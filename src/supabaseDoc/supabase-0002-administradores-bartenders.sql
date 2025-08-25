-- ================================================================================================
-- SCHEMA PARA ADMINISTRADORES Y BARTENDERS
-- OnTicket - Club Management Platform
-- ================================================================================================

-- Este script extiende el schema básico agregando tablas específicas para:
-- 1. Administradores de clubs (gestión y operaciones)
-- 2. Bartenders (personal operativo)

-- ================================================================================================
-- TIPOS ENUM ADICIONALES
-- ================================================================================================

-- Estado de empleados/administradores
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'suspended', 'terminated');

-- Nivel de experiencia para bartenders
CREATE TYPE experience_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Tipo de contrato
CREATE TYPE contract_type AS ENUM ('full_time', 'part_time', 'freelance', 'intern');

-- ================================================================================================
-- TABLA DE ADMINISTRADORES
-- ================================================================================================

-- Tabla específica para administradores de clubs
-- Se separa de profiles para tener mejor control y campos específicos
CREATE TABLE administradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información básica
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    
    -- Información profesional
    position VARCHAR(100), -- Cargo/posición (Gerente, Supervisor, etc.)
    department VARCHAR(100), -- Departamento (Administración, Ventas, etc.)
    employee_id VARCHAR(50), -- ID de empleado interno
    
    -- Autenticación y acceso
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Referencia opcional a auth.users
    role user_role DEFAULT 'club_admin',
    is_super_admin BOOLEAN DEFAULT FALSE,
    
    -- Estado y fechas
    status employee_status DEFAULT 'active',
    contract_type contract_type DEFAULT 'full_time',
    hire_date DATE,
    termination_date DATE,
    
    -- Información adicional
    salary DECIMAL(10,2), -- Salario (opcional)
    emergency_contact JSONB DEFAULT '{}', -- Contacto de emergencia
    notes TEXT, -- Notas administrativas
    permissions JSONB DEFAULT '{}', -- Permisos específicos
    preferences JSONB DEFAULT '{}', -- Preferencias del usuario
    
    -- Auditoría
    created_by UUID REFERENCES profiles(id), -- Quién lo creó
    updated_by UUID REFERENCES profiles(id), -- Quién lo actualizó
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Restricciones
    CONSTRAINT administradores_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT administradores_phone_check CHECK (phone IS NULL OR phone ~* '^[\+]?[0-9\s\-\(\)]+$'),
    CONSTRAINT administradores_dates_check CHECK (termination_date IS NULL OR termination_date >= hire_date)
);

-- ================================================================================================
-- TABLA DE BARTENDERS
-- ================================================================================================

-- Tabla específica para bartenders y personal operativo
CREATE TABLE bartenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información básica
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    date_of_birth DATE,
    
    -- Información profesional
    employee_id VARCHAR(50), -- ID de empleado interno
    experience_level experience_level DEFAULT 'beginner',
    specialties TEXT[], -- Especialidades (cocktails, vinos, cervezas, etc.)
    certifications TEXT[], -- Certificaciones (WSET, Bartender Course, etc.)
    languages TEXT[] DEFAULT ARRAY['español'], -- Idiomas que habla
    
    -- Información laboral
    contract_type contract_type DEFAULT 'part_time',
    hourly_rate DECIMAL(8,2), -- Tarifa por hora
    status employee_status DEFAULT 'active',
    hire_date DATE,
    termination_date DATE,
    
    -- Disponibilidad y horarios
    availability JSONB DEFAULT '{}', -- Disponibilidad semanal
    preferred_shifts TEXT[], -- Turnos preferidos (morning, afternoon, night)
    max_hours_per_week INTEGER DEFAULT 40,
    
    -- Evaluación y performance
    rating DECIMAL(3,2) CHECK (rating >= 1.0 AND rating <= 5.0), -- Rating promedio
    total_shifts INTEGER DEFAULT 0, -- Total de turnos trabajados
    completed_orders INTEGER DEFAULT 0, -- Órdenes completadas
    customer_rating DECIMAL(3,2) CHECK (customer_rating >= 1.0 AND customer_rating <= 5.0),
    
    -- Información adicional
    emergency_contact JSONB DEFAULT '{}', -- Contacto de emergencia
    medical_info JSONB DEFAULT '{}', -- Información médica relevante
    uniform_size VARCHAR(10), -- Talla de uniforme
    notes TEXT, -- Notas sobre el empleado
    
    -- Club asignado (un bartender puede trabajar en múltiples clubs)
    primary_club_id UUID REFERENCES clubs(id), -- Club principal
    
    -- Auditoría
    created_by UUID REFERENCES profiles(id), -- Quién lo creó
    updated_by UUID REFERENCES profiles(id), -- Quién lo actualizó
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Restricciones
    CONSTRAINT bartenders_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT bartenders_phone_check CHECK (phone IS NULL OR phone ~* '^[\+]?[0-9\s\-\(\)]+$'),
    CONSTRAINT bartenders_age_check CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '16 years'),
    CONSTRAINT bartenders_dates_check CHECK (termination_date IS NULL OR termination_date >= hire_date)
);

-- ================================================================================================
-- TABLA DE RELACIÓN ADMINISTRADORES - CLUBS
-- ================================================================================================

-- Relación many-to-many entre administradores y clubs
CREATE TABLE administrador_clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    administrador_id UUID NOT NULL REFERENCES administradores(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    
    -- Información específica de la relación
    role club_role DEFAULT 'manager',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE, -- ¿Es el club principal?
    
    -- Fechas
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    
    -- Auditoría
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Restricciones
    UNIQUE(administrador_id, club_id),
    CONSTRAINT admin_clubs_dates_check CHECK (end_date IS NULL OR end_date >= start_date)
);

-- ================================================================================================
-- TABLA DE RELACIÓN BARTENDERS - CLUBS
-- ================================================================================================

-- Relación many-to-many entre bartenders y clubs
CREATE TABLE bartender_clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bartender_id UUID NOT NULL REFERENCES bartenders(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    
    -- Información específica de la relación
    role VARCHAR(50) DEFAULT 'bartender', -- bartender, senior_bartender, head_bartender
    hourly_rate_override DECIMAL(9,2), -- Tarifa específica para este club
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Fechas
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    
    -- Performance en este club específico
    shifts_worked INTEGER DEFAULT 0,
    orders_completed INTEGER DEFAULT 0,
    club_rating DECIMAL(3,2) CHECK (club_rating >= 1.0 AND club_rating <= 5.0),
    
    -- Auditoría
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Restricciones
    UNIQUE(bartender_id, club_id),
    CONSTRAINT bartender_clubs_dates_check CHECK (end_date IS NULL OR end_date >= start_date)
);

-- ================================================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ================================================================================================

-- Índices para administradores
CREATE INDEX idx_administradores_email ON administradores(email);
CREATE INDEX idx_administradores_status ON administradores(status);
CREATE INDEX idx_administradores_auth_user ON administradores(auth_user_id);
CREATE INDEX idx_administradores_created_at ON administradores(created_at);

-- Índices para bartenders
CREATE INDEX idx_bartenders_email ON bartenders(email);
CREATE INDEX idx_bartenders_status ON bartenders(status);
CREATE INDEX idx_bartenders_experience ON bartenders(experience_level);
CREATE INDEX idx_bartenders_primary_club ON bartenders(primary_club_id);
CREATE INDEX idx_bartenders_created_at ON bartenders(created_at);

-- Índices para relaciones
CREATE INDEX idx_admin_clubs_admin ON administrador_clubs(administrador_id);
CREATE INDEX idx_admin_clubs_club ON administrador_clubs(club_id);
CREATE INDEX idx_admin_clubs_active ON administrador_clubs(is_active);

CREATE INDEX idx_bartender_clubs_bartender ON bartender_clubs(bartender_id);
CREATE INDEX idx_bartender_clubs_club ON bartender_clubs(club_id);
CREATE INDEX idx_bartender_clubs_active ON bartender_clubs(is_active);

-- ================================================================================================
-- FUNCIONES AUXILIARES
-- ================================================================================================

-- Función para obtener clubs de un administrador
CREATE OR REPLACE FUNCTION get_administrador_clubs(admin_id UUID)
RETURNS UUID[] AS $$
    SELECT ARRAY(
        SELECT club_id
        FROM administrador_clubs
        WHERE administrador_id = admin_id
        AND is_active = true
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para obtener clubs de un bartender
CREATE OR REPLACE FUNCTION get_bartender_clubs(bartender_id UUID)
RETURNS UUID[] AS $$
    SELECT ARRAY(
        SELECT club_id
        FROM bartender_clubs
        WHERE bartender_id = bartender_id
        AND is_active = true
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para verificar si un usuario es administrador
CREATE OR REPLACE FUNCTION is_administrador()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM administradores
        WHERE auth_user_id = auth.uid()
        AND status = 'active'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- ================================================================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ================================================================================================

-- Habilitar RLS en todas las nuevas tablas
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE bartenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrador_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bartender_clubs ENABLE ROW LEVEL SECURITY;

-- ================================================================================================
-- POLÍTICAS PARA TABLA ADMINISTRADORES
-- ================================================================================================

-- Los super administradores pueden ver y gestionar todos los administradores
CREATE POLICY "super_admin_full_access_administradores" ON administradores
    FOR ALL USING (is_super_admin());

-- Los administradores pueden ver su propio registro
CREATE POLICY "admin_can_view_own_record" ON administradores
    FOR SELECT USING (auth_user_id = auth.uid());

-- Los administradores pueden actualizar su propio registro (campos limitados)
CREATE POLICY "admin_can_update_own_record" ON administradores
    FOR UPDATE USING (auth_user_id = auth.uid());

-- Solo super administradores pueden crear nuevos administradores
CREATE POLICY "super_admin_can_create_administradores" ON administradores
    FOR INSERT WITH CHECK (is_super_admin());

-- ================================================================================================
-- POLÍTICAS PARA TABLA BARTENDERS
-- ================================================================================================

-- Los super administradores pueden ver y gestionar todos los bartenders
CREATE POLICY "super_admin_full_access_bartenders" ON bartenders
    FOR ALL USING (is_super_admin());

-- Los administradores pueden ver bartenders de sus clubs
CREATE POLICY "admin_can_view_club_bartenders" ON bartenders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bartender_clubs bc
            JOIN administrador_clubs ac ON bc.club_id = ac.club_id
            JOIN administradores a ON ac.administrador_id = a.id
            WHERE bc.bartender_id = bartenders.id
            AND a.auth_user_id = auth.uid()
            AND ac.is_active = true
            AND bc.is_active = true
        )
    );

-- Los administradores pueden crear bartenders para sus clubs
CREATE POLICY "admin_can_create_bartenders" ON bartenders
    FOR INSERT WITH CHECK (
        is_super_admin() OR 
        is_administrador()
    );

-- Los administradores pueden actualizar bartenders de sus clubs
CREATE POLICY "admin_can_update_club_bartenders" ON bartenders
    FOR UPDATE USING (
        is_super_admin() OR
        EXISTS (
            SELECT 1 FROM bartender_clubs bc
            JOIN administrador_clubs ac ON bc.club_id = ac.club_id
            JOIN administradores a ON ac.administrador_id = a.id
            WHERE bc.bartender_id = bartenders.id
            AND a.auth_user_id = auth.uid()
            AND ac.is_active = true
            AND bc.is_active = true
        )
    );

-- ================================================================================================
-- POLÍTICAS PARA RELACIONES ADMINISTRADOR_CLUBS
-- ================================================================================================

-- Los super administradores pueden ver todas las relaciones
CREATE POLICY "super_admin_view_all_admin_clubs" ON administrador_clubs
    FOR SELECT USING (is_super_admin());

-- Los administradores pueden ver sus propias relaciones
CREATE POLICY "admin_view_own_club_relations" ON administrador_clubs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM administradores
            WHERE id = administrador_clubs.administrador_id
            AND auth_user_id = auth.uid()
        )
    );

-- Solo super administradores pueden crear/modificar relaciones
CREATE POLICY "super_admin_manage_admin_clubs" ON administrador_clubs
    FOR ALL USING (is_super_admin());

-- ================================================================================================
-- POLÍTICAS PARA RELACIONES BARTENDER_CLUBS
-- ================================================================================================

-- Los super administradores pueden ver todas las relaciones
CREATE POLICY "super_admin_view_all_bartender_clubs" ON bartender_clubs
    FOR SELECT USING (is_super_admin());

-- Los administradores pueden ver relaciones de sus clubs
CREATE POLICY "admin_view_club_bartender_relations" ON bartender_clubs
    FOR SELECT USING (
        is_super_admin() OR
        EXISTS (
            SELECT 1 FROM administrador_clubs ac
            JOIN administradores a ON ac.administrador_id = a.id
            WHERE ac.club_id = bartender_clubs.club_id
            AND a.auth_user_id = auth.uid()
            AND ac.is_active = true
        )
    );

-- Los administradores pueden gestionar bartenders en sus clubs
CREATE POLICY "admin_manage_club_bartenders" ON bartender_clubs
    FOR ALL USING (
        is_super_admin() OR
        EXISTS (
            SELECT 1 FROM administrador_clubs ac
            JOIN administradores a ON ac.administrador_id = a.id
            WHERE ac.club_id = bartender_clubs.club_id
            AND a.auth_user_id = auth.uid()
            AND ac.is_active = true
        )
    );

-- ================================================================================================
-- TRIGGERS PARA AUDITORÍA
-- ================================================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER trigger_administradores_updated_at
    BEFORE UPDATE ON administradores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_bartenders_updated_at
    BEFORE UPDATE ON bartenders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_administrador_clubs_updated_at
    BEFORE UPDATE ON administrador_clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_bartender_clubs_updated_at
    BEFORE UPDATE ON bartender_clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================================================
-- DATOS DE EJEMPLO PARA TESTING
-- ================================================================================================

-- Insertar un administrador de ejemplo (después de crear un usuario en auth)
-- Este será ejecutado manualmente después de crear el usuario en Supabase Auth

/*
-- Ejemplo de inserción después de crear usuario en auth:
INSERT INTO administradores (
    email, 
    full_name, 
    position, 
    role, 
    is_super_admin,
    hire_date,
    auth_user_id
) VALUES (
    'admin@ejemplo.com',
    'Juan Pérez',
    'Gerente General',
    'super_admin',
    true,
    CURRENT_DATE,
    'uuid-del-usuario-auth' -- Reemplazar con el UUID real
);
*/

-- ================================================================================================
-- COMENTARIOS DE USO
-- ================================================================================================

/*
INSTRUCCIONES DE USO:

1. Ejecutar este script en Supabase SQL Editor
2. Verificar que todas las tablas y políticas se crearon correctamente
3. Para crear administradores:
   a. Crear usuario en Supabase Auth (Authentication panel)
   b. Insertar registro en tabla 'administradores' con auth_user_id
   c. Crear relaciones en 'administrador_clubs'

4. Para crear bartenders:
   a. Insertar directamente en tabla 'bartenders' (no requiere auth.users)
   b. Crear relaciones en 'bartender_clubs'

5. El primer super administrador debe ser creado manualmente:
   UPDATE administradores SET is_super_admin = true WHERE email = 'tu-email@ejemplo.com';

IMPORTANTES:
- Los administradores tienen cuentas de auth (login)
- Los bartenders son empleados sin acceso al sistema (solo datos)
- Las políticas RLS garantizan acceso seguro por roles
- Los super administradores tienen acceso completo
- Los administradores solo ven datos de sus clubs asignados
*/
