// ================================================================================================
// FORMULARIO DE ADMINISTRADORES - COMPONENTE COMPLETO PARA CRUD
// ================================================================================================
// Este formulario permite crear y editar administradores del sistema:
// - Crear nuevos usuarios con email y contraseña
// - Editar información de administradores existentes
// - Asignar/desasignar clubs a administradores
// - Configurar roles (Super Admin vs Admin de Club)
// - Gestión completa de perfiles de usuario
// ================================================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { Profile, Club } from '@/types/database';

// Importaciones de componentes UI de Shadcn
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
import { Textarea } from '@/components/ui/textarea';
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
// TIPOS E INTERFACES
// ================================================================================================

// Datos del formulario de administrador
interface AdminFormData {
  // Información básica del usuario
  email: string;                    // Email (obligatorio, único)
  password: string;                 // Contraseña (solo para nuevos usuarios)
  confirmPassword: string;          // Confirmación de contraseña
  full_name: string;               // Nombre completo
  phone: string;                   // Teléfono de contacto
  
  // Configuración de roles y permisos
  role: 'super_admin' | 'club_admin'; // Rol del usuario
  is_super_admin: boolean;         // Flag de super administrador
  
  // Clubs asignados
  assigned_clubs: string[];        // IDs de clubs asignados
  
  // Metadatos
  preferences: Record<string, any>; // Preferencias del usuario
}

// Props del componente
interface AdminFormProps {
  open: boolean;                    // Controla si el diálogo está abierto
  editingAdmin: any | null;        // Admin a editar (null para nuevo admin)
  clubs: Club[];                   // Lista de clubs disponibles
  onClose: () => void;             // Callback cuando se cierra el diálogo
  onSuccess: () => void;           // Callback cuando la operación es exitosa
}

// ================================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================================

const AdminForm: React.FC<AdminFormProps> = ({
  open,
  editingAdmin,
  clubs,
  onClose,
  onSuccess
}) => {
  // ============================================================================================
  // HOOKS Y ESTADO
  // ============================================================================================
  
  // Hook de autenticación para acceder a secureQuery
  const { secureQuery } = useAuth();
  
  // Hook para mostrar notificaciones
  const { toast } = useToast();
  
  // Estado del formulario con valores por defecto
  const [formData, setFormData] = useState<AdminFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    role: 'club_admin',
    is_super_admin: false,
    assigned_clubs: [],
    preferences: {}
  });
  
  // Estados de control del componente
  const [isSubmitting, setIsSubmitting] = useState(false);      // Control del botón de envío
  const [formErrors, setFormErrors] = useState<Partial<AdminFormData>>({}); // Errores de validación
  const [showPassword, setShowPassword] = useState(false);      // Mostrar campos de contraseña

  // ============================================================================================
  // FUNCIONES AUXILIARES
  // ============================================================================================
  
  // Función para generar contraseña temporal
  const generateTempPassword = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Función para generar UUID v4
  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // ============================================================================================
  // EFFECT PARA INICIALIZAR FORMULARIO
  // ============================================================================================
  
  // Effect para cargar datos cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      console.log(`📝 Formulario de admin abierto. Editing: ${editingAdmin?.id || 'NUEVO'}`);
      
      if (editingAdmin) {
        // Modo edición: cargar datos del administrador existente
        setFormData({
          email: editingAdmin.email || '',
          password: '',                    // No mostramos contraseña existente
          confirmPassword: '',
          full_name: editingAdmin.full_name || '',
          phone: editingAdmin.phone || '',
          role: editingAdmin.role || 'club_admin',
          is_super_admin: editingAdmin.is_super_admin || false,
          assigned_clubs: editingAdmin.clubs?.map((club: Club) => club.id) || [],
          preferences: editingAdmin.preferences || {}
        });
        
        setShowPassword(false);          // No mostrar campos de contraseña en edición
        console.log(`✅ Datos del admin cargados: ${editingAdmin.email}`);
        
      } else {
        // Modo creación: formulario vacío con contraseña temporal
        const tempPassword = generateTempPassword();
        setFormData({
          email: '',
          password: tempPassword,
          confirmPassword: tempPassword,
          full_name: '',
          phone: '',
          role: 'club_admin',
          is_super_admin: false,
          assigned_clubs: [],
          preferences: {}
        });
        
        setShowPassword(true);           // Mostrar campos de contraseña en creación
        console.log(`✅ Formulario resetado para nuevo admin con contraseña temporal`);
      }
      
      // Resetear estados de control
      setIsSubmitting(false);
      setFormErrors({});
    }
  }, [open, editingAdmin]);

  // ============================================================================================
  // FUNCIONES DE MANEJO DE FORMULARIO
  // ============================================================================================
  
  // Manejar cambios en campos simples del formulario
  const handleFieldChange = (field: keyof AdminFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo si existe
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
    
    // Sincronizar is_super_admin con role
    if (field === 'role') {
      setFormData(prev => ({
        ...prev,
        is_super_admin: value === 'super_admin'
      }));
    }
    
    if (field === 'is_super_admin') {
      setFormData(prev => ({
        ...prev,
        role: value ? 'super_admin' : 'club_admin'
      }));
    }
  };
  
  // Manejar selección/deselección de clubs
  const handleClubToggle = (clubId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_clubs: prev.assigned_clubs.includes(clubId)
        ? prev.assigned_clubs.filter(id => id !== clubId)  // Quitar club
        : [...prev.assigned_clubs, clubId]                 // Agregar club
    }));
  };
  
  // Quitar club específico
  const handleRemoveClub = (clubId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_clubs: prev.assigned_clubs.filter(id => id !== clubId)
    }));
  };

  // ============================================================================================
  // VALIDACIÓN DEL FORMULARIO
  // ============================================================================================
  
  // Función para validar todos los campos antes del envío
  const validateForm = (): boolean => {
    const errors: Partial<AdminFormData> = {};
    
    // Validar email (obligatorio y formato)
    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Formato de email inválido';
    }
    
    // Validar contraseña (solo para nuevos usuarios)
    if (!editingAdmin) {
      if (!formData.password.trim()) {
        errors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }
    
    // Validar nombre completo (opcional pero recomendado)
    if (!formData.full_name.trim()) {
      // No es error, pero podemos mostrar advertencia
      console.log('⚠️ Recomendado: agregar nombre completo del administrador');
    }
    
    // Validar teléfono (formato si se proporciona)
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Formato de teléfono inválido';
    }
    
    // Actualizar errores y retornar validez
    setFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    
    console.log(`📋 Validación: ${isValid ? 'EXITOSA' : 'FALLIDA'}`, errors);
    return isValid;
  };

  // ============================================================================================
  // FUNCIÓN PRINCIPAL DE GUARDADO
  // ============================================================================================
  
  // Función para guardar/actualizar administrador
  const handleSave = async () => {
    console.log(`💾 Iniciando guardado de administrador...`);
    console.log(`📊 Datos del formulario:`, formData);
    console.log(`📝 Es edición: ${!!editingAdmin}`);
    
    // 1. VALIDAR FORMULARIO
    if (!validateForm()) {
      console.log(`❌ Validación fallida, cancelando guardado`);
      return;
    }
    
    // 2. MARCAR COMO ENVIANDO
    setIsSubmitting(true);
    
    try {
      if (editingAdmin) {
        // =================== MODO EDICIÓN ===================
        await handleUpdateAdmin();
      } else {
        // =================== MODO CREACIÓN ===================
        await handleCreateAdmin();
      }
      
      // 3. ÉXITO - CERRAR FORMULARIO Y RECARGAR DATOS
      console.log(`✅ Operación exitosa`);
      setTimeout(() => {
        onSuccess();  // Recargar lista de administradores
        onClose();    // Cerrar diálogo
      }, 100);
      
    } catch (error) {
      console.error('💥 Error en handleSave:', error);
      
      // Mostrar notificación de error
      toast({
        title: "❌ Error",
        description: `Error al ${editingAdmin ? 'actualizar' : 'crear'} administrador: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función específica para crear nuevo administrador
  const handleCreateAdmin = async () => {
    console.log(`🆕 Creando nuevo administrador: ${formData.email}`);
    
    try {
      // 1. GENERAR UUID PARA EL NUEVO USUARIO
      const newUserId = generateUUID();
      console.log(`📋 ID generado para nuevo usuario: ${newUserId}`);
      
      // 2. PREPARAR DATOS DEL PERFIL CON ID ESPECÍFICO
      const profileData = {
        id: newUserId,  // UUID generado manualmente
        email: formData.email.trim(),
        full_name: formData.full_name.trim() || null,
        phone: formData.phone.trim() || null,
        role: formData.role,
        is_super_admin: formData.is_super_admin,
        preferences: formData.preferences,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log(`📤 Datos del perfil a crear:`, profileData);
      
      // 3. CREAR PERFIL EN BASE DE DATOS
      const { data: profileResult, error: profileError } = await secureQuery<Profile>(
        'profiles',
        'insert',
        profileData
      );
      
      if (profileError) {
        throw new Error(profileError.message || 'Error al crear perfil de administrador');
      }
      
      if (!profileResult || profileResult.length === 0) {
        throw new Error('No se recibió respuesta del servidor al crear perfil');
      }
      
      const newProfile = profileResult[0];
      console.log(`✅ Perfil creado con ID: ${newProfile.id}`);
      
      // 4. CREAR RELACIONES CON CLUBS
      if (formData.assigned_clubs.length > 0) {
        await handleUpdateUserClubs(newProfile.id);
      }
      
      console.log(`✅ Administrador creado exitosamente: ${formData.email}`);
      
      // 5. MOSTRAR NOTIFICACIÓN DE ÉXITO
      toast({
        title: "✅ Administrador creado",
        description: `${formData.email} ha sido creado exitosamente.`,
        variant: "success",
      });
      
      // 6. MOSTRAR INFO DE CONTRASEÑA TEMPORAL
      setTimeout(() => {
        toast({
          title: "🔑 Contraseña temporal",
          description: `Contraseña: ${formData.password} - El usuario debe cambiarla en el primer login.`,
          variant: "warning",
        });
      }, 1000);
      
    } catch (error) {
      console.error('💥 Error en handleCreateAdmin:', error);
      throw error; // Re-lanzar para que se maneje en handleSave
    }
  };
  
  // Función específica para actualizar administrador existente
  const handleUpdateAdmin = async () => {
    console.log(`✏️ Actualizando administrador: ${editingAdmin.email}`);
    
    // 1. PREPARAR DATOS DE ACTUALIZACIÓN
    const updateData = {
      full_name: formData.full_name.trim() || null,
      phone: formData.phone.trim() || null,
      role: formData.role,
      is_super_admin: formData.is_super_admin,
      preferences: formData.preferences,
      updated_at: new Date().toISOString()
    };
    
    console.log(`📤 Datos de actualización:`, updateData);
    
    // 2. ACTUALIZAR PERFIL EN BASE DE DATOS
    const { error: updateError } = await secureQuery(
      'profiles',
      'update',
      updateData,
      { id: editingAdmin.id }
    );
    
    if (updateError) {
      throw new Error(updateError.message || 'Error al actualizar perfil');
    }
    
    console.log(`✅ Perfil actualizado: ${editingAdmin.id}`);
    
    // 3. ACTUALIZAR RELACIONES CON CLUBS
    await handleUpdateUserClubs(editingAdmin.id);
    
    console.log(`✅ Administrador actualizado exitosamente: ${editingAdmin.email}`);
    
    // Mostrar notificación de éxito
    toast({
      title: "✅ Administrador actualizado",
      description: `${editingAdmin.email} ha sido actualizado exitosamente.`,
      variant: "success",
    });
  };
  
  // Función para manejar relaciones usuario-club
  const handleUpdateUserClubs = async (userId: string) => {
    console.log(`🏢 Actualizando clubs para usuario: ${userId}`);
    console.log(`📋 Clubs asignados: ${formData.assigned_clubs.length}`);
    
    // 1. ELIMINAR TODAS LAS RELACIONES EXISTENTES
    const { error: deleteError } = await secureQuery(
      'user_clubs',
      'delete',
      undefined,
      { user_id: userId }
    );
    
    if (deleteError) {
      console.error('⚠️ Error eliminando relaciones existentes:', deleteError);
      // No fallar por esto, continuar
    }
    
    // 2. CREAR NUEVAS RELACIONES
    if (formData.assigned_clubs.length > 0) {
      const userClubsData = formData.assigned_clubs.map(clubId => ({
        user_id: userId,
        club_id: clubId,
        role: 'manager',  // Rol por defecto en el club
        is_active: true,
        joined_at: new Date().toISOString()
      }));
      
      console.log(`📤 Creando ${userClubsData.length} relaciones usuario-club`);
      
      const { error: insertError } = await secureQuery(
        'user_clubs',
        'insert',
        userClubsData
      );
      
      if (insertError) {
        throw new Error(`Error al asignar clubs: ${insertError.message}`);
      }
      
      console.log(`✅ Clubs asignados exitosamente`);
    } else {
      console.log(`ℹ️ No hay clubs para asignar`);
    }
  };

  // ============================================================================================
  // FUNCIÓN PARA CERRAR FORMULARIO
  // ============================================================================================
  
  // Cerrar formulario y resetear estado
  const handleClose = () => {
    setIsSubmitting(false);
    setFormErrors({});
    onClose();
  };

  // ============================================================================================
  // FUNCIONES DE RENDERIZADO
  // ============================================================================================
  
  // Renderizar lista de clubs asignados como badges
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
        {/* Header del diálogo */}
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
        
        {/* Campos del formulario */}
        <div className="space-y-6">
          {/* Sección: Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="administrador@ejemplo.com"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                disabled={!!editingAdmin} // No editar email en modo edición
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
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
                className={formErrors.phone ? 'border-red-500' : ''}
              />
              {formErrors.phone && (
                <p className="text-sm text-red-500">{formErrors.phone}</p>
              )}
            </div>
          </div>
          
          {/* Sección: Contraseña (solo para nuevos usuarios) */}
          {showPassword && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contraseña</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  Se ha generado una contraseña temporal. El usuario deberá cambiarla en su primer login.
                </p>
              </div>
              
              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="text"
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className={formErrors.password ? 'border-red-500' : ''}
                />
                {formErrors.password && (
                  <p className="text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>
              
              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="text"
                  value={formData.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  className={formErrors.confirmPassword ? 'border-red-500' : ''}
                />
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Sección: Roles y permisos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Roles y Permisos</h3>
            
            {/* Toggle Super Admin */}
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
            
            {/* Selector de rol */}
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
          
          {/* Sección: Clubs asignados */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Clubs Asignados</h3>
            
            {/* Clubs actualmente asignados */}
            <div className="space-y-2">
              <Label>Clubs Actuales</Label>
              {renderAssignedClubs()}
            </div>
            
            {/* Lista de clubs disponibles */}
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

        {/* Botones de acción */}
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

export default AdminForm;
