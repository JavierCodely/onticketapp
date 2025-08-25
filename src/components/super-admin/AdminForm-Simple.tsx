// ================================================================================================
// FORMULARIO SIMPLIFICADO PARA ADMINISTRADORES
// ================================================================================================

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, DollarSign, User, Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { log } from '@/shared/utils/logger';
import { generateTempPassword } from '@/utils/password';
import PasswordStrength from '@/components/ui/password-strength';

// ================================================================================================
// TIPOS Y INTERFACES
// ================================================================================================

interface Club {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface AdminFormData {
  // Campos obligatorios básicos
  email: string;
  password: string;
  full_name: string;
  
  // Información laboral
  salary: string;
  role: 'club_admin' | 'super_admin';
  status: 'active' | 'inactive';
  
  // Clubs asignados
  selectedClubs: string[];
}

interface AdminFormProps {
  open: boolean;
  editingAdmin: any | null;
  clubs: Club[];
  onClose: () => void;
  onSuccess: () => void;
}

// ================================================================================================
// CONSTANTES
// ================================================================================================

const COMPONENT_NAME = 'AdminForm-Simple';

// ================================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================================

const AdminFormSimple: React.FC<AdminFormProps> = ({ 
  open, 
  editingAdmin, 
  clubs, 
  onClose, 
  onSuccess 
}) => {
  // Estado del componente
  log.info(COMPONENT_NAME, 'render', `Diálogo ${open ? 'abierto' : 'cerrado'}`, {
    editingAdmin: editingAdmin?.id || 'nuevo',
    clubsCount: clubs.length
  });

  // ================================================================================================
  // ESTADO DEL FORMULARIO
  // ================================================================================================

  const [formData, setFormData] = useState<AdminFormData>({
    email: '',
    password: '',
    full_name: '',
    salary: '',
    role: 'club_admin',
    status: 'active',
    selectedClubs: []
  });

  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de envío
  const [passwordGenerated, setPasswordGenerated] = useState(false); // Si se generó contraseña automática
  const [realtimeValidation, setRealtimeValidation] = useState<{[key: string]: string}>({}); // Validación en tiempo real

  // ================================================================================================
  // HOOKS
  // ================================================================================================

  const { secureQuery } = useAuth(); // Hook de autenticación para queries seguras
  const { toast } = useToast(); // Hook para mostrar notificaciones

  // ================================================================================================
  // EFECTOS
  // ================================================================================================

  // Efecto para cargar datos del admin cuando se abre el diálogo
  useEffect(() => {
    log.debug(COMPONENT_NAME, 'dialog-state-change', `Diálogo ${open ? 'abierto' : 'cerrado'}`);
    
    if (open) {
      if (editingAdmin) {
        // Modo edición: cargar datos existentes
        log.info(COMPONENT_NAME, 'load-edit-data', 'Cargando datos para edición', { 
          adminId: editingAdmin.id,
          editingAdmin: editingAdmin 
        });
        
        const newFormData = {
          email: editingAdmin.email || '',
          password: '', // No mostrar contraseña existente
          full_name: editingAdmin.full_name || '',
          salary: editingAdmin.salary?.toString() || '',
          role: editingAdmin.role || 'club_admin',
          status: editingAdmin.status || 'active',
          selectedClubs: [] // Se cargará por separado
        };
        
        log.debug(COMPONENT_NAME, 'load-edit-data', 'Datos del formulario preparados', { newFormData });
        setFormData(newFormData);
        
        // Cargar clubs asignados si estamos editando
        if (editingAdmin.id) {
          log.debug(COMPONENT_NAME, 'load-edit-data', 'Cargando clubs asignados');
          loadAdminClubs(editingAdmin.id);
        } else {
          log.warn(COMPONENT_NAME, 'load-edit-data', 'Administrador sin ID', { editingAdmin });
        }
      } else {
        // Modo creación: resetear formulario
        log.info(COMPONENT_NAME, 'new-admin-mode', 'Preparando formulario para nuevo administrador');
        
        setFormData({
          email: '',
          password: '',
          full_name: '',
          salary: '',
          role: 'club_admin',
          status: 'active',
          selectedClubs: []
        });
        setPasswordGenerated(false);
      }
      
      // Limpiar validaciones
      setRealtimeValidation({});
    }
  }, [open, editingAdmin]);

  // Efecto para resetear estado de envío cuando se cierra el diálogo
  useEffect(() => {
    if (!open) {
      log.debug(COMPONENT_NAME, 'reset-submitting', 'Reseteando estado isSubmitting a false');
      setIsSubmitting(false);
    }
  }, [open]);

  // ================================================================================================
  // FUNCIONES AUXILIARES
  // ================================================================================================

  // Función para cargar clubs asignados a un admin
  const loadAdminClubs = async (adminId: string) => {
    try {
      log.debug(COMPONENT_NAME, 'load-admin-clubs', 'Cargando clubs asignados', { adminId });
      
      const result = await secureQuery(
        'administrador_clubs', 
        'select', 
        undefined, 
        { administrador_id: adminId, is_active: true }
      );

      log.debug(COMPONENT_NAME, 'load-admin-clubs', 'Resultado de secureQuery', { result });

      if (result?.error) {
        log.error(COMPONENT_NAME, 'load-admin-clubs', 'Error en secureQuery', { error: result.error });
        return;
      }

      if (result?.data) {
        const clubIds = result.data.map((item: any) => item.club_id);
        log.success(COMPONENT_NAME, 'load-admin-clubs', 'Clubs cargados exitosamente', { 
          count: clubIds.length, 
          clubIds,
          data: result.data 
        });
        
        setFormData(prev => {
          const newFormData = {
            ...prev,
            selectedClubs: clubIds
          };
          log.debug(COMPONENT_NAME, 'load-admin-clubs', 'FormData actualizado', { newFormData });
          return newFormData;
        });
      } else {
        log.warn(COMPONENT_NAME, 'load-admin-clubs', 'No se encontraron clubs para este administrador');
        setFormData(prev => ({ ...prev, selectedClubs: [] }));
      }
    } catch (error) {
      log.error(COMPONENT_NAME, 'load-admin-clubs', 'Error al cargar clubs', { error });
    }
  };

  // Función para validar campo en tiempo real
  const validateFieldRealtime = (field: string, value: string): string => {
    switch (field) {
      case 'email':
        if (!value) return 'El email es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
        return '';
      
      case 'password':
        if (!editingAdmin && !value) return 'La contraseña es obligatoria';
        if (value && value.length < 8) return 'Mínimo 8 caracteres';
        return '';
      
      case 'full_name':
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.trim().length < 2) return 'Mínimo 2 caracteres';
        return '';
      
      case 'salary':
        if (value && isNaN(Number(value))) return 'Debe ser un número válido';
        if (value && Number(value) < 0) return 'No puede ser negativo';
        if (value && Number(value) > 9999999999999) return 'Salario demasiado alto (máximo: 9,999,999,999,999)';
        return '';
      
      default:
        return '';
    }
  };

  // Función para generar contraseña temporal
  const handleGeneratePassword = () => {
    const newPassword = generateTempPassword();
    log.info(COMPONENT_NAME, 'generate-password', 'Contraseña temporal generada');
    
    setFormData(prev => ({ ...prev, password: newPassword }));
    setPasswordGenerated(true);
    setShowPassword(true);
    
    // Validar el nuevo campo
    const error = validateFieldRealtime('password', newPassword);
    setRealtimeValidation(prev => ({ ...prev, password: error }));
  };

  // ================================================================================================
  // HANDLERS DE EVENTOS
  // ================================================================================================

  // Handler para cambios en campos del formulario
  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    log.debug(COMPONENT_NAME, 'field-change', `Campo ${field} cambiado`, { value: field === 'password' ? '[OCULTO]' : value });
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validación en tiempo real
    const error = validateFieldRealtime(field, value);
    setRealtimeValidation(prev => ({ ...prev, [field]: error }));
    
    // Si cambió la contraseña manualmente, marcar como no generada
    if (field === 'password') {
      setPasswordGenerated(false);
    }
  };

  // Handler para selección de clubs
  const handleClubToggle = (clubId: string) => {
    setFormData(prev => {
      const newSelectedClubs = prev.selectedClubs.includes(clubId)
        ? prev.selectedClubs.filter(id => id !== clubId)
        : [...prev.selectedClubs, clubId];
      
      log.debug(COMPONENT_NAME, 'club-toggle', 'Club seleccionado/deseleccionado', { 
        clubId, 
        totalSelected: newSelectedClubs.length 
      });
      
      return { ...prev, selectedClubs: newSelectedClubs };
    });
  };

  // Handler para cerrar el diálogo
  const handleClose = () => {
    log.info(COMPONENT_NAME, 'close-dialog', 'Cerrando diálogo');
    setIsSubmitting(false);
    onClose();
  };

  // ================================================================================================
  // FUNCIÓN PRINCIPAL DE GUARDADO
  // ================================================================================================

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      log.info(COMPONENT_NAME, 'save-start', editingAdmin ? 'Iniciando actualización' : 'Iniciando creación');

      // Validación final
      const errors: string[] = [];
      
      if (!formData.email.trim()) errors.push('Email es obligatorio');
      if (!formData.full_name.trim()) errors.push('Nombre es obligatorio');
      if (!editingAdmin && !formData.password.trim()) errors.push('Contraseña es obligatoria');
      if (formData.password && formData.password.length < 8) errors.push('Contraseña debe tener al menos 8 caracteres');
      if (formData.salary && Number(formData.salary) > 9999999999999) errors.push('Salario demasiado alto');
      if (formData.salary && isNaN(Number(formData.salary))) errors.push('Salario debe ser un número válido');

      if (errors.length > 0) {
        log.warn(COMPONENT_NAME, 'validation-failed', 'Errores de validación', { errors });
        toast({
          title: "Error de validación",
          description: errors.join(', '),
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (editingAdmin) {
        await handleUpdateAdmin();
      } else {
        await handleCreateAdmin();
      }

    } catch (error) {
      log.error(COMPONENT_NAME, 'save-error', 'Error en guardado', { error });
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Por favor intente nuevamente.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  // ================================================================================================
  // CREAR NUEVO ADMINISTRADOR
  // ================================================================================================

  const handleCreateAdmin = async () => {
    log.info(COMPONENT_NAME, 'create-admin', 'Creando nuevo administrador', {
      email: formData.email,
      role: formData.role,
      status: formData.status,
      clubsCount: formData.selectedClubs.length
    });

    // Insertar en tabla administradores
    const adminResult = await secureQuery('administradores', 'insert', {
      email: formData.email.trim(),
      password_hash: formData.password, // Se hashea automáticamente en el trigger
      full_name: formData.full_name.trim(),
      salary: formData.salary ? parseFloat(formData.salary) : null,
      role: formData.role,
      status: formData.status
    });

    if (adminResult?.error) {
      throw new Error(`Error al crear administrador: ${adminResult.error.message}`);
    }

    const newAdminId = adminResult.data?.[0]?.id;
    log.success(COMPONENT_NAME, 'create-admin', 'Administrador creado exitosamente', { adminId: newAdminId });

    // Asignar clubs si se seleccionaron
    if (formData.selectedClubs.length > 0) {
      await handleUpdateAdminClubs(newAdminId);
    }

    toast({
      title: "Administrador creado",
      description: `El administrador ${formData.full_name} ha sido creado exitosamente.`
    });

    log.info(COMPONENT_NAME, 'create-complete', 'Creación completada exitosamente');
    onSuccess();
    handleClose();
    setIsSubmitting(false);
  };

  // ================================================================================================
  // ACTUALIZAR ADMINISTRADOR EXISTENTE
  // ================================================================================================

  const handleUpdateAdmin = async () => {
    log.info(COMPONENT_NAME, 'update-admin', 'Iniciando actualización de administrador', { 
      adminId: editingAdmin.id,
      editingAdmin: editingAdmin,
      formData: formData 
    });

    if (!editingAdmin || !editingAdmin.id) {
      log.error(COMPONENT_NAME, 'update-admin', 'No hay administrador para editar', { editingAdmin });
      throw new Error('No hay administrador seleccionado para editar');
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
      log.info(COMPONENT_NAME, 'update-email', 'Email cambiado', { 
        oldEmail: editingAdmin.email, 
        newEmail: formData.email 
      });
    }

    // Solo actualizar contraseña si se proporcionó una nueva
    if (formData.password.trim()) {
      updateData.password_hash = formData.password; // Se hashea automáticamente
      log.info(COMPONENT_NAME, 'update-password', 'Actualizando contraseña');
    }

    log.info(COMPONENT_NAME, 'update-admin', 'Datos a actualizar', { updateData, conditions: { id: editingAdmin.id } });

    const result = await secureQuery('administradores', 'update', updateData, { id: editingAdmin.id });

    log.info(COMPONENT_NAME, 'update-admin', 'Resultado de secureQuery', { result });

    if (result?.error) {
      log.error(COMPONENT_NAME, 'update-admin', 'Error en secureQuery', { error: result.error });
      throw new Error(`Error al actualizar administrador: ${result.error.message}`);
    }

    log.success(COMPONENT_NAME, 'update-admin', 'Administrador actualizado exitosamente en BD');

    // Actualizar clubs asignados
    await handleUpdateAdminClubs(editingAdmin.id);

    toast({
      title: "Administrador actualizado",
      description: `Los datos de ${formData.full_name} han sido actualizados.`
    });

    log.info(COMPONENT_NAME, 'update-complete', 'Actualización completada exitosamente');
    onSuccess();
    handleClose();
    setIsSubmitting(false);
  };

  // ================================================================================================
  // GESTIÓN DE CLUBS ASIGNADOS
  // ================================================================================================

  const handleUpdateAdminClubs = async (adminId: string) => {
    log.info(COMPONENT_NAME, 'update-admin-clubs', 'Actualizando clubs asignados', {
      adminId,
      selectedClubs: formData.selectedClubs
    });

    try {
      // 1. Eliminar TODAS las relaciones existentes para empezar limpio
      log.debug(COMPONENT_NAME, 'update-admin-clubs', 'Eliminando relaciones existentes');
      const deleteResult = await secureQuery(
        'administrador_clubs', 
        'delete', 
        undefined, 
        { administrador_id: adminId }
      );

      if (deleteResult?.error) {
        log.warn(COMPONENT_NAME, 'update-admin-clubs', 'Advertencia al eliminar relaciones', { error: deleteResult.error });
        // No fallar por esto, continuar
      } else {
        log.debug(COMPONENT_NAME, 'update-admin-clubs', 'Relaciones existentes eliminadas exitosamente');
      }

      // 2. Crear nuevas relaciones solo si hay clubs seleccionados
      if (formData.selectedClubs.length > 0) {
        const clubRelations = formData.selectedClubs.map(clubId => ({
          administrador_id: adminId,
          club_id: clubId,
          is_active: true,
          role: 'manager',
          start_date: new Date().toISOString().split('T')[0] // Solo la fecha
        }));

        log.debug(COMPONENT_NAME, 'update-admin-clubs', 'Creando nuevas relaciones', { clubRelations });

        const insertResult = await secureQuery('administrador_clubs', 'insert', clubRelations);

        if (insertResult?.error) {
          log.error(COMPONENT_NAME, 'update-admin-clubs', 'Error al insertar relaciones', { error: insertResult.error });
          throw new Error(`Error al asignar clubs: ${insertResult.error.message}`);
        }

        log.success(COMPONENT_NAME, 'update-admin-clubs', 'Clubs asignados exitosamente', { 
          count: formData.selectedClubs.length,
          result: insertResult
        });
      } else {
        log.info(COMPONENT_NAME, 'update-admin-clubs', 'No hay clubs para asignar - todas las relaciones eliminadas');
      }

    } catch (error) {
      log.error(COMPONENT_NAME, 'update-admin-clubs', 'Error en actualización de clubs', { error });
      throw error;
    }
  };

  // ================================================================================================
  // RENDER DEL COMPONENTE
  // ================================================================================================

  // Calcular si el formulario es válido
  const isFormValid = formData.email.trim() && formData.full_name.trim() && 
                     (editingAdmin || formData.password.trim()) &&
                     !Object.values(realtimeValidation).some(error => error);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingAdmin ? <User className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
            {editingAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Información Básica
              </h3>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@empresa.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={realtimeValidation.email ? 'border-red-500' : ''}
                />
                {realtimeValidation.email && (
                  <p className="text-sm text-red-500">{realtimeValidation.email}</p>
                )}
              </div>

              {/* Nombre completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  placeholder="Juan Pérez"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className={realtimeValidation.full_name ? 'border-red-500' : ''}
                />
                {realtimeValidation.full_name && (
                  <p className="text-sm text-red-500">{realtimeValidation.full_name}</p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {editingAdmin ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={editingAdmin ? "Dejar vacío para no cambiar" : "Mínimo 8 caracteres"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={realtimeValidation.password ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                  >
                    Generar
                  </Button>
                </div>
                {realtimeValidation.password && (
                  <p className="text-sm text-red-500">{realtimeValidation.password}</p>
                )}
                {formData.password && (
                  <PasswordStrength password={formData.password} />
                )}
                {passwordGenerated && (
                  <Alert>
                    <AlertDescription>
                      Contraseña temporal generada. Por favor, cópiela y compártala de forma segura.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información laboral */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Información Laboral
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Salario */}
                <div className="space-y-2">
                  <Label htmlFor="salary">Salario Mensual</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="0.00"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    className={realtimeValidation.salary ? 'border-red-500' : ''}
                  />
                  {realtimeValidation.salary && (
                    <p className="text-sm text-red-500">{realtimeValidation.salary}</p>
                  )}
                </div>

                {/* Rol */}
                <div className="space-y-2">
                  <Label>Rol del Sistema</Label>
                  <Select value={formData.role} onValueChange={(value: any) => handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="club_admin">Administrador de Club</SelectItem>
                      <SelectItem value="super_admin">Super Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Estado de la Cuenta</Label>
                  <p className="text-sm text-muted-foreground">
                    Controla si el administrador puede iniciar sesión y realizar operaciones
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={formData.status === 'active' ? 'default' : 'secondary'}>
                    {formData.status === 'active' ? 'Habilitado' : 'Deshabilitado'}
                  </Badge>
                  <Switch
                    checked={formData.status === 'active'}
                    onCheckedChange={(checked) => handleInputChange('status', checked ? 'active' : 'inactive')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clubs asignados */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Clubs Asignados</h3>
              
              {clubs.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No hay clubs disponibles. Cree clubs primero en la pestaña "Clubs".
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {clubs.map((club) => (
                    <div
                      key={club.id}
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.selectedClubs.includes(club.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleClubToggle(club.id)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedClubs.includes(club.id)}
                        onChange={() => handleClubToggle(club.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{club.name}</p>
                        <p className="text-sm text-muted-foreground">{club.slug}</p>
                      </div>
                      <Badge variant={club.status === 'active' ? 'default' : 'secondary'}>
                        {club.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {formData.selectedClubs.length > 0 && (
                <Alert>
                  <AlertDescription>
                    Clubs seleccionados: {formData.selectedClubs.length}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
              disabled={!isFormValid || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                editingAdmin ? 'Actualizar' : 'Crear Administrador'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminFormSimple;
