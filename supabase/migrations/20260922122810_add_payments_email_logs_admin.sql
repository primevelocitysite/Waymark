/*
# Add payments, email_logs, and admin tables

## New Tables

### 1. `payments`
Records payment transactions for bookings.
- `id` (uuid, PK)
- `booking_id` (uuid, FK → bookings)
- `amount` (integer) — total charged
- `currency` (text, default 'USD')
- `method` (text) — 'card', 'apple_pay', 'google_pay'
- `card_last4` (text, nullable) — last 4 digits of card
- `card_brand` (text, nullable) — 'visa', 'mastercard', 'amex'
- `billing_name` (text)
- `billing_email` (text)
- `billing_address` (text, nullable)
- `billing_city` (text, nullable)
- `billing_zip` (text, nullable)
- `billing_country` (text, nullable)
- `status` (text) — 'succeeded', 'pending', 'failed', 'refunded'
- `created_at` (timestamptz)

### 2. `email_logs`
Tracks outgoing email notifications sent via Resend.
- `id` (uuid, PK)
- `recipient` (text) — email address
- `subject` (text)
- `type` (text) — 'booking_confirmation', 'booking_cancelled', 'save_notification', 'admin_alert'
- `body` (text) — email body content
- `status` (text) — 'sent', 'failed'
- `related_id` (uuid, nullable) — booking or listing id
- `created_at` (timestamptz)

### 3. `admin_settings`
Single-row table for admin console configuration.
- `id` (uuid, PK, default single)
- `site_name` (text, default 'Waymark')
- `maintenance_mode` (boolean, default false)
- `updated_at` (timestamptz)

## Updated Tables
### `bookings`
Added `payment_status` column to track whether payment was completed.
*/

-- === payments ===
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  method text NOT NULL DEFAULT 'card' CHECK (method IN ('card','apple_pay','google_pay')),
  card_last4 text,
  card_brand text,
  billing_name text NOT NULL DEFAULT '',
  billing_email text NOT NULL DEFAULT '',
  billing_address text,
  billing_city text,
  billing_zip text,
  billing_country text,
  status text NOT NULL DEFAULT 'succeeded' CHECK (status IN ('succeeded','pending','failed','refunded')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_payments" ON payments;
CREATE POLICY "anon_select_payments" ON payments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
CREATE POLICY "anon_insert_payments" ON payments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_payments" ON payments;
CREATE POLICY "anon_update_payments" ON payments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_payments" ON payments;
CREATE POLICY "anon_delete_payments" ON payments FOR DELETE
  TO anon, authenticated USING (true);

-- === email_logs ===
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  subject text NOT NULL,
  type text NOT NULL DEFAULT 'booking_confirmation',
  body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed')),
  related_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_email_logs" ON email_logs;
CREATE POLICY "anon_select_email_logs" ON email_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_email_logs" ON email_logs;
CREATE POLICY "anon_insert_email_logs" ON email_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_email_logs" ON email_logs;
CREATE POLICY "anon_delete_email_logs" ON email_logs FOR DELETE
  TO anon, authenticated USING (true);

-- === admin_settings ===
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Waymark',
  maintenance_mode boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_admin_settings" ON admin_settings;
CREATE POLICY "anon_select_admin_settings" ON admin_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_admin_settings" ON admin_settings;
CREATE POLICY "anon_update_admin_settings" ON admin_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Insert default admin settings row
INSERT INTO admin_settings (site_name, maintenance_mode)
SELECT 'Waymark', false
WHERE NOT EXISTS (SELECT 1 FROM admin_settings);

-- === Add payment_status to bookings ===
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid','paid','refunded','failed'));

-- === Indexes ===
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at DESC);
