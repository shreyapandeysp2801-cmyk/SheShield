/*
# Create emergency_contacts table (single-tenant, no auth)

1. New Tables
- `emergency_contacts`
  - `id` (uuid, primary key)
  - `name` (text, not null) — display name of the contact (e.g. "Mom", "Sarah")
  - `phone` (text, not null) — phone number to dial
  - `relationship` (text, nullable) — optional relationship label (e.g. "Family", "Friend")
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `emergency_contacts`.
- Allow anon + authenticated CRUD because this is a no-auth app and the data is intentionally shared/public.
- Four separate policies: SELECT, INSERT, UPDATE, DELETE.
*/

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  relationship text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_emergency_contacts" ON emergency_contacts;
CREATE POLICY "anon_select_emergency_contacts"
ON emergency_contacts FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_emergency_contacts" ON emergency_contacts;
CREATE POLICY "anon_insert_emergency_contacts"
ON emergency_contacts FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_emergency_contacts" ON emergency_contacts;
CREATE POLICY "anon_update_emergency_contacts"
ON emergency_contacts FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_emergency_contacts" ON emergency_contacts;
CREATE POLICY "anon_delete_emergency_contacts"
ON emergency_contacts FOR DELETE
TO anon, authenticated USING (true);
