// ================================================================================================
// TIPOS E INTERFACES PARA GESTIÓN DE ADMINISTRADORES
// ================================================================================================
// Este archivo contiene todas las definiciones de tipos específicos para la gestión
// de administradores, incluyendo interfaces extendidas y tipos de estado.
// ================================================================================================

import type { Profile, Club, UserClub } from '@/types/database';

// ================================================================================================
// TIPO EXTENDIDO PARA ADMINISTRADOR CON INFORMACIÓN ADICIONAL
// ================================================================================================
// Interface que extiende Profile con información adicional calculada y formateada
// para mostrar en la tabla de administradores
export interface AdminWithClubs extends Profile {
  clubs: Club[];                    // Array de clubs asignados al administrador
  user_clubs: UserClub[];          // Relaciones usuario-club con roles específicos
  total_clubs: number;             // Conteo total de clubs asignados
  last_login_display: string;     // Último login formateado para mostrar en UI
  status_display: string;         // Estado formateado para mostrar (Super Admin / Admin Club)
}

// ================================================================================================
// TIPOS PARA FILTROS Y BÚSQUEDA
// ================================================================================================
// Tipo para los filtros de búsqueda disponibles en la tabla
export type AdminSearchField = 'email' | 'full_name' | 'role' | 'clubs';

// Interface para el estado de filtros de la tabla
export interface AdminFilters {
  searchTerm: string;              // Término de búsqueda general
  roleFilter?: 'super_admin' | 'club_admin' | 'all'; // Filtro por tipo de rol
  statusFilter?: 'active' | 'inactive' | 'all';      // Filtro por estado (cuando se implemente)
}

// ================================================================================================
// TIPOS PARA OPERACIONES CRUD
// ================================================================================================
// Tipo para las operaciones disponibles sobre administradores
export type AdminOperation = 'create' | 'edit' | 'delete' | 'toggle_status';

// Interface para callbacks de operaciones
export interface AdminOperationCallbacks {
  onEdit: (admin: AdminWithClubs) => void;          // Callback para editar administrador
  onDelete: (admin: AdminWithClubs) => Promise<void>; // Callback para eliminar administrador
  onToggleStatus: (admin: AdminWithClubs) => Promise<void>; // Callback para cambiar estado
}

// ================================================================================================
// TIPOS PARA ESTADOS DE CARGA
// ================================================================================================
// Interface para el estado de carga de diferentes operaciones
export interface AdminLoadingState {
  admins: boolean;                 // Cargando lista de administradores
  clubs: boolean;                  // Cargando lista de clubs
  operation: boolean;              // Ejecutando operación CRUD
}

// ================================================================================================
// CONSTANTES Y ENUMS
// ================================================================================================
// Roles disponibles para administradores
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  CLUB_ADMIN: 'club_admin'
} as const;

// Estados de administradores (para futuro uso)
export const ADMIN_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const;

// Límites para paginación y búsqueda
export const ADMIN_LIMITS = {
  MAX_RESULTS: 100,               // Máximo número de administradores a mostrar
  SEARCH_MIN_LENGTH: 2,           // Mínimo de caracteres para búsqueda
  DEBOUNCE_DELAY: 300            // Delay para debounce en búsqueda (ms)
} as const;
