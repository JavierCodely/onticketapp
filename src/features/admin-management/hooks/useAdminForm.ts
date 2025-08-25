// ================================================================================================
// HOOK PERSONALIZADO PARA GESTIÓN DEL FORMULARIO DE ADMINISTRADORES
// ================================================================================================
// Este hook encapsula toda la lógica del formulario de administradores, incluyendo:
// - Estado del formulario y validaciones
// - Operaciones CRUD (crear/actualizar)
// - Manejo de clubs asignados
// - Gestión de errores y loading
// ================================================================================================

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { log } from '@/shared/utils/logger';

// ================================================================================================
// TIPOS E INTERFACES
// ================================================================================================

interface AdminFormData {
  email: string;                    // Email del administrador (obligatorio)
  full_name: string;               // Nombre completo del administrador
  password: string;                // Contraseña (obligatoria en crear, opcional en editar)
  salary: string;                  // Salario mensual en formato string
  role: 'club_admin' | 'super_admin'; // Rol en el sistema
  status: 'active' | 'inactive';   // Estado de la cuenta
  selectedClubs: string[];         // IDs de clubs asignados
}

interface UseAdminFormProps {
  open: boolean;                   // Si el diálogo está abierto
  editingAdmin: any | null;        // Administrador en edición o null para crear
  clubs: any[];                    // Lista de clubs disponibles
  onSuccess: () => void;           // Callback ejecutado tras éxito
}

// ================================================================================================
// HOOK PRINCIPAL
// ================================================================================================

export const useAdminForm = ({ open, editingAdmin, clubs, onSuccess }: UseAdminFormProps) => {
  
  // ============================================================================================
  // HOOKS EXTERNOS
  // ============================================================================================
  
  const { secureQuery } = useAuth();  // Hook para operaciones seguras en BD
  const { toast } = useToast();       // Hook para notificaciones

  // ============================================================================================
  // ESTADO LOCAL
  // ============================================================================================
  
  // Estado principal del formulario con valores iniciales
  const [formData, setFormData] = useState<AdminFormData>({
    email: '',
    full_name: '',
    password: '',
    salary: '',
    role: 'club_admin',
    status: 'active',
    selectedClubs: []
  });
  
  // Estados de UI
  const [loading, setLoading] = useState(false);     // Estado de carga durante operaciones
  const [error, setError] = useState<string | null>(null); // Mensaje de error actual

  // ============================================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================================
  
  /**
   * Maneja errores globalmente y actualiza el estado correspondiente
   * @param error - El error capturado
   * @param context - Contexto donde ocurrió el error
   */
  const handleError = (error: any, context: string) => {
    // Extraer mensaje de error de forma segura
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    // Registrar error en el sistema de logging
    log.error('useAdminForm', 'error-handler', `Error en ${context}`, { 
      message: errorMessage,
      context 
    });
    
    // Actualizar estado de error para mostrar en UI
    setError(`Error en ${context}: ${errorMessage}`);
    
    // Detener estado de carga
    setLoading(false);
  };

  /**
   * Limpia el estado del formulario y errores
   */
  const resetForm = () => {
    log.debug('useAdminForm', 'reset-form', 'Limpiando formulario');
    
    setFormData({
      email: '',
      full_name: '',
      password: '',
      salary: '',
      role: 'club_admin',
      status: 'active',
      selectedClubs: []
    });
    
    setError(null);
    setLoading(false);
  };

  // ============================================================================================
  // EFECTOS
  // ============================================================================================
  
  /**
   * Efecto para inicializar el formulario cuando cambia el estado del diálogo
   */
  useEffect(() => {
    try {
      log.info('useAdminForm', 'dialog-state-change', 'Estado del diálogo cambió', {
        open,
        isEditing: !!editingAdmin,
        adminId: editingAdmin?.id || 'nuevo'
      });

      if (open && editingAdmin) {
        // MODO EDICIÓN: Cargar datos del administrador existente
        log.info('useAdminForm', 'edit-mode', 'Cargando datos para edición', {
          adminId: editingAdmin.id,
          email: editingAdmin.email,
          full_name: editingAdmin.full_name,
          role: editingAdmin.role,
          status: editingAdmin.status,
          clubs: editingAdmin.clubs
        });
        
        // Preparar datos del formulario desde el administrador existente
        const newFormData: AdminFormData = {
          email: editingAdmin.email || '',
          full_name: editingAdmin.full_name || '',
          password: '',  // Siempre vacío en edición (opcional)
          salary: editingAdmin.salary?.toString() || '',
          role: editingAdmin.role || 'club_admin',
          status: editingAdmin.status || 'active',
          selectedClubs: editingAdmin.clubs?.map((club: any) => club.id) || []
        };
        
        log.debug('useAdminForm', 'form-data-prepared', 'Datos del formulario preparados', {
          newFormData
        });
        
        setFormData(newFormData);
      } else if (open && !editingAdmin) {
        // MODO CREACIÓN: Usar valores por defecto
        log.info('useAdminForm', 'create-mode', 'Modo crear nuevo administrador');
        resetForm();
      }
      
      // Limpiar errores al abrir el diálogo
      if (open) {
        setError(null);
      }
      
    } catch (error) {
      handleError(error, 'inicialización del formulario');
    }
  }, [open, editingAdmin]); // Dependencias: ejecutar cuando cambie el estado del diálogo

  // ============================================================================================
  // HANDLERS DE FORMULARIO
  // ============================================================================================
  
  /**
   * Maneja cambios en los campos del formulario
   * @param field - Nombre del campo que cambió
   * @param value - Nuevo valor del campo
   */
  const handleInputChange = (field: keyof AdminFormData, value: string | string[]) => {
    try {
      log.debug('useAdminForm', 'input-change', `Campo ${field} cambió`, { field, value });
      
      // Actualizar el campo específico en el estado
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Limpiar errores al hacer cambios (feedback inmediato)
      setError(null);
    } catch (error) {
      handleError(error, 'actualización de campo');
    }
  };

  /**
   * Maneja la selección/deselección de clubs
   * @param clubId - ID del club a toggle
   */
  const handleClubToggle = (clubId: string) => {
    try {
      log.debug('useAdminForm', 'club-toggle', 'Toggling club', { clubId });
      
      setFormData(prev => {
        // Verificar si el club está actualmente seleccionado
        const isCurrentlySelected = prev.selectedClubs.includes(clubId);
        
        // Crear nueva lista: agregar si no está, quitar si está
        const newSelectedClubs = isCurrentlySelected
          ? prev.selectedClubs.filter(id => id !== clubId)  // Quitar
          : [...prev.selectedClubs, clubId];                // Agregar
        
        log.debug('useAdminForm', 'club-toggle', 'Clubs actualizados', {
          clubId,
          wasSelected: isCurrentlySelected,
          newCount: newSelectedClubs.length,
          selectedClubs: newSelectedClubs
        });
        
        return {
          ...prev,
          selectedClubs: newSelectedClubs
        };
      });
    } catch (error) {
      handleError(error, 'selección de club');
    }
  };

  // ============================================================================================
  // OPERACIONES CRUD
  // ============================================================================================
  
  /**
   * Crea un nuevo administrador en la base de datos
   */
  const handleCreateAdmin = async () => {
    try {
      log.info('useAdminForm', 'create-admin', 'Iniciando creación de administrador', {
        formData: { ...formData, password: '[HIDDEN]' } // No logear la contraseña
      });

      // Preparar datos para inserción
      const adminData = {
        email: formData.email,
        full_name: formData.full_name,
        password_hash: formData.password, // Se hasheará en el servidor
        salary: parseFloat(formData.salary) || 0,
        role: formData.role,
        status: formData.status
      };
      
      // Ejecutar inserción en la base de datos
      const result = await secureQuery('administradores', 'insert', adminData);
      
      if (result?.error) {
        throw new Error(`Error al crear administrador: ${result.error.message}`);
      }
      
      // Obtener el ID del administrador creado
      const newAdminId = result.data?.[0]?.id;
      if (!newAdminId) {
        throw new Error('No se pudo obtener el ID del administrador creado');
      }
      
      // Asignar clubs si se seleccionaron
      if (formData.selectedClubs.length > 0) {
        await handleAssignClubs(newAdminId);
      }
      
      log.success('useAdminForm', 'create-admin', 'Administrador creado exitosamente');
      
      // Mostrar notificación de éxito
      toast({
        title: "Administrador creado",
        description: `Se creó el administrador ${formData.full_name} exitosamente.`,
      });
      
      // Ejecutar callback de éxito
      onSuccess();
      
    } catch (error) {
      handleError(error, 'creación de administrador');
    }
  };

  /**
   * Actualiza un administrador existente en la base de datos
   */
  const handleUpdateAdmin = async () => {
    if (!editingAdmin) {
      setError('No hay administrador para actualizar');
      return;
    }

    try {
      log.info('useAdminForm', 'update-admin', 'Iniciando actualización de administrador', {
        adminId: editingAdmin.id,
        formData: { ...formData, password: '[HIDDEN]' } // No logear la contraseña
      });

      // Preparar datos para actualización (sin incluir campos vacíos)
      const updateData: any = {
        email: formData.email,
        full_name: formData.full_name,
        salary: parseFloat(formData.salary) || 0,
        role: formData.role,
        status: formData.status,
        updated_at: new Date().toISOString()
      };

      // Solo incluir password si se proporcionó uno nuevo
      if (formData.password.trim()) {
        updateData.password_hash = formData.password;
      }

      log.debug('useAdminForm', 'update-admin', 'Datos a actualizar', {
        updateData: { ...updateData, password_hash: updateData.password_hash ? '[HIDDEN]' : undefined }
      });
      
      // Ejecutar actualización en la base de datos
      const result = await secureQuery('administradores', 'update', updateData, { id: editingAdmin.id });
      
      if (result?.error) {
        log.error('useAdminForm', 'update-admin', 'Error en actualización', { message: result.error.message });
        throw new Error(`Error al actualizar administrador: ${result.error.message}`);
      }
      
      // Actualizar clubs asignados
      await handleAssignClubs(editingAdmin.id);
      
      log.success('useAdminForm', 'update-admin', 'Administrador actualizado exitosamente');
      
      // Mostrar notificación de éxito
      toast({
        title: "Administrador actualizado",
        description: `Se actualizó el administrador ${formData.full_name} exitosamente.`,
      });
      
      // Ejecutar callback de éxito
      onSuccess();
      
    } catch (error) {
      handleError(error, 'actualización de administrador');
    }
  };

  /**
   * Gestiona la asignación de clubs a un administrador
   * @param adminId - ID del administrador
   */
  const handleAssignClubs = async (adminId: string) => {
    try {
      log.info('useAdminForm', 'assign-clubs', 'Asignando clubs', {
        adminId,
        selectedClubs: formData.selectedClubs
      });

      // 1. ELIMINAR todas las relaciones existentes para empezar limpio
      const deleteResult = await secureQuery(
        'administrador_clubs',
        'delete',
        undefined,
        { administrador_id: adminId }
      );

      // No es crítico si falla (puede no haber relaciones previas)
      if (deleteResult?.error) {
        log.warn('useAdminForm', 'assign-clubs', 'Advertencia al eliminar relaciones', { 
          error: deleteResult.error 
        });
      }

      // 2. CREAR nuevas relaciones para clubs seleccionados
      if (formData.selectedClubs.length > 0) {
        // Preparar datos de relación para cada club seleccionado
        const clubRelations = formData.selectedClubs.map(clubId => ({
          administrador_id: adminId,
          club_id: clubId,
          is_active: true,
          role: 'manager',
          start_date: new Date().toISOString().split('T')[0] // Fecha actual en formato YYYY-MM-DD
        }));

        // Insertar todas las relaciones de una vez
        const insertResult = await secureQuery('administrador_clubs', 'insert', clubRelations);

        if (insertResult?.error) {
          throw new Error(`Error al asignar clubs: ${insertResult.error.message}`);
        }

        log.success('useAdminForm', 'assign-clubs', 'Clubs asignados exitosamente', {
          count: formData.selectedClubs.length
        });
      } else {
        log.info('useAdminForm', 'assign-clubs', 'No hay clubs para asignar');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      log.error('useAdminForm', 'assign-clubs', 'Error en asignación de clubs', { message: errorMessage });
      throw error; // Re-lanzar para que lo maneje el llamador
    }
  };

  /**
   * Función principal de guardado que determina si crear o actualizar
   */
  const handleSave = async () => {
    try {
      // Prevenir múltiples ejecuciones
      if (loading) {
        log.warn('useAdminForm', 'save', 'Operación ya en progreso, ignorando');
        return;
      }

      // Iniciar estado de carga
      setLoading(true);
      setError(null);

      log.info('useAdminForm', 'save', 'Iniciando operación de guardado', {
        mode: editingAdmin ? 'update' : 'create',
        adminId: editingAdmin?.id || 'nuevo'
      });

      // Ejecutar operación correspondiente
      if (editingAdmin) {
        await handleUpdateAdmin();
      } else {
        await handleCreateAdmin();
      }

    } catch (error) {
      handleError(error, 'guardado');
    } finally {
      // Asegurar que el loading se desactive
      setLoading(false);
    }
  };

  // ============================================================================================
  // VALIDACIONES
  // ============================================================================================
  
  /**
   * Valida si el formulario está completo y correcto
   */
  const isFormValid = () => {
    // Email requerido y con formato válido
    if (!formData.email || !formData.email.includes('@')) {
      return false;
    }
    
    // Nombre requerido
    if (!formData.full_name.trim()) {
      return false;
    }
    
    // Contraseña requerida solo en modo creación
    if (!editingAdmin && !formData.password.trim()) {
      return false;
    }
    
    // Contraseña mínima 8 caracteres si se proporciona
    if (formData.password && formData.password.length < 8) {
      return false;
    }
    
    return true;
  };

  // ============================================================================================
  // RETURN DEL HOOK
  // ============================================================================================
  
  return {
    // Estado del formulario
    formData,
    loading,
    error,
    
    // Validaciones
    isFormValid: isFormValid(),
    
    // Handlers
    handleInputChange,
    handleClubToggle,
    handleSave,
    resetForm,
    
    // Información adicional
    isEditing: !!editingAdmin,
    clubsCount: clubs.length
  };
};
