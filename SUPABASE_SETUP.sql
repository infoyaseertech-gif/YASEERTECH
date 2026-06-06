-- ============================================================
--  YASEERTECH ERP — SUPABASE SETUP SQL
--  Go to: supabase.com → your project → SQL Editor → New Query
--  Paste ALL of this → Click RUN
-- ============================================================

-- STEP 1: Create all tables if they don't exist
CREATE TABLE IF NOT EXISTS users (
    id          bigserial PRIMARY KEY,
    created_at  timestamptz DEFAULT now(),
    name        text,
    email       text,
    password    text,
    role        text DEFAULT 'staff',
    status      text DEFAULT 'active',
    permissions text DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS invoices (
    id           bigserial PRIMARY KEY,
    created_at   timestamptz DEFAULT now(),
    number       text,
    client_name  text,
    client_email text,
    client_phone text,
    service      text,
    date         date,
    due_date     date,
    subtotal     numeric DEFAULT 0,
    tax_rate     numeric DEFAULT 0,
    tax          numeric DEFAULT 0,
    total        numeric DEFAULT 0,
    items        jsonb,
    notes        text,
    status       text DEFAULT 'Pending',
    added_by     text,
    added_role   text
);

CREATE TABLE IF NOT EXISTS expenses (
    id          bigserial PRIMARY KEY,
    created_at  timestamptz DEFAULT now(),
    description text,
    category    text,
    amount      numeric DEFAULT 0,
    date        date,
    added_by    text,
    added_role  text
);

CREATE TABLE IF NOT EXISTS staff (
    id          bigserial PRIMARY KEY,
    created_at  timestamptz DEFAULT now(),
    name        text,
    position    text,
    phone       text,
    status      text DEFAULT 'Active',
    date_added  date
);

CREATE TABLE IF NOT EXISTS notifications (
    id          bigserial PRIMARY KEY,
    created_at  timestamptz DEFAULT now(),
    type        text,
    title       text,
    message     text,
    icon        text,
    actor_name  text,
    is_read     boolean DEFAULT false
);

-- STEP 2: Add any missing columns to existing tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions text DEFAULT '[]';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS service text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS added_by text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS added_role text;

-- STEP 3: DISABLE Row Level Security on ALL tables
--         This is the most important step — without this nothing works
ALTER TABLE users         DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices      DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses      DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff         DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- STEP 4: Drop any existing RLS policies that may block access
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON invoices;
DROP POLICY IF EXISTS "Enable read access for all users" ON expenses;
DROP POLICY IF EXISTS "Enable read access for all users" ON staff;

-- STEP 5: Grant full access to anon role on all tables
GRANT ALL ON users TO anon;
GRANT ALL ON invoices TO anon;
GRANT ALL ON expenses TO anon;
GRANT ALL ON staff TO anon;
GRANT ALL ON notifications TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- STEP 6: Confirm your admin account exists
--         If the row already exists this will do nothing (safe to run)
INSERT INTO users (name, email, password, role, status, permissions)
VALUES ('Yaseer', 'infoyaseertech@gmail.com', 'adminyaseertech', 'admin', 'active', '[]')
ON CONFLICT DO NOTHING;

-- DONE. You should see: "Success. No rows returned"
