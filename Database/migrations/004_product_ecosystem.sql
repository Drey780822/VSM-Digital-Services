-- VSM product-ecosystem configuration and operational workflows.
-- Run after the existing production migrations.

CREATE TABLE IF NOT EXISTS public.product_settings (
  setting_key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.corporate_enquiries (
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
  stage TEXT NOT NULL DEFAULT 'Proposal' CHECK (stage IN ('Proposal', 'Quote', 'Contract', 'Invoice', 'Booking')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.creative_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organisation TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE,
  role TEXT NOT NULL,
  scope TEXT NOT NULL,
  deliverables TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Open', 'Closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.outreach_crm (
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

CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corporate_enquiries_stage ON public.corporate_enquiries(stage);
CREATE INDEX IF NOT EXISTS idx_creative_opportunities_status ON public.creative_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_outreach_crm_stage ON public.outreach_crm(stage);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_booking ON public.payment_proofs(booking_id);

ALTER TABLE public.product_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_crm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

-- Public customers can submit a corporate brief and read only published opportunities.
DROP POLICY IF EXISTS "product_settings_public_read" ON public.product_settings;
CREATE POLICY "product_settings_public_read" ON public.product_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "product_settings_admin_write" ON public.product_settings;
CREATE POLICY "product_settings_admin_write" ON public.product_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "corporate_enquiries_public_insert" ON public.corporate_enquiries;
CREATE POLICY "corporate_enquiries_public_insert" ON public.corporate_enquiries FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "corporate_enquiries_admin_all" ON public.corporate_enquiries;
CREATE POLICY "corporate_enquiries_admin_all" ON public.corporate_enquiries FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "creative_opportunities_public_open_read" ON public.creative_opportunities;
CREATE POLICY "creative_opportunities_public_open_read" ON public.creative_opportunities FOR SELECT USING (status = 'Open');
DROP POLICY IF EXISTS "creative_opportunities_admin_all" ON public.creative_opportunities;
CREATE POLICY "creative_opportunities_admin_all" ON public.creative_opportunities FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "outreach_crm_admin_all" ON public.outreach_crm;
CREATE POLICY "outreach_crm_admin_all" ON public.outreach_crm FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "payment_proofs_authenticated_insert" ON public.payment_proofs;
CREATE POLICY "payment_proofs_authenticated_insert" ON public.payment_proofs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "payment_proofs_admin_all" ON public.payment_proofs;
CREATE POLICY "payment_proofs_admin_all" ON public.payment_proofs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Private storage for EFT proof-of-payment uploads. Admin users review the files from the payment-verification queue.
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "payment_proofs_upload" ON storage.objects;
CREATE POLICY "payment_proofs_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'payment-proofs');
DROP POLICY IF EXISTS "payment_proofs_admin_read" ON storage.objects;
CREATE POLICY "payment_proofs_admin_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'payment-proofs' AND public.is_admin());

