-- ==============================================================================
-- VSM COMPLETE PRODUCTION SCHEMA
-- Two Services. One Platform.
-- Source of Truth for Database Structure
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Security Definer Admin helper (breaks infinite RLS recursion)
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

-- Profiles
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

-- Customers
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

-- Packages
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

-- Bookings
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

-- Loans
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
    loan_type TEXT DEFAULT 'personal',
    salary NUMERIC DEFAULT 0,
    expenses NUMERIC DEFAULT 0,
    employer TEXT,
    employment_type TEXT DEFAULT 'Employed',
    bank_name TEXT,
    account_number TEXT,
    risk_level TEXT DEFAULT 'Low',
    status TEXT DEFAULT 'Submitted',
    verification_status TEXT DEFAULT 'unverified',
    due_date DATE,
    reference_number TEXT UNIQUE,
    rejection_reason TEXT,
    notes TEXT,
    linked_booking_id UUID REFERENCES public.bookings(id),
    disbursed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Repayments
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

-- Invoices
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

-- Memory Vaults
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

-- Gallery Items (CMS)
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

-- Notifications & Logs
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