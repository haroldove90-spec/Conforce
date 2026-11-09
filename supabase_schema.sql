-- ==============================================================================
-- CON FORCE MARKETPLACE - ESQUEMA Y MIGRACIÓN DEFINITIVA SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Este script es 100% seguro e idempotente. Agrega columnas faltantes si las
-- tablas ya existían (evitando el error 42703: column does not exist) y crea
-- las tablas e índices necesarios.
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA DE USUARIOS (users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'seller', 'admin')),
    phone TEXT,
    address TEXT,
    business_id TEXT,
    status TEXT DEFAULT 'active',
    department TEXT,
    password_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Asegurar columnas si la tabla ya existía
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ==============================================================================
-- 3. TABLA DE NEGOCIOS (businesses)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.businesses (
    id TEXT PRIMARY KEY DEFAULT ('biz_' || substring(gen_random_uuid()::TEXT from 1 for 8)),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Repuestos',
    logo TEXT DEFAULT '🏬',
    banner_image TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Caracas',
    state TEXT DEFAULT 'Distrito Capital',
    rif TEXT,
    coordinates JSONB DEFAULT '{"lat": 10.4806, "lng": -66.9036}'::JSONB,
    opening_hours TEXT DEFAULT '08:00 AM - 06:00 PM',
    rating NUMERIC(3,1) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    is_sponsor BOOLEAN DEFAULT false,
    commission_rate NUMERIC DEFAULT 10,
    custom_pin_color TEXT DEFAULT '#D4021D',
    delivery_time TEXT DEFAULT '30-45 min',
    min_order NUMERIC DEFAULT 0,
    tags JSONB DEFAULT '[]'::JSONB,
    owner_username TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar TODAS las columnas por si la tabla ya existía previamente
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Repuestos';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS logo TEXT DEFAULT '🏬';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS banner_image TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Caracas';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Distrito Capital';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS rif TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS coordinates JSONB DEFAULT '{"lat": 10.4806, "lng": -66.9036}'::JSONB;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS opening_hours TEXT DEFAULT '08:00 AM - 06:00 PM';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 5.0;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_sponsor BOOLEAN DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 10;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS custom_pin_color TEXT DEFAULT '#D4021D';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS delivery_time TEXT DEFAULT '30-45 min';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS min_order NUMERIC DEFAULT 0;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS owner_username TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_username);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);

-- ==============================================================================
-- 4. TABLA DE PRODUCTOS / REPUESTOS (products)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod_' || substring(gen_random_uuid()::TEXT from 1 for 8)),
    business_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    original_price NUMERIC(12,2),
    category TEXT NOT NULL DEFAULT 'Repuestos',
    image TEXT,
    in_stock BOOLEAN DEFAULT true,
    stock_count INTEGER DEFAULT 10,
    tags JSONB DEFAULT '[]'::JSONB,
    is_offer_of_the_day BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar columnas si ya existía
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS business_id TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC(12,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC(12,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Repuestos';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 10;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_offer_of_the_day BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_products_business ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- ==============================================================================
-- 5. TABLA DE PEDIDOS (orders)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('ord_' || substring(gen_random_uuid()::TEXT from 1 for 8)),
    business_id TEXT,
    business_name TEXT,
    business_logo TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::JSONB,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    delivery_type TEXT DEFAULT 'delivery',
    delivery_address TEXT DEFAULT '',
    delivery_coordinates JSONB,
    payment_method TEXT NOT NULL DEFAULT 'pago_movil',
    order_channel TEXT DEFAULT 'app',
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar columnas si ya existía
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS business_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS business_logo TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS service_fee NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS service_fee_rate NUMERIC(5,2) DEFAULT 0.05;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'delivery';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_address TEXT DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_coordinates JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pago_movil';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_vehicle TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS review JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_channel TEXT DEFAULT 'app';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_orders_business ON public.orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ==============================================================================
-- 6. TABLA DE CLIENTES FINALES (clients)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY DEFAULT ('cli_' || substring(gen_random_uuid()::TEXT from 1 for 8)),
    user_id TEXT,
    name TEXT NOT NULL,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC(12,2) DEFAULT 0,
    status TEXT DEFAULT 'active',
    registered_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS total_spent NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_username ON public.clients(username);

-- ==============================================================================
-- 7. TABLAS ADICIONALES (Campañas WhatsApp, Chatbot y Direcciones)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_audience TEXT,
    status TEXT,
    sent_count INTEGER DEFAULT 0,
    open_rate NUMERIC DEFAULT 0,
    click_rate NUMERIC DEFAULT 0,
    date TEXT
);

CREATE TABLE IF NOT EXISTS public.chatbot_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    meta_api_token TEXT,
    phone_number_id TEXT,
    business_account_id TEXT,
    webhook_verify_token TEXT,
    welcome_message TEXT,
    featured_offer_id TEXT,
    auto_deep_links_enabled BOOLEAN DEFAULT true,
    gemini_smart_search BOOLEAN DEFAULT true,
    max_distance_km NUMERIC DEFAULT 8,
    custom_keywords JSONB DEFAULT '[]'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.saved_addresses (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    address TEXT NOT NULL,
    coordinates JSONB,
    is_default BOOLEAN DEFAULT false
);

-- ==============================================================================
-- 7. POLÍTICAS DE ACCESO (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura públicas para la app cliente:
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir gestion de usuarios" ON public.users;
    CREATE POLICY "Permitir gestion de usuarios" ON public.users FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir gestion de clientes" ON public.clients;
    CREATE POLICY "Permitir gestion de clientes" ON public.clients FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir gestion de negocios" ON public.businesses;
    CREATE POLICY "Permitir gestion de negocios" ON public.businesses FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir gestion de productos" ON public.products;
    CREATE POLICY "Permitir gestion de productos" ON public.products FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir gestion de pedidos" ON public.orders;
    CREATE POLICY "Permitir gestion de pedidos" ON public.orders FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir gestion de campanas" ON public.whatsapp_campaigns;
    CREATE POLICY "Permitir gestion de campanas" ON public.whatsapp_campaigns FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir gestion de chatbot" ON public.chatbot_config;
    CREATE POLICY "Permitir gestion de chatbot" ON public.chatbot_config FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir gestion de direcciones" ON public.saved_addresses;
    CREATE POLICY "Permitir gestion de direcciones" ON public.saved_addresses FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Habilitar Supabase Realtime para la tabla de pedidos
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ==============================================================================
-- 8. USUARIOS SUPERADMIN (Harold Anguiano & Admin Master)
-- ==============================================================================
INSERT INTO public.users (
    id,
    username,
    name,
    email,
    password,
    password_hash,
    role,
    phone,
    address,
    status
)
VALUES (
    'usr_harold_anguiano',
    'haroldo90',
    'Harold Anguiano',
    'haroldove90@gmail.com',
    'Chevropar#1970',
    'Chevropar#1970',
    'admin',
    '+58 412 8765432',
    'Presidencia Con Force, Caracas',
    'active'
)
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password,
    password_hash = EXCLUDED.password_hash,
    role = 'admin',
    name = EXCLUDED.name;

INSERT INTO public.users (
    id,
    username,
    name,
    email,
    password,
    password_hash,
    role,
    phone,
    address,
    status
)
VALUES (
    'usr_admin_master',
    'admin_master',
    'Administrador Maestro Con Force',
    'admin@conforce.com',
    'Chevropar#1970',
    'Chevropar#1970',
    'admin',
    '+58 412 1234567',
    'Sede Central Con Force, Caracas',
    'active'
)
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password,
    password_hash = EXCLUDED.password_hash,
    role = 'admin',
    name = EXCLUDED.name;
