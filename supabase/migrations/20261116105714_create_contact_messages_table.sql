/*
# Create contact_messages table

1. New Tables
- `contact_messages`
  - `id` (uuid, primary key)
  - `name` (text, required, max 100 characters)
  - `email` (text, required, max 254 characters)
  - `subject` (text, required, max 150 characters)
  - `message` (text, required, max 2000 characters)
  - `created_at` (timestamptz, defaults to now)

2. Security
- Row level security enabled on `contact_messages`.
- Anonymous visitors and signed-in users may only INSERT messages, and only with valid field lengths.
- No SELECT, UPDATE, or DELETE access is granted, so submitted messages cannot be read or altered from the public site.
- The owner can read messages from the Supabase dashboard.
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 150),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON contact_messages TO anon, authenticated;

DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
CREATE POLICY "anon_insert_contact_messages" ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 254
    AND char_length(subject) BETWEEN 1 AND 150
    AND char_length(message) BETWEEN 1 AND 2000
  );
