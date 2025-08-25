// ================================================================================================
// FORMULARIO DE ADMINISTRADORES CON LOGGING DETALLADO
// ================================================================================================
// Versión del formulario con logging exhaustivo para diagnosticar problemas
// en la creación y edición de administradores.
// ================================================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { log } from '@/shared/utils/logger';
import type { Club } from '@/types/database';
import type { AdministradorFormData, Administrador, EmployeeStatus } from '@/types/empleados';

// Importaciones de componentes UI
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Iconos
import { Building2, X } from 'lucide-react';

// ================================================================================================
// CONSTANTE DEL COMPONENTE PARA LOGGING
// ================================================================================================
const COMPONENT_NAME = 'AdminForm-Debug';

// ================================================================================================
// TIPOS E INTERFACES
// ================================================================================================

// Usamos el tipo AdministradorFormData de types/empleados.ts (sin campos de autenticación)
interface AdminFormData extends Omit<AdministradorFormData, 'hire_date' | 'salary'> {
  hire_date: string;               // Fecha como string para inputs
  salary: string;                  // Salario como string para inputs
}

// Props del componente
interface AdminFormProps {
  open: boolean;                    // Estado del diálogo
  editingAdmin: any | null;        // Admin en edición
  clubs: Club[];                   // Lista de clubs
  onClose: () => void;             // Callback de cierre
  onSuccess: () => void;           // Callback de éxito
}

// ================================================================================================
// FUNCIONES AUXILIARES
// ================================================================================================

// Los administradores no requieren autenticación, por lo que no necesitamos funciones de contraseña

// ================================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================================
const AdminFormDebug: React.FC<AdminFormProps> = ({
  open,
  editingAdmin,
  clubs,
  onClose,
  onSuccess
}) => {
  
  log.debug(COMPONENT_NAME, 'render', 'Renderizando componente', { 
    open, 
    editingAdmin: editingAdmin?.id || 'null',
    clubsCount: clubs.length 
  });
  
  // ============================================================================================
  // HOOKS
  // ============================================================================================
  
  const { secureQuery } = useAuth();
  const { toast } = useToast();
  
  // ============================================================================================
  // ESTADOS
  // ============================================================================================
  
  // Estado del formulario (sin campos de autenticación)
  const [formData, setFormData] = useState<AdminFormData>({
    email: '',                    // Email ficticio para identificación
    full_name: '',
    phone: '',
    position: '',
    department: '',
    employee_id: '',
    role: 'club_admin',
    is_super_admin: false,
    contract_type: 'full_time',
    hire_date: new Date().toISOString().split('T')[0], // Fecha actual
    salary: '',
    assigned_clubs: [],
    emergency_contact: {
      name: '',
      phone: '',
      relationship: ''
    },
    notes: '',
    permissions: {},
    preferences: {}
  });
  
  // Estados de control
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<AdminFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [realtimeValidation, setRealtimeValidation] = useState<Partial<AdminFormData>>({});
  
  log.debug(COMPONENT_NAME, 'state', 'Estados inicializados', { 
    isSubmitting, 
    showPassword,
    errorsCount: Object.keys(formErrors).length 
  });
  
  // ============================================================================================
  // EFFECT PARA INICIALIZACIÓN
  // ============================================================================================
  
  useEffect(() => {
    log.info(COMPONENT_NAME, 'dialog-state-change', 'Cambio de estado del diálogo', { open, editingAdmin: !!editingAdmin });
    
    if (open) {
      log.info(COMPONENT_NAME, 'dialog-open', 'Diálogo abierto', { 
        mode: editingAdmin ? 'edit' : 'create',
        adminId: editingAdmin?.id || 'new'
      });
      
      if (editingAdmin) {
        // Modo edición
        log.debug(COMPONENT_NAME, 'load-edit-data', 'Cargando datos para edición', editingAdmin);
        
        const newFormData: AdminFormData = {
          email: editingAdmin.email || '',  // Email ficticio
          full_name: editingAdmin.full_name || '',
          phone: editingAdmin.phone || '',
          position: editingAdmin.position || '',
          department: editingAdmin.department || '',
          employee_id: editingAdmin.employee_id || '',
          role: editingAdmin.role || 'club_admin',
          is_super_admin: editingAdmin.is_super_admin || false,
          contract_type: editingAdmin.contract_type || 'full_time',
          hire_date: editingAdmin.hire_date || new Date().toISOString().split('T')[0],
          salary: editingAdmin.salary?.toString() || '',
          assigned_clubs: editingAdmin.clubs?.map((club: Club) => club.id) || [],
          emergency_contact: editingAdmin.emergency_contact || { name: '', phone: '', relationship: '' },
          notes: editingAdmin.notes || '',
          permissions: editingAdmin.permissions || {},
          preferences: editingAdmin.preferences || {}
        };
        
        setFormData(newFormData);
        setShowPassword(false);
        
        log.success(COMPONENT_NAME, 'load-edit-data', 'Datos de edición cargados', {
          email: newFormData.email,
          clubsCount: newFormData.assigned_clubs.length,
          role: newFormData.role
        });
        
      } else {
        // Modo creación
        log.debug(COMPONENT_NAME, 'prepare-create-form', 'Preparando formulario para creación');
        
        const newFormData: AdminFormData = {
          email: '',                    // Email ficticio para identificación
          full_name: '',
          phone: '',
          position: '',
          department: '',
          employee_id: '',
          role: 'club_admin' as const,
          is_super_admin: false,
          contract_type: 'full_time',
          hire_date: new Date().toISOString().split('T')[0],
          salary: '',
          assigned_clubs: [],
          emergency_contact: { name: '', phone: '', relationship: '' },
          notes: '',
          permissions: {},
          preferences: {}
        };
        
        setFormData(newFormData);
        setShowPassword(false); // No hay sección de contraseña
        
        log.success(COMPONENT_NAME, 'prepare-create-form', 'Formulario de creación preparado');
      }
      
      // Reset estados
      setIsSubmitting(false);
      setFormErrors({});
      setRealtimeValidation({});
      
      log.debug(COMPONENT_NAME, 'reset-states', 'Estados de control reseteados');
    }
  }, [open, editingAdmin]);
  
  // ============================================================================================
  // FUNCIONES DE MANEJO DE FORMULARIO
  // ============================================================================================
  
  // Validación en tiempo real
  const validateFieldRealtime = (field: keyof AdminFormData, value: any) => {
    let error = '';
    
    switch (field) {
      case 'email':
        if (!value.trim()) {
          error = 'El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Formato de email inválido';
        }
        break;
        
      // Eliminamos validaciones de contraseña ya que no hay autenticación
        
      case 'phone':
        if (value && !/^[\+]?[0-9\s\-\(\)]+$/.test(value)) {
          error = 'Formato de teléfono inválido';
        }
        break;
    }
    
    setRealtimeValidation(prev => ({
      ...prev,
      [field]: error || undefined
    }));
    
    return !error;
  };

  // Manejar cambios en campos
  const handleFieldChange = (field: keyof AdminFormData, value: any) => {
    log.debug(COMPONENT_NAME, 'field-change', `Campo ${field} cambió`, { field, newValue: value });
    
    const oldValue = formData[field];
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    log.debug(COMPONENT_NAME, field, oldValue, value);
    
    // Validación en tiempo real
    validateFieldRealtime(field, value);
    
    // Sin validaciones cruzadas de contraseña
    
    // Sincronizar is_super_admin con role
    if (field === 'role') {
      const newIsSuperAdmin = value === 'super_admin';
      setFormData(prev => ({
        ...prev,
        is_super_admin: newIsSuperAdmin
      }));
      log.debug(COMPONENT_NAME, 'sync-super-admin', 'Sincronizando is_super_admin', { 
        role: value, 
        is_super_admin: newIsSuperAdmin 
      });
    }
    
    if (field === 'is_super_admin') {
      const newRole = value ? 'super_admin' : 'club_admin';
      setFormData(prev => ({
        ...prev,
        role: newRole
      }));
      log.debug(COMPONENT_NAME, 'sync-role', 'Sincronizando role', { 
        is_super_admin: value, 
        role: newRole 
      });
    }
    
    // Limpiar error del campo
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
      log.debug(COMPONENT_NAME, 'clear-field-error', `Error de ${field} limpiado`);
    }
  };
  
  // Manejar toggle de clubs
  const handleClubToggle = (clubId: string) => {
    log.debug(COMPONENT_NAME, 'club-toggle', 'Toggle de club', { clubId });
    
    const isCurrentlyAssigned = formData.assigned_clubs.includes(clubId);
    const newClubs = isCurrentlyAssigned
      ? formData.assigned_clubs.filter(id => id !== clubId)
      : [...formData.assigned_clubs, clubId];
    
    setFormData(prev => ({
      ...prev,
      assigned_clubs: newClubs
    }));
    
    log.debug(COMPONENT_NAME, 'club-toggle', 'Clubs actualizados', {
      clubId,
      action: isCurrentlyAssigned ? 'removed' : 'added',
      totalClubs: newClubs.length
    });
  };
  
  // Remover club específico
  const handleRemoveClub = (clubId: string) => {
    log.debug(COMPONENT_NAME, 'club-remove', 'Removiendo club', { clubId });
    
    setFormData(prev => ({
      ...prev,
      assigned_clubs: prev.assigned_clubs.filter(id => id !== clubId)
    }));
    
    log.debug(COMPONENT_NAME, 'club-remove', 'Club removido');
  };
  
  // ============================================================================================
  // VALIDACIÓN
  // ============================================================================================
  
  const validateForm = (): boolean => {
    log.info(COMPONENT_NAME, 'form-validation', formData);
    
    const errors: Partial<AdminFormData> = {};
    
    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
      log.debug(COMPONENT_NAME, 'email', false, 'Email vacío');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Formato de email inválido';
      log.debug(COMPONENT_NAME, 'email', false, 'Formato inválido');
    } else {
      log.debug(COMPONENT_NAME, 'email', true);
    }
    
    // Sin validaciones de contraseña - administradores no requieren autenticación
    
    // Validar teléfono (opcional)
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Formato de teléfono inválido';
      log.debug(COMPONENT_NAME, 'phone', false, 'Formato inválido');
    } else {
      log.debug(COMPONENT_NAME, 'phone', true);
    }
    
    setFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    
    if (isValid) {
      log.success(COMPONENT_NAME, 'form-validation', { isValid: true });
    } else {
      log.warn(COMPONENT_NAME, 'form-validation', 'Validación fallida', { 
        errorsCount: Object.keys(errors).length,
        errors 
      });
    }
    
    return isValid;
  };
  
  // ============================================================================================
  // FUNCIÓN PRINCIPAL DE GUARDADO
  // ============================================================================================
  
  const handleSave = async () => {
    log.info(COMPONENT_NAME, 'save-admin', {
      mode: editingAdmin ? 'edit' : 'create',
      formData: { ...formData, password: '[HIDDEN]', confirmPassword: '[HIDDEN]' }
    });
    
    // Validar formulario
    if (!validateForm()) {
      log.warn(COMPONENT_NAME, 'save-admin', 'Guardado cancelado por validación');
      return;
    }
    
    setIsSubmitting(true);
    log.debug(COMPONENT_NAME, 'isSubmitting', false, true);
    
    try {
      if (editingAdmin) {
        await handleUpdateAdmin();
      } else {
        await handleCreateAdmin();
      }
      
      log.success(COMPONENT_NAME, 'save-admin', 'Admin guardado exitosamente');
      
      // Cerrar formulario
      setTimeout(() => {
        log.debug(COMPONENT_NAME, 'save-admin', 'Cerrando formulario y notificando éxito');
        onSuccess();
        onClose();
      }, 100);
      
    } catch (error) {
      log.error(COMPONENT_NAME, 'save-admin', error as Error, { 
        mode: editingAdmin ? 'edit' : 'create' 
      });
      
      toast({
        title: "❌ Error",
        description: `Error al ${editingAdmin ? 'actualizar' : 'crear'} administrador: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      log.debug(COMPONENT_NAME, 'isSubmitting', true, false);
    }
  };
  
  // ============================================================================================
  // CREAR ADMINISTRADOR
  // ============================================================================================
  
  const handleCreateAdmin = async () => {
    log.info(COMPONENT_NAME, 'create-admin', { email: formData.email });
    
    try {
      // 1. Preparar datos del administrador
      const administradorData = {
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim() || null,
        position: formData.position.trim() || null,
        department: formData.department.trim() || null,
        employee_id: formData.employee_id.trim() || null,
        role: formData.role,
        is_super_admin: formData.is_super_admin,
        contract_type: formData.contract_type,
        hire_date: formData.hire_date || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        emergency_contact: formData.emergency_contact,
        notes: formData.notes.trim() || null,
        permissions: formData.permissions,
        preferences: formData.preferences,
        status: 'active' as EmployeeStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      log.debug(COMPONENT_NAME, 'create-admin', 'Datos del administrador preparados', {
        ...administradorData,
        salary: administradorData.salary ? '[HIDDEN]' : null
      });
      
      // 2. Crear administrador en la nueva tabla
      log.debug(COMPONENT_NAME, 'create-admin', 'Ejecutando secureQuery INSERT en administradores');
      const { data: adminResult, error: adminError } = await secureQuery<Administrador>(
        'administradores',
        'insert',
        administradorData
      );
      
      log.debug(COMPONENT_NAME, 'create-admin', 'Resultado secureQuery INSERT administradores', {
        hasData: !!adminResult,
        dataLength: adminResult?.length || 0,
        hasError: !!adminError,
        error: adminError
      });
      
      if (adminError) {
        throw new Error(adminError.message || 'Error al crear administrador');
      }
      
      if (!adminResult || adminResult.length === 0) {
        throw new Error('No se recibió respuesta del servidor al crear administrador');
      }
      
      const newAdmin = adminResult[0];
      log.success(COMPONENT_NAME, 'create-admin', 'Administrador creado exitosamente', {
        adminId: newAdmin.id,
        email: newAdmin.email
      });
      
      // 3. Crear relaciones con clubs
      if (formData.assigned_clubs.length > 0) {
        await handleUpdateAdminClubs(newAdmin.id);
      } else {
        log.debug(COMPONENT_NAME, 'create-admin', 'Sin clubs para asignar');
      }
      
      // 4. Mostrar notificaciones de éxito
      toast({
        title: "✅ Administrador creado",
        description: `${formData.email} ha sido creado exitosamente como administrador del sistema.`,
        variant: "success",
      });
      
      toast({
        title: "ℹ️ Información",
        description: `El administrador ${formData.full_name} está registrado con email ficticio para identificación.`,
        variant: "default",
      });
      
      log.success(COMPONENT_NAME, 'create-admin', 'Administrador creado completamente');
      
    } catch (error) {
      log.error(COMPONENT_NAME, 'create-admin', error as Error);
      throw error;
    }
  };
  
  // ============================================================================================
  // ACTUALIZAR ADMINISTRADOR
  // ============================================================================================
  
  const handleUpdateAdmin = async () => {
    log.info(COMPONENT_NAME, 'update-admin', { 
      adminId: editingAdmin.id,
      email: editingAdmin.email 
    });
    
    try {
      // 1. Preparar datos de actualización
      const updateData = {
        full_name: formData.full_name.trim() || null,
        phone: formData.phone.trim() || null,
        role: formData.role,
        is_super_admin: formData.is_super_admin,
        preferences: formData.preferences,
        updated_at: new Date().toISOString()
      };
      
      log.debug(COMPONENT_NAME, 'update-admin', 'Datos de actualización preparados', updateData);
      
      // 2. Actualizar perfil
      log.debug(COMPONENT_NAME, 'update-admin', 'Ejecutando secureQuery UPDATE');
      const { error: updateError } = await secureQuery(
        'profiles',
        'update',
        updateData,
        { id: editingAdmin.id }
      );
      
      log.debug(COMPONENT_NAME, 'update-admin', 'Resultado secureQuery UPDATE', {
        hasError: !!updateError,
        error: updateError
      });
      
      if (updateError) {
        throw new Error(updateError.message || 'Error al actualizar perfil');
      }
      
      log.success(COMPONENT_NAME, 'update-admin', 'Perfil actualizado exitosamente');
      
      // 3. Actualizar relaciones con clubs
      await handleUpdateAdminClubs(editingAdmin.id);
      
      // 4. Mostrar notificación de éxito
      toast({
        title: "✅ Administrador actualizado",
        description: `${editingAdmin.email} ha sido actualizado exitosamente.`,
        variant: "success",
      });
      
      log.success(COMPONENT_NAME, 'update-admin', 'Administrador actualizado completamente');
      
    } catch (error) {
      log.error(COMPONENT_NAME, 'update-admin', error as Error);
      throw error;
    }
  };
  
  // ============================================================================================
  // ACTUALIZAR RELACIONES ADMINISTRADOR-CLUB
  // ============================================================================================
  
  const handleUpdateAdminClubs = async (adminId: string) => {
    log.info(COMPONENT_NAME, 'update-admin-clubs', {
      adminId,
      clubsToAssign: formData.assigned_clubs.length,
      clubs: formData.assigned_clubs
    });
    
    try {
      // 1. Eliminar relaciones existentes
      log.debug(COMPONENT_NAME, 'update-admin-clubs', 'Eliminando relaciones existentes');
      const { error: deleteError } = await secureQuery(
        'administrador_clubs',
        'delete',
        undefined,
        { administrador_id: adminId }
      );
      
      if (deleteError) {
        log.warn(COMPONENT_NAME, 'update-admin-clubs', 'Error eliminando relaciones existentes', deleteError);
      } else {
        log.debug(COMPONENT_NAME, 'update-admin-clubs', 'Relaciones existentes eliminadas');
      }
      
      // 2. Crear nuevas relaciones
      if (formData.assigned_clubs.length > 0) {
        const adminClubsData = formData.assigned_clubs.map((clubId, index) => ({
          administrador_id: adminId,
          club_id: clubId,
          role: 'manager',
          is_active: true,
          is_primary: index === 0, // El primer club es el principal
          start_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        log.debug(COMPONENT_NAME, 'update-admin-clubs', 'Creando nuevas relaciones', {
          count: adminClubsData.length,
          relations: adminClubsData
        });
        
        const { error: insertError } = await secureQuery(
          'administrador_clubs',
          'insert',
          adminClubsData
        );
        
        if (insertError) {
          throw new Error(`Error al asignar clubs: ${insertError.message}`);
        }
        
        log.success(COMPONENT_NAME, 'update-admin-clubs', 'Clubs asignados exitosamente', {
          count: adminClubsData.length
        });
      } else {
        log.debug(COMPONENT_NAME, 'update-admin-clubs', 'No hay clubs para asignar');
      }
      
    } catch (error) {
      log.error(COMPONENT_NAME, 'update-admin-clubs', error as Error);
      throw error;
    }
  };
  
  // ============================================================================================
  // CERRAR FORMULARIO
  // ============================================================================================
  
  const handleClose = () => {
    log.debug(COMPONENT_NAME, 'close-dialog', 'Cerrando formulario');
    setIsSubmitting(false);
    setFormErrors({});
    setRealtimeValidation({});
    onClose();
  };
  
  // ============================================================================================
  // RENDERIZADO DE CLUBS ASIGNADOS
  // ============================================================================================
  
  const renderAssignedClubs = () => {
    if (formData.assigned_clubs.length === 0) {
      return <p className="text-sm text-gray-500">No hay clubs asignados</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2">
        {formData.assigned_clubs.map(clubId => {
          const club = clubs.find(c => c.id === clubId);
          return club ? (
            <Badge key={clubId} variant="outline" className="flex items-center gap-1">
              {club.name}
              <button
                type="button"
                onClick={() => handleRemoveClub(clubId)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ) : null;
        })}
      </div>
    );
  };
  
  // ============================================================================================
  // RENDERIZADO PRINCIPAL
  // ============================================================================================
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}
          </DialogTitle>
          <DialogDescription>
            {editingAdmin 
              ? `Modificando: ${editingAdmin.email}`
              : 'Crear un nuevo administrador del sistema'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email de Identificación *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin.club@sistema.local"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                disabled={!!editingAdmin}
                className={
                  realtimeValidation.email ? 'border-red-500' : 
                  formData.email && !realtimeValidation.email ? 'border-green-500' : ''
                }
              />
              <p className="text-xs text-gray-500">
                💡 Email ficticio para identificación interna del administrador
              </p>
              {realtimeValidation.email && (
                <p className="text-sm text-red-500">{realtimeValidation.email}</p>
              )}
              {formData.email && !realtimeValidation.email && (
                <p className="text-sm text-green-600">✅ Email válido</p>
              )}
            </div>
            
            {/* Nombre completo */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                placeholder="Juan Pérez"
                value={formData.full_name}
                onChange={(e) => handleFieldChange('full_name', e.target.value)}
                className={formErrors.full_name ? 'border-red-500' : ''}
              />
              {formErrors.full_name && (
                <p className="text-sm text-red-500">{formErrors.full_name}</p>
              )}
            </div>
            
            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+54 11 1234-5678"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={
                  realtimeValidation.phone ? 'border-red-500' : 
                  formData.phone && !realtimeValidation.phone ? 'border-green-500' : ''
                }
              />
              {realtimeValidation.phone && (
                <p className="text-sm text-red-500">{realtimeValidation.phone}</p>
              )}
              {formData.phone && !realtimeValidation.phone && (
                <p className="text-sm text-green-600">✅ Teléfono válido</p>
              )}
            </div>
          </div>
          
          {/* Información profesional */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Profesional</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Posición */}
              <div className="space-y-2">
                <Label htmlFor="position">Posición/Cargo</Label>
                <Input
                  id="position"
                  placeholder="Gerente, Supervisor, etc."
                  value={formData.position}
                  onChange={(e) => handleFieldChange('position', e.target.value)}
                />
              </div>
              
              {/* Departamento */}
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  placeholder="Administración, Ventas, etc."
                  value={formData.department}
                  onChange={(e) => handleFieldChange('department', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Employee ID */}
              <div className="space-y-2">
                <Label htmlFor="employee_id">ID de Empleado</Label>
                <Input
                  id="employee_id"
                  placeholder="EMP001"
                  value={formData.employee_id}
                  onChange={(e) => handleFieldChange('employee_id', e.target.value)}
                />
              </div>
              
              {/* Tipo de contrato */}
              <div className="space-y-2">
                <Label>Tipo de Contrato</Label>
                <Select
                  value={formData.contract_type}
                  onValueChange={(value) => handleFieldChange('contract_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Tiempo Completo</SelectItem>
                    <SelectItem value="part_time">Medio Tiempo</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="intern">Practicante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Fecha de contratación */}
              <div className="space-y-2">
                <Label htmlFor="hire_date">Fecha de Contratación</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => handleFieldChange('hire_date', e.target.value)}
                />
              </div>
              
              {/* Salario */}
              <div className="space-y-2">
                <Label htmlFor="salary">Salario (Opcional)</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="50000"
                  value={formData.salary}
                  onChange={(e) => handleFieldChange('salary', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Roles y permisos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Roles y Permisos</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Super Administrador</Label>
                <p className="text-sm text-gray-500">
                  Acceso completo a todo el sistema
                </p>
              </div>
              <Switch
                checked={formData.is_super_admin}
                onCheckedChange={(checked) => handleFieldChange('is_super_admin', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Rol del Usuario</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleFieldChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Administrador</SelectItem>
                  <SelectItem value="club_admin">Administrador de Club</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Adicional</h3>
            
            {/* Contacto de emergencia */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Contacto de Emergencia</Label>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  placeholder="Nombre completo"
                  value={formData.emergency_contact.name || ''}
                  onChange={(e) => handleFieldChange('emergency_contact', {
                    ...formData.emergency_contact,
                    name: e.target.value
                  })}
                />
                <Input
                  placeholder="Teléfono"
                  value={formData.emergency_contact.phone || ''}
                  onChange={(e) => handleFieldChange('emergency_contact', {
                    ...formData.emergency_contact,
                    phone: e.target.value
                  })}
                />
                <Input
                  placeholder="Relación (padre, esposo/a, etc.)"
                  value={formData.emergency_contact.relationship || ''}
                  onChange={(e) => handleFieldChange('emergency_contact', {
                    ...formData.emergency_contact,
                    relationship: e.target.value
                  })}
                />
              </div>
            </div>
            
            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Administrativas</Label>
              <textarea
                id="notes"
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Información adicional, observaciones, etc."
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
              />
            </div>
          </div>
          
          {/* Clubs asignados */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Clubs Asignados</h3>
            
            <div className="space-y-2">
              <Label>Clubs Actuales</Label>
              {renderAssignedClubs()}
            </div>
            
            <div className="space-y-2">
              <Label>Asignar Clubs</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {clubs.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay clubs disponibles</p>
                ) : (
                  <div className="space-y-2">
                    {clubs.map(club => (
                      <div key={club.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`club-${club.id}`}
                          checked={formData.assigned_clubs.includes(club.id)}
                          onCheckedChange={() => handleClubToggle(club.id)}
                        />
                        <Label 
                          htmlFor={`club-${club.id}`}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Building2 className="w-4 h-4" />
                          {club.name}
                          <Badge variant="outline" className="text-xs">
                            {club.status}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : (editingAdmin ? 'Actualizar' : 'Crear Administrador')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminFormDebug;
