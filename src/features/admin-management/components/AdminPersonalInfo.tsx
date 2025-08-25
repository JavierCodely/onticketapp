// ================================================================================================
// COMPONENTE DE INFORMACIÓN PERSONAL DEL ADMINISTRADOR
// ================================================================================================
// Este componente maneja los campos de información personal del formulario de administradores:
// - Email (obligatorio)
// - Nombre completo (obligatorio) 
// - Contraseña (obligatoria en crear, opcional en editar)
// - Salario mensual (opcional)
// ================================================================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ================================================================================================
// TIPOS E INTERFACES
// ================================================================================================

interface AdminPersonalInfoProps {
  formData: {                      // Datos actuales del formulario
    email: string;
    full_name: string;
    password: string;
    salary: string;
  };
  isEditing: boolean;              // Si está en modo edición (cambia comportamiento de contraseña)
  onInputChange: (field: string, value: string) => void; // Callback para cambios de campo
}

// ================================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================================

const AdminPersonalInfo: React.FC<AdminPersonalInfoProps> = ({
  formData,
  isEditing,
  onInputChange
}) => {
  
  // ============================================================================================
  // HANDLERS LOCALES
  // ============================================================================================
  
  /**
   * Maneja cambios en campos de entrada y los propaga al componente padre
   * @param field - Nombre del campo que cambió
   * @param value - Nuevo valor del campo
   */
  const handleFieldChange = (field: string, value: string) => {
    // Propagar cambio al componente padre que maneja el estado global
    onInputChange(field, value);
  };

  // ============================================================================================
  // VALIDACIONES VISUALES
  // ============================================================================================
  
  /**
   * Determina si un campo tiene un valor válido para mostrar feedback visual
   * @param field - Nombre del campo a validar
   * @returns true si el campo es válido
   */
  const isFieldValid = (field: string): boolean => {
    switch (field) {
      case 'email':
        // Email debe existir y contener @
        return formData.email.length > 0 && formData.email.includes('@');
      
      case 'full_name':
        // Nombre debe tener al menos 2 caracteres
        return formData.full_name.trim().length >= 2;
      
      case 'password':
        // En modo edición es opcional, en creación es obligatorio
        if (isEditing) {
          // Si está vacío en edición, es válido (no se cambia)
          // Si tiene contenido, debe tener al menos 8 caracteres
          return formData.password.length === 0 || formData.password.length >= 8;
        } else {
          // En creación debe tener al menos 8 caracteres
          return formData.password.length >= 8;
        }
      
      case 'salary':
        // Salario es opcional, pero si se proporciona debe ser un número válido
        if (formData.salary.trim() === '') return true;
        const salaryNum = parseFloat(formData.salary);
        return !isNaN(salaryNum) && salaryNum >= 0;
      
      default:
        return true;
    }
  };

  /**
   * Genera clases CSS para el estilo del campo basado en su validez
   * @param field - Nombre del campo
   * @returns string con clases CSS
   */
  const getFieldClasses = (field: string): string => {
    const baseClasses = "transition-all duration-200";
    const valid = isFieldValid(field);
    
    if (formData[field as keyof typeof formData].length === 0) {
      // Campo vacío: estilo neutral
      return baseClasses;
    }
    
    if (valid) {
      // Campo válido: borde verde sutil
      return `${baseClasses} border-green-500/50 focus:border-green-500`;
    } else {
      // Campo inválido: borde rojo sutil
      return `${baseClasses} border-red-500/50 focus:border-red-500`;
    }
  };

  // ============================================================================================
  // RENDER
  // ============================================================================================
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Información Personal</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* ========================================================================== */}
          {/* CAMPO: EMAIL */}
          {/* ========================================================================== */}
          <div className="space-y-2">
            <Label htmlFor="admin-email" className="text-sm font-medium">
              Email *
            </Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@empresa.com"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={getFieldClasses('email')}
              required
            />
            {/* Mostrar ayuda si el email es inválido */}
            {formData.email.length > 0 && !isFieldValid('email') && (
              <p className="text-xs text-red-500">
                Ingresa un email válido
              </p>
            )}
          </div>

          {/* ========================================================================== */}
          {/* CAMPO: NOMBRE COMPLETO */}
          {/* ========================================================================== */}
          <div className="space-y-2">
            <Label htmlFor="admin-fullname" className="text-sm font-medium">
              Nombre Completo *
            </Label>
            <Input
              id="admin-fullname"
              type="text"
              placeholder="Juan Pérez"
              value={formData.full_name}
              onChange={(e) => handleFieldChange('full_name', e.target.value)}
              className={getFieldClasses('full_name')}
              required
            />
            {/* Mostrar ayuda si el nombre es muy corto */}
            {formData.full_name.length > 0 && !isFieldValid('full_name') && (
              <p className="text-xs text-red-500">
                El nombre debe tener al menos 2 caracteres
              </p>
            )}
          </div>

          {/* ========================================================================== */}
          {/* CAMPO: CONTRASEÑA */}
          {/* ========================================================================== */}
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-medium">
              {isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
            </Label>
            <Input
              id="admin-password"
              type="password"
              placeholder={
                isEditing 
                  ? "Dejar vacío para no cambiar" 
                  : "Mínimo 8 caracteres"
              }
              value={formData.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              className={getFieldClasses('password')}
              required={!isEditing} // Solo requerido en modo creación
            />
            {/* Mostrar ayuda sobre contraseña */}
            {formData.password.length > 0 && (
              <div className="text-xs">
                {isFieldValid('password') ? (
                  <span className="text-green-600">✓ Contraseña válida</span>
                ) : (
                  <span className="text-red-500">
                    La contraseña debe tener al menos 8 caracteres
                  </span>
                )}
              </div>
            )}
            {isEditing && formData.password.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No se modificará la contraseña actual
              </p>
            )}
          </div>

          {/* ========================================================================== */}
          {/* CAMPO: SALARIO */}
          {/* ========================================================================== */}
          <div className="space-y-2">
            <Label htmlFor="admin-salary" className="text-sm font-medium">
              Salario Mensual
            </Label>
            <Input
              id="admin-salary"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.salary}
              onChange={(e) => handleFieldChange('salary', e.target.value)}
              className={getFieldClasses('salary')}
            />
            {/* Mostrar ayuda si el salario es inválido */}
            {formData.salary.length > 0 && !isFieldValid('salary') && (
              <p className="text-xs text-red-500">
                Ingresa un monto válido
              </p>
            )}
            {/* Mostrar formato del salario si es válido */}
            {formData.salary.length > 0 && isFieldValid('salary') && (
              <p className="text-xs text-muted-foreground">
                Formato: ${parseFloat(formData.salary || '0').toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            )}
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPersonalInfo;
