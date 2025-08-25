// ================================================================================================
// HOOK PARA OPERACIONES CRUD DE ADMINISTRADORES
// ================================================================================================
// Este hook encapsula toda la lógica de operaciones CRUD (Create, Read, Update, Delete)
// para administradores, incluyendo eliminación y cambio de estado.
// ================================================================================================

import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/hooks/use-confirm';
import type { AdminWithClubs } from '@/types/admin';

// ================================================================================================
// INTERFACE DEL HOOK
// ================================================================================================
// Define las operaciones disponibles y callbacks del hook
interface UseAdminsOperationsReturn {
  // Operaciones principales
  handleDeleteAdmin: (admin: AdminWithClubs) => Promise<void>; // Eliminar administrador
  handleToggleAdminStatus: (admin: AdminWithClubs) => Promise<void>; // Cambiar estado
  
  // Componentes UI necesarios
  ConfirmDialog: React.ComponentType; // Componente de diálogo de confirmación
}

// ================================================================================================
// IMPLEMENTACIÓN DEL HOOK
// ================================================================================================
export function useAdminsOperations(
  onAdminUpdated: () => Promise<void> // Callback para recargar datos después de operaciones
): UseAdminsOperationsReturn {
  
  // Hook de autenticación para acceso a secureQuery
  const { secureQuery } = useAuth();
  
  // Hook para mostrar notificaciones al usuario
  const { toast } = useToast();
  
  // Hook para mostrar diálogos de confirmación bonitos
  const { confirm, ConfirmDialog } = useConfirm();
  
  // ============================================================================================
  // FUNCIÓN PARA ELIMINAR ADMINISTRADOR
  // ============================================================================================
  
  // Función memoizada para eliminar un administrador con confirmación
  const handleDeleteAdmin = useCallback(async (admin: AdminWithClubs) => {
    try {
      console.log(`🗑️ [useAdminsOperations] Iniciando eliminación de: ${admin.email}`);
      
      // Mostrar diálogo de confirmación bonito al usuario
      const confirmed = await confirm({
        title: '¿Eliminar administrador?',                           // Título del diálogo
        description: `¿Estás seguro de que deseas eliminar al administrador "${admin.email}"? Esta acción no se puede deshacer.`, // Descripción detallada
        confirmText: 'Eliminar',                                    // Texto del botón de confirmación
        cancelText: 'Cancelar',                                     // Texto del botón de cancelación
        destructive: true,                                          // Estilo destructivo (botón rojo)
      });
      
      // Si el usuario canceló, terminar sin hacer nada
      if (!confirmed) {
        console.log(`↩️ [useAdminsOperations] Eliminación cancelada por usuario: ${admin.email}`);
        return;
      }
      
      console.log(`✅ [useAdminsOperations] Usuario confirmó eliminación de: ${admin.email}`);
      
      // Ejecutar eliminación usando secureQuery en la nueva tabla
      // Nota: Las relaciones en administrador_clubs se eliminan automáticamente por CASCADE
      const result = await secureQuery('administradores', 'delete', undefined, { id: admin.id });
      
      // Verificar si hubo error en la operación
      if (result?.error) {
        console.error(`❌ [useAdminsOperations] Error en secureQuery delete:`, result.error);
        throw new Error(result.error.message || 'Error al eliminar administrador');
      }
      
      console.log(`✅ [useAdminsOperations] Administrador eliminado exitosamente: ${admin.email}`);
      
      // Mostrar notificación de éxito al usuario
      toast({
        title: "✅ Administrador eliminado",                         // Título del toast
        description: `${admin.email} ha sido eliminado exitosamente.`, // Descripción del éxito
        variant: "success",                                         // Variante de éxito (verde)
      });
      
      // Ejecutar callback para recargar datos y actualizar UI
      await onAdminUpdated();
      console.log(`🔄 [useAdminsOperations] Datos recargados después de eliminación`);
      
    } catch (error) {
      // Manejar errores y mostrar notificación de error
      console.error('💥 [useAdminsOperations] Error eliminando administrador:', error);
      toast({
        title: "❌ Error",                                          // Título del error
        description: `Error al eliminar administrador: ${error instanceof Error ? error.message : 'Error desconocido'}`, // Descripción del error
        variant: "destructive",                                     // Variante destructiva (rojo)
      });
    }
  }, [secureQuery, toast, confirm, onAdminUpdated]); // Dependencias del useCallback
  
  // ============================================================================================
  // FUNCIÓN PARA CAMBIAR ESTADO DE ADMINISTRADOR
  // ============================================================================================
  
  // Función memoizada para activar/desactivar un administrador
  const handleToggleAdminStatus = useCallback(async (admin: AdminWithClubs) => {
    try {
      console.log(`🔄 [useAdminsOperations] Cambiando estado de: ${admin.email}`);
      
      // Determinar nuevo estado (toggle del estado actual)
      const newStatus = admin.status === 'active' ? 'inactive' : 'active';
      const statusText = newStatus === 'active' ? 'habilitar' : 'deshabilitar';
      
      // Mostrar confirmación antes de cambiar estado
      const confirmed = await confirm({
        title: `¿${statusText.charAt(0).toUpperCase() + statusText.slice(1)} administrador?`,
        description: `¿Estás seguro de que deseas ${statusText} al administrador "${admin.email}"? ${newStatus === 'inactive' ? 'No podrá iniciar sesión ni realizar operaciones.' : 'Podrá volver a iniciar sesión y realizar operaciones.'}`,
        confirmText: statusText.charAt(0).toUpperCase() + statusText.slice(1),
        cancelText: 'Cancelar',
        destructive: newStatus === 'inactive', // Destructivo solo para desactivar
      });
      
      if (!confirmed) {
        console.log(`↩️ [useAdminsOperations] Cambio de estado cancelado por usuario: ${admin.email}`);
        return;
      }
      
      console.log(`✅ [useAdminsOperations] Usuario confirmó cambio de estado: ${admin.email} -> ${newStatus}`);
      
      // Ejecutar actualización del estado en la nueva tabla
      const result = await secureQuery(
        'administradores', 
        'update', 
        {
          status: newStatus,
          updated_at: new Date().toISOString()
        },
        { id: admin.id }
      );
      
      if (result?.error) {
        console.error(`❌ [useAdminsOperations] Error actualizando estado:`, result.error);
        throw new Error(result.error.message || 'Error al cambiar estado');
      }
      
      console.log(`✅ [useAdminsOperations] Estado cambiado exitosamente: ${admin.email} -> ${newStatus}`);
      
      // Mostrar notificación de éxito
      toast({
        title: `✅ Administrador ${newStatus === 'active' ? 'habilitado' : 'deshabilitado'}`,
        description: `${admin.email} ha sido ${newStatus === 'active' ? 'habilitado' : 'deshabilitado'} exitosamente.`,
        variant: "success",
      });
      
      // Recargar datos para actualizar UI
      await onAdminUpdated();
      console.log(`🔄 [useAdminsOperations] Datos recargados después de cambio de estado`);
      
    } catch (error) {
      // Manejar errores en cambio de estado
      console.error('💥 [useAdminsOperations] Error cambiando estado:', error);
      toast({
        title: "❌ Error",                                          // Título del error
        description: `Error al cambiar estado: ${error instanceof Error ? error.message : 'Error desconocido'}`, // Descripción del error
        variant: "destructive",                                     // Variante destructiva
      });
    }
  }, [secureQuery, toast, confirm, onAdminUpdated]); // Dependencias del useCallback
  
  // ============================================================================================
  // RETORNO DEL HOOK
  // ============================================================================================
  
  // Retornar funciones y componentes para uso en componentes UI
  return {
    handleDeleteAdmin,        // Función para eliminar administrador
    handleToggleAdminStatus,  // Función para cambiar estado
    ConfirmDialog            // Componente de diálogo de confirmación
  };
}
