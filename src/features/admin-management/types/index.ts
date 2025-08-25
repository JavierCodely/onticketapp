// ================================================================================================
// TIPOS Y INTERFACES PARA LA GESTIÓN DE ADMINISTRADORES
// ================================================================================================
// Este archivo centraliza todos los tipos TypeScript relacionados con la gestión de administradores
// ================================================================================================

// ================================================================================================
// TIPOS BASE
// ================================================================================================

/**
 * Roles disponibles en el sistema para administradores
 */
export type AdminRole = 'club_admin' | 'super_admin';

/**
 * Estados posibles de una cuenta de administrador
 */
export type AdminStatus = 'active' | 'inactive';

/**
 * Estados de carga para operaciones asíncronas
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ================================================================================================
// INTERFACES PRINCIPALES
// ================================================================================================

/**
 * Estructura básica de un administrador en la base de datos
 */
export interface Administrador {
  id: string;                      // UUID único del administrador
  email: string;                   // Email único del administrador
  full_name: string;               // Nombre completo
  password_hash?: string;          // Hash de la contraseña (opcional en queries)
  salary: number;                  // Salario mensual
  role: AdminRole;                 // Rol en el sistema
  status: AdminStatus;             // Estado de la cuenta
  must_change_password: boolean;   // Si debe cambiar contraseña en próximo login
  last_login?: string;             // Fecha del último login (ISO string)
  login_attempts: number;          // Intentos fallidos de login
  account_locked: boolean;         // Si la cuenta está bloqueada por seguridad
  created_at: string;              // Fecha de creación (ISO string)
  updated_at: string;              // Fecha de última actualización (ISO string)
}

/**
 * Club básico para asignaciones
 */
export interface Club {
  id: string;                      // UUID único del club
  name: string;                    // Nombre del club
  slug: string;                    // Slug URL-friendly
  status: 'active' | 'inactive';   // Estado del club
  description?: string;            // Descripción opcional
  location?: string;               // Ubicación opcional
  created_at: string;              // Fecha de creación
  updated_at: string;              // Fecha de actualización
}

/**
 * Relación entre administrador y club
 */
export interface AdministradorClub {
  id: string;                      // UUID único de la relación
  administrador_id: string;        // ID del administrador
  club_id: string;                 // ID del club
  is_active: boolean;              // Si la asignación está activa
  role: string;                    // Rol específico en el club (ej: 'manager')
  start_date: string;              // Fecha de inicio de la asignación
  end_date?: string;               // Fecha de fin (opcional)
  created_at: string;              // Fecha de creación de la relación
  updated_at: string;              // Fecha de actualización
}

/**
 * Administrador con información de clubs asignados (para vistas)
 */
export interface AdminWithClubs extends Administrador {
  clubs: Club[];                   // Clubs asignados al administrador
}

// ================================================================================================
// INTERFACES PARA FORMULARIOS
// ================================================================================================

/**
 * Datos del formulario de administrador (antes de enviar al servidor)
 */
export interface AdminFormData {
  email: string;                   // Email del administrador
  full_name: string;               // Nombre completo
  password: string;                // Contraseña en texto plano (se hasheará)
  salary: string;                  // Salario como string para el input
  role: AdminRole;                 // Rol del sistema
  status: AdminStatus;             // Estado de la cuenta
  selectedClubs: string[];         // IDs de clubs seleccionados
}

/**
 * Datos para crear un nuevo administrador (payload para el servidor)
 */
export interface CreateAdminPayload {
  email: string;                   // Email único
  full_name: string;               // Nombre completo
  password_hash: string;           // Contraseña que será hasheada
  salary: number;                  // Salario como número
  role: AdminRole;                 // Rol del sistema
  status: AdminStatus;             // Estado inicial de la cuenta
}

/**
 * Datos para actualizar un administrador existente
 */
export interface UpdateAdminPayload {
  email?: string;                  // Email (opcional)
  full_name?: string;              // Nombre (opcional)
  password_hash?: string;          // Nueva contraseña (opcional)
  salary?: number;                 // Nuevo salario (opcional)
  role?: AdminRole;                // Nuevo rol (opcional)
  status?: AdminStatus;            // Nuevo estado (opcional)
  updated_at: string;              // Timestamp de actualización
}

// ================================================================================================
// INTERFACES PARA HOOKS Y COMPONENTES
// ================================================================================================

/**
 * Props para el hook useAdminForm
 */
export interface UseAdminFormProps {
  open: boolean;                   // Si el formulario está abierto
  editingAdmin: AdminWithClubs | null; // Admin en edición o null para crear
  clubs: Club[];                   // Lista de clubs disponibles
  onSuccess: () => void;           // Callback tras operación exitosa
}

/**
 * Valor de retorno del hook useAdminForm
 */
export interface UseAdminFormReturn {
  // Estado del formulario
  formData: AdminFormData;         // Datos actuales del formulario
  loading: boolean;                // Si hay una operación en progreso
  error: string | null;            // Mensaje de error actual
  
  // Validaciones
  isFormValid: boolean;            // Si el formulario es válido
  
  // Handlers
  handleInputChange: (field: keyof AdminFormData, value: string | string[]) => void;
  handleClubToggle: (clubId: string) => void;
  handleSave: () => Promise<void>;
  resetForm: () => void;
  
  // Información adicional
  isEditing: boolean;              // Si está en modo edición
  clubsCount: number;              // Cantidad de clubs disponibles
}

/**
 * Props para el componente AdminFormDialog
 */
export interface AdminFormDialogProps {
  open: boolean;                   // Si el diálogo está abierto
  editingAdmin: AdminWithClubs | null; // Admin en edición o null
  clubs: Club[];                   // Lista de clubs disponibles
  onClose: () => void;             // Callback al cerrar
  onSuccess: () => void;           // Callback tras éxito
}

// ================================================================================================
// INTERFACES PARA OPERACIONES DE BASE DE datos
// ================================================================================================

/**
 * Resultado genérico de operaciones de base de datos
 */
export interface DatabaseResult<T = any> {
  data?: T;                        // Datos retornados (si exitoso)
  error?: {                        // Error (si falló)
    message: string;               // Mensaje de error
    code?: string;                 // Código de error específico
    details?: string;              // Detalles adicionales
  };
}

/**
 * Parámetros para consultas con condiciones
 */
export interface QueryConditions {
  [key: string]: any;              // Condiciones dinámicas para la query
}

/**
 * Operaciones CRUD disponibles
 */
export type CrudOperation = 'select' | 'insert' | 'update' | 'delete';

// ================================================================================================
// INTERFACES PARA NOTIFICACIONES Y UI
// ================================================================================================

/**
 * Tipo de notificación para toasts
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Configuración de notificación
 */
export interface NotificationConfig {
  title: string;                   // Título de la notificación
  description?: string;            // Descripción opcional
  type: NotificationType;          // Tipo de notificación
  duration?: number;               // Duración en ms (opcional)
}

// ================================================================================================
// INTERFACES PARA LOGGING Y DEBUG
// ================================================================================================

/**
 * Nivel de log
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

/**
 * Entrada de log
 */
export interface LogEntry {
  timestamp: string;               // Timestamp del log
  level: LogLevel;                 // Nivel del log
  component: string;               // Componente que genera el log
  operation: string;               // Operación específica
  message: string;                 // Mensaje del log
  data?: any;                      // Datos adicionales (opcional)
}

// ================================================================================================
// TYPES PARA VALIDACIONES
// ================================================================================================

/**
 * Resultado de validación de campo
 */
export interface FieldValidation {
  isValid: boolean;                // Si el campo es válido
  message?: string;                // Mensaje de error (si inválido)
}

/**
 * Reglas de validación para campos
 */
export interface ValidationRules {
  required?: boolean;              // Si el campo es obligatorio
  minLength?: number;              // Longitud mínima
  maxLength?: number;              // Longitud máxima
  pattern?: RegExp;                // Patrón regex
  custom?: (value: any) => FieldValidation; // Validación personalizada
}

// ================================================================================================
// EXPORTACIONES POR DEFECTO
// ================================================================================================

// Re-exportar tipos principales para fácil importación
export type {
  Administrador as Admin,
  AdminWithClubs,
  AdminFormData,
  Club,
  AdministradorClub as AdminClub
};

// Constantes útiles
export const ADMIN_ROLES: AdminRole[] = ['club_admin', 'super_admin'];
export const ADMIN_STATUSES: AdminStatus[] = ['active', 'inactive'];

// Valores por defecto
export const DEFAULT_ADMIN_FORM_DATA: AdminFormData = {
  email: '',
  full_name: '',
  password: '',
  salary: '',
  role: 'club_admin',
  status: 'active',
  selectedClubs: []
};
