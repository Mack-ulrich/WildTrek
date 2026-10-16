-- WildTrek Database Schema
-- Run this in Supabase SQL Editor first

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'guide', 'outfitter', 'admin')),
  contact_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guides table
CREATE TABLE IF NOT EXISTS guides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT,
  description TEXT,
  specialties TEXT[] DEFAULT '{}',
  location TEXT,
  price_per_hour DECIMAL(10, 2) DEFAULT 150,
  years_experience INTEGER DEFAULT 0,
  max_group_size INTEGER DEFAULT 6,
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  license_number TEXT,
  insurance_verified BOOLEAN DEFAULT FALSE,
  background_check_passed BOOLEAN DEFAULT FALSE,
  -- Public URL id (/guides/<slug>) and the full listing in the app's Guide shape (lib/types.ts)
  slug TEXT UNIQUE,
  listing JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  -- NULL customer_id = guest request sent through /api/bookings with the service role
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Filled from guide_slug by a trigger when the guide has a row in guides
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  guide_slug TEXT NOT NULL,
  guide_name TEXT,
  business TEXT,
  package_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  -- Booking.id from the app, so uploads from a device are idempotent
  client_id TEXT,
  trip_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  party_size INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'pending', 'confirmed', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded')),
  stripe_payment_intent_id TEXT,
  special_requests TEXT,
  target_species TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, client_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  photos TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles table (The Cave)
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vibes posts (community feed)
CREATE TABLE IF NOT EXISTS vibes_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  photos TEXT[],
  catch_species TEXT,
  catch_weight TEXT,
  catch_length TEXT,
  location TEXT,
  likes INTEGER DEFAULT 0,
  author_name TEXT,
  author_role TEXT DEFAULT 'angler' CHECK (author_role IN ('angler', 'hunter', 'guide')),
  size TEXT,
  comments INTEGER DEFAULT 0,
  client_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, client_id)
);

-- Logbook entries (components/logbook.tsx LogEntry)
CREATE TABLE IF NOT EXISTS logbook_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id TEXT NOT NULL,
  entry_date DATE NOT NULL,
  species TEXT NOT NULL,
  location TEXT NOT NULL,
  length NUMERIC,
  weight NUMERIC,
  count INTEGER NOT NULL DEFAULT 1,
  kept BOOLEAN NOT NULL DEFAULT FALSE,
  method TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  moon TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, client_id)
);

-- Gear checklist state (components/gear-checklist.tsx): one map of "list:section:item" -> true per user
CREATE TABLE IF NOT EXISTS gear_checks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  checked JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guide availability
CREATE TABLE IF NOT EXISTS guide_availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE NOT NULL,
  available_date DATE NOT NULL,
  start_time TIME NOT NULL DEFAULT '06:00',
  end_time TIME NOT NULL DEFAULT '14:00',
  max_bookings INTEGER DEFAULT 1,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guide_id, available_date, start_time)
);

-- Triggers to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON guides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_logbook_entries_updated_at BEFORE UPDATE ON logbook_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gear_checks_updated_at BEFORE UPDATE ON gear_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Link a booking to a guides row when the requested guide (by slug) has one
CREATE OR REPLACE FUNCTION link_booking_guide()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.guide_id IS NULL THEN
    SELECT id INTO NEW.guide_id FROM public.guides WHERE slug = NEW.guide_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER link_booking_guide BEFORE INSERT OR UPDATE OF guide_slug ON bookings FOR EACH ROW EXECUTE FUNCTION link_booking_guide();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    -- Sign-up may only request customer or guide; admin/outfitter are granted manually
    CASE WHEN NEW.raw_user_meta_data->>'role' = 'guide' THEN 'guide' ELSE 'customer' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibes_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE logbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Approved guides are viewable by everyone" ON guides FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Guides can update own profile" ON guides FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Guides can insert their profile" ON guides FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = customer_id OR auth.uid() IN (SELECT user_id FROM guides WHERE id = guide_id));
CREATE POLICY "Authenticated users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Guides can update their bookings" ON bookings FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM guides WHERE id = guide_id) OR auth.uid() = customer_id);

CREATE POLICY "Reviews are publicly viewable" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Published articles are publicly viewable" ON articles FOR SELECT USING (published = TRUE OR auth.uid() = author_id);
CREATE POLICY "Authors can create articles" ON articles FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their articles" ON articles FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Vibes posts are publicly viewable" ON vibes_posts FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can post vibes" ON vibes_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit their vibes" ON vibes_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their vibes" ON vibes_posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users manage their logbook" ON logbook_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage their gear checks" ON gear_checks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guide availability is publicly viewable" ON guide_availability FOR SELECT USING (TRUE);
CREATE POLICY "Guides can manage their availability" ON guide_availability FOR ALL USING (auth.uid() IN (SELECT user_id FROM guides WHERE id = guide_id));

-- Upgrading a database created from an earlier version of this file
ALTER TABLE guides ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS listing JSONB DEFAULT '{}';
ALTER TABLE bookings ALTER COLUMN customer_id DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN guide_id DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN start_time DROP NOT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guide_slug TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guide_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS business TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS package_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('requested', 'pending', 'confirmed', 'completed', 'cancelled'));
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'requested';
CREATE UNIQUE INDEX IF NOT EXISTS bookings_customer_client_key ON bookings (customer_id, client_id);
ALTER TABLE vibes_posts ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE vibes_posts ADD COLUMN IF NOT EXISTS author_role TEXT DEFAULT 'angler';
ALTER TABLE vibes_posts ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE vibes_posts ADD COLUMN IF NOT EXISTS comments INTEGER DEFAULT 0;
ALTER TABLE vibes_posts ADD COLUMN IF NOT EXISTS client_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS vibes_posts_user_client_key ON vibes_posts (user_id, client_id);
