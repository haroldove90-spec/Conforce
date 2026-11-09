-- ==============================================================================
-- SCRIPT SQL DE CONFIGURACIÓN Y REPARACIÓN PARA SUPABASE
-- Con Force Marketplace: Tabla USERS y Tabla CLIENTS
-- Ejecutar en: https://supabase.com/dashboard/project/cjoszqkgqtgfvzqxcsvi/sql/new
-- ==============================================================================

-- 1. TABLA USERS (Usuarios del Sistema, Administradores, Vendedores y Clientes)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'client',
  business_id TEXT,
  phone TEXT,
  avatar TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Asegurar que existan todas las columnas en public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. TABLA CLIENTS (Perfiles detallados de clientes finales y compradores)
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  username TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT DEFAULT 'Caracas',
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Asegurar que existan todas las columnas en public.clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Caracas';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 3. POLÍTICAS DE ACCESO (ROW LEVEL SECURITY - RLS)
-- Habilitar RLS en ambas tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas si existieran para evitar conflictos
DROP POLICY IF EXISTS "Permitir lectura publica de usuarios" ON public.users;
DROP POLICY IF EXISTS "Permitir registro e insercion de usuarios" ON public.users;
DROP POLICY IF EXISTS "Permitir actualizacion de usuarios" ON public.users;
DROP POLICY IF EXISTS "Permitir eliminacion de usuarios" ON public.users;
DROP POLICY IF EXISTS "users_full_access_anon" ON public.users;

DROP POLICY IF EXISTS "Permitir lectura publica de clientes" ON public.clients;
DROP POLICY IF EXISTS "Permitir registro e insercion de clientes" ON public.clients;
DROP POLICY IF EXISTS "Permitir actualizacion de clientes" ON public.clients;
DROP POLICY IF EXISTS "Permitir eliminacion de clientes" ON public.clients;
DROP POLICY IF EXISTS "clients_full_access_anon" ON public.clients;

-- Crear políticas permisivas para anon y authenticated en users
CREATE POLICY "users_full_access_anon" 
ON public.users 
FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- Crear políticas permisivas para anon y authenticated en clients
CREATE POLICY "clients_full_access_anon" 
ON public.clients 
FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- Otorgar permisos directos en el esquema public
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.clients TO anon, authenticated, service_role;

-- 4. ÍNDICES DE RENDIMIENTO PARA BÚSQUEDAS RÁPIDAS
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
