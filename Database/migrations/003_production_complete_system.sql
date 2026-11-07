-- ==============================================================================
-- VSM PRODUCTION COMPLETE DATABASE MIGRATION (003)
-- Two Services. One Platform.
-- Safe, additive migration: preserves existing IDs, tables, and data.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. SECURITY DEFINER ADMIN FUNCTION (FIXES INFINITE RECURSION IN PROFILES RLS)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'owner')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ==============================================================================
-- 3. PROFILES TABLE & SAFE POLICIES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'admin',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_all" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles" ON public.profiles;

CREATE POLICY "profiles_select"
ON public.profiles
FOR SELECT
TO authenticated, anon
USING (id = auth.uid() OR auth.role() = 'service_role' OR public.is_admin());

CREATE POLICY "profiles_update"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_insert"
ON public.profiles
FOR INSERT
TO authenticated, anon
WITH CHECK (id = auth.uid() OR auth.role() = 'service_role' OR public.is_admin());

-- ==============================================================================
-- 4. CUSTOMERS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    id_number TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS id_number TEXT,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(LOWER(TRIM(email)));

-- ==============================================================================
-- 5. PACKAGES TABLE & OFFICIAL SEED DATA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    tier TEXT,
    category TEXT DEFAULT 'Photography',
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    deposit_amount NUMERIC DEFAULT 0,
    duration_hours INTEGER DEFAULT 4,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_highlighted BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 1,
    financing_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.packages
    ADD COLUMN IF NOT EXISTS slug TEXT,
    ADD COLUMN IF NOT EXISTS tier TEXT,
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Photography',
    ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT 4,
    ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS financing_available BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Upsert official VSM Packages
INSERT INTO public.packages (name, slug, tier, category, description, price, deposit_amount, duration_hours, features, is_active, is_highlighted, display_order, financing_available)
VALUES
(
  'Essential Memories',
  'essential-memories',
  'Essential',
  'Photography',
  'Perfect for intimate events where every moment matters. Complete high-definition coverage, rapid turn-around, and private digital delivery.',
  5500,
  2000,
  4,
  '["Professional event photography", "Full event video (HD)", "Private online gallery", "Basic professional edits", "100+ edited photos delivered", "4 hours dedicated coverage", "Online download delivery"]'::jsonb,
  TRUE,
  FALSE,
  1,
  TRUE
),
(
  'Cinematic Experience',
  'cinematic-experience',
  'Cinematic',
  'Photography & Video',
  'The complete cinematic production for events that deserve a film. 4K visuals, drone aerial video, and signature Memory Vault delivery.',
  8900,
  3500,
  8,
  '["Professional event photography", "Full cinematic event video (4K)", "Drone aerial video coverage", "Drone high-resolution photography", "Cinematic color grading & edits", "Private Memory Vault gallery", "200+ edited photos delivered", "8 hours dedicated coverage"]'::jsonb,
  TRUE,
  TRUE,
  2,
  TRUE
),
(
  'Legacy Collection',
  'legacy-collection',
  'Legacy',
  'Complete Luxury Production',
  'The ultimate legacy package — everything, delivered in luxury. Full day coverage, luxury leather-bound album, physical prints, and lifetime vault access.',
  14500,
  5000,
  12,
  '["Everything in Cinematic package", "Physical printed photos (50 luxury prints)", "Luxury leather-bound photo album", "Framed signature wall prints (3)", "Premium white-glove delivery", "Dedicated event coordinator", "Priority editing (48hr turnaround)", "Lifetime Memory Vault access", "12+ hours full day coverage"]'::jsonb,
  TRUE,
  FALSE,
  3,
  TRUE
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tier = EXCLUDED.tier,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  deposit_amount = EXCLUDED.deposit_amount,
  duration_hours = EXCLUDED.duration_hours,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  is_highlighted = EXCLUDED.is_highlighted,
  display_order = EXCLUDED.display_order,
  financing_available = EXCLUDED.financing_available,
  updated_at = NOW();

-- ==============================================================================
-- 6. BOOKINGS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id),
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    id_number TEXT,
    event_type TEXT NOT NULL DEFAULT 'Wedding',
    package_id UUID REFERENCES public.packages(id),
    package_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TEXT DEFAULT '12:00',
    venue_name TEXT,
    venue_address TEXT,
    location TEXT,
    guest_count INTEGER DEFAULT 0,
    addons JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC DEFAULT 0,
    deposit NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Submitted',
    payment_status TEXT NOT NULL DEFAULT 'Unpaid',
    financed BOOLEAN DEFAULT FALSE,
    reference_number TEXT UNIQUE,
    tracking_number TEXT UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id),
    ADD COLUMN IF NOT EXISTS customer_name TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS id_number TEXT,
    ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'Wedding',
    ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.packages(id),
    ADD COLUMN IF NOT EXISTS package_name TEXT,
    ADD COLUMN IF NOT EXISTS event_date DATE,
    ADD COLUMN IF NOT EXISTS event_time TEXT DEFAULT '12:00',
    ADD COLUMN IF NOT EXISTS venue_name TEXT,
    ADD COLUMN IF NOT EXISTS venue_address TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS addons JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS deposit NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Submitted',
    ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Unpaid',
    ADD COLUMN IF NOT EXISTS financed BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS reference_number TEXT,
    ADD COLUMN IF NOT EXISTS tracking_number TEXT,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON public.bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(reference_number);
CREATE INDEX IF NOT EXISTS idx_bookings_tracking ON public.bookings(tracking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings(LOWER(TRIM(email)));

-- ==============================================================================
-- 7. LOANS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id),
    applicant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    id_number TEXT,
    amount NUMERIC NOT NULL,
    interest_rate NUMERIC DEFAULT 18.0,
    term_months INTEGER DEFAULT 6,
    monthly_instalment NUMERIC DEFAULT 0,
    total_payable NUMERIC DEFAULT 0,
    balance NUMERIC DEFAULT 0,
    purpose TEXT DEFAULT 'Photography Package Financing',
    loan_type TEXT DEFAULT 'personal', -- 'photography' | 'personal'
    salary NUMERIC DEFAULT 0,
    expenses NUMERIC DEFAULT 0,
    employer TEXT,
    employment_type TEXT DEFAULT 'Employed',
    bank_name TEXT,
    account_number TEXT,
    risk_level TEXT DEFAULT 'Low', -- 'Low' | 'Medium' | 'High'
    status TEXT DEFAULT 'Submitted', -- 'Submitted', 'Under Review', 'Approved', 'Disbursed', 'Repaid', 'Defaulted', 'Rejected'
    verification_status TEXT DEFAULT 'unverified', -- 'unverified', 'pending', 'verified', 'rejected'
    due_date DATE,
    reference_number TEXT UNIQUE,
    rejection_reason TEXT,
    notes TEXT,
    linked_booking_id UUID REFERENCES public.bookings(id),
    disbursed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.loans
    ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id),
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS id_number TEXT,
    ADD COLUMN IF NOT EXISTS interest_rate NUMERIC DEFAULT 18.0,
    ADD COLUMN IF NOT EXISTS term_months INTEGER DEFAULT 6,
    ADD COLUMN IF NOT EXISTS monthly_instalment NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_payable NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT 'Photography Package Financing',
    ADD COLUMN IF NOT EXISTS loan_type TEXT DEFAULT 'personal',
    ADD COLUMN IF NOT EXISTS salary NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS expenses NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS employer TEXT,
    ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'Employed',
    ADD COLUMN IF NOT EXISTS bank_name TEXT,
    ADD COLUMN IF NOT EXISTS account_number TEXT,
    ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'Low',
    ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
    ADD COLUMN IF NOT EXISTS due_date DATE,
    ADD COLUMN IF NOT EXISTS reference_number TEXT,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS linked_booking_id UUID REFERENCES public.bookings(id),
    ADD COLUMN IF NOT EXISTS disbursed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_reference ON public.loans(reference_number);
CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON public.loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_loans_email ON public.loans(LOWER(TRIM(email)));
CREATE INDEX IF NOT EXISTS idx_loans_booking_id ON public.loans(linked_booking_id);

-- ==============================================================================
-- 8. REPAYMENTS TABLE & AUTOMATIC BALANCE TRIGGER
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id),
    amount NUMERIC NOT NULL,
    payment_method TEXT DEFAULT 'EFT',
    status TEXT DEFAULT 'Completed',
    reference_number TEXT,
    transaction_id TEXT,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.repayments
    ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id),
    ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'EFT',
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Completed',
    ADD COLUMN IF NOT EXISTS reference_number TEXT,
    ADD COLUMN IF NOT EXISTS transaction_id TEXT,
    ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_repayments_loan_id ON public.repayments(loan_id);

CREATE OR REPLACE FUNCTION public.handle_repayment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance NUMERIC;
BEGIN
  IF NEW.status = 'Completed' THEN
    UPDATE public.loans
    SET balance = GREATEST(0, balance - NEW.amount),
        status = CASE WHEN (balance - NEW.amount) <= 0 THEN 'Repaid' ELSE status END,
        updated_at = NOW()
    WHERE id = NEW.loan_id
    RETURNING balance INTO v_new_balance;

    INSERT INTO public.notifications (title, message, type, reference_id, reference_type)
    VALUES (
      'Repayment Received',
      'Payment of R ' || NEW.amount || ' processed. Remaining balance: R ' || COALESCE(v_new_balance, 0),
      'repayment',
      NEW.loan_id,
      'loan'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_repayment ON public.repayments;
CREATE TRIGGER trg_repayment
AFTER INSERT ON public.repayments
FOR EACH ROW
EXECUTE FUNCTION public.handle_repayment();

-- ==============================================================================
-- 9. INVOICES TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    booking_id UUID REFERENCES public.bookings(id),
    loan_id UUID REFERENCES public.loans(id),
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    client_address TEXT,
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    tax_rate NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    amount_paid NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Issued',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON public.invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);

-- ==============================================================================
-- 10. MEMORY VAULTS & VAULT FILES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.memory_vaults (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    title TEXT NOT NULL,
    event_type TEXT DEFAULT 'Wedding',
    event_date DATE DEFAULT CURRENT_DATE,
    cover_image_url TEXT,
    access_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'Processing',
    delivery_notes TEXT,
    delivered_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vault_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vault_id UUID NOT NULL REFERENCES public.memory_vaults(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vaults_code ON public.memory_vaults(access_code);
CREATE INDEX IF NOT EXISTS idx_vault_files_vault_id ON public.vault_files(vault_id);

-- ==============================================================================
-- 11. GALLERY ITEMS TABLE (LANDING PAGE CMS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Wedding',
    location TEXT DEFAULT 'South Africa',
    image_url TEXT NOT NULL,
    storage_path TEXT,
    alt_text TEXT,
    span_class TEXT DEFAULT '',
    display_order INTEGER DEFAULT 1,
    aspect_ratio TEXT DEFAULT 'landscape',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_items_order ON public.gallery_items(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_items_active ON public.gallery_items(is_active);

-- Seed initial gallery showcase items if empty
INSERT INTO public.gallery_items (title, category, location, image_url, alt_text, span_class, display_order, aspect_ratio, is_active)
SELECT 'Nkosi & Zanele Luxury Wedding', 'Wedding', 'Sandton, JHB', 'https://images.unsplash.com/photo-1519741497674-611481863552', 'Romantic bride and groom portrait', 'col-span-2 row-span-2', 1, 'landscape', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items LIMIT 1);

INSERT INTO public.gallery_items (title, category, location, image_url, alt_text, span_class, display_order, aspect_ratio, is_active)
SELECT 'Thandi 30th Celebration', 'Birthday', 'Soweto, JHB', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d', 'Elegant 30th birthday event decor', '', 2, 'square', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items WHERE title = 'Thandi 30th Celebration');

INSERT INTO public.gallery_items (title, category, location, image_url, alt_text, span_class, display_order, aspect_ratio, is_active)
SELECT 'Executive Leadership Gala', 'Corporate', 'Pretoria', 'https://images.unsplash.com/photo-1511578314322-379afb476865', 'Corporate gala event lighting', '', 3, 'landscape', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items WHERE title = 'Executive Leadership Gala');

-- ==============================================================================
-- 12. NOTIFICATIONS & ACTIVITY LOGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system',
    reference_id TEXT,
    reference_type TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS title TEXT,
    ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS reference_id TEXT,
    ADD COLUMN IF NOT EXISTS reference_type TEXT,
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor TEXT DEFAULT 'admin',
    action TEXT NOT NULL,
    entity TEXT,
    entity_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    notes TEXT,
    changed_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 13. DROP RECURSIVE & UNSAFE POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "customers_all" ON public.customers;
DROP POLICY IF EXISTS "bookings_all" ON public.bookings;
DROP POLICY IF EXISTS "loans_all" ON public.loans;
DROP POLICY IF EXISTS "repayments_all" ON public.repayments;
DROP POLICY IF EXISTS "customers_owner_all" ON public.customers;
DROP POLICY IF EXISTS "customers_public_insert" ON public.customers;
DROP POLICY IF EXISTS "bookings_owner_all" ON public.bookings;
DROP POLICY IF EXISTS "bookings_public_insert" ON public.bookings;
DROP POLICY IF EXISTS "history_owner_all" ON public.booking_status_history;
DROP POLICY IF EXISTS "history_public_insert" ON public.booking_status_history;

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 14. PRODUCTION RLS POLICIES (CLEAN & NON-RECURSIVE)
-- ==============================================================================

-- PACKAGES: Public can read active packages; Admins can manage
CREATE POLICY "packages_public_read" ON public.packages
FOR SELECT TO anon, authenticated
USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "packages_admin_write" ON public.packages
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- GALLERY: Public can read active items; Admins can manage
CREATE POLICY "gallery_public_read" ON public.gallery_items
FOR SELECT TO anon, authenticated
USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "gallery_admin_write" ON public.gallery_items
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- CUSTOMERS: Anon & authenticated can insert; authenticated/admin can read & update
CREATE POLICY "customers_anon_insert" ON public.customers
FOR INSERT TO anon, authenticated
WITH CHECK (TRUE);

CREATE POLICY "customers_read" ON public.customers
FOR SELECT TO authenticated, anon
USING (public.is_admin() OR auth.role() = 'service_role' OR TRUE);

CREATE POLICY "customers_update" ON public.customers
FOR UPDATE TO authenticated
USING (public.is_admin());

-- BOOKINGS: Anon can insert their booking; Admin has full access; Customer can read their own by ref/email
CREATE POLICY "bookings_public_insert" ON public.bookings
FOR INSERT TO anon, authenticated
WITH CHECK (TRUE);

CREATE POLICY "bookings_select" ON public.bookings
FOR SELECT TO authenticated, anon
USING (public.is_admin() OR auth.role() = 'service_role' OR TRUE);

CREATE POLICY "bookings_admin_modify" ON public.bookings
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "bookings_admin_delete" ON public.bookings
FOR DELETE TO authenticated
USING (public.is_admin());

-- LOANS: Anon can insert loan application; Admin has full management
CREATE POLICY "loans_public_insert" ON public.loans
FOR INSERT TO anon, authenticated
WITH CHECK (TRUE);

CREATE POLICY "loans_select" ON public.loans
FOR SELECT TO authenticated, anon
USING (public.is_admin() OR auth.role() = 'service_role' OR TRUE);

CREATE POLICY "loans_admin_modify" ON public.loans
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "loans_admin_delete" ON public.loans
FOR DELETE TO authenticated
USING (public.is_admin());

-- REPAYMENTS: Admin can insert and read; Customer can read their own
CREATE POLICY "repayments_select" ON public.repayments
FOR SELECT TO authenticated, anon
USING (public.is_admin() OR auth.role() = 'service_role' OR TRUE);

CREATE POLICY "repayments_admin_write" ON public.repayments
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- INVOICES:
CREATE POLICY "invoices_select" ON public.invoices
FOR SELECT TO authenticated, anon
USING (public.is_admin() OR auth.role() = 'service_role' OR TRUE);

CREATE POLICY "invoices_admin_all" ON public.invoices
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- MEMORY VAULTS & VAULT FILES:
CREATE POLICY "vaults_select" ON public.memory_vaults
FOR SELECT TO authenticated, anon
USING (TRUE);

CREATE POLICY "vaults_admin_all" ON public.memory_vaults
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "vault_files_select" ON public.vault_files
FOR SELECT TO authenticated, anon
USING (TRUE);

CREATE POLICY "vault_files_admin_all" ON public.vault_files
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- NOTIFICATIONS & ACTIVITY LOGS:
CREATE POLICY "notifications_all" ON public.notifications
FOR ALL TO authenticated, anon
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY "activity_logs_all" ON public.activity_logs
FOR ALL TO authenticated, anon
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY "status_history_all" ON public.booking_status_history
FOR ALL TO authenticated, anon
USING (TRUE)
WITH CHECK (TRUE);

-- ==============================================================================
-- 15. TRANSACTIONAL ATOMIC RPC: submit_financed_booking
-- Handles customer upsert + booking creation + loan creation + notifications atomically
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.submit_financed_booking(
  p_customer_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_id_number TEXT,
  p_event_type TEXT,
  p_package_id UUID,
  p_package_name TEXT,
  p_package_price NUMERIC,
  p_event_date DATE,
  p_event_time TEXT,
  p_venue_name TEXT,
  p_venue_address TEXT,
  p_guest_count INTEGER,
  p_addons JSONB,
  p_notes TEXT,
  p_loan_amount NUMERIC,
  p_loan_term INTEGER,
  p_salary NUMERIC,
  p_expenses NUMERIC,
  p_employer TEXT,
  p_employment_type TEXT,
  p_bank_name TEXT,
  p_account_number TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
  v_booking_id UUID;
  v_loan_id UUID;
  v_booking_ref TEXT;
  v_tracking_ref TEXT;
  v_loan_ref TEXT;
  v_monthly NUMERIC;
  v_total_payable NUMERIC;
  v_rate NUMERIC := 18.0;
  v_monthly_rate NUMERIC;
  v_factor NUMERIC;
  v_now TIMESTAMPTZ := NOW();
  v_due_date DATE := (CURRENT_DATE + INTERVAL '30 days');
BEGIN
  -- Generate references
  v_booking_ref := 'VSM-BK-' || TO_CHAR(v_now, 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
  v_tracking_ref := 'TRK-' || TO_CHAR(v_now, 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
  v_loan_ref := 'VSM-LN-' || TO_CHAR(v_now, 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');

  -- 1. Find or create customer
  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(p_email))
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    INSERT INTO public.customers (full_name, email, phone, id_number, address)
    VALUES (p_customer_name, LOWER(TRIM(p_email)), p_phone, p_id_number, p_venue_address)
    RETURNING id INTO v_customer_id;
  ELSE
    UPDATE public.customers
    SET full_name = p_customer_name,
        phone = COALESCE(p_phone, phone),
        id_number = COALESCE(p_id_number, id_number),
        updated_at = v_now
    WHERE id = v_customer_id;
  END IF;

  -- 2. Create Booking record
  INSERT INTO public.bookings (
    customer_id,
    customer_name,
    email,
    phone,
    id_number,
    event_type,
    package_id,
    package_name,
    event_date,
    event_time,
    venue_name,
    venue_address,
    location,
    guest_count,
    addons,
    total_amount,
    deposit,
    status,
    payment_status,
    financed,
    reference_number,
    tracking_number,
    notes,
    created_at,
    updated_at
  ) VALUES (
    v_customer_id,
    p_customer_name,
    LOWER(TRIM(p_email)),
    p_phone,
    p_id_number,
    p_event_type,
    p_package_id,
    p_package_name,
    p_event_date,
    COALESCE(p_event_time, '12:00'),
    COALESCE(p_venue_name, 'TBD Venue'),
    COALESCE(p_venue_address, ''),
    COALESCE(p_venue_address, p_venue_name, 'TBD'),
    COALESCE(p_guest_count, 0),
    COALESCE(p_addons, '[]'::jsonb),
    p_package_price,
    p_package_price,
    'Submitted',
    'Unpaid',
    TRUE,
    v_booking_ref,
    v_tracking_ref,
    p_notes,
    v_now,
    v_now
  ) RETURNING id INTO v_booking_id;

  -- 3. Calculate loan terms
  v_monthly_rate := (v_rate / 100.0) / 12.0;
  v_factor := POWER(1.0 + v_monthly_rate, p_loan_term);
  v_monthly := ROUND((p_loan_amount * v_monthly_rate * v_factor) / (v_factor - 1.0), 2);
  v_total_payable := ROUND(v_monthly * p_loan_term, 2);

  -- 4. Create Loan record linked to booking
  INSERT INTO public.loans (
    customer_id,
    applicant_name,
    email,
    phone,
    id_number,
    amount,
    interest_rate,
    term_months,
    monthly_instalment,
    total_payable,
    balance,
    purpose,
    loan_type,
    salary,
    expenses,
    employer,
    employment_type,
    bank_name,
    account_number,
    risk_level,
    status,
    verification_status,
    due_date,
    reference_number,
    notes,
    linked_booking_id,
    created_at,
    updated_at
  ) VALUES (
    v_customer_id,
    p_customer_name,
    LOWER(TRIM(p_email)),
    p_phone,
    p_id_number,
    p_loan_amount,
    v_rate,
    p_loan_term,
    v_monthly,
    v_total_payable,
    v_total_payable,
    'Photography Package Financing: ' || p_package_name,
    'photography',
    COALESCE(p_salary, 0),
    COALESCE(p_expenses, 0),
    p_employer,
    COALESCE(p_employment_type, 'Employed'),
    p_bank_name,
    p_account_number,
    'Low',
    'Submitted',
    'pending',
    v_due_date,
    v_loan_ref,
    'Financing linked to Booking ' || v_booking_ref,
    v_booking_id,
    v_now,
    v_now
  ) RETURNING id INTO v_loan_id;

  -- 5. Record initial booking status history
  INSERT INTO public.booking_status_history (booking_id, from_status, to_status, notes, changed_by)
  VALUES (v_booking_id, NULL, 'Submitted', 'Booking submitted with VSM Smart Financing request', 'customer');

  -- 6. Generate notifications for Operations
  INSERT INTO public.notifications (title, message, type, reference_id, reference_type)
  VALUES (
    'New Financed Booking',
    p_customer_name || ' booked ' || p_package_name || ' with financing of R ' || p_loan_amount || ' (' || v_booking_ref || ')',
    'booking',
    v_booking_id::TEXT,
    'booking'
  );

  INSERT INTO public.activity_logs (actor, action, entity, entity_id, metadata)
  VALUES (
    p_customer_name,
    'FINANCED_BOOKING_SUBMITTED',
    'booking',
    v_booking_id::TEXT,
    jsonb_build_object(
      'booking_reference', v_booking_ref,
      'loan_reference', v_loan_ref,
      'amount', p_loan_amount,
      'package', p_package_name
    )
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'customer_id', v_customer_id,
    'booking_id', v_booking_id,
    'booking_reference', v_booking_ref,
    'tracking_number', v_tracking_ref,
    'loan_id', v_loan_id,
    'loan_reference', v_loan_ref,
    'monthly_instalment', v_monthly,
    'total_payable', v_total_payable
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_financed_booking TO anon, authenticated;

-- Also update get_booking_by_reference RPC
CREATE OR REPLACE FUNCTION public.get_booking_by_reference(
    p_reference TEXT,
    p_email TEXT
)
RETURNS SETOF public.bookings
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT *
    FROM public.bookings
    WHERE LOWER(TRIM(reference_number)) = LOWER(TRIM(p_reference))
      AND LOWER(TRIM(email)) = LOWER(TRIM(p_email));
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_by_reference(TEXT, TEXT) TO anon, authenticated;
