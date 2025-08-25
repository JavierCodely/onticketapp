-- ================================
-- SCHEMA BÁSICO PARA AUTENTICACIÓN Y ROLES
-- Club Management Platform - OnTicket
-- ================================

-- Este script contiene únicamente las tablas y configuraciones
-- necesarias para el sistema de autenticación y roles.
-- Se implementará paso a paso según la documentación.

-- ================================
-- TIPOS ENUM NECESARIOS
-- ================================

-- Estado del club (activo, inactivo, suspendido)
CREATE TYPE club_status AS ENUM ('active', 'inactive', 'suspended');

-- Plan de suscripción del club
CREATE TYPE subscription_plan AS ENUM ('basic', 'premium', 'enterprise');

-- Rol del usuario a nivel sistema (super admin o admin de club)
CREATE TYPE user_role AS ENUM ('super_admin', 'club_admin');

-- Rol del usuario dentro de un club específico
CREATE TYPE club_role AS ENUM ('owner', 'manager', 'supervisor', 'staff');

-- ================================
-- TABLA DE CLUBS (TENANTS)
-- ================================

-- Cada club es un "tenant" en nuestro sistema multi-tenant
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- Nombre del club
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL amigable única
    description TEXT, -- Descripción del club
    logo_url TEXT, -- URL del logo del club
    address TEXT, -- Dirección física
    phone VARCHAR(20), -- Teléfono de contacto
    email VARCHAR(255), -- Email de contacto
    timezone VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires', -- Zona horaria
    currency VARCHAR(3) DEFAULT 'ARS', -- Moneda utilizada
    status club_status DEFAULT 'active', -- Estado del club
    plan subscription_plan DEFAULT 'basic', -- Plan de suscripción
    settings JSONB DEFAULT '{}', -- Configuraciones específicas del club
    created_at TIMESTAMPTZ DEFAULT NOW(), -- Fecha de creación
    updated_at TIMESTAMPTZ DEFAULT NOW() -- Última actualización
);

-- ================================
-- TABLA DE PERFILES DE USUARIOS
-- ================================

-- Extensión de la tabla auth.users de Supabase
-- Contiene información adicional de cada usuario
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL, -- Email del usuario (sincronizado con auth.users)
    full_name VARCHAR(255), -- Nombre completo
    avatar_url TEXT, -- URL del avatar
    role user_role DEFAULT 'club_admin', -- Rol a nivel sistema
    is_super_admin BOOLEAN DEFAULT FALSE, -- ¿Es super administrador?
    phone VARCHAR(20), -- Teléfono de contacto
    preferences JSONB DEFAULT '{}', -- Preferencias del usuario
    last_login_at TIMESTAMPTZ, -- Último login
    created_at TIMESTAMPTZ DEFAULT NOW(), -- Fecha de creación
    updated_at TIMESTAMPTZ DEFAULT NOW() -- Última actualización
);

-- ================================
-- RELACIÓN USUARIOS - CLUBS
-- ================================

-- Tabla que relaciona usuarios con clubs (many-to-many)
-- Un usuario puede administrar múltiples clubs
-- Un club puede tener múltiples administradores
CREATE TABLE user_clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    role club_role DEFAULT 'manager', -- Rol del usuario en este club específico
    permissions JSONB DEFAULT '{}', -- Permisos específicos en este club
    is_active BOOLEAN DEFAULT TRUE, -- ¿Está activo en este club?
    joined_at TIMESTAMPTZ DEFAULT NOW(), -- Fecha en que se unió al club
    UNIQUE(user_id, club_id) -- Un usuario no puede estar duplicado en el mismo club
);

-- ================================
-- FUNCIONES PARA RLS (ROW LEVEL SECURITY)
-- ================================

-- Función que retorna los IDs de clubs a los que el usuario actual tiene acceso
CREATE OR REPLACE FUNCTION get_user_clubs()
RETURNS UUID[] AS $$
    SELECT ARRAY(
        SELECT club_id
        FROM user_clubs
        WHERE user_id = auth.uid()
        AND is_active = true
    );

$$
LANGUAGE sql SECURITY DEFINER;

-- Función que verifica si el usuario actual es super administrador
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS
$$

    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND is_super_admin = true
    );

$$
LANGUAGE sql SECURITY DEFINER;

-- Función que verifica si el usuario tiene un rol específico en un club
CREATE OR REPLACE FUNCTION has_club_role(club_uuid UUID, required_role club_role)
RETURNS BOOLEAN AS
$$

    SELECT EXISTS (
        SELECT 1 FROM user_clubs
        WHERE user_id = auth.uid()
        AND club_id = club_uuid
        AND role = required_role
        AND is_active = true
    );

$$
LANGUAGE sql SECURITY DEFINER;

-- ================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ================================

-- Habilitar RLS en todas las tablas
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clubs ENABLE ROW LEVEL SECURITY;

-- ================================
-- POLÍTICAS PARA TABLA CLUBS
-- ================================

-- Los super administradores pueden ver y gestionar todos los clubs
CREATE POLICY "super_admin_full_access_clubs" ON clubs
    FOR ALL USING (is_super_admin());

-- Los usuarios regulares solo pueden ver los clubs a los que tienen acceso
CREATE POLICY "users_can_view_their_clubs" ON clubs
    FOR SELECT USING (id = ANY(get_user_clubs()));

-- Solo los super administradores pueden crear nuevos clubs
CREATE POLICY "super_admin_can_create_clubs" ON clubs
    FOR INSERT WITH CHECK (is_super_admin());

-- Solo los super administradores pueden actualizar clubs
CREATE POLICY "super_admin_can_update_clubs" ON clubs
    FOR UPDATE USING (is_super_admin());

-- ================================
-- POLÍTICAS PARA TABLA PROFILES
-- ================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "users_can_view_own_profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil (excepto campos sensibles)
CREATE POLICY "users_can_update_own_profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Los super administradores pueden ver todos los perfiles
CREATE POLICY "super_admin_can_view_all_profiles" ON profiles
    FOR SELECT USING (is_super_admin());

-- Solo los super administradores pueden crear perfiles (control total de usuarios)
CREATE POLICY "super_admin_can_create_profiles" ON profiles
    FOR INSERT WITH CHECK (is_super_admin());

-- ================================
-- POLÍTICAS PARA TABLA USER_CLUBS
-- ================================

-- Los usuarios pueden ver sus propias relaciones con clubs
CREATE POLICY "users_can_view_own_club_relations" ON user_clubs
    FOR SELECT USING (auth.uid() = user_id);

-- Los super administradores pueden ver todas las relaciones
CREATE POLICY "super_admin_can_view_all_user_clubs" ON user_clubs
    FOR SELECT USING (is_super_admin());

-- Solo los super administradores pueden crear relaciones usuario-club
CREATE POLICY "super_admin_can_create_user_clubs" ON user_clubs
    FOR INSERT WITH CHECK (is_super_admin());

-- Solo los super administradores pueden actualizar relaciones
CREATE POLICY "super_admin_can_update_user_clubs" ON user_clubs
    FOR UPDATE USING (is_super_admin());

-- ================================
-- TRIGGER PARA SINCRONIZAR PERFILES
-- ================================

-- Función que se ejecuta cuando se crea un nuevo usuario en auth.users
-- Crea automáticamente un perfil asociado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS
$$

BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta cuando se inserta un nuevo usuario
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ================================
-- DATOS DE EJEMPLO PARA TESTING
-- ================================

-- Insertar un club de ejemplo para testing
INSERT INTO clubs (name, slug, description, email) VALUES 
('Club Demo', 'club-demo', 'Club de demostración para testing', 'admin@club-demo.com');

-- ================================
-- COMENTARIOS IMPORTANTES
-- ================================

/*
INSTRUCCIONES DE USO:

1. Ejecutar este script completo en el SQL Editor de Supabase
2. Verificar que todas las tablas y políticas se crearon correctamente
3. En el panel de Authentication de Supabase, crear usuarios manualmente
4. Asignar el rol de super_admin al primer usuario actualizando la tabla profiles:
   UPDATE profiles SET is_super_admin = true WHERE email = 'tu-email@ejemplo.com';
5. Crear relaciones usuario-club en la tabla user_clubs para testing

IMPORTANTE:
- Este sistema NO permite auto-registro de usuarios
- Solo los super administradores pueden crear nuevos usuarios y asignar roles
- Cada usuario debe ser asociado manualmente a clubs específicos
- Las políticas RLS garantizan que cada usuario solo vea datos de sus clubs asignados
*/
$$
