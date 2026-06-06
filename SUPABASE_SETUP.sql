-- ============================================================
--  YASEERTECH ERP — SUPABASE SETUP SQL
--  Run this in Supabase > SQL Editor > New Query > Run
-- ============================================================

-- 1. USERS TABLE (add missing columns if they don't exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions text DEFAULT '[]';

-- 2. INVOICES TABLE (drop old if needed, recreate cleanly)
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

-- 3. EXPENSES TABLE
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

-- 4. STAFF TABLE
CREATE TABLE IF NOT EXISTS staff (
    id          bigserial PRIMARY KEY,
    created_at  timestamptz DEFAULT now(),
    name        text,
    position    text,
    phone       text,
    status      text DEFAULT 'Active',
    date_added  date
);

-- 5. NOTIFICATIONS TABLE
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

-- 6. DISABLE ROW LEVEL SECURITY on all tables (so the app can read/write freely)
ALTER TABLE users         DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices      DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses      DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff         DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 7. CONFIRM your admin account exists (update if needed)
-- If you need to reset your admin, run this:
-- UPDATE users SET password = 'adminyaseertech', role = 'admin', status = 'active', permissions = '[]'
-- WHERE email = 'infoyaseertech@gmail.com';
