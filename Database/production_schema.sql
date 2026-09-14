



-- ==============================================================================
-- VSM PRODUCTION DATABASE SCHEMA (FIXED)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CORE TABLES (CREATE FIRST ✅)
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

CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Photography',
    description TEXT,
    price NUMERIC DEFAULT 0,
    duration_hours INTEGER DEFAULT 4,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id),
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    package_id UUID REFERENCES public.packages(id),
    package_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    total_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Submitted',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id),
    applicant_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Submitted',
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. DROP OLD POLICIES (NOW SAFE ✅)
-- ==============================================================================

DROP POLICY IF EXISTS "customers_admin_all" ON public.customers;
DROP POLICY IF EXISTS "customers_anon_insert" ON public.customers;

DROP POLICY IF EXISTS "bookings_admin_all" ON public.bookings;
DROP POLICY IF EXISTS "bookings_anon_insert" ON public.bookings;

DROP POLICY IF EXISTS "loans_admin_all" ON public.loans;
DROP POLICY IF EXISTS "repayments_admin_all" ON public.repayments;

-- ==============================================================================
-- 4. ENABLE RLS
-- ==============================================================================

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. POLICIES (SAFE)
-- ==============================================================================

CREATE POLICY "customers_all"
ON public.customers
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "bookings_all"
ON public.bookings
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "loans_all"
ON public.loans
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "repayments_all"
ON public.repayments
FOR ALL
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 6. TRIGGERS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_repayment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.loans
  SET balance = balance - NEW.amount
  WHERE id = NEW.loan_id;

  INSERT INTO public.notifications (title, message)
  VALUES ('Repayment Received', 'Payment received');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_repayment ON public.repayments;

CREATE TRIGGER trg_repayment
AFTER INSERT ON public.repayments
FOR EACH ROW
EXECUTE FUNCTION public.handle_repayment();

-- ==============================================================================
-- 7. SEED DATA
-- ==============================================================================

INSERT INTO public.packages (name, price)
SELECT 'Starter Package', 2500
WHERE NOT EXISTS (SELECT 1 FROM public.packages WHERE name = 'Starter Package');