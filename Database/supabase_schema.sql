create extension if not exists pgcrypto;

create table if not exists public.owner_account (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  id_number text,
  created_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  customer_name text not null,
  email text,
  phone text,
  event_type text not null,
  package_name text,
  event_date date not null,
  event_time text,
  location text,
  status text not null default 'Submitted',
  total_amount numeric default 0,
  reference_number text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.loan_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_name text not null,
  amount numeric not null,
  purpose text not null,
  salary numeric,
  risk_level text default 'Low',
  status text not null default 'Submitted',
  reference_number text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  created_at timestamptz default now()
);

create table if not exists public.event_galleries (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  gallery_name text,
  event_type text,
  event_date date,
  upload_date timestamptz default now(),
  storage_path text,
  gallery_status text default 'Pending'
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_event_date on public.bookings(event_date);
create index if not exists idx_loans_status on public.loan_applications(status);
