/*
# Create Waymark core tables: listings, bookings, saved_listings

## Overview
This migration creates the three core tables for the Waymark travel booking app.
The app is single-tenant (no auth / sign-in screen), so all policies use
`TO anon, authenticated` with `USING (true)` — the data is intentionally public/shared.

## New Tables

### 1. `listings`
Stores all bookable travel items (flights, hotels, homes, cars, yachts).
- `id` (uuid, PK)
- `title` (text) — display name, e.g. "The Aurelian — Sky Suite"
- `category` (text) — one of: flights, hotels, homes, cars, yachts
- `location` (text) — city/region label, e.g. "Amalfi Coast, Italy"
- `price` (integer) — nightly or per-day price in USD
- `price_unit` (text) — e.g. "night", "day", "trip"
- `rating` (numeric, 2,1) — average rating 0.0–5.0
- `review_count` (integer) — number of reviews
- `image_url` (text) — primary hero image URL
- `gallery` (jsonb) — array of image URLs for the gallery
- `amenities` (jsonb) — array of amenity strings
- `description` (text) — long-form description
- `badge` (text, nullable) — optional highlight badge, e.g. "Editor's Choice"
- `bedrooms` (integer, nullable) — for homes/hotels
- `bathrooms` (integer, nullable) — for homes/hotels
- `guests` (integer, nullable) — max occupancy
- `tags` (jsonb) — array of tag strings for filtering
- `featured` (boolean, default false) — shown on home hero
- `created_at` (timestamptz)

### 2. `bookings`
Stores booking records created by the user.
- `id` (uuid, PK)
- `listing_id` (uuid, FK → listings)
- `check_in` (date) — start date
- `check_out` (date) — end date
- `guests` (integer) — number of guests
- `total_price` (integer) — computed total
- `status` (text) — one of: confirmed, pending, completed, cancelled
- `booker_name` (text) — name on reservation
- `booker_email` (text) — contact email
- `created_at` (timestamptz)

### 3. `saved_listings`
Stores listings the user has saved/favorited.
- `id` (uuid, PK)
- `listing_id` (uuid, FK → listings)
- `created_at` (timestamptz)

## Security
- RLS enabled on all three tables.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because the app has no sign-in screen and the data is intentionally public/shared.
*/

-- === listings ===
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('flights','hotels','homes','cars','yachts')),
  location text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  price_unit text NOT NULL DEFAULT 'night',
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  review_count integer NOT NULL DEFAULT 0,
  image_url text NOT NULL,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text NOT NULL DEFAULT '',
  badge text,
  bedrooms integer,
  bathrooms integer,
  guests integer,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_listings" ON listings;
CREATE POLICY "anon_select_listings" ON listings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_listings" ON listings;
CREATE POLICY "anon_insert_listings" ON listings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_listings" ON listings;
CREATE POLICY "anon_update_listings" ON listings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_listings" ON listings;
CREATE POLICY "anon_delete_listings" ON listings FOR DELETE
  TO anon, authenticated USING (true);

-- === bookings ===
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests integer NOT NULL DEFAULT 1,
  total_price integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','pending','completed','cancelled')),
  booker_name text NOT NULL DEFAULT 'Guest',
  booker_email text NOT NULL DEFAULT 'guest@waymark.app',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bookings" ON bookings;
CREATE POLICY "anon_delete_bookings" ON bookings FOR DELETE
  TO anon, authenticated USING (true);

-- === saved_listings ===
CREATE TABLE IF NOT EXISTS saved_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_saved" ON saved_listings;
CREATE POLICY "anon_select_saved" ON saved_listings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_saved" ON saved_listings;
CREATE POLICY "anon_insert_saved" ON saved_listings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_saved" ON saved_listings;
CREATE POLICY "anon_delete_saved" ON saved_listings FOR DELETE
  TO anon, authenticated USING (true);

-- === Indexes ===
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_listing_id ON saved_listings(listing_id);
