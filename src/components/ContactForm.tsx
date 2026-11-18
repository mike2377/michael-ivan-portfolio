import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

type SubmitStatus = 'idle' | 'success' | 'notification-warning' | 'error';
type NotificationStatus = 'queued' | 'failed' | 'not_configured' | 'pending';

interface ContactFunctionResponse {
  stored?: boolean;
  notificationStatus?: NotificationStatus;
  outcome?: 'not_stored' | 'unknown';
  code?: string;
}

const emptyValues: FormValues = { name: '', email: '', subject: '', message: '' };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContactForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const subject = values.subject.trim();
  const message = values.message.trim();

  if (!name) errors.name = 'Please enter your name.';
  else if (name.length > 100) errors.name = 'Your name must be 100 characters or fewer.';

  if (!email) errors.email = 'Please enter your email address.';
  else if (email.length > 254 || !emailPattern.test(email)) errors.email = 'Please enter a valid email address.';

  if (!subject) errors.subject = 'Please enter a subject.';
  else if (subject.length > 150) errors.subject = 'The subject must be 150 characters or fewer.';

  if (!message) errors.message = 'Please write a message.';
  else if (message.length < 10) errors.message = 'Your message should be at least 10 characters.';
  else if (message.length > 2000) errors.message = 'Your message must be 2000 characters or fewer.';

  return errors;
}

const inputClass =
  'w-full rounded-lg border bg-canvas/70 px-4 py-3 text-sm text-ink placeholder:text-muted transition-colors duration-200 focus:border-secondary-400 focus:outline-none focus:ring-2 focus:ring-secondary-400/25';

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-error-300">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ContactForm({ emailFallback }: { emailFallback: string }) {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  const submittingRef = useRef(false);
  const submissionKeyRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  const updateField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    submissionKeyRef.current = null;
    setStatus('idle');
    setServerMessage('');
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const validationErrors = validateContactForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setStatus('idle');
      setServerMessage('');
      const firstInvalidField = Object.keys(validationErrors)[0] as keyof FormValues;
      window.requestAnimationFrame(() => document.getElementById(`contact-${firstInvalidField}`)?.focus());
      return;
    }

    if (!supabase) {
      setStatus('error');
      setServerMessage('The contact form is not connected yet. Please email me directly instead.');
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setStatus('idle');
    setServerMessage('');
    const requestId = ++requestIdRef.current;
    const isCurrentRequest = () => mountedRef.current && requestIdRef.current === requestId;
    const submissionKey = submissionKeyRef.current ?? window.crypto.randomUUID();
    submissionKeyRef.current = submissionKey;
    const website = String(new FormData(event.currentTarget).get('website') ?? '');

    try {
      const { data, error } = await supabase.functions.invoke<ContactFunctionResponse>('contact-message', {
        body: {
          submissionKey,
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
          website,
        },
      });

      if (error) {
        const response = 'context' in error && error.context instanceof Response ? error.context : null;
        const fetchCause = 'context' in error && error.context instanceof Response ? null : 'context' in error ? error.context : null;
        const timedOut = fetchCause instanceof DOMException && fetchCause.name === 'TimeoutError';
        let failure: ContactFunctionResponse = {};
        if (response) {
          try {
            failure = await response.clone().json() as ContactFunctionResponse;
          } catch {
            failure = {};
          }
        }

        const message = timedOut
          ? 'This request took too long, so we could not confirm whether your message was saved. Retry this form without editing to safely check the original submission, or email me directly.'
          : response?.status === 429
          ? 'Too many messages were sent from this connection. Please wait, then retry this form without editing so it checks the same submission.'
            : failure.code === 'invalid_submission' || (response?.status === 400 && failure.code !== 'submission_rejected')
              ? 'Please check the form fields and try again.'
              : failure.code === 'submission_rejected'
                ? 'This message could not be accepted. Please contact me by email instead.'
                : response?.status === 403
                  ? 'This form could not accept the submission from this page. Please email me directly.'
                  : response?.status === 409
                    ? 'This submission could not be matched safely. Please email me directly so I can help.'
                    : failure.outcome === 'not_stored'
                      ? 'The contact service could not accept your message, so it was not saved. Please try again later or email me directly.'
                      : 'We could not confirm whether your message was saved. Retry this form without editing to safely check the original submission, or email me directly.';
        if (isCurrentRequest()) {
          setServerMessage(message);
          setStatus('error');
        }
        return;
      }

      if (!data?.stored) {
        if (isCurrentRequest()) {
          setServerMessage('We could not confirm whether your message was saved. Retry this form without editing to safely check the original submission, or email me directly.');
          setStatus('error');
        }
        return;
      }

      if (!isCurrentRequest()) return;
      setValues(emptyValues);
      setErrors({});
      submissionKeyRef.current = null;
      if (data.notificationStatus === 'queued') {
        setStatus('success');
      } else {
        setStatus('notification-warning');
        setServerMessage(data.notificationStatus === 'pending'
          ? 'Your message was saved, but the email notification status could not be confirmed. If your inquiry is time-sensitive, please email me directly.'
          : 'Your message was saved, but an email notification could not be queued. If your inquiry is time-sensitive, please email me directly.');
      }
    } catch (error) {
      if (isCurrentRequest()) {
        const timedOut = error instanceof DOMException && error.name === 'TimeoutError';
        setServerMessage(timedOut
          ? 'This request took too long, so we could not confirm whether your message was saved. Retry this form without editing to safely check the original submission, or email me directly.'
          : 'A connection problem prevented us from confirming whether your message was saved. Retry this form without editing to safely check the original submission, or email me directly.');
        setStatus('error');
      }
    } finally {
      submittingRef.current = false;
      if (isCurrentRequest()) setIsSubmitting(false);
    }
  };

  const fieldProps = (field: keyof FormValues) => ({
    id: `contact-${field}`,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `contact-${field}-error` : undefined,
    'aria-required': true,
    required: true,
    disabled: isSubmitting,
  });

  const borderFor = (field: keyof FormValues) => (errors[field] ? 'border-error-300' : 'border-slate-500');

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 rounded-xl border border-line bg-card p-6 sm:p-8">
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="contact-name" label="Name" error={errors.name}>
          <input
            {...fieldProps('name')}
            type="text"
            maxLength={100}
            autoComplete="name"
            placeholder="Your name"
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            className={`${inputClass} ${borderFor('name')}`}
          />
        </Field>
        <Field id="contact-email" label="Email" error={errors.email}>
          <input
            {...fieldProps('email')}
            type="email"
            maxLength={254}
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            className={`${inputClass} ${borderFor('email')}`}
          />
        </Field>
      </div>

      <Field id="contact-subject" label="Subject" error={errors.subject}>
        <input
          {...fieldProps('subject')}
          type="text"
          maxLength={150}
          placeholder="What would you like to discuss?"
          value={values.subject}
          onChange={(event) => updateField('subject', event.target.value)}
          className={`${inputClass} ${borderFor('subject')}`}
        />
      </Field>

      <Field id="contact-message" label="Message" error={errors.message}>
        <textarea
          {...fieldProps('message')}
          rows={6}
          minLength={10}
          maxLength={2000}
          placeholder="Tell me about your project, timeline, and goals."
          value={values.message}
          onChange={(event) => updateField('message', event.target.value)}
          className={`${inputClass} ${borderFor('message')} resize-y`}
        />
      </Field>

      {Object.keys(errors).length > 0 && (
        <div role="alert" className="rounded-lg border border-error-500/40 bg-error-500/10 p-4 text-sm text-error-300">
          Please correct the highlighted fields before sending your message.
        </div>
      )}

      <p role="status" aria-atomic="true" className="sr-only">
        {isSubmitting ? 'Sending your message.' : ''}
      </p>

      <p className="text-xs leading-relaxed text-muted">
        Your name, email address, subject, and message are stored in Supabase and used to respond to your inquiry. The contact service processes your forwarded network address to create a keyed hash for rate limiting; that hash is stored with rate-limit data. When configured, your message is sent through Resend to notify me. No automatic message deletion is configured. Please do not include confidential or sensitive information.
      </p>

      {status === 'success' && (
        <div role="status" className="flex items-start gap-3 rounded-lg border border-success-500/40 bg-success-500/10 p-4 text-sm text-success-300">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>Your message has been saved and an email notification was queued. I will get back to you as soon as possible.</p>
        </div>
      )}

      {status === 'notification-warning' && (
        <div role="status" className="flex items-start gap-3 rounded-lg border border-warning-500/40 bg-warning-500/10 p-4 text-sm text-warning-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            {serverMessage}{' '}
            <a href={`mailto:${emailFallback}`} className="font-semibold underline underline-offset-4 hover:text-ink">
              email me directly
            </a>
            .
          </p>
        </div>
      )}

      {status === 'error' && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-error-500/40 bg-error-500/10 p-4 text-sm text-error-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            {serverMessage}{' '}
            <a href={`mailto:${emailFallback}`} className="font-semibold underline underline-offset-4 hover:text-ink">
              Send an email
            </a>
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Prefer email?{' '}
          <a href={`mailto:${emailFallback}`} className="font-medium text-secondary-300 underline-offset-4 hover:underline">
            {emailFallback}
          </a>
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary-600 px-7 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Sending
            </>
          ) : (
            <>
              Send Message
              <Send size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
