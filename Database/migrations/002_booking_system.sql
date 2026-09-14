-- ==============================================================================
-- VSM PHASE 2: BOOKINGS + CUSTOMER TRACKING (FIXED VERSION)
-- ==============================================================================

-- ==============================================================================
-- 1. EXTEND BOOKINGS TABLE (SAFE + COMPLETE)
-- ==============================================================================

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS reference_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS tracking_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS venue_name TEXT,
ADD COLUMN IF NOT EXISTS venue_address TEXT,
ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS addons JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS id_number TEXT,
ADD COLUMN IF NOT EXISTS financed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================================================
-- 2. INDEXES (ONLY AFTER COLUMNS EXIST)
-- ==============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_reference
ON public.bookings(reference_number);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_tracking
ON public.bookings(tracking_number);

CREATE INDEX IF NOT EXISTS idx_bookings_email
ON public.bookings(email);

CREATE INDEX IF NOT EXISTS idx_customers_email
ON public.customers(email);

-- ==============================================================================
-- 3. BOOKING STATUS HISTORY TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    notes TEXT,
    changed_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_history_booking
ON public.booking_status_history(booking_id);

-- ==============================================================================
-- 4. RPC FUNCTIONS (SAFE LOOKUPS)
-- ==============================================================================

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
    WHERE reference_number = p_reference
      AND LOWER(TRIM(email)) = LOWER(TRIM(p_email));
$$;

CREATE OR REPLACE FUNCTION public.get_customer_bookings(
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
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(p_email))
    ORDER BY created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_booking_status_history(
    p_booking_id UUID,
    p_email TEXT
)
RETURNS SETOF public.booking_status_history
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT h.*
    FROM public.booking_status_history h
    INNER JOIN public.bookings b ON b.id = h.booking_id
    WHERE h.booking_id = p_booking_id
      AND LOWER(TRIM(b.email)) = LOWER(TRIM(p_email))
    ORDER BY h.created_at ASC;
$$;

-- ==============================================================================
-- 5. ENABLE RLS
-- ==============================================================================

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 6. DROP OLD POLICIES (SAFE RE-RUN)
-- ==============================================================================

DROP POLICY IF EXISTS "bookings_owner_all" ON public.bookings;
DROP POLICY IF EXISTS "bookings_public_insert" ON public.bookings;

DROP POLICY IF EXISTS "customers_owner_all" ON public.customers;
DROP POLICY IF EXISTS "customers_public_insert" ON public.customers;

DROP POLICY IF EXISTS "history_owner_all" ON public.booking_status_history;
DROP POLICY IF EXISTS "history_public_insert" ON public.booking_status_history;

-- ==============================================================================
-- 7. RLS POLICIES
-- ==============================================================================

-- BOOKINGS
CREATE POLICY "bookings_owner_all"
ON public.bookings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "bookings_public_insert"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- CUSTOMERS
CREATE POLICY "customers_owner_all"
ON public.customers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "customers_public_insert"
ON public.customers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- HISTORY
CREATE POLICY "history_owner_all"
ON public.booking_status_history
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "history_public_insert"
ON public.booking_status_history
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ==============================================================================
-- 8. GRANT RPC ACCESS
-- ==============================================================================

GRANT EXECUTE ON FUNCTION public.get_booking_by_reference(text, text)
TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_customer_bookings(text)
TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_booking_status_history(uuid, text)
TO anon, authenticated;