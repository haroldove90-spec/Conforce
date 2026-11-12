-- ==============================================================================
-- CON FORCE MARKETPLACE - ESQUEMA Y MIGRACIÓN DEFINITIVA SUPABASE (POSTGRESQL)
-- Versión Actualizada: Soporte de Rol 'driver' (Mensajeros en Moto)
-- ==============================================================================
-- Este script es 100% seguro e idempotente. Agrega columnas faltantes si las
-- tablas ya existían (evitando el error 42703: column does not exist) y crea
-- las tablas, restricciones, políticas RLS y datos iniciales necesarios.
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA DE USUARIOS (users) - SOPORTE MULTI-ROL (Admin, Seller, Client, Driver)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client',
    phone TEXT,
    address TEXT,
    business_id TEXT,
    status TEXT DEFAULT 'active',
    department TEXT,
    password_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Asegurar actualización de restricción de roles (permitir 'driver')
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('client', 'seller', 'admin', 'driver'));

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

CREATE INDEX IF NOT EXISTS idx_businesses_name ON public.businesses(name);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_is_sponsor ON public.businesses(is_sponsor);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_username ON public.businesses(owner_username);

-- ==============================================================================
-- 4. TABLA DE PRODUCTOS (products)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod_' || substring(gen_random_uuid()::TEXT from 1 for 8)),
    business_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    price_usd NUMERIC(12,2) DEFAULT 0,
    original_price NUMERIC(12,2),
    category TEXT DEFAULT 'General',
    image TEXT,
    images JSONB DEFAULT '[]'::JSONB,
    in_stock BOOLEAN DEFAULT true,
    stock_count INTEGER DEFAULT 10,
    tags JSONB DEFAULT '[]'::JSONB,
    is_offer_of_the_day BOOLEAN DEFAULT false,
    is_boosted BOOLEAN DEFAULT false,
    boost_tier TEXT,
    boost_expires_at TIMESTAMPTZ,
    has_variants BOOLEAN DEFAULT false,
    variants JSONB DEFAULT '[]'::JSONB,
    ingredients JSONB DEFAULT '[]'::JSONB,
    extras JSONB DEFAULT '[]'::JSONB,
    preparation_time TEXT,
    food_tags JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS business_id TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_usd NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC(12,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 10;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_offer_of_the_day BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS boost_tier TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMPTZ;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS preparation_time TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS food_tags JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_products_business ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_offer ON public.products(is_offer_of_the_day);

-- ==============================================================================
-- 5. TABLA DE MENSAJEROS EN MOTO (drivers)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.drivers (
    id TEXT PRIMARY KEY DEFAULT ('drv_' || substring(gen_random_uuid()::TEXT from 1 for 8)),
    user_id TEXT,
    full_name TEXT NOT NULL,
    username TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    ci_dni TEXT NOT NULL,
    motorcycle_brand_model TEXT NOT NULL,
    plate_number TEXT NOT NULL,
    driver_license TEXT,
    status TEXT NOT NULL DEFAULT 'pending_approval',
    is_available BOOLEAN NOT NULL DEFAULT false,
    current_coords JSONB,
    rating NUMERIC(3,1) NOT NULL DEFAULT 5.0,
    total_deliveries INTEGER NOT NULL DEFAULT 0,
    earnings_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    bank_name TEXT DEFAULT 'Banesco (0134)',
    bank_phone TEXT,
    bank_id_number TEXT,
    city TEXT DEFAULT 'Caracas',
    avatar_url TEXT,
    id_document_photo TEXT,
    license_photo TEXT,
    motorcycle_photo TEXT,
    vehicle_doc_photo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS ci_dni TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS motorcycle_brand_model TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS plate_number TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS driver_license TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_approval';
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS current_coords JSONB;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 5.0;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS total_deliveries INTEGER DEFAULT 0;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS earnings_balance NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS bank_name TEXT DEFAULT 'Banesco (0134)';
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS bank_phone TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS bank_id_number TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Caracas';
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS id_document_photo TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS license_photo TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS motorcycle_photo TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS vehicle_doc_photo TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_drivers_username ON public.drivers(username);
CREATE INDEX IF NOT EXISTS idx_drivers_phone ON public.drivers(phone);
CREATE INDEX IF NOT EXISTS idx_drivers_plate ON public.drivers(plate_number);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);

-- ==============================================================================
-- 6. TABLA DE PEDIDOS (orders) - ACTUALIZADA CON FLUJO DE REPARTO
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
    service_fee NUMERIC(12,2) DEFAULT 0,
    service_fee_rate NUMERIC(5,2) DEFAULT 0.05,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    delivery_type TEXT DEFAULT 'delivery',
    delivery_address TEXT DEFAULT '',
    delivery_coordinates JSONB,
    payment_method TEXT NOT NULL DEFAULT 'pago_movil',
    payment_reference TEXT,
    payment_proof_url TEXT,
    driver_id TEXT,
    driver_name TEXT,
    driver_phone TEXT,
    driver_vehicle TEXT,
    driver_step TEXT,
    driver_assigned_at TIMESTAMPTZ,
    driver_delivered_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    review JSONB,
    order_channel TEXT DEFAULT 'app',
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar columnas para seguimiento de motorizados en órdenes
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
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_vehicle TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_step TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_assigned_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_delivered_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS review JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_channel TEXT DEFAULT 'app';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_orders_business ON public.orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON public.orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ==============================================================================
-- 7. TABLA DE CLIENTES (clients)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY DEFAULT ('cli_' || substring(gen_random_uuid()::TEXT from 1 for 8)),
    user_id TEXT,
    name TEXT NOT NULL,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT DEFAULT 'Caracas',
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
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Caracas';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS total_spent NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_username ON public.clients(username);

-- ==============================================================================
-- 8. TABLA DE EMPLEADOS / OPERADORES (employees)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY DEFAULT ('emp_' || substring(gen_random_uuid()::TEXT from 1 for 8)),
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    position TEXT DEFAULT 'Operaciones',
    department TEXT DEFAULT 'Logística',
    business_id TEXT,
    salary NUMERIC(12,2) DEFAULT 0,
    hire_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS business_id TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS salary NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS hire_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================================================
-- 9. TABLAS AUXILIARES (Campañas WhatsApp, Chatbot y Direcciones)
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
    id TEXT PRIMARY KEY DEFAULT 'primary',
    meta_api_token TEXT,
    phone_number_id TEXT,
    business_account_id TEXT,
    webhook_verify_token TEXT,
    welcome_message TEXT,
    featured_offer_id TEXT,
    auto_deep_links_enabled BOOLEAN DEFAULT true,
    gemini_smart_search BOOLEAN DEFAULT true,
    max_distance_km NUMERIC DEFAULT 15,
    custom_keywords JSONB DEFAULT '[]'::JSONB
);

CREATE TABLE IF NOT EXISTS public.saved_addresses (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    address TEXT NOT NULL,
    coordinates JSONB,
    is_default BOOLEAN DEFAULT false
);

-- ==============================================================================
-- 10. SEGURIDAD Y POLÍTICAS RLS (Row Level Security)
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir lectura y gestion de usuarios" ON public.users;
    CREATE POLICY "Permitir lectura y gestion de usuarios" ON public.users FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir lectura y gestion de negocios" ON public.businesses;
    CREATE POLICY "Permitir lectura y gestion de negocios" ON public.businesses FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir lectura y gestion de productos" ON public.products;
    CREATE POLICY "Permitir lectura y gestion de productos" ON public.products FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir lectura y gestion de motorizados" ON public.drivers;
    CREATE POLICY "Permitir lectura y gestion de motorizados" ON public.drivers FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir gestion de pedidos" ON public.orders;
    CREATE POLICY "Permitir gestion de pedidos" ON public.orders FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir lectura y gestion de clientes" ON public.clients;
    CREATE POLICY "Permitir lectura y gestion de clientes" ON public.clients FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir gestion de empleados" ON public.employees;
    CREATE POLICY "Permitir gestion de empleados" ON public.employees FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir gestion de campanas" ON public.whatsapp_campaigns;
    CREATE POLICY "Permitir gestion de campanas" ON public.whatsapp_campaigns FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir gestion de chatbot" ON public.chatbot_config;
    CREATE POLICY "Permitir gestion de chatbot" ON public.chatbot_config FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir gestion de direcciones" ON public.saved_addresses;
    CREATE POLICY "Permitir gestion de direcciones" ON public.saved_addresses FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Habilitar Supabase Realtime para pedidos y motorizados
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ==============================================================================
-- 11. DATOS INICIALES Y CUENTAS DEMO (Admin, Comercios y Mensajeros Motorizados)
-- ==============================================================================

-- Superadministradores
INSERT INTO public.users (id, username, name, email, password, password_hash, role, phone, address, status, department)
VALUES
(
    'usr_harold_anguiano', 'haroldo90', 'Harold Anguiano', 'haroldove90@gmail.com',
    'Chevropar#1970', 'Chevropar#1970', 'admin', '+58 412 8765432', 'Presidencia ConForce, Caracas', 'active', 'Dirección General'
),
(
    'usr_admin_master', 'admin_master', 'Administrador Maestro ConForce', 'admin@conforce.com',
    'Chevropar#1970', 'Chevropar#1970', 'admin', '+58 412 1234567', 'Sede Central ConForce, Caracas', 'active', 'Dirección General'
),
-- Motorizados de Prueba
(
    'usr-driver-1', 'carlos_moto', 'Carlos Mendoza (Motorizado)', 'carlos.moto@conforce.com',
    'Chevropar#1970', 'Chevropar#1970', 'driver', '+58 412 9988776', 'Caracas Centro, Municipio Libertador', 'active', 'Logística & Despacho en Moto'
),
(
    'usr-driver-2', 'jose_moto', 'José Gregorio Rivas', 'jose.moto@conforce.com',
    'Chevropar#1970', 'Chevropar#1970', 'driver', '+58 414 5544332', 'Chacao, Caracas', 'active', 'Logística & Despacho en Moto'
)
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    status = 'active';

-- Perfiles de Motorizados Iniciales
INSERT INTO public.drivers (
    id, user_id, full_name, username, email, phone, ci_dni,
    motorcycle_brand_model, plate_number, driver_license,
    status, is_available, rating, total_deliveries, earnings_balance,
    bank_name, bank_phone, bank_id_number, city
)
VALUES
(
    'drv-1', 'usr-driver-1', 'Carlos Mendoza', 'carlos_moto', 'carlos.moto@conforce.com',
    '+58 412 9988776', 'V-24.891.302', 'Bera SBR 150 (Azul)', 'AA1B22', 'LIC-24891302',
    'active', true, 4.9, 128, 1420.00,
    'Banesco (0134)', '+58 412 9988776', 'V-24891302', 'Caracas'
),
(
    'drv-2', 'usr-driver-2', 'José Gregorio Rivas', 'jose_moto', 'jose.moto@conforce.com',
    '+58 414 5544332', 'V-22.104.991', 'Empire Keeway Horse 150 (Rojo)', 'AC9X10', 'LIC-22104991',
    'active', true, 4.8, 94, 980.00,
    'Banco de Venezuela (0102)', '+58 414 5544332', 'V-22104991', 'Caracas - Chacao'
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    motorcycle_brand_model = EXCLUDED.motorcycle_brand_model,
    plate_number = EXCLUDED.plate_number,
    status = EXCLUDED.status,
    is_available = EXCLUDED.is_available;
