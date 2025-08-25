// ================================================================================================
// FORMULARIO DE ADMINISTRADORES - VERSIÓN SEGURA CON MANEJO DE ERRORES
// ================================================================================================
// Esta versión incluye manejo robusto de errores y logging detallado para debuggear problemas
// ================================================================================================

import React, { useState, useEffect } from 'react';

// Componentes de UI base
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';


// Logging y contexto
import { log } from '@/shared/utils/logger';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// ================================================================================================
// INTERFACES
// ================================================================================================

interface AdminFormSafeProps {
  open: boolean;
  editingAdmin: any | null;
  clubs: any[];
  onClose: () => void;
  onSuccess: () => void;
}

// ================================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================================

const AdminFormSafe: React.FC<AdminFormSafeProps> = ({
  open,
  editingAdmin,
  clubs,
  onClose,
  onSuccess
}) => {
  
  // ============================================================================================
  // HOOKS
  // ============================================================================================
  
  // Hook de autenticación para operaciones de base de datos
  const { secureQuery } = useAuth();
  
  // Hook para mostrar notificaciones
  const { toast } = useToast();
  
  // ============================================================================================
  // ESTADO LOCAL SIMPLE
  // ============================================================================================
  
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    salary: '',
    role: 'club_admin' as 'club_admin' | 'super_admin',
    status: 'active' as 'active' | 'inactive',
    selectedClubs: [] as string[]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================================
  // MANEJO DE ERRORES GLOBAL
  // ============================================================================================
  
  const handleError = (error: any, context: string) => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    log.error('AdminForm-Safe', 'error-handler', `Error en ${context}`, { message: errorMessage });
    setError(`Error en ${context}: ${errorMessage}`);
    setLoading(false);
  };

  // ============================================================================================
  // EFECTOS
  // ============================================================================================
  
  useEffect(() => {
    try {
      log.info('AdminForm-Safe', 'dialog-state-change', 'Estado del diálogo cambió', {
        open,
        isEditing: !!editingAdmin,
        adminId: editingAdmin?.id || 'nuevo'
      });

      if (open && editingAdmin) {
        log.info('AdminForm-Safe', 'load-edit-data', 'Cargando datos para edición', {
          adminId: editingAdmin.id,
          email: editingAdmin.email,
          full_name: editingAdmin.full_name,
          salary: editingAdmin.salary,
          role: editingAdmin.role,
          status: editingAdmin.status,
          rawAdmin: editingAdmin
        });
        
        const newFormData = {
          email: editingAdmin.email || '',
          full_name: editingAdmin.full_name || '',
          password: '',
          salary: editingAdmin.salary?.toString() || '',
          role: editingAdmin.role || 'club_admin',
          status: editingAdmin.status || 'active',
          selectedClubs: editingAdmin.clubs?.map((club: any) => club.id) || []
        };
        
        log.debug('AdminForm-Safe', 'form-data-prepared', 'Datos del formulario preparados', {
          newFormData
        });
        
        setFormData(newFormData);
      } else if (open && !editingAdmin) {
        log.info('AdminForm-Safe', 'new-admin-mode', 'Modo crear nuevo administrador');
        setFormData({
          email: '',
          full_name: '',
          password: '',
          salary: '',
          role: 'club_admin',
          status: 'active',
          selectedClubs: []
        });
      }
      
      // Limpiar errores al abrir
      if (open) {
        setError(null);
      }
      
    } catch (error) {
      handleError(error, 'useEffect');
    }
  }, [open, editingAdmin]);

  // ============================================================================================
  // HANDLERS
  // ============================================================================================
  
  const handleInputChange = (field: string, value: string | string[]) => {
    try {
      log.debug('AdminForm-Safe', 'input-change', `Campo ${field} cambió`, { field, value });
      setFormData(prev => ({ ...prev, [field]: value }));
      setError(null); // Limpiar errores al hacer cambios
    } catch (error) {
      handleError(error, 'handleInputChange');
    }
  };

  const handleClubToggle = (clubId: string) => {
    try {
      log.debug('AdminForm-Safe', 'club-toggle', 'Toggling club', { clubId });
      
      setFormData(prev => {
        const isCurrentlySelected = prev.selectedClubs.includes(clubId);
        const newSelectedClubs = isCurrentlySelected
          ? prev.selectedClubs.filter(id => id !== clubId)
          : [...prev.selectedClubs, clubId];
        
        log.debug('AdminForm-Safe', 'club-toggle', 'Clubs actualizados', {
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
      handleError(error, 'handleClubToggle');
    }
  };

  const handleClose = () => {
    try {
      log.info('AdminForm-Safe', 'close', 'Cerrando formulario');
      setError(null);
      setLoading(false);
      onClose();
    } catch (error) {
      handleError(error, 'handleClose');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      log.info('AdminForm-Safe', 'save-start', 'Iniciando guardado', {
        isEditing: !!editingAdmin,
        formData: { ...formData, password: '[OCULTO]' }
      });

      // Validaciones básicas
      if (!formData.email.trim()) {
        throw new Error('Email es obligatorio');
      }
      if (!formData.full_name.trim()) {
        throw new Error('Nombre es obligatorio');
      }
      if (!editingAdmin && !formData.password.trim()) {
        throw new Error('Contraseña es obligatoria para nuevos administradores');
      }

      // ============================================================================================
      // GUARDADO REAL EN LA BASE DE DATOS
      // ============================================================================================
      
      if (editingAdmin) {
        // MODO EDICIÓN: Actualizar administrador existente
        await handleUpdateAdmin();
      } else {
        // MODO CREACIÓN: Crear nuevo administrador
        await handleCreateAdmin();
      }
      
      log.success('AdminForm-Safe', 'save-success', 'Guardado exitoso');
      
      // Mostrar notificación de éxito
      toast({
        title: "Éxito",
        description: editingAdmin ? 
          "Administrador actualizado correctamente" : 
          "Administrador creado correctamente"
      });
      
      // Recargar datos y cerrar formulario
      onSuccess();
      handleClose();
      
    } catch (error) {
      handleError(error, 'handleSave');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================================
  // FUNCIÓN PARA CREAR NUEVO ADMINISTRADOR
  // ============================================================================================
  
  const handleCreateAdmin = async () => {
    log.info('AdminForm-Safe', 'create-admin', 'Creando nuevo administrador');
    
    const adminData = {
      email: formData.email.trim(),
      password_hash: formData.password, // Se hashea automáticamente en la BD
      full_name: formData.full_name.trim(),
      salary: formData.salary ? parseFloat(formData.salary) : null,
      role: formData.role,
      status: formData.status
    };
    
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
    
    log.success('AdminForm-Safe', 'create-admin', 'Administrador creado exitosamente');
  };

  // ============================================================================================
  // FUNCIÓN PARA ACTUALIZAR ADMINISTRADOR EXISTENTE
  // ============================================================================================
  
  const handleUpdateAdmin = async () => {
    log.info('AdminForm-Safe', 'update-admin', 'Actualizando administrador existente', {
      adminId: editingAdmin.id
    });
    
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
    }
    
    // Solo actualizar contraseña si se proporcionó una nueva
    if (formData.password.trim()) {
      updateData.password_hash = formData.password;
    }
    
    log.debug('AdminForm-Safe', 'update-admin', 'Datos a actualizar', {
      updateData: { ...updateData, password_hash: updateData.password_hash ? '[OCULTO]' : undefined },
      adminId: editingAdmin.id
    });
    
    const result = await secureQuery('administradores', 'update', updateData, { id: editingAdmin.id });
    
    if (result?.error) {
      log.error('AdminForm-Safe', 'update-admin', 'Error en actualización', { message: result.error.message });
      throw new Error(`Error al actualizar administrador: ${result.error.message}`);
    }
    
    // Actualizar clubs asignados
    await handleAssignClubs(editingAdmin.id);
    
    log.success('AdminForm-Safe', 'update-admin', 'Administrador actualizado exitosamente');
  };

  // ============================================================================================
  // FUNCIÓN PARA ASIGNAR CLUBS
  // ============================================================================================
  
  const handleAssignClubs = async (adminId: string) => {
    try {
      log.info('AdminForm-Safe', 'assign-clubs', 'Asignando clubs', {
        adminId,
        selectedClubs: formData.selectedClubs
      });

      // 1. Eliminar todas las relaciones existentes
      const deleteResult = await secureQuery(
        'administrador_clubs',
        'delete',
        undefined,
        { administrador_id: adminId }
      );

      if (deleteResult?.error) {
        log.warn('AdminForm-Safe', 'assign-clubs', 'Advertencia al eliminar relaciones', { 
          error: deleteResult.error 
        });
      }

      // 2. Crear nuevas relaciones
      if (formData.selectedClubs.length > 0) {
        const clubRelations = formData.selectedClubs.map(clubId => ({
          administrador_id: adminId,
          club_id: clubId,
          is_active: true,
          role: 'manager',
          start_date: new Date().toISOString().split('T')[0]
        }));

        const insertResult = await secureQuery('administrador_clubs', 'insert', clubRelations);

        if (insertResult?.error) {
          throw new Error(`Error al asignar clubs: ${insertResult.error.message}`);
        }

        log.success('AdminForm-Safe', 'assign-clubs', 'Clubs asignados exitosamente', {
          count: formData.selectedClubs.length
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      log.error('AdminForm-Safe', 'assign-clubs', 'Error en asignación de clubs', { message: errorMessage });
      throw error;
    }
  };

  // ============================================================================================
  // RENDER CON MANEJO DE ERRORES
  // ============================================================================================
  
  try {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
          
          {/* Header Simple */}
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              {editingAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}
            </DialogTitle>
          </DialogHeader>

          {/* Contenido del formulario */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            
            {/* Mostrar errores si existen */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              
              {/* Información Personal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@empresa.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre Completo *</Label>
                      <Input
                        id="fullName"
                        placeholder="Juan Pérez"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">
                        {editingAdmin ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder={editingAdmin ? "Dejar vacío para no cambiar" : "Mínimo 8 caracteres"}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary">Salario Mensual</Label>
                      <Input
                        id="salary"
                        type="number"
                        placeholder="0.00"
                        value={formData.salary}
                        onChange={(e) => handleInputChange('salary', e.target.value)}
                      />
                    </div>
                    
                  </div>
                </CardContent>
              </Card>

              {/* Configuración */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configuración</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="space-y-2">
                      <Label>Rol del Sistema</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(value) => handleInputChange('role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="club_admin">Admin de Club</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Estado de la Cuenta</Label>
                      <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md">
                        <Switch
                          checked={formData.status === 'active'}
                          onCheckedChange={(checked) => handleInputChange('status', checked ? 'active' : 'inactive')}
                        />
                        <span className="text-sm">
                          {formData.status === 'active' ? 'Habilitado' : 'Deshabilitado'}
                        </span>
                      </div>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>

              {/* Clubs Asignados */}
              {clubs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Clubs Asignados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {clubs.map((club) => (
                        <div key={club.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                          <Checkbox
                            checked={formData.selectedClubs.includes(club.id)}
                            onCheckedChange={() => handleClubToggle(club.id)}
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
                      
                      {formData.selectedClubs.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground">
                            {formData.selectedClubs.length} club(s) seleccionado(s)
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>

          {/* Footer con botones */}
          <div className="px-6 py-4 border-t bg-muted/50">
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              
              <Button 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Guardando...' : (editingAdmin ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </div>

        </DialogContent>
      </Dialog>
    );
    
  } catch (error) {
    // Error en el render
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    log.error('AdminForm-Safe', 'render-error', 'Error en el render del componente', { message: errorMessage });
    
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <Alert variant="destructive">
            <AlertDescription>
              Error al cargar el formulario. Ver consola para detalles.
            </AlertDescription>
          </Alert>
          <Button onClick={handleClose}>Cerrar</Button>
        </DialogContent>
      </Dialog>
    );
  }
};

export default AdminFormSafe;
