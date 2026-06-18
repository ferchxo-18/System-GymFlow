-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clients (Members)
create table public.clients (
  id text primary key default gen_random_uuid()::text,
  "fullName" text not null,
  dni text not null,
  phone text not null,
  email text not null,
  "joinDate" text not null,
  "membershipType" text not null,
  "membershipExpiry" text not null,
  status text not null,
  "avatarUrl" text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payments
create table public.payments (
  id text primary key default gen_random_uuid()::text,
  "clientId" text not null,
  "clientName" text not null,
  amount numeric not null,
  date text not null,
  method text not null,
  concept text not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Staff
create table public.staff (
  id text primary key default gen_random_uuid()::text,
  "fullName" text not null,
  role text not null,
  status text not null,
  phone text not null,
  email text not null,
  "hiredDate" text not null,
  "shiftStart" text not null,
  "shiftEnd" text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Attendance (Staff Attendance)
create table public.attendance (
  id text primary key default gen_random_uuid()::text,
  "staffId" text not null,
  date text not null,
  "checkIn" text not null,
  "checkOut" text,
  "hoursWorked" numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inventory (Products)
create table public.inventory (
  id text primary key default gen_random_uuid()::text,
  code text not null,
  name text not null,
  category text not null,
  stock integer not null,
  "minStock" integer not null,
  price numeric not null,
  "lastRestock" text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Measurements
create table public.measurements (
  id text primary key default gen_random_uuid()::text,
  "clientId" text not null,
  date text not null,
  weight numeric not null,
  height numeric not null,
  imc numeric not null,
  waist numeric not null,
  chest numeric not null,
  arms numeric not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Users (Application Admins / Managers)
create table public.users (
  id text primary key default gen_random_uuid()::text,
  username text not null,
  password text not null,
  "fullName" text not null,
  role text not null,
  "avatarUrl" text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set Row Level Security (RLS) to open for testing (In production, use auth constraints)
alter table public.clients enable row level security;
alter table public.payments enable row level security;
alter table public.staff enable row level security;
alter table public.attendance enable row level security;
alter table public.inventory enable row level security;
alter table public.measurements enable row level security;
alter table public.users enable row level security;

create policy "Allow all access" on public.clients for all using (true);
create policy "Allow all access" on public.payments for all using (true);
create policy "Allow all access" on public.staff for all using (true);
create policy "Allow all access" on public.attendance for all using (true);
create policy "Allow all access" on public.inventory for all using (true);
create policy "Allow all access" on public.measurements for all using (true);
create policy "Allow all access" on public.users for all using (true);
