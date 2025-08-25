// ================================================================================================
// TIPOS TYPESCRIPT PARA ADMINISTRADORES Y EMPLEADOS - VERSIÓN FINAL
// ================================================================================================

// Tipos para los enums de la base de datos
export type EmployeeStatus = 'active' | 'inactive' | 'suspended' | 'terminated' | 'on_leave';
export type UserRole = 'super_admin' | 'club_admin';
export type ClubRole = 'owner' | 'manager' | 'supervisor' | 'staff';
export type ContractType = 'full_time' | 'part_time' | 'freelance' | 'intern' | 'seasonal' | 'event_based';
export type ExperienceLevel = 'trainee' | 'junior' | 'senior' | 'expert' | 'master';
export type WorkShift = 'morning' | 'afternoon' | 'night' | 'early_night' | 'late_night' | 'weekend' | 'special_events';

// Categorías de empleados en club nocturno
export type EmpleadoCategoria = 
  | 'bartender'           // Bartender regular
  | 'head_bartender'      // Jefe de bar
  | 'waiter'             // Mesero/camarero
  | 'head_waiter'        // Jefe de meseros
  | 'security'           // Seguridad/portero
  | 'security_chief'     // Jefe de seguridad
  | 'dj'                 // DJ
  | 'sound_tech'         // Técnico de sonido
  | 'lighting_tech'      // Técnico de luces
  | 'promoter'           // Promotor/relaciones públicas
  | 'hostess'            // Azafata/hostess
  | 'cleaner'            // Personal de limpieza
  | 'kitchen_staff'      // Personal de cocina
  | 'cashier'            // Cajero
  | 'manager'            // Gerente de turno
  | 'coordinator'        // Coordinador general
  | 'maintenance'        // Mantenimiento
  | 'valet'              // Valet parking
  | 'photographer'       // Fotógrafo del club
  | 'dancer'             // Bailarín/animador
  | 'admin_staff';       // Personal administrativo

// ================================================================================================
// INTERFACE PARA ADMINISTRADORES (CON AUTENTICACIÓN)
// ================================================================================================

export interface Administrador {
  id: string;
  
  // Información de autenticación (REALES para login)
  email: string;            // Email real para login
  password_hash?: string;   // Hash de contraseña (no se expone en frontend)
  full_name: string;
  phone?: string;
  avatar_url?: string;
  
  // Información profesional
  position?: string;
  department?: string;
  employee_id?: string;
  
  // Roles del sistema (sin dependencia de auth)
  role: UserRole;
  is_super_admin: boolean;
  
  // Estado y fechas
  status: EmployeeStatus;
  contract_type: ContractType;
  hire_date?: string;
  termination_date?: string;
  
  // Información adicional
  salary?: number;
  emergency_contact?: Record<string, any>;
  notes?: string;
  permissions?: Record<string, any>;
  preferences?: Record<string, any>;
  
  // Auditoría
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// ================================================================================================
// INTERFACE PARA EMPLEADOS (PERSONAL COMPLETO DEL CLUB)
// ================================================================================================

export interface Empleado {
  id: string;
  
  // Información básica y autenticación
  email: string;            // Email real del empleado
  password_hash?: string;   // Hash de contraseña (opcional)
  full_name: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  document_type?: string;   // DNI, Pasaporte, etc.
  document_number?: string;
  
  // Información profesional
  employee_id?: string;
  categoria: EmpleadoCategoria;
  experience_level: ExperienceLevel;
  specialties?: string[];
  certifications?: string[];
  languages: string[];
  
  // Información laboral
  contract_type: ContractType;
  hourly_rate?: number;
  monthly_salary?: number;
  commission_rate?: number;
  status: EmployeeStatus;
  hire_date?: string;
  termination_date?: string;
  
  // Disponibilidad y horarios
  availability?: Record<string, any>;
  preferred_shifts?: WorkShift[];
  max_hours_per_week: number;
  min_hours_per_week: number;
  
  // Evaluación y performance
  rating?: number;
  total_shifts: number;
  total_hours_worked: number;
  completed_tasks: number;
  customer_rating?: number;
  punctuality_score: number;
  
  // Información personal y laboral
  emergency_contact?: Record<string, any>;
  medical_info?: Record<string, any>;
  allergies?: string[];
  uniform_size?: string;
  locker_number?: number;
  access_card_number?: string;
  
  // Información bancaria
  bank_name?: string;
  account_number?: string;
  account_type?: string;
  
  // Configuraciones de trabajo
  can_work_weekends: boolean;
  can_work_holidays: boolean;
  has_transportation: boolean;
  needs_accommodation: boolean;
  
  // Notas
  notes?: string;
  training_notes?: string;
  performance_notes?: string;
  
  // Club principal
  primary_club_id?: string;
  
  // Auditoría
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// ================================================================================================
// INTERFACES PARA RELACIONES
// ================================================================================================

export interface AdministradorClub {
  id: string;
  administrador_id: string;
  club_id: string;
  role: ClubRole;
  permissions?: Record<string, any>;
  is_active: boolean;
  is_primary: boolean;
  start_date: string;
  end_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EmpleadoClub {
  id: string;
  empleado_id: string;
  club_id: string;
  categoria_override?: EmpleadoCategoria;
  hourly_rate_override?: number;
  monthly_salary_override?: number;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  shifts_worked: number;
  hours_worked: number;
  tasks_completed: number;
  club_rating?: number;
  access_level: number;
  uniform_provided: boolean;
  locker_assigned: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EmpleadoTurno {
  id: string;
  empleado_id: string;
  club_id: string;
  fecha: string;
  turno: WorkShift;
  hora_inicio: string;
  hora_fin: string;
  horas_trabajadas?: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  check_in_time?: string;
  check_out_time?: string;
  performance_rating?: number;
  supervisor_notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ================================================================================================
// TYPES PARA VISTAS Y JOINS
// ================================================================================================

// Administrador con sus clubs
export interface AdministradorWithClubs extends Administrador {
  clubs: Array<{
    id: string;
    name: string;
    role: ClubRole;
    is_primary: boolean;
    is_active: boolean;
  }>;
}

// Empleado con sus clubs
export interface EmpleadoWithClubs extends Empleado {
  clubs: Array<{
    id: string;
    name: string;
    categoria_override?: EmpleadoCategoria;
    hourly_rate_override?: number;
    monthly_salary_override?: number;
    is_active: boolean;
  }>;
}

// ================================================================================================
// TYPES PARA FORMULARIOS
// ================================================================================================

// Formulario de administrador (sin auth)
export interface AdministradorFormData {
  email: string;                    // Email ficticio
  full_name: string;
  phone: string;
  position: string;
  department: string;
  employee_id: string;
  role: UserRole;
  is_super_admin: boolean;
  contract_type: ContractType;
  hire_date: string;
  salary: string;                   // Como string para inputs
  assigned_clubs: string[];
  emergency_contact: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  notes: string;
  permissions: Record<string, any>;
  preferences: Record<string, any>;
}

// Formulario de empleado
export interface EmpleadoFormData {
  email: string;                    // Email real
  password: string;                 // Contraseña del empleado
  confirmPassword: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
  document_type: string;
  document_number: string;
  employee_id: string;
  categoria: EmpleadoCategoria;
  experience_level: ExperienceLevel;
  specialties: string[];
  certifications: string[];
  languages: string[];
  contract_type: ContractType;
  hourly_rate: string;              // Como string para inputs
  monthly_salary: string;           // Como string para inputs
  commission_rate: string;          // Como string para inputs
  primary_club_id: string;
  max_hours_per_week: number;
  min_hours_per_week: number;
  preferred_shifts: WorkShift[];
  availability: Record<string, any>;
  can_work_weekends: boolean;
  can_work_holidays: boolean;
  has_transportation: boolean;
  needs_accommodation: boolean;
  emergency_contact: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  medical_info: Record<string, any>;
  allergies: string[];
  uniform_size: string;
  bank_name: string;
  account_number: string;
  account_type: string;
  notes: string;
  training_notes: string;
  performance_notes: string;
  assigned_clubs: string[];
}

// ================================================================================================
// TYPES PARA FILTROS Y BÚSQUEDAS
// ================================================================================================

export interface AdministradorFilters {
  search?: string;
  status?: EmployeeStatus;
  role?: UserRole;
  contract_type?: ContractType;
  club_id?: string;
  department?: string;
}

export interface EmpleadoFilters {
  search?: string;
  status?: EmployeeStatus;
  categoria?: EmpleadoCategoria;
  experience_level?: ExperienceLevel;
  contract_type?: ContractType;
  club_id?: string;
  specialties?: string[];
  preferred_shifts?: WorkShift[];
}

// ================================================================================================
// CONSTANTS Y HELPERS
// ================================================================================================

// Categorías organizadas por área
export const CATEGORIAS_POR_AREA = {
  'Bar y Bebidas': ['bartender', 'head_bartender'],
  'Servicio al Cliente': ['waiter', 'head_waiter', 'hostess'],
  'Seguridad': ['security', 'security_chief'],
  'Entretenimiento': ['dj', 'sound_tech', 'lighting_tech', 'dancer', 'photographer'],
  'Operaciones': ['manager', 'coordinator', 'cashier', 'promoter'],
  'Soporte': ['cleaner', 'kitchen_staff', 'maintenance', 'valet', 'admin_staff']
} as const;

// Labels en español para las categorías
export const CATEGORIA_LABELS: Record<EmpleadoCategoria, string> = {
  bartender: 'Bartender',
  head_bartender: 'Jefe de Bar',
  waiter: 'Mesero',
  head_waiter: 'Jefe de Meseros',
  security: 'Seguridad',
  security_chief: 'Jefe de Seguridad',
  dj: 'DJ',
  sound_tech: 'Técnico de Sonido',
  lighting_tech: 'Técnico de Luces',
  promoter: 'Promotor',
  hostess: 'Azafata',
  cleaner: 'Personal de Limpieza',
  kitchen_staff: 'Personal de Cocina',
  cashier: 'Cajero',
  manager: 'Gerente',
  coordinator: 'Coordinador',
  maintenance: 'Mantenimiento',
  valet: 'Valet Parking',
  photographer: 'Fotógrafo',
  dancer: 'Bailarín',
  admin_staff: 'Personal Administrativo'
};

// Labels para turnos
export const TURNO_LABELS: Record<WorkShift, string> = {
  morning: 'Mañana',
  afternoon: 'Tarde',
  night: 'Noche',
  early_night: 'Noche Temprana',
  late_night: 'Noche Tardía',
  weekend: 'Fin de Semana',
  special_events: 'Eventos Especiales'
};

// Labels para niveles de experiencia
export const EXPERIENCIA_LABELS: Record<ExperienceLevel, string> = {
  trainee: 'Trainee',
  junior: 'Junior',
  senior: 'Senior',
  expert: 'Experto',
  master: 'Maestro'
};

// ================================================================================================
// TYPES PARA API RESPONSES
// ================================================================================================

export interface AdministradorListResponse {
  data: AdministradorWithClubs[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmpleadoListResponse {
  data: EmpleadoWithClubs[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}
