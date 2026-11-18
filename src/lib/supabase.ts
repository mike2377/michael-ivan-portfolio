import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { contactRequestTimeoutMs, createTimeoutFetch } from '@/lib/contactRequest';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && anonKey
  ? createClient(url, anonKey, { global: { fetch: createTimeoutFetch(contactRequestTimeoutMs) } })
  : null;
