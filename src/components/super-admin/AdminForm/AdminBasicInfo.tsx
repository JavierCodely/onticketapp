// ================================================================================================
// SECCIÓN DE INFORMACIÓN BÁSICA DEL ADMINISTRADOR
// ================================================================================================
// Componente que maneja los campos básicos: email, nombre, contraseña
// ================================================================================================

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import PasswordStrength from '@/components/ui/password-strength';

// ================================================================================================
// INTERFACES
// ================================================================================================

interface AdminBasicInfoProps {
  // Datos del formulario
  email: string;
  full_name: string;
  password: string;
  
  // Estados de UI
  showPassword: boolean;
  passwordGenerated: boolean;
  
  // Validaciones
  emailError?: string;
  nameError?: string;
  passwordError?: string;
  
  // Flags
  isEditing: boolean;
  
  // Callbacks
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
  onGeneratePassword: () => void;
}

// ================================================================================================
// COMPONENTE
// ================================================================================================

const AdminBasicInfo: React.FC<AdminBasicInfoProps> = ({
  // Props de datos
  email,
  full_name,
  password,
  
  // Props de estado
  showPassword,
  passwordGenerated,
  
  // Props de validación
  emailError,
  nameError,
  passwordError,
  
  // Props de flags
  isEditing,
  
  // Props de callbacks
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onTogglePasswordVisibility,
  onGeneratePassword
}) => {
  
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        
        {/* Título de la sección */}
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-4 w-4" />
          Información Básica
        </h3>

        {/* ==================================================================================== */}
        {/* CAMPO: EMAIL */}
        {/* ==================================================================================== */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email *
          </Label>
          
          {/* Input de email con indicador visual de error */}
          <Input
            id="email"
            type="email"
            placeholder="admin@empresa.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className={emailError ? 'border-red-500' : ''} // Borde rojo si hay error
          />
          
          {/* Mensaje de error si existe */}
          {emailError && (
            <p className="text-sm text-red-500">{emailError}</p>
          )}
        </div>

        {/* ==================================================================================== */}
        {/* CAMPO: NOMBRE COMPLETO */}
        {/* ==================================================================================== */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre Completo *</Label>
          
          {/* Input de nombre con indicador visual de error */}
          <Input
            id="fullName"
            placeholder="Juan Pérez"
            value={full_name}
            onChange={(e) => onNameChange(e.target.value)}
            className={nameError ? 'border-red-500' : ''} // Borde rojo si hay error
          />
          
          {/* Mensaje de error si existe */}
          {nameError && (
            <p className="text-sm text-red-500">{nameError}</p>
          )}
        </div>

        {/* ==================================================================================== */}
        {/* CAMPO: CONTRASEÑA */}
        {/* ==================================================================================== */}
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
          </Label>
          
          {/* Contenedor flex para input y botones */}
          <div className="flex gap-2">
            
            {/* Input de contraseña con botón de mostrar/ocultar integrado */}
            <div className="relative flex-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"} // Cambiar tipo según visibilidad
                placeholder={isEditing ? "Dejar vacío para no cambiar" : "Mínimo 8 caracteres"}
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                className={passwordError ? 'border-red-500' : ''} // Borde rojo si hay error
              />
              
              {/* Botón para mostrar/ocultar contraseña */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={onTogglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Botón para generar contraseña automática */}
            <Button
              type="button"
              variant="outline"
              onClick={onGeneratePassword}
            >
              Generar
            </Button>
          </div>
          
          {/* Mensaje de error si existe */}
          {passwordError && (
            <p className="text-sm text-red-500">{passwordError}</p>
          )}
          
          {/* Indicador de fortaleza de contraseña si hay contraseña */}
          {password && (
            <PasswordStrength password={password} />
          )}
          
          {/* Alerta informativa si se generó una contraseña automática */}
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
  );
};

export default AdminBasicInfo;
