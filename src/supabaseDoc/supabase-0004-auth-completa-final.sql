-- ================================================================================================
-- SCHEMA FINAL CON AUTENTICACIÓN COMPLETA
-- OnTicket - Club Management Platform
-- ================================================================================================

-- Este script define las tablas finales para:
-- 1. Administradores (con email y contraseña reales para login)
-- 2. Empleados (con email y contraseña reales para login)
-- Ambos creados desde el panel de admin general

-- ================================================================================================
-- TIPOS ENUM FINALES
-- ================================================================================================

-- Estado de empleados/administradores
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'suspended', 'terminated', 'on_leave');

-- Categorías de empleados en club nocturno
CREATE TYPE empleado_categoria AS ENUM (
    'bartender',           -- Bartender regular
    'head_bartender',      -- Jefe de bar
    'waiter',             -- Mesero/camarero
    'head_waiter',        -- Jefe de meseros
    'security',           -- Seguridad/portero
    'security_chief',     -- Jefe de seguridad
    'dj',                 -- DJ
    'sound_tech',         -- Técnico de sonido
    'lighting_tech',      -- Técnico de luces
    'promoter',           -- Promotor/relaciones públicas
    'hostess',            -- Azafata/hostess
    'cleaner',            -- Personal de limpieza
    'kitchen_staff',      -- Personal de cocina
    'cashier',            -- Cajero
    'manager',            -- Gerente de turno
    'coordinator',        -- Coordinador general
    'maintenance',        -- Mantenimiento
    'valet',              -- Valet parking
    'photographer',       -- Fotógrafo del club
    'dancer',             -- Bailarín/animador
    'admin_staff'         -- Personal administrativo
);

-- Nivel de experiencia
CREATE TYPE experience_level AS ENUM ('trainee', 'junior', 'senior', 'expert', 'master');

-- Tipo de contrato
CREATE TYPE contract_type AS ENUM ('full_time', 'part_time', 'freelance', 'intern', 'seasonal', 'event_based');

-- Turnos de trabajo
CREATE TYPE work_shift AS ENUM ('morning', 'afternoon', 'night', 'early_night', 'late_night', 'weekend', 'special_events');

-- ================================================================================================
-- TABLA DE ADMINISTRADORES (CON AUTENTICACIÓN)
-- ================================================================================================

-- Tabla para administradores del sistema CON autenticación completa
CREATE TABLE administradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información de autenticación (REALES para login)
    email VARCHAR(255) UNIQUE NOT NULL, -- Email real para login
    password_hash VARCHAR(255) NOT NULL, -- Hash de contraseña para login
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    
    -- Información profesional
    position VARCHAR(100), -- Cargo/posición (Gerente, Supervisor, etc.)
    department VARCHAR(100), -- Departamento (Administración, Ventas, etc.)
    employee_id VARCHAR(50), -- ID de empleado interno
    
    -- Roles del sistema
    role user_role DEFAULT 'club_admin',
    is_super_admin BOOLEAN DEFAULT FALSE,
    
    -- Estado y fechas
    status employee_status DEFAULT 'active',
    contract_type contract_type DEFAULT 'full_time',
    hire_date DATE,
    termination_date DATE,
    
    -- Información adicional
    salary DECIMAL(15,2), -- Salario (hasta 999 billones)
    emergency_contact JSONB DEFAULT '{}', -- Contacto de emergencia
    notes TEXT, -- Notas administrativas
    permissions JSONB DEFAULT '{}', -- Permisos específicos del sistema
    preferences JSONB DEFAULT '{}', -- Preferencias del usuario
    
    -- Control de acceso
    last_login TIMESTAMPTZ, -- Último login
    login_attempts INTEGER DEFAULT 0, -- Intentos de login fallidos
    account_locked BOOLEAN DEFAULT FALSE, -- Cuenta bloqueada
    password_reset_token VARCHAR(255), -- Token para reset de contraseña
    password_reset_expires TIMESTAMPTZ, -- Expiración del token
    must_change_password BOOLEAN DEFAULT TRUE, -- Debe cambiar contraseña en primer login
    
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
-- TABLA DE EMPLEADOS (CON AUTENTICACIÓN OBLIGATORIA)
-- ================================================================================================

-- Tabla completa para empleados de club nocturno CON autenticación obligatoria
CREATE TABLE empleados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información básica y autenticación (OBLIGATORIAS)
    email VARCHAR(255) UNIQUE NOT NULL, -- Email real del empleado para login
    password_hash VARCHAR(255) NOT NULL, -- Hash de contraseña OBLIGATORIO
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    date_of_birth DATE,
    document_type VARCHAR(20) DEFAULT 'DNI', -- DNI, Pasaporte, etc.
    document_number VARCHAR(50),
    
    -- Información profesional
    employee_id VARCHAR(50), -- ID de empleado interno
    categoria empleado_categoria NOT NULL, -- Categoría del empleado
    experience_level experience_level DEFAULT 'junior',
    specialties TEXT[], -- Especialidades específicas
    certifications TEXT[], -- Certificaciones y cursos
    languages TEXT[] DEFAULT ARRAY['español'], -- Idiomas que habla
    
    -- Información laboral
    contract_type contract_type DEFAULT 'part_time',
    hourly_rate DECIMAL(9,2), -- Tarifa por hora
    monthly_salary DECIMAL(10,2), -- Salario mensual fijo (opcional)
    commission_rate DECIMAL(5,2), -- Porcentaje de comisión (para ventas)
    status employee_status DEFAULT 'active',
    hire_date DATE,
    termination_date DATE,
    
    -- Disponibilidad y horarios
    availability JSONB DEFAULT '{}', -- Disponibilidad semanal
    preferred_shifts work_shift[], -- Turnos preferidos
    max_hours_per_week INTEGER DEFAULT 40,
    min_hours_per_week INTEGER DEFAULT 0,
    
    -- Evaluación y performance
    rating DECIMAL(3,2) CHECK (rating >= 1.0 AND rating <= 5.0), -- Rating promedio
    total_shifts INTEGER DEFAULT 0, -- Total de turnos trabajados
    total_hours_worked DECIMAL(8,2) DEFAULT 0, -- Horas totales trabajadas
    completed_tasks INTEGER DEFAULT 0, -- Tareas/órdenes completadas
    customer_rating DECIMAL(3,2) CHECK (customer_rating >= 1.0 AND customer_rating <= 5.0),
    punctuality_score DECIMAL(3,2) DEFAULT 5.0, -- Puntualidad (1-5)
    
    -- Información personal y laboral
    emergency_contact JSONB DEFAULT '{}', -- Contacto de emergencia
    medical_info JSONB DEFAULT '{}', -- Información médica relevante
    allergies TEXT[], -- Alergias importantes
    uniform_size VARCHAR(10), -- Talla de uniforme
    locker_number INTEGER, -- Número de casillero
    access_card_number VARCHAR(50), -- Número de tarjeta de acceso
    
    -- Información bancaria (para pagos)
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_type VARCHAR(20), -- Cuenta corriente, caja de ahorro, etc.
    
    -- Configuraciones de trabajo
    can_work_weekends BOOLEAN DEFAULT true,
    can_work_holidays BOOLEAN DEFAULT false,
    has_transportation BOOLEAN DEFAULT false,
    needs_accommodation BOOLEAN DEFAULT false,
    
    -- Control de acceso
    last_login TIMESTAMPTZ, -- Último login
    login_attempts INTEGER DEFAULT 0, -- Intentos de login fallidos
    account_locked BOOLEAN DEFAULT FALSE, -- Cuenta bloqueada
    password_reset_token VARCHAR(255), -- Token para reset de contraseña
    password_reset_expires TIMESTAMPTZ, -- Expiración del token
    must_change_password BOOLEAN DEFAULT TRUE, -- Debe cambiar contraseña en primer login
    
    -- Notas y observaciones
    notes TEXT, -- Notas sobre el empleado
    training_notes TEXT, -- Notas de entrenamiento
    performance_notes TEXT, -- Notas de rendimiento
    
    -- Club principal (un empleado puede trabajar en múltiples clubs)
    primary_club_id UUID REFERENCES clubs(id), -- Club principal
    
    -- Auditoría
    created_by UUID REFERENCES profiles(id), -- Quién lo creó
    updated_by UUID REFERENCES profiles(id), -- Quién lo actualizó
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Restricciones
    CONSTRAINT empleados_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT empleados_phone_check CHECK (phone IS NULL OR phone ~* '^[\+]?[0-9\s\-\(\)]+$'),
    CONSTRAINT empleados_age_check CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '16 years'),
    CONSTRAINT empleados_dates_check CHECK (termination_date IS NULL OR termination_date >= hire_date),
    CONSTRAINT empleados_hours_check CHECK (max_hours_per_week >= min_hours_per_week),
    CONSTRAINT empleados_salary_check CHECK (
        (hourly_rate IS NOT NULL AND hourly_rate > 0) OR 
        (monthly_salary IS NOT NULL AND monthly_salary > 0)
    )
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
-- TABLA DE RELACIÓN EMPLEADOS - CLUBS
-- ================================================================================================

-- Relación many-to-many entre empleados y clubs
CREATE TABLE empleado_clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    
    -- Información específica de la relación en este club
    categoria_override empleado_categoria, -- Categoría específica para este club
    hourly_rate_override DECIMAL(9,2), -- Tarifa específica para este club
    monthly_salary_override DECIMAL(10,2), -- Salario específico para este club
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Fechas
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    
    -- Performance en este club específico
    shifts_worked INTEGER DEFAULT 0,
    hours_worked DECIMAL(8,2) DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    club_rating DECIMAL(3,2) CHECK (club_rating >= 1.0 AND club_rating <= 5.0),
    
    -- Configuración específica del club
    access_level INTEGER DEFAULT 1, -- Nivel de acceso en este club
    uniform_provided BOOLEAN DEFAULT false,
    locker_assigned BOOLEAN DEFAULT false,
    
    -- Auditoría
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Restricciones
    UNIQUE(empleado_id, club_id),
    CONSTRAINT empleado_clubs_dates_check CHECK (end_date IS NULL OR end_date >= start_date)
);

-- ================================================================================================
-- TABLA DE TURNOS DE TRABAJO
-- ================================================================================================

-- Tabla para gestionar turnos específicos de empleados
CREATE TABLE empleado_turnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    
    -- Información del turno
    fecha DATE NOT NULL,
    turno work_shift NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    horas_trabajadas DECIMAL(4,2),
    
    -- Estado del turno
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    
    -- Evaluación del turno
    performance_rating DECIMAL(3,2) CHECK (performance_rating >= 1.0 AND performance_rating <= 5.0),
    supervisor_notes TEXT,
    
    -- Auditoría
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================================================
-- FUNCIONES PARA AUTENTICACIÓN
-- ================================================================================================

-- Función para validar login de administrador con control estricto de estados
CREATE OR REPLACE FUNCTION validate_admin_login(p_email VARCHAR, p_password VARCHAR)
RETURNS TABLE(
    admin_id UUID,
    full_name VARCHAR,
    role user_role,
    is_super_admin BOOLEAN,
    must_change_password BOOLEAN,
    account_locked BOOLEAN,
    status employee_status,
    login_successful BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    admin_record RECORD;
BEGIN
    -- Buscar el administrador
    SELECT * INTO admin_record 
    FROM administradores a 
    WHERE a.email = p_email;
    
    -- Verificar si existe el administrador
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            NULL::UUID, NULL::VARCHAR, NULL::user_role, NULL::BOOLEAN, 
            NULL::BOOLEAN, NULL::BOOLEAN, NULL::employee_status,
            false, 'Usuario no encontrado'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si la cuenta está bloqueada
    IF admin_record.account_locked THEN
        RETURN QUERY SELECT 
            admin_record.id, admin_record.full_name, admin_record.role, 
            admin_record.is_super_admin, admin_record.must_change_password,
            admin_record.account_locked, admin_record.status,
            false, 'Cuenta bloqueada por múltiples intentos fallidos'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si está activo
    IF admin_record.status != 'active' THEN
        RETURN QUERY SELECT 
            admin_record.id, admin_record.full_name, admin_record.role, 
            admin_record.is_super_admin, admin_record.must_change_password,
            admin_record.account_locked, admin_record.status,
            false, 'Cuenta deshabilitada. Contacte al administrador'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar contraseña
    IF admin_record.password_hash = crypt(p_password, admin_record.password_hash) THEN
        -- Login exitoso
        UPDATE administradores 
        SET last_login = NOW(), login_attempts = 0
        WHERE email = p_email;
        
        RETURN QUERY SELECT 
            admin_record.id, admin_record.full_name, admin_record.role, 
            admin_record.is_super_admin, admin_record.must_change_password,
            admin_record.account_locked, admin_record.status,
            true, 'Login exitoso'::TEXT;
    ELSE
        -- Contraseña incorrecta
        UPDATE administradores 
        SET login_attempts = login_attempts + 1,
            account_locked = CASE 
                WHEN login_attempts >= 4 THEN true 
                ELSE false 
            END
        WHERE email = p_email;
        
        RETURN QUERY SELECT 
            admin_record.id, admin_record.full_name, admin_record.role, 
            admin_record.is_super_admin, admin_record.must_change_password,
            admin_record.account_locked, admin_record.status,
            false, 'Contraseña incorrecta'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para validar login de empleado
CREATE OR REPLACE FUNCTION validate_empleado_login(p_email VARCHAR, p_password VARCHAR)
RETURNS TABLE(
    empleado_id UUID,
    full_name VARCHAR,
    categoria empleado_categoria,
    must_change_password BOOLEAN,
    account_locked BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.full_name,
        e.categoria,
        e.must_change_password,
        e.account_locked
    FROM empleados e
    WHERE e.email = p_email 
    AND e.password_hash = crypt(p_password, e.password_hash)
    AND e.status = 'active'
    AND NOT e.account_locked;
    
    -- Actualizar último login si es exitoso
    IF FOUND THEN
        UPDATE empleados 
        SET last_login = NOW(), login_attempts = 0
        WHERE email = p_email;
    ELSE
        -- Incrementar intentos fallidos
        UPDATE empleados 
        SET login_attempts = login_attempts + 1,
            account_locked = CASE WHEN login_attempts >= 4 THEN true ELSE false END
        WHERE email = p_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para cambiar contraseña
CREATE OR REPLACE FUNCTION change_password(p_user_type VARCHAR, p_user_id UUID, p_new_password VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    IF p_user_type = 'admin' THEN
        UPDATE administradores 
        SET password_hash = crypt(p_new_password, gen_salt('bf')),
            must_change_password = false,
            updated_at = NOW()
        WHERE id = p_user_id;
    ELSIF p_user_type = 'empleado' THEN
        UPDATE empleados 
        SET password_hash = crypt(p_new_password, gen_salt('bf')),
            must_change_password = false,
            updated_at = NOW()
        WHERE id = p_user_id;
    ELSE
        RETURN false;
    END IF;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para validar si un administrador puede realizar operaciones
CREATE OR REPLACE FUNCTION validate_admin_can_operate(p_admin_id UUID)
RETURNS TABLE(
    can_operate BOOLEAN,
    status employee_status,
    error_message TEXT
) AS $$
DECLARE
    admin_record RECORD;
BEGIN
    -- Buscar el administrador
    SELECT * INTO admin_record 
    FROM administradores a 
    WHERE a.id = p_admin_id;
    
    -- Verificar si existe
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::employee_status, 'Administrador no encontrado'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si está activo
    IF admin_record.status != 'active' THEN
        RETURN QUERY SELECT false, admin_record.status, 'Administrador deshabilitado'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si no está bloqueado
    IF admin_record.account_locked THEN
        RETURN QUERY SELECT false, admin_record.status, 'Cuenta bloqueada'::TEXT;
        RETURN;
    END IF;
    
    -- Todo OK
    RETURN QUERY SELECT true, admin_record.status, 'Operación permitida'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para validar si un empleado puede realizar operaciones
CREATE OR REPLACE FUNCTION validate_empleado_can_operate(p_empleado_id UUID)
RETURNS TABLE(
    can_operate BOOLEAN,
    status employee_status,
    error_message TEXT
) AS $$
DECLARE
    empleado_record RECORD;
BEGIN
    -- Buscar el empleado
    SELECT * INTO empleado_record 
    FROM empleados e 
    WHERE e.id = p_empleado_id;
    
    -- Verificar si existe
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::employee_status, 'Empleado no encontrado'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si está activo
    IF empleado_record.status != 'active' THEN
        RETURN QUERY SELECT false, empleado_record.status, 'Empleado deshabilitado'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si no está bloqueado
    IF empleado_record.account_locked THEN
        RETURN QUERY SELECT false, empleado_record.status, 'Cuenta bloqueada'::TEXT;
        RETURN;
    END IF;
    
    -- Todo OK
    RETURN QUERY SELECT true, empleado_record.status, 'Operación permitida'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ================================================================================================

-- Índices para administradores
CREATE INDEX idx_administradores_email ON administradores(email);
CREATE INDEX idx_administradores_status ON administradores(status);
CREATE INDEX idx_administradores_role ON administradores(role);
CREATE INDEX idx_administradores_created_at ON administradores(created_at);

-- Índices para empleados
CREATE INDEX idx_empleados_email ON empleados(email);
CREATE INDEX idx_empleados_status ON empleados(status);
CREATE INDEX idx_empleados_categoria ON empleados(categoria);
CREATE INDEX idx_empleados_primary_club ON empleados(primary_club_id);
CREATE INDEX idx_empleados_document ON empleados(document_type, document_number);
CREATE INDEX idx_empleados_created_at ON empleados(created_at);

-- Índices para relaciones
CREATE INDEX idx_admin_clubs_admin ON administrador_clubs(administrador_id);
CREATE INDEX idx_admin_clubs_club ON administrador_clubs(club_id);
CREATE INDEX idx_admin_clubs_active ON administrador_clubs(is_active);

CREATE INDEX idx_empleado_clubs_empleado ON empleado_clubs(empleado_id);
CREATE INDEX idx_empleado_clubs_club ON empleado_clubs(club_id);
CREATE INDEX idx_empleado_clubs_active ON empleado_clubs(is_active);

-- Índices para turnos
CREATE INDEX idx_empleado_turnos_empleado ON empleado_turnos(empleado_id);
CREATE INDEX idx_empleado_turnos_club ON empleado_turnos(club_id);
CREATE INDEX idx_empleado_turnos_fecha ON empleado_turnos(fecha);
CREATE INDEX idx_empleado_turnos_status ON empleado_turnos(status);

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

-- Función para obtener clubs de un empleado
CREATE OR REPLACE FUNCTION get_empleado_clubs(empleado_id UUID)
RETURNS UUID[] AS $$
    SELECT ARRAY(
        SELECT club_id
        FROM empleado_clubs
        WHERE empleado_id = empleado_id
        AND is_active = true
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para calcular horas trabajadas en un período
CREATE OR REPLACE FUNCTION calcular_horas_empleado(empleado_id UUID, fecha_inicio DATE, fecha_fin DATE)
RETURNS DECIMAL AS $$
    SELECT COALESCE(SUM(horas_trabajadas), 0)
    FROM empleado_turnos
    WHERE empleado_id = empleado_id
    AND fecha BETWEEN fecha_inicio AND fecha_fin
    AND status = 'completed';
$$ LANGUAGE sql SECURITY DEFINER;

-- ================================================================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ================================================================================================

-- Habilitar RLS en todas las nuevas tablas
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrador_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleado_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleado_turnos ENABLE ROW LEVEL SECURITY;

-- ================================================================================================
-- POLÍTICAS PARA TABLA ADMINISTRADORES
-- ================================================================================================

-- Los super administradores pueden ver y gestionar todos los administradores
CREATE POLICY "super_admin_full_access_administradores" ON administradores
    FOR ALL USING (is_super_admin());

-- Solo super administradores pueden crear nuevos administradores
CREATE POLICY "super_admin_can_create_administradores" ON administradores
    FOR INSERT WITH CHECK (is_super_admin());

-- ================================================================================================
-- POLÍTICAS PARA TABLA EMPLEADOS
-- ================================================================================================

-- Los super administradores pueden ver y gestionar todos los empleados
CREATE POLICY "super_admin_full_access_empleados" ON empleados
    FOR ALL USING (is_super_admin());

-- Los administradores pueden ver empleados de sus clubs
CREATE POLICY "admin_can_view_club_empleados" ON empleados
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM empleado_clubs ec
            JOIN administrador_clubs ac ON ec.club_id = ac.club_id
            JOIN administradores a ON ac.administrador_id = a.id
            WHERE ec.empleado_id = empleados.id
            AND ac.is_active = true
            AND ec.is_active = true
        )
    );

-- Los administradores pueden crear empleados para sus clubs
CREATE POLICY "admin_can_create_empleados" ON empleados
    FOR INSERT WITH CHECK (is_super_admin());

-- Los administradores pueden actualizar empleados de sus clubs
CREATE POLICY "admin_can_update_club_empleados" ON empleados
    FOR UPDATE USING (
        is_super_admin() OR
        EXISTS (
            SELECT 1 FROM empleado_clubs ec
            JOIN administrador_clubs ac ON ec.club_id = ac.club_id
            JOIN administradores a ON ac.administrador_id = a.id
            WHERE ec.empleado_id = empleados.id
            AND ac.is_active = true
            AND ec.is_active = true
        )
    );

-- ================================================================================================
-- POLÍTICAS PARA RELACIONES
-- ================================================================================================

-- Solo super administradores pueden gestionar relaciones administrador-clubs
CREATE POLICY "super_admin_manage_admin_clubs" ON administrador_clubs
    FOR ALL USING (is_super_admin());

-- Super administradores y administradores pueden gestionar empleado-clubs
CREATE POLICY "admin_manage_empleado_clubs" ON empleado_clubs
    FOR ALL USING (
        is_super_admin() OR
        EXISTS (
            SELECT 1 FROM administrador_clubs ac
            JOIN administradores a ON ac.administrador_id = a.id
            WHERE ac.club_id = empleado_clubs.club_id
            AND ac.is_active = true
        )
    );

-- Políticas para turnos
CREATE POLICY "admin_manage_empleado_turnos" ON empleado_turnos
    FOR ALL USING (
        is_super_admin() OR
        EXISTS (
            SELECT 1 FROM administrador_clubs ac
            JOIN administradores a ON ac.administrador_id = a.id
            WHERE ac.club_id = empleado_turnos.club_id
            AND ac.is_active = true
        )
    );

-- ================================================================================================
-- TRIGGERS PARA AUDITORÍA Y AUTOMATIZACIÓN
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

CREATE TRIGGER trigger_empleados_updated_at
    BEFORE UPDATE ON empleados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_administrador_clubs_updated_at
    BEFORE UPDATE ON administrador_clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_empleado_clubs_updated_at
    BEFORE UPDATE ON empleado_clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para hashear contraseñas automáticamente
CREATE OR REPLACE FUNCTION hash_password()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo hashear si la contraseña cambió y no está ya hasheada
    IF NEW.password_hash IS DISTINCT FROM OLD.password_hash AND 
       NOT NEW.password_hash LIKE '$2%' THEN
        NEW.password_hash = crypt(NEW.password_hash, gen_salt('bf'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_hash_admin_password
    BEFORE INSERT OR UPDATE ON administradores
    FOR EACH ROW EXECUTE FUNCTION hash_password();

CREATE TRIGGER trigger_hash_empleado_password
    BEFORE INSERT OR UPDATE ON empleados
    FOR EACH ROW EXECUTE FUNCTION hash_password();

-- Trigger para calcular horas trabajadas automáticamente
CREATE OR REPLACE FUNCTION calcular_horas_turno()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.hora_inicio IS NOT NULL AND NEW.hora_fin IS NOT NULL THEN
        NEW.horas_trabajadas = EXTRACT(EPOCH FROM (NEW.hora_fin - NEW.hora_inicio)) / 3600;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_horas_turno
    BEFORE INSERT OR UPDATE ON empleado_turnos
    FOR EACH ROW EXECUTE FUNCTION calcular_horas_turno();

-- ================================================================================================
-- COMENTARIOS DE USO
-- ================================================================================================

/*
INSTRUCCIONES DE USO:

1. Ejecutar este script en Supabase SQL Editor
2. Verificar que todas las tablas y políticas se crearon correctamente

3. Para crear administradores:
   - Insertar en tabla 'administradores' con email y password reales
   - La contraseña se hashea automáticamente
   - must_change_password = true por defecto
   - Crear relaciones en 'administrador_clubs'

4. Para crear empleados:
   - Insertar en tabla 'empleados' con email, password y categoría
   - La contraseña se hashea automáticamente  
   - must_change_password = true por defecto
   - Crear relaciones en 'empleado_clubs'

5. Para login:
   - Usar función validate_admin_login(email, password)
   - Usar función validate_empleado_login(email, password)
   - Gestiona intentos fallidos y bloqueo automático

6. El primer super administrador:
   INSERT INTO administradores (email, password_hash, full_name, role, is_super_admin) 
   VALUES ('admin@sistema.com', 'password123', 'Super Admin', 'super_admin', true);

IMPORTANTES:
- Ambos tipos de usuario tienen email y contraseña reales
- Autenticación completa con funciones de login
- Sistema de bloqueo por intentos fallidos
- Forzar cambio de contraseña en primer login
- Hashing automático de contraseñas con bcrypt
*/
