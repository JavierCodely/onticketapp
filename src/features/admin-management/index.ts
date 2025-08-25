// ================================================================================================
// EXPORTACIONES PRINCIPALES DE LA FEATURE ADMIN MANAGEMENT
// ================================================================================================
// Este archivo centraliza todas las exportaciones de la feature de gestión de administradores
// para facilitar las importaciones desde otras partes de la aplicación
// ================================================================================================

// ================================================================================================
// COMPONENTES PRINCIPALES
// ================================================================================================

// Componente principal del formulario de administradores
export { default as AdminFormDialog } from './components/AdminFormDialog';

// Componentes específicos del formulario (por si se necesitan por separado)
export { default as AdminPersonalInfo } from './components/AdminPersonalInfo';
export { default as AdminSystemConfig } from './components/AdminSystemConfig';
export { default as AdminClubAssignment } from './components/AdminClubAssignment';

// ================================================================================================
// HOOKS PERSONALIZADOS
// ================================================================================================

// Hook principal para la lógica del formulario
export { useAdminForm } from './hooks/useAdminForm';

// ================================================================================================
// TIPOS E INTERFACES
// ================================================================================================

// Exportar todos los tipos principales
export type {
  // Tipos base
  AdminRole,
  AdminStatus,
  LoadingState,
  
  // Interfaces principales
  Administrador,
  Club,
  AdministradorClub,
  AdminWithClubs,
  
  // Interfaces para formularios
  AdminFormData,
  CreateAdminPayload,
  UpdateAdminPayload,
  
  // Interfaces para hooks
  UseAdminFormProps,
  UseAdminFormReturn,
  
  // Interfaces para componentes
  AdminFormDialogProps,
  
  // Interfaces para base de datos
  DatabaseResult,
  QueryConditions,
  CrudOperation,
  
  // Interfaces para UI
  NotificationType,
  NotificationConfig,
  
  // Interfaces para logging
  LogLevel,
  LogEntry,
  
  // Interfaces para validaciones
  FieldValidation,
  ValidationRules,
  
  // Aliases convenientes
  Admin,
  AdminClub
} from './types';

// ================================================================================================
// CONSTANTES Y VALORES POR DEFECTO
// ================================================================================================

// Exportar constantes útiles
export {
  ADMIN_ROLES,
  ADMIN_STATUSES,
  DEFAULT_ADMIN_FORM_DATA
} from './types';

// ================================================================================================
// UTILIDADES (si existen)
// ================================================================================================

// TODO: Agregar utilidades específicas de administradores cuando se creen
// Por ejemplo: validadores, formateadores, etc.

// ================================================================================================
// SERVICIOS (si existen)
// ================================================================================================

// TODO: Agregar servicios específicos de administradores cuando se creen
// Por ejemplo: API calls, transformaciones de datos, etc.

// ================================================================================================
// COMENTARIOS PARA DESARROLLO
// ================================================================================================

/**
 * ESTRUCTURA DE LA FEATURE ADMIN MANAGEMENT:
 * 
 * /admin-management/
 * ├── components/           # Componentes React específicos
 * │   ├── AdminFormDialog.tsx      # Componente principal del formulario
 * │   ├── AdminPersonalInfo.tsx    # Información personal
 * │   ├── AdminSystemConfig.tsx    # Configuración del sistema
 * │   └── AdminClubAssignment.tsx  # Asignación de clubs
 * ├── hooks/               # Hooks personalizados
 * │   └── useAdminForm.ts          # Lógica principal del formulario
 * ├── types/               # Tipos TypeScript
 * │   └── index.ts                 # Todos los tipos centralizados
 * ├── services/            # Servicios y API calls (futuro)
 * ├── utils/               # Utilidades específicas (futuro)
 * └── index.ts             # Este archivo - exportaciones principales
 * 
 * CÓMO USAR ESTA FEATURE:
 * 
 * 1. Importación simple del componente principal:
 *    import { AdminFormDialog } from '@/features/admin-management';
 * 
 * 2. Importación de tipos:
 *    import type { AdminFormData, AdminWithClubs } from '@/features/admin-management';
 * 
 * 3. Uso del hook personalizado:
 *    import { useAdminForm } from '@/features/admin-management';
 * 
 * 4. Componentes específicos (si necesitas personalización):
 *    import { AdminPersonalInfo, AdminSystemConfig } from '@/features/admin-management';
 */
