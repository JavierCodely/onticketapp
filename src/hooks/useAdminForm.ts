// ================================================================================================
// HOOK PERSONALIZADO PARA GESTIÓN DEL FORMULARIO DE ADMINISTRADORES
// ================================================================================================
// Este hook encapsula toda la lógica del formulario de administradores, separando
// la lógica de negocio de la presentación visual
// ================================================================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { log } from '@/shared/utils/logger';
import { debugFullEditingProcess, debugDatabaseResult } from '@/utils/adminFormDebug';

// ================================================================================================
// TIPOS E INTERFACES
// ================================================================================================

// Estructura de datos del formulario
interface AdminFormData {
  email: string;           // Email del administrador (obligatorio)
  password: string;        // Contraseña (obligatorio para nuevo, opcional para editar)
  full_name: string;       // Nombre completo (obligatorio)
  salary: string;          // Salario en formato string para evitar problemas de parsing
  role: 'club_admin' | 'super_admin'; // Rol del sistema
  status: 'active' | 'inactive';      // Estado del administrador
  selectedClubs: string[];             // IDs de clubs asignados
}

// Estructura de validaciones en tiempo real
interface FormValidation {
  [key: string]: string;  // Campo -> mensaje de error
}

// Props que recibe el hook
interface UseAdminFormProps {
  editingAdmin: any | null;  // Administrador en edición (null = crear nuevo)
  clubs: any[];              // Lista de clubs disponibles
  onSuccess: () => void;     // Callback cuando se guarda exitosamente
  onClose: () => void;       // Callback para cerrar el formulario
}

// Lo que retorna el hook
interface UseAdminFormReturn {
  // Estados del formulario
  formData: AdminFormData;
  setFormData: (data: AdminFormData) => void;
  
  // Estados de UI
  isSubmitting: boolean;
  showPassword: boolean;
  passwordGenerated: boolean;
  
  // Validaciones
  realtimeValidation: FormValidation;
  
  // Funciones principales
  handleInputChange: (field: keyof AdminFormData, value: string) => void;
  handleClubToggle: (clubId: string) => void;
  handleGeneratePassword: () => void;
  handleSave: () => Promise<void>;
  handleClose: () => void;
  
  // Funciones de UI
  togglePasswordVisibility: () => void;
  
  // Estado de formulario válido
  isFormValid: boolean;
  
  // Función de debug manual
  debugCurrentState: () => void;
}

// ================================================================================================
// CONSTANTES
// ================================================================================================

const COMPONENT_NAME = 'useAdminForm'; // Para logging

// ================================================================================================
// IMPLEMENTACIÓN DEL HOOK
// ================================================================================================

export function useAdminForm({
  editingAdmin,
  clubs,
  onSuccess,
  onClose
}: UseAdminFormProps): UseAdminFormReturn {
  
  // ============================================================================================
  // HOOKS DE DEPENDENCIAS
  // ============================================================================================
  
  const { secureQuery } = useAuth(); // Hook para queries seguras a Supabase
  const { toast } = useToast();       // Hook para mostrar notificaciones
  
  // ============================================================================================
  // ESTADOS DEL FORMULARIO
  // ============================================================================================
  
  // Estado principal con todos los datos del formulario
  const [formData, setFormData] = useState<AdminFormData>({
    email: '',
    password: '',
    full_name: '',
    salary: '',
    role: 'club_admin',
    status: 'active',
    selectedClubs: []
  });
  
  // Estados de la interfaz de usuario
  const [isSubmitting, setIsSubmitting] = useState(false);        // Indica si está guardando
  const [showPassword, setShowPassword] = useState(false);        // Mostrar/ocultar contraseña
  const [passwordGenerated, setPasswordGenerated] = useState(false); // Si se generó contraseña automática
  const [realtimeValidation, setRealtimeValidation] = useState<FormValidation>({}); // Errores de validación
  
  // ============================================================================================
  // FUNCIONES DE VALIDACIÓN
  // ============================================================================================
  
  // Función para validar un campo específico en tiempo real
  const validateField = useCallback((field: string, value: string): string => {
    log.debug(COMPONENT_NAME, 'validate-field', `Validando campo: ${field}`, { value });
    
    switch (field) {
      case 'email':
        // Validar que el email no esté vacío
        if (!value) {
          return 'El email es obligatorio';
        }
        // Validar formato de email con regex básico
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Formato de email inválido';
        }
        return ''; // Sin errores
      
      case 'password':
        // Solo validar contraseña si no estamos editando un admin existente
        if (!editingAdmin && !value) {
          return 'La contraseña es obligatoria';
        }
        // Si hay contraseña, validar longitud mínima
        if (value && value.length < 8) {
          return 'La contraseña debe tener al menos 8 caracteres';
        }
        return ''; // Sin errores
      
      case 'full_name':
        // Validar que el nombre no esté vacío
        if (!value.trim()) {
          return 'El nombre completo es obligatorio';
        }
        // Validar longitud mínima
        if (value.trim().length < 2) {
          return 'El nombre debe tener al menos 2 caracteres';
        }
        return ''; // Sin errores
      
      case 'salary':
        // El salario es opcional, pero si se ingresa debe ser válido
        if (value) {
          // Verificar que sea un número válido
          if (isNaN(Number(value))) {
            return 'El salario debe ser un número válido';
          }
          // Verificar que no sea negativo
          if (Number(value) < 0) {
            return 'El salario no puede ser negativo';
          }
          // Verificar que no exceda el límite de la base de datos
          if (Number(value) > 9999999999999) {
            return 'Salario demasiado alto (máximo: 9,999,999,999,999)';
          }
        }
        return ''; // Sin errores
      
      default:
        return ''; // Campo no reconocido, sin errores
    }
  }, [editingAdmin]);
  
  // ============================================================================================
  // FUNCIONES DE MANEJO DE EVENTOS
  // ============================================================================================
  
  // Función para manejar cambios en los campos de entrada
  const handleInputChange = useCallback((field: keyof AdminFormData, value: string) => {
    log.debug(COMPONENT_NAME, 'input-change', `Campo ${field} cambió`, { 
      field, 
      value: field === 'password' ? '[OCULTO]' : value 
    });
    
    // Actualizar el estado del formulario
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      log.debug(COMPONENT_NAME, 'form-data-updated', 'Estado del formulario actualizado', newData);
      return newData;
    });
    
    // Ejecutar validación en tiempo real
    const errorMessage = validateField(field, value);
    setRealtimeValidation(prev => ({
      ...prev,
      [field]: errorMessage
    }));
    
    // Si el campo es contraseña y se cambió manualmente, marcar como no generada automáticamente
    if (field === 'password') {
      setPasswordGenerated(false);
      log.debug(COMPONENT_NAME, 'password-manual', 'Contraseña cambiada manualmente');
    }
  }, [validateField]);
  
  // Función para manejar la selección/deselección de clubs
  const handleClubToggle = useCallback((clubId: string) => {
    log.debug(COMPONENT_NAME, 'club-toggle', 'Toggling club', { clubId });
    
    setFormData(prev => {
      // Verificar si el club ya está seleccionado
      const isCurrentlySelected = prev.selectedClubs.includes(clubId);
      
      // Crear nueva lista de clubs seleccionados
      const newSelectedClubs = isCurrentlySelected
        ? prev.selectedClubs.filter(id => id !== clubId) // Remover si está seleccionado
        : [...prev.selectedClubs, clubId];                // Agregar si no está seleccionado
      
      log.debug(COMPONENT_NAME, 'club-toggle', 'Clubs actualizados', {
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
  }, []);
  
  // ============================================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================================
  
  // Función para generar una contraseña temporal automática
  const handleGeneratePassword = useCallback(() => {
    log.info(COMPONENT_NAME, 'generate-password', 'Generando contraseña temporal');
    
    // Importar la función de generación (se podría mover a un archivo separado)
    import('@/utils/password').then(({ generateTempPassword }) => {
      const newPassword = generateTempPassword();
      
      // Actualizar el campo de contraseña
      handleInputChange('password', newPassword);
      
      // Marcar como generada automáticamente
      setPasswordGenerated(true);
      
      // Mostrar la contraseña para que el usuario pueda verla
      setShowPassword(true);
      
      log.success(COMPONENT_NAME, 'generate-password', 'Contraseña generada exitosamente');
    });
  }, [handleInputChange]);
  
  // Función para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => {
      const newValue = !prev;
      log.debug(COMPONENT_NAME, 'toggle-password', 'Visibilidad de contraseña cambiada', { visible: newValue });
      return newValue;
    });
  }, []);
  
  // Función para cerrar el formulario
  const handleClose = useCallback(() => {
    log.info(COMPONENT_NAME, 'close', 'Cerrando formulario');
    
    // Resetear estado de envío
    setIsSubmitting(false);
    
    // Llamar callback de cierre
    onClose();
  }, [onClose]);
  

  
  // ============================================================================================
  // FUNCIÓN PRINCIPAL DE GUARDADO
  // ============================================================================================
  
  // Función principal para guardar el administrador
  const handleSave = useCallback(async () => {
    try {
      // Indicar que se está procesando
      setIsSubmitting(true);
      
      log.info(COMPONENT_NAME, 'save-start', editingAdmin ? 'Iniciando actualización' : 'Iniciando creación', {
        isEditing: !!editingAdmin,
        adminId: editingAdmin?.id,
        formData: { ...formData, password: '[OCULTO]' }
      });
      
      // ========================================================================================
      // VALIDACIÓN FINAL ANTES DE GUARDAR
      // ========================================================================================
      
      const errors: string[] = [];
      
      // Validar campos obligatorios
      if (!formData.email.trim()) {
        errors.push('Email es obligatorio');
      }
      if (!formData.full_name.trim()) {
        errors.push('Nombre es obligatorio');
      }
      if (!editingAdmin && !formData.password.trim()) {
        errors.push('Contraseña es obligatoria para nuevos administradores');
      }
      if (formData.password && formData.password.length < 8) {
        errors.push('Contraseña debe tener al menos 8 caracteres');
      }
      if (formData.salary && Number(formData.salary) > 9999999999999) {
        errors.push('Salario demasiado alto');
      }
      if (formData.salary && isNaN(Number(formData.salary))) {
        errors.push('Salario debe ser un número válido');
      }
      
      // Si hay errores, mostrarlos y cancelar el guardado
      if (errors.length > 0) {
        log.warn(COMPONENT_NAME, 'validation-failed', 'Errores de validación encontrados', { errors });
        
        toast({
          title: "Error de validación",
          description: errors.join(', '),
          variant: "destructive"
        });
        
        setIsSubmitting(false);
        return;
      }
      
      log.info(COMPONENT_NAME, 'validation-passed', 'Validación exitosa, procediendo con el guardado');
      
      // ========================================================================================
      // DECIDIR SI CREAR O ACTUALIZAR
      // ========================================================================================
      
      if (editingAdmin) {
        // Modo edición: actualizar administrador existente
        await handleUpdateAdmin();
      } else {
        // Modo creación: crear nuevo administrador
        await handleCreateAdmin();
      }
      
    } catch (error) {
      // Capturar cualquier error durante el proceso de guardado
      log.error(COMPONENT_NAME, 'save-error', 'Error durante el guardado', { 
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined 
      });
      
      // Mostrar error al usuario
      toast({
        title: "Error",
        description: `Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive"
      });
      
      // Resetear estado de envío
      setIsSubmitting(false);
    }
  }, [formData, editingAdmin, toast]);
  
  // ============================================================================================
  // FUNCIÓN PARA CREAR NUEVO ADMINISTRADOR
  // ============================================================================================
  
  const handleCreateAdmin = useCallback(async () => {
    log.info(COMPONENT_NAME, 'create-admin', 'Creando nuevo administrador', {
      email: formData.email,
      role: formData.role,
      status: formData.status,
      clubsCount: formData.selectedClubs.length
    });
    
    // Preparar datos para inserción
    const adminData = {
      email: formData.email.trim(),
      password_hash: formData.password, // Se hashea automáticamente en la BD
      full_name: formData.full_name.trim(),
      salary: formData.salary ? parseFloat(formData.salary) : null,
      role: formData.role,
      status: formData.status
    };
    
    log.debug(COMPONENT_NAME, 'create-admin', 'Datos preparados para inserción', adminData);
    
    // Insertar en la base de datos
    const result = await secureQuery('administradores', 'insert', adminData);
    
    // Debug del resultado
    const dbAnalysis = debugDatabaseResult('INSERT administradores', result, { adminData });
    
    // Verificar si hubo errores
    if (result?.error) {
      log.error(COMPONENT_NAME, 'create-admin', 'Error en secureQuery', { 
        error: result.error,
        suggestion: dbAnalysis.suggestion 
      });
      throw new Error(`Error al crear administrador: ${result.error.message}`);
    }
    
    // Obtener el ID del administrador creado
    const newAdminId = result.data?.[0]?.id;
    if (!newAdminId) {
      log.error(COMPONENT_NAME, 'create-admin', 'No se obtuvo ID del nuevo administrador', { result });
      throw new Error('No se pudo obtener el ID del administrador creado');
    }
    
    log.success(COMPONENT_NAME, 'create-admin', 'Administrador creado exitosamente', { adminId: newAdminId });
    
    // Asignar clubs si se seleccionaron
    if (formData.selectedClubs.length > 0) {
      await handleUpdateAdminClubs(newAdminId);
    }
    
    // Mostrar notificación de éxito
    toast({
      title: "Administrador creado",
      description: `${formData.full_name} ha sido creado exitosamente.`
    });
    
    // Finalizar proceso exitoso
    log.info(COMPONENT_NAME, 'create-complete', 'Creación completada');
    onSuccess();
    handleClose();
    setIsSubmitting(false);
    
  }, [formData, secureQuery, toast, onSuccess, handleClose]);
  
  // ============================================================================================
  // FUNCIÓN PARA ACTUALIZAR ADMINISTRADOR EXISTENTE
  // ============================================================================================
  
  const handleUpdateAdmin = useCallback(async () => {
    log.info(COMPONENT_NAME, 'update-admin', 'Actualizando administrador existente', {
      adminId: editingAdmin.id,
      email: formData.email
    });
    
    // Verificar que tenemos un administrador para editar
    if (!editingAdmin || !editingAdmin.id) {
      log.error(COMPONENT_NAME, 'update-admin', 'No hay administrador para editar', { editingAdmin });
      throw new Error('No se encontró el administrador a editar');
    }
    
    // Preparar datos de actualización
    const updateData: any = {
      full_name: formData.full_name.trim(),
      salary: formData.salary ? parseFloat(formData.salary) : null,
      role: formData.role,
      status: formData.status,
      updated_at: new Date().toISOString()
    };
    
    // Solo actualizar email si cambió
    if (formData.email !== editingAdmin.email) {
      updateData.email = formData.email.trim();
      log.info(COMPONENT_NAME, 'update-email', 'Actualizando email', {
        oldEmail: editingAdmin.email,
        newEmail: formData.email
      });
    }
    
    // Solo actualizar contraseña si se proporcionó una nueva
    if (formData.password.trim()) {
      updateData.password_hash = formData.password; // Se hashea automáticamente
      log.info(COMPONENT_NAME, 'update-password', 'Actualizando contraseña');
    }
    
    log.debug(COMPONENT_NAME, 'update-admin', 'Datos preparados para actualización', {
      updateData: { ...updateData, password_hash: updateData.password_hash ? '[OCULTO]' : undefined },
      conditions: { id: editingAdmin.id }
    });
    
    // Ejecutar actualización en la base de datos
    const result = await secureQuery('administradores', 'update', updateData, { id: editingAdmin.id });
    
    // Debug del resultado
    const dbAnalysis = debugDatabaseResult('UPDATE administradores', result, { 
      updateData: { ...updateData, password_hash: updateData.password_hash ? '[OCULTO]' : undefined },
      adminId: editingAdmin.id 
    });
    
    log.debug(COMPONENT_NAME, 'update-admin', 'Resultado de secureQuery', { 
      hasError: !!result?.error,
      error: result?.error,
      suggestion: dbAnalysis.suggestion
    });
    
    // Verificar errores
    if (result?.error) {
      log.error(COMPONENT_NAME, 'update-admin', 'Error en actualización', { 
        error: result.error,
        suggestion: dbAnalysis.suggestion 
      });
      throw new Error(`Error al actualizar administrador: ${result.error.message}`);
    }
    
    log.success(COMPONENT_NAME, 'update-admin', 'Administrador actualizado en BD');
    
    // Actualizar clubs asignados
    await handleUpdateAdminClubs(editingAdmin.id);
    
    // Mostrar notificación de éxito
    toast({
      title: "Administrador actualizado",
      description: `${formData.full_name} ha sido actualizado exitosamente.`
    });
    
    // Finalizar proceso exitoso
    log.info(COMPONENT_NAME, 'update-complete', 'Actualización completada');
    onSuccess();
    handleClose();
    setIsSubmitting(false);
    
  }, [formData, editingAdmin, secureQuery, toast, onSuccess, handleClose]);
  
  // ============================================================================================
  // FUNCIÓN PARA GESTIONAR CLUBS ASIGNADOS
  // ============================================================================================
  
  const handleUpdateAdminClubs = useCallback(async (adminId: string) => {
    log.info(COMPONENT_NAME, 'update-clubs', 'Actualizando clubs asignados', {
      adminId,
      selectedClubs: formData.selectedClubs,
      count: formData.selectedClubs.length
    });
    
    try {
      // ========================================================================================
      // PASO 1: ELIMINAR TODAS LAS RELACIONES EXISTENTES
      // ========================================================================================
      
      log.debug(COMPONENT_NAME, 'update-clubs', 'Eliminando relaciones existentes');
      
      const deleteResult = await secureQuery(
        'administrador_clubs',
        'delete',
        undefined,
        { administrador_id: adminId }
      );
      
      // Log del resultado de eliminación
      if (deleteResult?.error) {
        log.warn(COMPONENT_NAME, 'update-clubs', 'Advertencia al eliminar relaciones', { 
          error: deleteResult.error 
        });
      } else {
        log.debug(COMPONENT_NAME, 'update-clubs', 'Relaciones existentes eliminadas');
      }
      
      // ========================================================================================
      // PASO 2: CREAR NUEVAS RELACIONES SI HAY CLUBS SELECCIONADOS
      // ========================================================================================
      
      if (formData.selectedClubs.length > 0) {
        log.debug(COMPONENT_NAME, 'update-clubs', 'Creando nuevas relaciones');
        
        // Preparar datos de las relaciones
        const clubRelations = formData.selectedClubs.map(clubId => ({
          administrador_id: adminId,
          club_id: clubId,
          is_active: true,
          role: 'manager',
          start_date: new Date().toISOString().split('T')[0] // Solo fecha YYYY-MM-DD
        }));
        
        log.debug(COMPONENT_NAME, 'update-clubs', 'Datos de relaciones preparados', { clubRelations });
        
        // Insertar nuevas relaciones
        const insertResult = await secureQuery('administrador_clubs', 'insert', clubRelations);
        
        // Verificar errores en la inserción
        if (insertResult?.error) {
          log.error(COMPONENT_NAME, 'update-clubs', 'Error al insertar relaciones', { 
            error: insertResult.error 
          });
          throw new Error(`Error al asignar clubs: ${insertResult.error.message}`);
        }
        
        log.success(COMPONENT_NAME, 'update-clubs', 'Clubs asignados exitosamente', {
          count: formData.selectedClubs.length,
          clubIds: formData.selectedClubs
        });
        
      } else {
        log.info(COMPONENT_NAME, 'update-clubs', 'No hay clubs para asignar - todas las relaciones eliminadas');
      }
      
    } catch (error) {
      log.error(COMPONENT_NAME, 'update-clubs', 'Error en gestión de clubs', { error });
      throw error;
    }
  }, [formData.selectedClubs, secureQuery]);
  
  // ============================================================================================
  // FUNCIÓN PARA CARGAR CLUBS DEL ADMINISTRADOR EN EDICIÓN
  // ============================================================================================
  
  const loadAdminClubs = useCallback(async (adminId: string) => {
    log.debug(COMPONENT_NAME, 'load-clubs', 'Cargando clubs del administrador', { adminId });
    
    try {
      // Obtener relaciones activas del administrador
      const result = await secureQuery(
        'administrador_clubs',
        'select',
        undefined,
        { administrador_id: adminId, is_active: true }
      );
      
      log.debug(COMPONENT_NAME, 'load-clubs', 'Resultado de query', { result });
      
      // Verificar errores
      if (result?.error) {
        log.error(COMPONENT_NAME, 'load-clubs', 'Error al cargar clubs', { error: result.error });
        return;
      }
      
      // Extraer IDs de clubs
      if (result?.data) {
        const clubIds = result.data.map((item: any) => item.club_id);
        
        log.success(COMPONENT_NAME, 'load-clubs', 'Clubs cargados exitosamente', {
          count: clubIds.length,
          clubIds,
          rawData: result.data
        });
        
        // Actualizar estado del formulario
        setFormData(prev => ({
          ...prev,
          selectedClubs: clubIds
        }));
        
      } else {
        log.info(COMPONENT_NAME, 'load-clubs', 'No se encontraron clubs para este administrador');
        setFormData(prev => ({ ...prev, selectedClubs: [] }));
      }
      
    } catch (error) {
      log.error(COMPONENT_NAME, 'load-clubs', 'Error en carga de clubs', { error });
    }
  }, [secureQuery]);
  
  // ============================================================================================
  // EFECTOS PARA CARGA INICIAL DE DATOS
  // ============================================================================================
  
  // Efecto para cargar datos cuando se abre el formulario en modo edición
  useEffect(() => {
    if (editingAdmin) {
      log.info(COMPONENT_NAME, 'load-edit-data', 'Cargando datos para edición', {
        adminId: editingAdmin.id,
        admin: editingAdmin
      });
      
      // Preparar datos del formulario basados en el administrador existente
      const initialFormData: AdminFormData = {
        email: editingAdmin.email || '',
        password: '', // No cargar contraseña existente por seguridad
        full_name: editingAdmin.full_name || '',
        salary: editingAdmin.salary?.toString() || '',
        role: editingAdmin.role || 'club_admin',
        status: editingAdmin.status || 'active',
        selectedClubs: [] // Se cargará por separado
      };
      
      log.debug(COMPONENT_NAME, 'load-edit-data', 'Datos iniciales preparados', initialFormData);
      
      // Actualizar estado del formulario
      setFormData(initialFormData);
      
      // Cargar clubs asignados
      if (editingAdmin.id) {
        loadAdminClubs(editingAdmin.id);
      } else {
        log.warn(COMPONENT_NAME, 'load-edit-data', 'Administrador sin ID válido', { editingAdmin });
      }
      
    } else {
      log.info(COMPONENT_NAME, 'new-admin-mode', 'Preparando formulario para nuevo administrador');
      
      // Resetear formulario para nuevo administrador
      setFormData({
        email: '',
        password: '',
        full_name: '',
        salary: '',
        role: 'club_admin',
        status: 'active',
        selectedClubs: []
      });
      
      // Resetear estados de UI
      setPasswordGenerated(false);
      setShowPassword(false);
    }
    
    // Limpiar validaciones
    setRealtimeValidation({});
    
  }, [editingAdmin, loadAdminClubs]);
  
  // ============================================================================================
  // CÁLCULO DE ESTADO DE FORMULARIO VÁLIDO
  // ============================================================================================
  
  // Calcular si el formulario es válido para habilitar el botón de guardar
  const isFormValid = 
    formData.email.trim() !== '' &&                    // Email no vacío
    formData.full_name.trim() !== '' &&                // Nombre no vacío
    (editingAdmin || formData.password.trim() !== '') && // Contraseña para nuevos o edición con nueva contraseña
    !Object.values(realtimeValidation).some(error => error !== ''); // Sin errores de validación
  
  // ============================================================================================
  // FUNCIÓN DE DEBUG MANUAL (DESPUÉS DE TODAS LAS DECLARACIONES)
  // ============================================================================================
  
  // Función para debuggear el estado actual del formulario manualmente
  const debugCurrentState = useCallback(() => {
    const currentHookState = {
      formData,
      isSubmitting,
      showPassword,
      passwordGenerated,
      realtimeValidation,
      isFormValid
    };
    
    debugFullEditingProcess(editingAdmin, formData, currentHookState);
  }, [formData, isSubmitting, showPassword, passwordGenerated, realtimeValidation, isFormValid, editingAdmin]);
  
  // ============================================================================================
  // RETORNO DEL HOOK
  // ============================================================================================
  
  return {
    // Estados del formulario
    formData,
    setFormData,
    
    // Estados de UI
    isSubmitting,
    showPassword,
    passwordGenerated,
    
    // Validaciones
    realtimeValidation,
    
    // Funciones principales
    handleInputChange,
    handleClubToggle,
    handleGeneratePassword,
    handleSave,
    handleClose,
    
    // Funciones de UI
    togglePasswordVisibility,
    
    // Estado calculado
    isFormValid,
    
    // Función de debug
    debugCurrentState
  };
}
