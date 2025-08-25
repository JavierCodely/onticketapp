// ================================================================================================
// TIPOS TYPESCRIPT PARA ADMINISTRADORES Y BARTENDERS
// ================================================================================================

// Tipos para los enums de la base de datos
export type EmployeeStatus = 'active' | 'inactive' | 'suspended' | 'terminated';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ContractType = 'full_time' | 'part_time' | 'freelance' | 'intern';
export type UserRole = 'super_admin' | 'club_admin';
export type ClubRole = 'owner' | 'manager' | 'supervisor' | 'staff';

// ================================================================================================
// INTERFACE PARA ADMINISTRADORES
// ================================================================================================

export interface Administrador {
  id: string;
  
  // Información básica
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  
  // Información profesional
  position?: string;
  department?: string;
  employee_id?: string;
  
  // Autenticación y acceso
  auth_user_id?: string;
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
// INTERFACE PARA BARTENDERS
// ================================================================================================

export interface Bartender {
  id: string;
  
  // Información básica
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  
  // Información profesional
  employee_id?: string;
  experience_level: ExperienceLevel;
  specialties?: string[];
  certifications?: string[];
  languages: string[];
  
  // Información laboral
  contract_type: ContractType;
  hourly_rate?: number;
  status: EmployeeStatus;
  hire_date?: string;
  termination_date?: string;
  
  // Disponibilidad y horarios
  availability?: Record<string, any>;
  preferred_shifts?: string[];
  max_hours_per_week: number;
  
  // Evaluación y performance
  rating?: number;
  total_shifts: number;
  completed_orders: number;
  customer_rating?: number;
  
  // Información adicional
  emergency_contact?: Record<string, any>;
  medical_info?: Record<string, any>;
  uniform_size?: string;
  notes?: string;
  
  // Club asignado
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

export interface BartenderClub {
  id: string;
  bartender_id: string;
  club_id: string;
  role: string;
  hourly_rate_override?: number;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  shifts_worked: number;
  orders_completed: number;
  club_rating?: number;
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

// Bartender con sus clubs
export interface BartenderWithClubs extends Bartender {
  clubs: Array<{
    id: string;
    name: string;
    role: string;
    hourly_rate_override?: number;
    is_active: boolean;
  }>;
}

// ================================================================================================
// TYPES PARA FORMULARIOS
// ================================================================================================

export interface AdministradorFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  phone: string;
  position: string;
  department: string;
  employee_id: string;
  role: UserRole;
  is_super_admin: boolean;
  contract_type: ContractType;
  hire_date: string;
  salary: number;
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

export interface BartenderFormData {
  email: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
  employee_id: string;
  experience_level: ExperienceLevel;
  specialties: string[];
  certifications: string[];
  languages: string[];
  contract_type: ContractType;
  hourly_rate: number;
  primary_club_id: string;
  max_hours_per_week: number;
  preferred_shifts: string[];
  availability: Record<string, any>;
  emergency_contact: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  medical_info: Record<string, any>;
  uniform_size: string;
  notes: string;
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

export interface BartenderFilters {
  search?: string;
  status?: EmployeeStatus;
  experience_level?: ExperienceLevel;
  contract_type?: ContractType;
  club_id?: string;
  specialties?: string[];
}

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

export interface BartenderListResponse {
  data: BartenderWithClubs[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}
