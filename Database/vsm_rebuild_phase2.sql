-- ==============================================================================
-- VSM COMPLETE DATABASE REBUILD & DYNAMIC PRICING ENGINE (PHASE 2)
-- Two Commercial Lanes: Visual Moments (Hourly/Package/Corporate) & Smart Financing
-- Minimalist, Defensible, Production-Ready
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean Drop of Legacy Tables & Foreign Keys (Cascade)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

DROP TABLE IF EXISTS public.booking_status_history CASCADE;
DROP TABLE IF EXISTS public.outreach_crm CASCADE;
DROP TABLE IF EXISTS public.payment_proofs CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.vault_files CASCADE;
DROP TABLE IF EXISTS public.memory_vaults CASCADE;
DROP TABLE IF EXISTS public.repayments CASCADE;
DROP TABLE IF EXISTS public.loans CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.creative_opportunities CASCADE;
DROP TABLE IF EXISTS public.corporate_enquiries CASCADE;
DROP TABLE IF EXISTS public.gallery_items CASCADE;
DROP TABLE IF EXISTS public.pricing_addons CASCADE;
DROP TABLE IF EXISTS public.event_types CASCADE;
DROP TABLE IF EXISTS public.packages CASCADE;
DROP TABLE IF EXISTS public.product_settings CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. Enum Definition
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'owner', 'creator', 'client');
  ELSE
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'owner';
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'creator';
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'client';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END;
  END IF;
END $$;

-- ==============================================================================
-- 4. CORE TABLES (Profiles MUST be created first before is_admin() function)
-- ==============================================================================

-- Profiles (Admin, Creators, Clients)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatically sync existing Supabase Auth users into profiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'fullName', split_part(email, '@', 1)),
  'admin'
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET role = EXCLUDED.role, email = EXCLUDED.email;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'fullName', split_part(new.email, '@', 1)),
    CASE 
      WHEN new.email ILIKE '%admin%' OR new.email ILIKE '%owner%' THEN 'admin'
      ELSE 'client'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 5. Helper Function: is_admin() (Defined AFTER profiles table is created)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role::text INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN COALESCE(v_role IN ('admin', 'owner'), FALSE);
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- ==============================================================================
-- 6. APPLICATION TABLES
-- ==============================================================================

-- Customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  id_number TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event Types (Dynamic commercial classification: hourly | package | quotation)
CREATE TABLE public.event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  commercial_model TEXT NOT NULL CHECK (commercial_model IN ('hourly', 'package', 'quotation')),
  description TEXT,
  min_hours INTEGER NOT NULL DEFAULT 1,
  base_hourly_rate NUMERIC NOT NULL DEFAULT 400,
  base_deliverables JSONB NOT NULL DEFAULT '{"photos": 80, "videos": 2}'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Packages (Major Events: Essential R5,500 / Cinematic R8,900 / Legacy R14,500)
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('Essential', 'Cinematic', 'Legacy', 'Custom')),
  category TEXT NOT NULL DEFAULT 'Photography & Video',
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  deposit_amount NUMERIC NOT NULL,
  duration_hours INTEGER NOT NULL DEFAULT 4,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_highlighted BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 1,
  financing_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pricing Addons Catalog
CREATE TABLE public.pricing_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'flat' CHECK (unit IN ('flat', 'per_hour', 'per_unit')),
  applicable_models JSONB NOT NULL DEFAULT '["hourly", "package"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Global Product Settings & Pricing Engine Config (Zero-downtime admin tweaks)
CREATE TABLE public.product_settings (
  setting_key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings (Unified table for Hourly Mini-Events and Major Packages)
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  id_number TEXT,
  event_type TEXT NOT NULL,
  commercial_model TEXT NOT NULL DEFAULT 'hourly' CHECK (commercial_model IN ('hourly', 'package', 'quotation')),
  event_date DATE NOT NULL,
  event_time TEXT DEFAULT '12:00',
  venue_name TEXT,
  venue_address TEXT,
  location TEXT,
  guest_count INTEGER DEFAULT 0,
  -- Hourly Specific
  hours INTEGER DEFAULT 2,
  media_type TEXT DEFAULT 'both' CHECK (media_type IN ('photo', 'video', 'both')),
  deliverables JSONB DEFAULT '[]'::jsonb,
  -- Package Specific
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  package_name TEXT,
  package_tier TEXT,
  -- Pricing & Deposits
  base_price NUMERIC NOT NULL DEFAULT 0,
  addons JSONB DEFAULT '[]'::jsonb,
  addons_total NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  deposit_amount NUMERIC NOT NULL DEFAULT 0,
  balance_due NUMERIC NOT NULL DEFAULT 0,
  -- Statuses
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Confirmed', 'In_Progress', 'Completed', 'Cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Deposit_Paid', 'Fully_Paid', 'Financed')),
  payment_method TEXT DEFAULT 'eft' CHECK (payment_method IN ('eft', 'cash', 'yoco', 'payfast', 'financed')),
  financed BOOLEAN NOT NULL DEFAULT FALSE,
  tracking_number TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment Proofs (EFT Verification Queue)
CREATE TABLE public.payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Corporate Enquiries & CRM Pipeline (Quotation Lane)
CREATE TABLE public.corporate_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_date DATE,
  location TEXT NOT NULL,
  coverage_needs TEXT NOT NULL,
  crew_needs TEXT,
  deliverables TEXT,
  estimated_budget NUMERIC DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'Prospect' CHECK (stage IN ('Prospect', 'Contacted', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Creative Opportunities (VSM Creator Marketplace)
CREATE TABLE public.creative_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organisation TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE,
  role TEXT NOT NULL,
  scope TEXT NOT NULL,
  deliverables TEXT NOT NULL,
  compensation NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Open', 'Closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Outreach CRM
CREATE TABLE public.outreach_crm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation TEXT NOT NULL,
  sector TEXT,
  contact_name TEXT,
  contact_email TEXT,
  stage TEXT NOT NULL DEFAULT 'Prospect' CHECK (stage IN ('Prospect', 'Contacted', 'Conversation', 'Proposal', 'Negotiation', 'Won', 'Delivered')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Smart Financing: Loans (Dual Lane: Package Financing vs Personal Loan)
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  linked_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  applicant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  id_number TEXT,
  loan_type TEXT NOT NULL DEFAULT 'package_finance' CHECK (loan_type IN ('package_finance', 'personal_loan')),
  amount NUMERIC NOT NULL,
  term_months INTEGER NOT NULL DEFAULT 6,
  interest_rate NUMERIC NOT NULL DEFAULT 18.0,
  monthly_instalment NUMERIC NOT NULL DEFAULT 0,
  total_payable NUMERIC NOT NULL DEFAULT 0,
  balance NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under_Review', 'Approved', 'Rejected', 'Disbursed', 'Settled')),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'flagged')),
  salary NUMERIC DEFAULT 0,
  expenses NUMERIC DEFAULT 0,
  employer TEXT,
  employment_type TEXT DEFAULT 'Employed',
  bank_name TEXT,
  account_number TEXT,
  reference_number TEXT UNIQUE,
  rejection_reason TEXT,
  notes TEXT,
  disbursed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Repayments
CREATE TABLE public.repayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'EFT',
  status TEXT NOT NULL DEFAULT 'Completed',
  reference_number TEXT,
  transaction_id TEXT,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Memory Vaults (Client Cloud Delivery & Annual Preservation)
CREATE TABLE public.memory_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  title TEXT NOT NULL,
  event_type TEXT DEFAULT 'Celebration',
  event_date DATE DEFAULT CURRENT_DATE,
  cover_image_url TEXT,
  access_code TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL DEFAULT 'included' CHECK (tier IN ('included', 'premium', 'family_archive')),
  status TEXT NOT NULL DEFAULT 'Processing' CHECK (status IN ('Processing', 'Ready', 'Archived', 'Expired')),
  expires_at TIMESTAMPTZ,
  annual_fee NUMERIC NOT NULL DEFAULT 0,
  delivery_notes TEXT,
  delivered_at TIMESTAMPTZ,
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vault Files
CREATE TABLE public.vault_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.memory_vaults(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  loan_id UUID REFERENCES public.loans(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_address TEXT,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Issued' CHECK (status IN ('Draft', 'Issued', 'Paid', 'Overdue', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gallery CMS Items
CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Celebration',
  location TEXT DEFAULT 'South Africa',
  image_url TEXT NOT NULL,
  storage_path TEXT,
  alt_text TEXT,
  span_class TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 1,
  aspect_ratio TEXT DEFAULT 'portrait',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity Logs & Notifications
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT DEFAULT 'system',
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  reference_id TEXT,
  reference_type TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX idx_bookings_date ON public.bookings(event_date);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loans_customer ON public.loans(customer_id);
CREATE INDEX idx_corporate_stage ON public.corporate_enquiries(stage);
CREATE INDEX idx_vaults_access ON public.memory_vaults(access_code);
CREATE INDEX idx_vault_files_vault ON public.vault_files(vault_id);
CREATE INDEX idx_gallery_active ON public.gallery_items(is_active, display_order);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES (NO RECURSION GUARANTEED)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_crm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES (Direct auth.uid check ONLY - NEVER call is_admin() here!)
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- EVENT TYPES & PACKAGES & ADDONS (Public catalog read, Admin write)
CREATE POLICY "event_types_public_read" ON public.event_types FOR SELECT USING (true);
CREATE POLICY "event_types_admin_all" ON public.event_types FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "packages_public_read" ON public.packages FOR SELECT USING (true);
CREATE POLICY "packages_admin_all" ON public.packages FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "pricing_addons_public_read" ON public.pricing_addons FOR SELECT USING (true);
CREATE POLICY "pricing_addons_admin_all" ON public.pricing_addons FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "product_settings_public_read" ON public.product_settings FOR SELECT USING (true);
CREATE POLICY "product_settings_admin_all" ON public.product_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- CUSTOMERS & BOOKINGS (Public insert for bookings, Admin manage all)
CREATE POLICY "customers_public_insert" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "customers_admin_all" ON public.customers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "bookings_public_insert" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_public_select_by_tracking" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "bookings_admin_all" ON public.bookings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PAYMENT PROOFS
CREATE POLICY "payment_proofs_public_insert" ON public.payment_proofs FOR INSERT WITH CHECK (true);
CREATE POLICY "payment_proofs_admin_all" ON public.payment_proofs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- CORPORATE ENQUIRIES (Public submission, Admin CRM)
CREATE POLICY "corporate_enquiries_public_insert" ON public.corporate_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "corporate_enquiries_admin_all" ON public.corporate_enquiries FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- CREATIVE OPPORTUNITIES & OUTREACH CRM
CREATE POLICY "creative_opportunities_public_read" ON public.creative_opportunities FOR SELECT USING (status = 'Open');
CREATE POLICY "creative_opportunities_admin_all" ON public.creative_opportunities FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "outreach_crm_admin_all" ON public.outreach_crm FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- LOANS & REPAYMENTS (Public apply, Admin assess)
CREATE POLICY "loans_public_insert" ON public.loans FOR INSERT WITH CHECK (true);
CREATE POLICY "loans_public_select" ON public.loans FOR SELECT USING (true);
CREATE POLICY "loans_admin_all" ON public.loans FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "repayments_admin_all" ON public.repayments FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- MEMORY VAULTS & FILES (Public read by access code, Admin write)
CREATE POLICY "memory_vaults_public_read" ON public.memory_vaults FOR SELECT USING (true);
CREATE POLICY "memory_vaults_admin_all" ON public.memory_vaults FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "vault_files_public_read" ON public.vault_files FOR SELECT USING (true);
CREATE POLICY "vault_files_admin_all" ON public.vault_files FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- GALLERY & INVOICES & NOTIFICATIONS
CREATE POLICY "gallery_items_public_read" ON public.gallery_items FOR SELECT USING (is_active = true);
CREATE POLICY "gallery_items_admin_all" ON public.gallery_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "invoices_admin_all" ON public.invoices FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "activity_logs_admin_all" ON public.activity_logs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "notifications_admin_all" ON public.notifications FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ==============================================================================
-- 9. PRISTINE CANONICAL SEED DATA
-- ==============================================================================

-- Seed Event Types (Mapping user's exact commercial models)
INSERT INTO public.event_types (slug, name, commercial_model, description, min_hours, base_hourly_rate, base_deliverables, display_order)
VALUES
  ('birthday', 'Birthday Party', 'hourly', 'Flexible hourly coverage for milestone birthdays and intimate celebrations.', 1, 400, '{"photos": 80, "videos": 2}'::jsonb, 1),
  ('baby-shower', 'Baby Shower', 'hourly', 'Warm, candid moments celebrating new life and family love.', 1, 400, '{"photos": 80, "videos": 2}'::jsonb, 2),
  ('graduation', 'Graduation Shoot', 'hourly', 'Celebrate your academic milestone with sharp portraits and family captures.', 1, 400, '{"photos": 80, "videos": 2}'::jsonb, 3),
  ('pool-party', 'Pool Party', 'hourly', 'Vibrant, high-energy summer captures and highlight reels.', 2, 400, '{"photos": 100, "videos": 2}'::jsonb, 4),
  ('groove', 'Groove & Nightlife', 'hourly', 'Cinematic club and social gathering coverage with fast turnaround reels.', 2, 450, '{"photos": 100, "videos": 3}'::jsonb, 5),
  ('overnight-event', 'Overnight Event', 'hourly', 'Extended coverage for weekend retreats, camps, and multi-hour festivities.', 4, 400, '{"photos": 150, "videos": 4}'::jsonb, 6),
  ('private-party', 'Private Dinner / Party', 'hourly', 'Understated, elegant coverage for anniversaries and private family gatherings.', 1, 400, '{"photos": 80, "videos": 2}'::jsonb, 7),
  ('wedding', 'Wedding Production', 'package', 'Comprehensive cinematic packages with fixed deposit reserve.', 4, 0, '{"photos": 200, "videos": 1}'::jsonb, 8),
  ('funeral', 'Funeral Memorial', 'package', 'Respectful, solemn legacy documentation honoring life and family heritage.', 4, 0, '{"photos": 150, "videos": 1}'::jsonb, 9),
  ('corporate', 'Corporate Gathering', 'quotation', 'Enterprise-grade visual production and bespoke quotation.', 2, 0, '{}'::jsonb, 10),
  ('summit', 'Tech & Business Summit', 'quotation', 'Multi-camera keynotes, sponsor highlights, and rapid social media delivery.', 4, 0, '{}'::jsonb, 11),
  ('conference', 'Academic / Industry Conference', 'quotation', 'Stage coverage, breakout sessions, attendee portraits, and executive recap video.', 4, 0, '{}'::jsonb, 12),
  ('hackathon', 'Hackathon / Innovation Showcase', 'quotation', 'Fast-paced storytelling, developer spotlights, pitching stages, and award reels.', 6, 0, '{}'::jsonb, 13),
  ('awards', 'Gala Dinner & Awards Ceremony', 'quotation', 'Red carpet step-and-repeat, stage presentations, and immediate PR assets.', 4, 0, '{}'::jsonb, 14),
  ('brand-activation', 'Brand Activation / Pop-up', 'quotation', 'High-impact customer engagement, experiential recap films, and vertical reels.', 3, 0, '{}'::jsonb, 15),
  ('product-launch', 'Product Launch Event', 'quotation', 'Cinematic product unveiling, media-ready photo packs, and press cutdowns.', 3, 0, '{}'::jsonb, 16);

-- Seed Packages (Exact user fixed deposit structure)
INSERT INTO public.packages (slug, name, tier, category, description, price, deposit_amount, duration_hours, features, is_highlighted, display_order)
VALUES
  (
    'essential-memories',
    'Essential Memories',
    'Essential',
    'Photography & Video',
    'Perfect for intimate ceremonies and major family gatherings where every moment matters. Complete high-definition coverage and signature Memory Vault delivery.',
    5500,
    1500,
    4,
    '["Professional event photography", "Full event video (HD)", "Private online gallery", "100+ edited high-resolution photos", "4 hours dedicated coverage", "Memory Vault digital download", "Rapid 5-day delivery SLA"]'::jsonb,
    false,
    1
  ),
  (
    'cinematic-experience',
    'Cinematic Experience',
    'Cinematic',
    'Photography & Cinema',
    'The complete cinematic production for unforgettable celebrations. 4K visuals, drone aerial perspectives, and signature Memory Vault delivery.',
    8900,
    2500,
    8,
    '["Professional event photography", "Full cinematic event video (4K)", "Drone aerial video coverage", "Drone high-resolution photography", "Cinematic color grading & edits", "Private Memory Vault gallery", "200+ edited photos delivered", "8 hours dedicated coverage", "Same-day 10-photo preview teaser"]'::jsonb,
    true,
    2
  ),
  (
    'legacy-collection',
    'Legacy Collection',
    'Legacy',
    'Complete Luxury Production',
    'The ultimate visual heirloom. Full-day multi-camera master crew, heirloom album, lifetime vault preservation, and cinematic documentary.',
    14500,
    4000,
    12,
    '["2 senior photographers + 1 filmmaker", "Full day dedicated coverage (12 hours)", "Drone 4K aerial photography & video", "350+ master-retouched photos", "10-15 minute cinematic documentary film", "60-second social media reel", "Same-day teaser photo delivery", "Luxury leather-bound physical photo album", "Lifetime Memory Vault digital preservation"]'::jsonb,
    false,
    3
  );

-- Seed Pricing Addons Catalog
INSERT INTO public.pricing_addons (slug, name, description, price, unit, applicable_models, display_order)
VALUES
  ('photos-50', '50 Extra Edited Photos', 'Additional professionally retouched high-resolution images.', 300, 'flat', '["hourly", "package"]'::jsonb, 1),
  ('photos-100', '100 Extra Edited Photos', 'Comprehensive extended photo collection.', 550, 'flat', '["hourly", "package"]'::jsonb, 2),
  ('reel-30', '30s Social Media Reel', 'Punchy vertical video highlight optimized for Instagram & TikTok.', 500, 'flat', '["hourly", "package"]'::jsonb, 3),
  ('reel-60', '60s Cinematic Reel', 'Story-driven cinematic highlight with licensed soundtrack.', 900, 'flat', '["hourly", "package"]'::jsonb, 4),
  ('same-day-preview', 'Same-Day Preview (10 Photos)', 'Delivered within 6 hours of shooting for instant social sharing.', 750, 'flat', '["hourly", "package"]'::jsonb, 5),
  ('delivery-24h', '24-Hour Express Delivery', 'Fast-tracked editing pipeline for your full album.', 500, 'flat', '["hourly", "package"]'::jsonb, 6),
  ('raw-footage', 'Unedited RAW Footage & Photos', 'Complete raw media archive transferred via private drive link.', 1000, 'flat', '["hourly", "package"]'::jsonb, 7),
  ('extra-hour', 'Extra Coverage Hour', 'Additional on-site shooting hour with the creative team.', 400, 'per_hour', '["hourly", "package"]'::jsonb, 8),
  ('drone-coverage', 'Drone Aerial Video & Photo', 'Certified drone operator capture for stunning aerial views.', 1000, 'flat', '["package", "quotation"]'::jsonb, 9),
  ('extra-photographer', 'Additional Lead Photographer', 'Second shooter to capture candid angles simultaneously.', 1500, 'flat', '["package", "quotation"]'::jsonb, 10);

-- Seed Product Settings (Dynamic engine configuration)
INSERT INTO public.product_settings (setting_key, value)
VALUES
  (
    'product_config',
    '{
      "hourlyRate": 400,
      "baseHours": 2,
      "minimumHours": 1,
      "financeThreshold": 3000,
      "paymentMethods": { "eft": true, "cash": true, "yoco": false, "payfast": false },
      "vaultPlans": [
        { "id": "included", "name": "Digital Vault", "price": 0, "label": "60 days included with every booking" },
        { "id": "premium", "name": "Premium Vault", "price": 199, "label": "Annual 4K streaming and high-speed archive" },
        { "id": "family", "name": "Family Archive", "price": 399, "label": "Annual unlimited RAW backup and legacy preservation" }
      ]
    }'::jsonb
  )
ON CONFLICT (setting_key) DO UPDATE SET value = EXCLUDED.value;

-- Seed Creative Opportunities
INSERT INTO public.creative_opportunities (title, organisation, location, event_date, role, scope, deliverables, compensation, status)
VALUES
  (
    'TUT Annual Spring Graduation',
    'Tshwane University of Technology',
    'Pretoria Campus',
    (CURRENT_DATE + INTERVAL '14 days'),
    'Lead Portrait Photographer',
    'On-site graduate stage portraits and family candid moments.',
    '150 color-graded portraits within 48 hours.',
    3500,
    'Open'
  ),
  (
    'Gauteng Tech Leaders Summit',
    'TechBridge Africa',
    'Sandton Convention Centre',
    (CURRENT_DATE + INTERVAL '21 days'),
    'Cinematographer & Drone Pilot',
    'Keynote sessions, exhibition floor reels, and sponsor interviews.',
    '4K highlight film (3 mins) + 3 vertical reels.',
    6500,
    'Open'
  );

-- ==============================================================================
-- END OF PHASE 2 REBUILD SCHEMA
-- ==============================================================================
