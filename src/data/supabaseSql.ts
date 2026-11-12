export const SUPABASE_PROJECT_INFO = {
  projectName: "marketplace@force-express.com's Project",
  projectId: "cjoszqkgqtgfvzqxcsvi",
  url: "https://cjoszqkgqtgfvzqxcsvi.supabase.co",
  restUrl: "https://cjoszqkgqtgfvzqxcsvi.supabase.co/rest/v1/",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqb3N6cWtncXRnZnZ6cXhjc3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTA3OTksImV4cCI6MjEwNDA2Njc5OX0.L-u61LH5GKKrBWgnxThVbRWitqmdXtHJH64MhlWJqOQ",
  sqlEditorUrl: "https://supabase.com/dashboard/project/cjoszqkgqtgfvzqxcsvi/sql/new",
  tableEditorUrl: "https://supabase.com/dashboard/project/cjoszqkgqtgfvzqxcsvi/editor"
};

export const SUPABASE_PURGE_SAMPLE_DATA_SQL = `-- ==============================================================================
-- 🧹 SCRIPT PARA LIMPIAR TODOS LOS DATOS DE MUESTRA EN SUPABASE
-- Deja el sistema 100% limpio para pruebas y registros reales
-- Preserva la estructura de tablas y el usuario administrador maestro (admin_master)
-- Copia y corre esto en: https://supabase.com/dashboard/project/cjoszqkgqtgfvzqxcsvi/sql/new
-- ==============================================================================

-- 1. Eliminar datos dependientes primero (hijos)
DELETE FROM public.orders WHERE id IS NOT NULL;
DELETE FROM public.products WHERE id IS NOT NULL;
DELETE FROM public.whatsapp_campaigns WHERE id IS NOT NULL;
DELETE FROM public.saved_addresses WHERE id IS NOT NULL;
DELETE FROM public.clients WHERE id IS NOT NULL;
DELETE FROM public.employees WHERE id IS NOT NULL;

-- 2. Eliminar comercios de prueba
DELETE FROM public.businesses WHERE id IS NOT NULL;

-- 3. Eliminar usuarios de prueba excepto admin_master
DELETE FROM public.users WHERE username != 'admin_master';

-- 4. Garantizar existencia y acceso del Administrador Maestro
INSERT INTO public.users (
    id, name, username, email, password, password_hash, role, status, phone, is_active
) VALUES (
    'usr-admin-master',
    'Administrador Master ConForce',
    'admin_master',
    'admin_master@conforce.com',
    'Chevropar#1970',
    'Chevropar#1970',
    'admin',
    'active',
    '+58 412 1234567',
    true
)
ON CONFLICT (username) DO UPDATE SET
    password = 'Chevropar#1970',
    password_hash = 'Chevropar#1970',
    is_active = true;
`;

export const SUPABASE_SPONSOR_UNLOCK_SQL = `-- ==============================================================================
-- 🚀 SCRIPT DE DESBLOQUEO PARA PATROCINADORES Y CATEGORÍAS AUTOMOTRICES
-- Copia y corre esto en: https://supabase.com/dashboard/project/cjoszqkgqtgfvzqxcsvi/sql/new
-- ==============================================================================

-- 1. Eliminar restricciones antiguas de categorías (permitir repuestos, talleres, marcas)
ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_category_check;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Asegurar columnas para Patrocinadores y Comercios Aliados
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_sponsor BOOLEAN DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS owner_username TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS rif TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Caracas';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Distrito Capital';

-- 3. Índices para acelerar búsquedas de patrocinadores
CREATE INDEX IF NOT EXISTS idx_businesses_is_sponsor ON public.businesses(is_sponsor);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_username ON public.businesses(owner_username);
`;

export const SUPABASE_DRIVERS_SQL = `-- ==============================================================================
-- 🛵 SCRIPT PARA HABILITAR MENSAJEROS EN MOTO (DRIVERS) EN SUPABASE
-- Copia y corre esto en: https://supabase.com/dashboard/project/cjoszqkgqtgfvzqxcsvi/sql/new
-- ==============================================================================

-- 1. Actualizar restricción de roles en users para admitir 'driver'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('client', 'seller', 'admin', 'driver'));

-- 2. Crear tabla de mensajeros en moto
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Columnas aseguradas
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

CREATE INDEX IF NOT EXISTS idx_drivers_username ON public.drivers(username);
CREATE INDEX IF NOT EXISTS idx_drivers_phone ON public.drivers(phone);
CREATE INDEX IF NOT EXISTS idx_drivers_plate ON public.drivers(plate_number);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);

-- 3. Columnas en órdenes para asignación y rastreo de motorizados
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_vehicle TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_step TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_assigned_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_delivered_at TIMESTAMPTZ;

-- 4. RLS para drivers
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir lectura y gestion de motorizados" ON public.drivers;
    CREATE POLICY "Permitir lectura y gestion de motorizados" ON public.drivers FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 5. Publicación en Realtime
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 6. Motorizados de prueba
INSERT INTO public.users (id, username, name, email, password, password_hash, role, phone, address, status, department)
VALUES
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
`;

export const SUPABASE_VENEZUELA_AND_PRODUCTS_SQL = `-- ==============================================================================
-- 🇻🇪 CONFORCE - ACTUALIZACIÓN VENEZUELA: DUAL CURRENCY (Bs. & USD) + PRODUCTOS VARIABLES + ALIMENTOS/EXTRAS
-- Copia y corre esto en el SQL Editor de Supabase:
-- https://supabase.com/dashboard/project/cjoszqkgqtgfvzqxcsvi/sql/new
-- ==============================================================================

-- 1. Agregar columnas en 'products' para moneda dual (USD), variantes, fotos múltiples y alimentos
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_usd NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS preparation_time TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS food_tags JSONB DEFAULT '[]'::JSONB;

-- 2. Asegurar columnas de ciudad y coordenadas venezolanas en comercios
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Caracas';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Distrito Capital';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS rif TEXT;

-- 3. Índices de optimización
CREATE INDEX IF NOT EXISTS idx_products_price_usd ON public.products(price_usd);
`;


export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- CON FORCE MARKETPLACE - ESQUEMA COMPLETO Y DATOS INICIALES PARA SUPABASE
-- Proyecto: marketplace@force-express.com's Project
-- Project ID: cjoszqkgqtgfvzqxcsvi
-- URL: https://cjoszqkgqtgfvzqxcsvi.supabase.co
-- ==============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABLA: businesses (Comercios, Talleres, Marcas y Patrocinadores)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Repuestos',
    logo TEXT NOT NULL DEFAULT '🏢',
    banner_image TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    coordinates JSONB NOT NULL DEFAULT '{"lat": 10.4806, "lng": -66.9036}'::jsonb,
    opening_hours TEXT NOT NULL DEFAULT '08:00 AM - 07:00 PM',
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
    reviews_count INTEGER NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 10.0,
    custom_pin_color TEXT NOT NULL DEFAULT '#D4021D',
    delivery_time TEXT NOT NULL DEFAULT '20-40 min',
    min_order NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_sponsor BOOLEAN NOT NULL DEFAULT false,
    owner_username TEXT,
    rif TEXT,
    email TEXT,
    city TEXT DEFAULT 'Caracas',
    state TEXT DEFAULT 'Distrito Capital',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Si la tabla ya existía, remover restricciones restrictivas antiguas
ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_category_check;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_sponsor BOOLEAN DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS owner_username TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS rif TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Caracas';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Distrito Capital';

CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_is_active ON public.businesses(is_active);

-- ------------------------------------------------------------------------------
-- 2. TABLA: products (Catálogo de productos e inventario)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price NUMERIC(12, 2) NOT NULL,
    price_usd NUMERIC(12, 2) DEFAULT 0,
    original_price NUMERIC(12, 2),
    category TEXT NOT NULL DEFAULT 'General',
    image TEXT NOT NULL DEFAULT '',
    images JSONB DEFAULT '[]'::JSONB,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    stock_count INTEGER NOT NULL DEFAULT 100,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_offer_of_the_day BOOLEAN NOT NULL DEFAULT false,
    is_boosted BOOLEAN NOT NULL DEFAULT false,
    has_variants BOOLEAN DEFAULT false,
    variants JSONB DEFAULT '[]'::JSONB,
    ingredients JSONB DEFAULT '[]'::JSONB,
    extras JSONB DEFAULT '[]'::JSONB,
    preparation_time TEXT,
    food_tags JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_usd NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_offer_of_the_day BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS preparation_time TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS food_tags JSONB DEFAULT '[]'::JSONB;

CREATE INDEX IF NOT EXISTS idx_products_business_id ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_offer ON public.products(is_offer_of_the_day);

-- ------------------------------------------------------------------------------
-- 3. TABLA: orders (Pedidos, Checkout App y WhatsApp)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    business_name TEXT NOT NULL DEFAULT '',
    business_logo TEXT NOT NULL DEFAULT '',
    customer_name TEXT NOT NULL DEFAULT '',
    customer_phone TEXT NOT NULL DEFAULT '',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    service_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('pickup', 'delivery')),
    delivery_address TEXT NOT NULL DEFAULT '',
    delivery_coordinates JSONB,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cash_on_delivery', 'pos_terminal')),
    order_channel TEXT NOT NULL DEFAULT 'app' CHECK (order_channel IN ('app', 'whatsapp')),
    status TEXT NOT NULL DEFAULT 'preparing' CHECK (status IN ('preparing', 'ready', 'on_the_way', 'delivered', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS service_fee NUMERIC(10, 2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_orders_business_id ON public.orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. TABLA: whatsapp_campaigns (Campañas de difusión por WhatsApp)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_audience TEXT NOT NULL DEFAULT 'all',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
    sent_count INTEGER NOT NULL DEFAULT 0,
    open_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
    click_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
    date TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. TABLA: chatbot_config (Configuración del Chatbot IA y Webhook de WhatsApp)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chatbot_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    meta_api_token TEXT NOT NULL DEFAULT '',
    phone_number_id TEXT NOT NULL DEFAULT '',
    business_account_id TEXT NOT NULL DEFAULT '',
    webhook_verify_token TEXT NOT NULL DEFAULT '',
    welcome_message TEXT NOT NULL DEFAULT '¡Hola! Soy el asistente virtual de Pulso. ¿En qué puedo ayudarte hoy?',
    featured_offer_id TEXT NOT NULL DEFAULT '',
    auto_deep_links_enabled BOOLEAN NOT NULL DEFAULT true,
    gemini_smart_search BOOLEAN NOT NULL DEFAULT true,
    max_distance_km NUMERIC(5, 2) NOT NULL DEFAULT 8.0,
    custom_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. TABLA: saved_addresses (Direcciones frecuentes de clientes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_addresses (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    address TEXT NOT NULL,
    coordinates JSONB NOT NULL DEFAULT '{"lat": 19.4120, "lng": -99.1650}'::jsonb,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. TABLA: users (Usuarios y Roles RBAC: Admin, Negocio y Cliente)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'seller', 'client')),
    business_id TEXT REFERENCES public.businesses(id) ON DELETE SET NULL,
    phone TEXT,
    avatar TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Asegurar columnas si la tabla public.users ya existía en la base de datos
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Quitar restricciones de clave foránea estricta que puedan bloquear inserciones
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_business_id_fkey;
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_business_id_fkey;

-- Quitar restricciones NOT NULL en columnas de contraseña para compatibilidad con esquemas previos
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password'
    ) THEN
        ALTER TABLE public.users ALTER COLUMN password DROP NOT NULL;
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ------------------------------------------------------------------------------
-- 8. TABLA: clients (Fichas de Clientes Registrados en el Marketplace)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Ciudad de México',
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_spent NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS total_spent NUMERIC(10, 2) DEFAULT 0.0;

CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);

-- ------------------------------------------------------------------------------
-- 9. TABLA: employees (Colaboradores y Empleados del Corporativo y Tiendas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT NOT NULL,
    business_id TEXT REFERENCES public.businesses(id) ON DELETE SET NULL,
    salary NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS salary NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON public.employees(is_active);

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for businesses" ON public.businesses;
CREATE POLICY "Public access for businesses" ON public.businesses
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for products" ON public.products;
CREATE POLICY "Public access for products" ON public.products
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for orders" ON public.orders;
CREATE POLICY "Public access for orders" ON public.orders
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for whatsapp_campaigns" ON public.whatsapp_campaigns;
CREATE POLICY "Public access for whatsapp_campaigns" ON public.whatsapp_campaigns
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for chatbot_config" ON public.chatbot_config;
CREATE POLICY "Public access for chatbot_config" ON public.chatbot_config
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for saved_addresses" ON public.saved_addresses;
CREATE POLICY "Public access for saved_addresses" ON public.saved_addresses
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for users" ON public.users;
CREATE POLICY "Public access for users" ON public.users
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for clients" ON public.clients;
CREATE POLICY "Public access for clients" ON public.clients
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for employees" ON public.employees;
CREATE POLICY "Public access for employees" ON public.employees
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- HABILITAR TIEMPO REAL (REALTIME) EN SUPABASE
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'products'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'businesses'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;
    END IF;
END $$;

-- ==============================================================================
-- DATOS SEMILLA (SEED DATA)
-- ==============================================================================

INSERT INTO public.businesses (
    id, name, category, logo, banner_image, phone, address, coordinates,
    opening_hours, rating, reviews_count, is_verified, is_active,
    commission_rate, custom_pin_color, delivery_time, min_order, tags
) VALUES
(
    'biz-farmacia-1', 'Farmacias San Rafael Express', 'farmacia', '💊',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=60',
    '+52 55 8765 4321', 'Av. Central 452, Col. Del Valle', '{"lat": 19.3985, "lng": -99.1685}'::jsonb,
    '24 Horas (Lunes a Domingo)', 4.8, 142, true, true,
    8.0, '#10b981', '15-25 min', 100.0,
    ARRAY['farmacia', 'medicamentos', 'urgencias', 'salud', 'paracetamol', 'antigripal', 'dolor']
),
(
    'biz-farm-1', 'Farmacias San Rafael Express', 'farmacia', '💊',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=60',
    '+52 55 8765 4321', 'Av. Central 452, Col. Del Valle', '{"lat": 19.3985, "lng": -99.1685}'::jsonb,
    '24 Horas (Lunes a Domingo)', 4.8, 142, true, true,
    8.0, '#10b981', '15-25 min', 100.0,
    ARRAY['farmacia', 'medicamentos', 'urgencias', 'salud', 'paracetamol', 'antigripal', 'dolor']
),
(
    'biz-farmacia-2', 'Farmacia & Dermocuidado Vitalis', 'farmacia', '🌿',
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&auto=format&fit=crop&q=60',
    '+52 55 1234 5678', 'Calle Durango 188, Col. Roma Norte', '{"lat": 19.4190, "lng": -99.1650}'::jsonb,
    '08:00 AM - 10:00 PM', 4.9, 98, true, true,
    9.0, '#059669', '20-30 min', 150.0,
    ARRAY['dermocosmetica', 'vitaminas', 'suplementos', 'pediatria', 'analgesico', 'bloqueador', 'skincare']
),
(
    'biz-farmacia-3', 'Farmacia Familiar & Pediátrica San Lucas', 'farmacia', '🍼',
    'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800&auto=format&fit=crop&q=60',
    '+52 55 4433 2211', 'Av. Coyoacán 810, Col. Del Valle Sur', '{"lat": 19.3750, "lng": -99.1710}'::jsonb,
    '07:00 AM - 11:00 PM', 4.9, 165, true, true,
    8.0, '#0ea5e9', '20-35 min', 120.0,
    ARRAY['pediatria', 'bebes', 'panales', 'leche', 'termometro', 'infantil', 'salud']
),
(
    'biz-farmacia-4', 'Farmacia Botica Natural VerdeVida', 'farmacia', '🍃',
    'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=800&auto=format&fit=crop&q=60',
    '+52 55 9988 7766', 'Av. Tamaulipas 64, Col. Condesa', '{"lat": 19.4110, "lng": -99.1730}'::jsonb,
    '09:00 AM - 09:00 PM', 4.7, 84, true, true,
    8.0, '#16a34a', '25-40 min', 130.0,
    ARRAY['natural', 'homeopatia', 'propoleo', 'colageno', 'herbolaria', 'te', 'suplementos']
),
(
    'biz-resto-1', 'Burger Craft & Wings House', 'restaurante', '🍔',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
    '+52 55 9876 5432', 'Av. Insurgentes Sur 1205, Mixcoac', '{"lat": 19.3780, "lng": -99.1790}'::jsonb,
    '12:00 PM - 11:30 PM', 4.7, 310, true, true,
    12.0, '#f97316', '25-40 min', 120.0,
    ARRAY['hamburguesas', 'alitas', 'papas', 'comida rapida', 'cena', 'bbq', 'tocino']
),
(
    'biz-resto-2', 'Pizzería Napolitana Bella Forno', 'restaurante', '🍕',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60',
    '+52 55 4567 8901', 'Av. Álvaro Obregón 85, Col. Condesa', '{"lat": 19.4165, "lng": -99.1600}'::jsonb,
    '01:00 PM - 11:00 PM', 4.9, 224, true, true,
    10.0, '#ef4444', '30-45 min', 180.0,
    ARRAY['pizza', 'artesanal', 'italiana', 'pasta', 'lasagna', 'cena', 'pepperoni']
),
(
    'biz-resto-3', 'Tacos Los Compadres & Birria', 'restaurante', '🌮',
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=60',
    '+52 55 3322 1100', 'Eje Central Lázaro Cárdenas 210, Centro', '{"lat": 19.4340, "lng": -99.1410}'::jsonb,
    '10:00 AM - 02:00 AM', 4.8, 450, true, true,
    10.0, '#eab308', '15-30 min', 80.0,
    ARRAY['tacos', 'pastor', 'birria', 'consome', 'antojitos', 'cena', 'quesadillas']
),
(
    'biz-resto-4', 'Sushi Roll Master & Poke Bar', 'restaurante', '🍣',
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=60',
    '+52 55 6677 8899', 'Calle Michoacán 42, Col. Condesa', '{"lat": 19.4125, "lng": -99.1705}'::jsonb,
    '12:30 PM - 10:30 PM', 4.8, 189, true, true,
    11.0, '#ec4899', '25-35 min', 150.0,
    ARRAY['sushi', 'poke', 'salmon', 'japonesa', 'rollos', 'mariscos', 'tempura']
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    logo = EXCLUDED.logo,
    banner_image = EXCLUDED.banner_image,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    coordinates = EXCLUDED.coordinates,
    opening_hours = EXCLUDED.opening_hours,
    rating = EXCLUDED.rating,
    reviews_count = EXCLUDED.reviews_count,
    is_verified = EXCLUDED.is_verified,
    is_active = EXCLUDED.is_active,
    commission_rate = EXCLUDED.commission_rate,
    custom_pin_color = EXCLUDED.custom_pin_color,
    delivery_time = EXCLUDED.delivery_time,
    min_order = EXCLUDED.min_order,
    tags = EXCLUDED.tags;

INSERT INTO public.products (
    id, business_id, name, description, price, original_price,
    category, image, in_stock, stock_count, tags, is_offer_of_the_day
) VALUES
(
    'prod-farm-1', 'biz-farmacia-1', 'Paracetamol 500mg (Caja con 20 tabletas)',
    'Alivio eficaz del dolor de cabeza, dolor dental y reducción de la fiebre.',
    45.0, 58.0, 'Medicamentos',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    true, 120, ARRAY['paracetamol', 'analgesico', 'fiebre', 'dolor', 'medicamento'], true
),
(
    'prod-comp-para-2', 'biz-farmacia-2', 'Paracetamol 500mg Genérico (Caja 20 tabletas)',
    'Analgésico y antipirético para alivio rápido de dolor leve a moderado.',
    48.0, NULL, 'Medicamentos',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    true, 60, ARRAY['paracetamol', 'analgesico', 'fiebre', 'dolor', 'medicamento'], false
),
(
    'prod-comp-para-3', 'biz-farmacia-3', 'Paracetamol 500mg Línea Familiar (20 tabletas)',
    'Fórmula efectiva para control térmico y malestar general en adultos.',
    42.0, 55.0, 'Medicamentos',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    true, 95, ARRAY['paracetamol', 'analgesico', 'fiebre', 'dolor de cabeza', 'medicamento'], true
),
(
    'prod-farm-2', 'biz-farmacia-1', 'Suero Oral Electrolitos 500ml Manzana',
    'Solución rehidratante oral con glucosa y electrolitos balanceados.',
    32.0, 40.0, 'Cuidado & Bienestar',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    true, 90, ARRAY['suero', 'electrolitos', 'hidratacion', 'deshidratacion'], true
),
(
    'prod-comp-suero-2', 'biz-farmacia-2', 'Suero Oral Electrolitos 500ml Fresa-Kiwi',
    'Bebida isotónica grado farmacéutico para rehidratación inmediata.',
    35.0, NULL, 'Cuidado & Bienestar',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    true, 80, ARRAY['suero', 'electrolitos', 'hidratacion', 'resaca', 'estomago'], false
),
(
    'prod-comp-suero-3', 'biz-farmacia-3', 'Suero Oral Pediátrico & Familiar 500ml',
    'Fórmula balanceada con zinc para recuperación gastrointestinal.',
    29.0, 38.0, 'Cuidado & Bienestar',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    true, 110, ARRAY['suero', 'electrolitos', 'bebe', 'pediatria', 'hidratacion', 'fiebre'], true
),
(
    'prod-resto-1', 'biz-resto-1', 'Hamburguesa Doble Smash con Queso Cheddar & Tocino',
    'Doble carne angus de 120g con queso cheddar madurado, tocino crujiente y aderezo especial.',
    159.0, 189.0, 'Hamburguesas',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    true, 40, ARRAY['hamburguesa', 'burger', 'tocino', 'carne', 'queso', 'comida'], true
),
(
    'prod-resto-2', 'biz-resto-2', 'Pizza Napolitana Margarita Clásica',
    'Salsa de tomate San Marzano, mozzarella fior di latte, albahaca fresca y aceite de oliva virgen extra.',
    195.0, 230.0, 'Pizzas',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
    true, 25, ARRAY['pizza', 'margarita', 'queso', 'albahaca', 'italiana', 'cena'], true
),
(
    'prod-resto-3', 'biz-resto-3', 'Orden de 5 Tacos al Pastor con Queso & Piña',
    'Cinco tacos de pastor adobado al carbón con cilantro, cebolla, piña asada y queso asadero.',
    95.0, 115.0, 'Tacos',
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&auto=format&fit=crop&q=60',
    true, 150, ARRAY['tacos', 'pastor', 'queso', 'pina', 'antojitos', 'comida'], true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    category = EXCLUDED.category,
    image = EXCLUDED.image,
    in_stock = EXCLUDED.in_stock,
    stock_count = EXCLUDED.stock_count,
    tags = EXCLUDED.tags,
    is_offer_of_the_day = EXCLUDED.is_offer_of_the_day;

INSERT INTO public.chatbot_config (
    id, welcome_message, featured_offer_id, auto_deep_links_enabled,
    gemini_smart_search, max_distance_km, custom_keywords
) VALUES (
    'default',
    '¡Hola! Soy PulsoBot, tu asistente inteligente para encontrar y pedir en farmacias y restaurantes cercanos.',
    'prod-farm-1', true, true, 8.0,
    '[
        {"keyword": "paracetamol", "category": "farmacia", "targetTag": "paracetamol"},
        {"keyword": "dolor", "category": "farmacia", "targetTag": "analgesico"},
        {"keyword": "hamburguesa", "category": "restaurante", "targetTag": "hamburguesa"},
        {"keyword": "pizza", "category": "restaurante", "targetTag": "pizza"},
        {"keyword": "suero", "category": "farmacia", "targetTag": "suero"}
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    welcome_message = EXCLUDED.welcome_message,
    featured_offer_id = EXCLUDED.featured_offer_id,
    auto_deep_links_enabled = EXCLUDED.auto_deep_links_enabled,
    gemini_smart_search = EXCLUDED.gemini_smart_search,
    max_distance_km = EXCLUDED.max_distance_km,
    custom_keywords = EXCLUDED.custom_keywords;

INSERT INTO public.saved_addresses (id, label, address, coordinates, is_default)
VALUES
(
    'addr-1', 'Casa', 'Av. Michoacán 84, Col. Condesa',
    '{"lat": 19.4120, "lng": -99.1650}'::jsonb, true
),
(
    'addr-2', 'Oficina', 'Paseo de la Reforma 222, Col. Juárez',
    '{"lat": 19.4290, "lng": -99.1620}'::jsonb, false
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- SEED DATA: Usuarios y Credenciales de Acceso (Admin, Negocios y Clientes)
-- ------------------------------------------------------------------------------
INSERT INTO public.users (id, name, username, email, password, password_hash, role, business_id, phone, is_active)
VALUES
(
    'usr-superadmin-1', 'Harold Anguiano Morales', 'haroldo90',
    'haroldo90@hotmail.com', 'Chevropar#1970', 'Chevropar#1970', 'admin', NULL, '+52 55 1234 5678', true
),
(
    'usr-admin-2', 'Anyl', 'anyl_admin',
    'anyl@conforce.com', 'Anyl#ConForce2026*!', 'Anyl#ConForce2026*!', 'admin', NULL, '+52 55 8765 4321', true
),
(
    'usr-seller-1', 'Farmacia San Rafael', 'farmacia_sanrafael',
    'contacto@sanrafael.com', 'SanRafael#2026', 'SanRafael#2026', 'seller', 'biz-farmacia-1', '+52 55 5555 1111', true
),
(
    'usr-seller-2', 'La Parrilla Urbana', 'parrilla_urbana',
    'ventas@parrillaurbana.com', 'Parrilla#2026', 'Parrilla#2026', 'seller', 'biz-resto-1', '+52 55 5555 2222', true
),
(
    'usr-client-1', 'Harold Anguiano Morales', 'haroldo90_cli',
    'haroldo90@cliente.com', 'Chevropar#1970', 'Chevropar#1970', 'client', NULL, '+52 55 1234 5678', true
),
(
    'usr-client-2', 'María Elena López', 'marialopez',
    'maria.lopez@gmail.com', 'Cliente#2026', 'Cliente#2026', 'client', NULL, '+52 55 9876 5432', true
),
(
    'usr-client-3', 'Carlos Mendoza', 'carlosm',
    'carlos.mendoza@yahoo.com', 'Carlos#2026', 'Carlos#2026', 'client', NULL, '+52 55 8912 3456', true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    business_id = EXCLUDED.business_id,
    phone = EXCLUDED.phone,
    is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- SEED DATA: Directorio de Clientes Registrados en el Marketplace
-- ------------------------------------------------------------------------------
INSERT INTO public.clients (id, user_id, name, username, email, phone, address, city, total_orders, total_spent)
VALUES
(
    'cli-1', 'usr-client-1', 'Harold Anguiano Morales', 'haroldo90_cli',
    'haroldo90@cliente.com', '+52 55 1234 5678', 'Av. Insurgentes Sur 1450, Roma Norte', 'Ciudad de México', 8, 3840.0
),
(
    'cli-2', 'usr-client-2', 'María Elena López', 'marialopez',
    'maria.lopez@gmail.com', '+52 55 9876 5432', 'Calle Colima 230, Depto 401, Roma Norte', 'Ciudad de México', 14, 5280.0
),
(
    'cli-3', 'usr-client-3', 'Carlos Mendoza', 'carlosm',
    'carlos.mendoza@yahoo.com', '+52 55 8912 3456', 'Paseo de la Reforma 222, Col. Juárez', 'Ciudad de México', 9, 3120.0
),
(
    'cli-4', NULL, 'Sofía Ramírez', 'sofiar',
    'sofia.ramirez@hotmail.com', '+52 55 4567 8901', 'Av. Horacio 500, Polanco', 'Ciudad de México', 4, 1850.0
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    total_orders = EXCLUDED.total_orders,
    total_spent = EXCLUDED.total_spent;

-- ------------------------------------------------------------------------------
-- SEED DATA: Plantilla de Empleados y Operadores
-- ------------------------------------------------------------------------------
INSERT INTO public.employees (id, name, email, phone, position, department, business_id, salary, hire_date, is_active)
VALUES
(
    'emp-1', 'Laura Salazar', 'laura.salazar@conforce.com',
    '+52 55 4321 8765', 'Coordinadora de Operaciones y Rutas', 'Operaciones & Logística', NULL, 22000.0, '2023-04-15', true
),
(
    'emp-2', 'Carlos Rivera', 'carlos.rivera@conforce.com',
    '+52 55 6543 2109', 'Especialista en Soporte WhatsApp & Bot IA', 'Soporte al Cliente & Bot', NULL, 16500.0, '2023-08-01', true
),
(
    'emp-3', 'Sofía Valenzuela', 'sofia.valenzuela@conforce.com',
    '+52 55 3456 7890', 'Analista de Finanzas y Liquidaciones', 'Finanzas & Facturación', NULL, 19500.0, '2024-01-10', true
),
(
    'emp-4', 'Jorge Morales', 'jorge.morales@sanrafael.com',
    '+52 55 7890 1234', 'Encargado de Mostrador y Despacho', 'Comercial & Afiliaciones', 'biz-farmacia-1', 14000.0, '2023-11-20', true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    position = EXCLUDED.position,
    department = EXCLUDED.department,
    business_id = EXCLUDED.business_id,
    salary = EXCLUDED.salary,
    is_active = EXCLUDED.is_active;
`;
