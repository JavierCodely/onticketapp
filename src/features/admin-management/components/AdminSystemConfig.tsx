// ================================================================================================
// COMPONENTE DE CONFIGURACIÓN DEL SISTEMA PARA ADMINISTRADORES
// ================================================================================================
// Este componente maneja los campos de configuración del sistema del formulario de administradores:
// - Rol del sistema (club_admin | super_admin)
// - Estado de la cuenta (active | inactive)
// ================================================================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// ================================================================================================
// TIPOS E INTERFACES
// ================================================================================================

interface AdminSystemConfigProps {
  formData: {                      // Datos actuales del formulario
    role: 'club_admin' | 'super_admin';
    status: 'active' | 'inactive';
  };
  onInputChange: (field: string, value: string) => void; // Callback para cambios de campo
}

// ================================================================================================
// CONSTANTES
// ================================================================================================

// Opciones disponibles para el rol del sistema
const ROLE_OPTIONS = [
  {
    value: 'club_admin',
    label: 'Admin de Club',
    description: 'Gestiona uno o varios clubs específicos'
  },
  {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Acceso completo a todo el sistema'
  }
] as const;

// Estados disponibles para la cuenta
const STATUS_OPTIONS = [
  {
    value: 'active',
    label: 'Habilitado',
    description: 'Puede acceder y realizar todas sus funciones',
    color: 'text-green-600'
  },
  {
    value: 'inactive',
    label: 'Deshabilitado',
    description: 'No puede acceder al sistema ni realizar acciones',
    color: 'text-red-600'
  }
] as const;

// ================================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================================

const AdminSystemConfig: React.FC<AdminSystemConfigProps> = ({
  formData,
  onInputChange
}) => {
  
  // ============================================================================================
  // HANDLERS LOCALES
  // ============================================================================================
  
  /**
   * Maneja cambios en el rol del sistema
   * @param newRole - Nuevo rol seleccionado
   */
  const handleRoleChange = (newRole: string) => {
    // Validar que el rol sea válido
    if (newRole === 'club_admin' || newRole === 'super_admin') {
      onInputChange('role', newRole);
    }
  };

  /**
   * Maneja cambios en el estado de la cuenta mediante el switch
   * @param isActive - Si la cuenta debe estar activa
   */
  const handleStatusToggle = (isActive: boolean) => {
    const newStatus = isActive ? 'active' : 'inactive';
    onInputChange('status', newStatus);
  };

  // ============================================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================================
  
  /**
   * Obtiene la configuración del rol actual
   * @returns Configuración del rol o undefined si no se encuentra
   */
  const getCurrentRoleConfig = () => {
    return ROLE_OPTIONS.find(option => option.value === formData.role);
  };

  /**
   * Obtiene la configuración del estado actual
   * @returns Configuración del estado o undefined si no se encuentra
   */
  const getCurrentStatusConfig = () => {
    return STATUS_OPTIONS.find(option => option.value === formData.status);
  };

  /**
   * Determina si el usuario puede cambiar el rol
   * @returns true si se puede cambiar el rol
   */
  const canChangeRole = (): boolean => {
    // Aquí se pueden agregar lógicas de permisos más complejas
    // Por ejemplo, solo super_admin puede crear otros super_admin
    return true;
  };

  // ============================================================================================
  // RENDER
  // ============================================================================================
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Configuración del Sistema</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ========================================================================== */}
          {/* CAMPO: ROL DEL SISTEMA */}
          {/* ========================================================================== */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Rol del Sistema</Label>
            
            <Select 
              value={formData.role} 
              onValueChange={handleRoleChange}
              disabled={!canChangeRole()}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="flex flex-col items-start"
                  >
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Descripción del rol actual */}
            {getCurrentRoleConfig() && (
              <p className="text-xs text-muted-foreground">
                {getCurrentRoleConfig()?.description}
              </p>
            )}
            
            {/* Advertencia si no puede cambiar el rol */}
            {!canChangeRole() && (
              <p className="text-xs text-amber-600">
                No tienes permisos para cambiar el rol de este administrador
              </p>
            )}
          </div>

          {/* ========================================================================== */}
          {/* CAMPO: ESTADO DE LA CUENTA */}
          {/* ========================================================================== */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Estado de la Cuenta</Label>
            
            {/* Switch con información visual del estado */}
            <div className="p-4 border rounded-lg bg-card space-y-3">
              
              {/* Indicador visual del estado actual */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Círculo indicador de estado */}
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      formData.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`} 
                  />
                  
                  {/* Texto del estado actual */}
                  <span className={`text-sm font-medium ${getCurrentStatusConfig()?.color}`}>
                    {getCurrentStatusConfig()?.label}
                  </span>
                </div>
                
                {/* Switch para cambiar estado */}
                <Switch
                  checked={formData.status === 'active'}
                  onCheckedChange={handleStatusToggle}
                  aria-label="Estado de la cuenta"
                />
              </div>
              
              {/* Descripción del estado actual */}
              <p className="text-xs text-muted-foreground">
                {getCurrentStatusConfig()?.description}
              </p>
              
              {/* Advertencia para cuentas deshabilitadas */}
              {formData.status === 'inactive' && (
                <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-700 dark:text-red-300">
                    ⚠️ Esta cuenta no podrá acceder al sistema ni realizar ninguna acción
                  </p>
                </div>
              )}
            </div>
          </div>
          
        </div>
        
        {/* ========================================================================== */}
        {/* RESUMEN DE CONFIGURACIÓN */}
        {/* ========================================================================== */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Resumen de Configuración</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Tipo de usuario:</span>
              <span className="font-medium">{getCurrentRoleConfig()?.label}</span>
            </div>
            <div className="flex justify-between">
              <span>Estado de acceso:</span>
              <span className={`font-medium ${getCurrentStatusConfig()?.color}`}>
                {getCurrentStatusConfig()?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Puede acceder:</span>
              <span className={`font-medium ${
                formData.status === 'active' ? 'text-green-600' : 'text-red-600'
              }`}>
                {formData.status === 'active' ? 'Sí' : 'No'}
              </span>
            </div>
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
};

export default AdminSystemConfig;
