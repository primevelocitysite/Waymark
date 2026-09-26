/*
# Add reward points, loyalty tier, and preferences to profiles

1. Modified Tables
- `profiles`
  - `reward_points` (integer, default 0) — loyalty points earned from bookings
  - `loyalty_tier` (text, default 'Silver') — one of 'Silver', 'Gold', 'Platinum'
  - `preferred_language` (text, default 'English (US)') — user's language preference
  - `notifications_enabled` (boolean, default true) — whether user gets push/email notifications
  - `dark_mode` (boolean, default false) — appearance preference
2. Security
- No RLS policy changes — existing policies remain intact.
3. Notes
- All columns are nullable-safe with defaults so existing rows are not broken.
- `loyalty_tier` uses a CHECK constraint to limit valid values.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reward_points integer NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS loyalty_tier text NOT NULL DEFAULT 'Silver'
  CHECK (loyalty_tier IN ('Silver', 'Gold', 'Platinum'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'English (US)';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dark_mode boolean NOT NULL DEFAULT false;
