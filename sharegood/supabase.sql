create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  phone text not null unique check (phone ~ '^[0-9]{10}$'),
  age_group text not null check (age_group in ('Teenager','Adult','Middle-aged')),
  address text not null check (char_length(address) between 10 and 300),
  delivery_location text not null default 'Guntur',
  created_at timestamptz not null default now()
);
-- RLS on with no public policies: only the server (service role key) can write or read.
alter table public.customers enable row level security;
