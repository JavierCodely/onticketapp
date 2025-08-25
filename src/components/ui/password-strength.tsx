// ================================================================================================
// INDICADOR DE FORTALEZA DE CONTRASEÑA
// ================================================================================================
// Componente para mostrar visualmente la fortaleza de la contraseña en tiempo real
// ================================================================================================

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

// ================================================================================================
// TIPOS E INTERFACES
// ================================================================================================

interface PasswordStrengthProps {
  password: string;                    // Contraseña a evaluar
  minLength?: number;                  // Longitud mínima requerida
  showRequirements?: boolean;          // Mostrar lista de requisitos
  className?: string;                  // Clases CSS adicionales
}

// Niveles de fortaleza
type StrengthLevel = 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';

// Resultado de análisis
interface PasswordAnalysis {
  score: number;                       // Puntuación de 0-100
  level: StrengthLevel;               // Nivel de fortaleza
  progress: number;                   // Progreso para la barra
  color: string;                      // Color del indicador
  message: string;                    // Mensaje descriptivo
  icon: React.ReactNode;              // Icono correspondiente
  requirements: {                     // Estado de requisitos
    length: boolean;
    hasLower: boolean;
    hasUpper: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

// ================================================================================================
// FUNCIÓN DE ANÁLISIS DE CONTRASEÑA
// ================================================================================================

const analyzePassword = (password: string, minLength: number = 8): PasswordAnalysis => {
  const requirements = {
    length: password.length >= minLength,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  // Calcular puntuación base
  let score = 0;
  
  // Longitud (40% del peso)
  if (password.length >= minLength) {
    score += 40;
    if (password.length >= 12) score += 10; // Bonus por longitud extra
  } else {
    score += (password.length / minLength) * 30; // Puntuación parcial
  }
  
  // Diversidad de caracteres (60% del peso)
  const characterTypes = [
    requirements.hasLower,
    requirements.hasUpper,
    requirements.hasNumber,
    requirements.hasSpecial
  ].filter(Boolean).length;
  
  score += (characterTypes / 4) * 50;
  
  // Determinar nivel
  let level: StrengthLevel;
  let color: string;
  let message: string;
  let icon: React.ReactNode;
  
  if (score < 20) {
    level = 'very-weak';
    color = 'bg-red-500';
    message = 'Muy débil';
    icon = <ShieldX className="w-4 h-4 text-red-500" />;
  } else if (score < 40) {
    level = 'weak';
    color = 'bg-orange-500';
    message = 'Débil';
    icon = <ShieldAlert className="w-4 h-4 text-orange-500" />;
  } else if (score < 60) {
    level = 'fair';
    color = 'bg-yellow-500';
    message = 'Aceptable';
    icon = <Shield className="w-4 h-4 text-yellow-500" />;
  } else if (score < 80) {
    level = 'good';
    color = 'bg-blue-500';
    message = 'Buena';
    icon = <ShieldCheck className="w-4 h-4 text-blue-500" />;
  } else {
    level = 'strong';
    color = 'bg-green-500';
    message = 'Fuerte';
    icon = <ShieldCheck className="w-4 h-4 text-green-500" />;
  }
  
  return {
    score: Math.round(score),
    level,
    progress: Math.min(score, 100),
    color,
    message,
    icon,
    requirements
  };
};

// ================================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================================

const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  minLength = 8,
  showRequirements = true,
  className = ''
}) => {
  
  // No mostrar nada si no hay contraseña
  if (!password) return null;
  
  // Analizar la contraseña
  const analysis = analyzePassword(password, minLength);
  
  // ============================================================================================
  // RENDERIZADO DE REQUISITOS
  // ============================================================================================
  
  const renderRequirements = () => {
    if (!showRequirements) return null;
    
    const requirements = [
      {
        key: 'length',
        text: `Al menos ${minLength} caracteres`,
        met: analysis.requirements.length
      },
      {
        key: 'hasLower',
        text: 'Letras minúsculas (a-z)',
        met: analysis.requirements.hasLower
      },
      {
        key: 'hasUpper',
        text: 'Letras mayúsculas (A-Z)',
        met: analysis.requirements.hasUpper
      },
      {
        key: 'hasNumber',
        text: 'Números (0-9)',
        met: analysis.requirements.hasNumber
      },
      {
        key: 'hasSpecial',
        text: 'Caracteres especiales (!@#$%^&*)',
        met: analysis.requirements.hasSpecial
      }
    ];
    
    return (
      <div className="space-y-2 mt-3">
        <p className="text-sm font-medium text-gray-700">Requisitos:</p>
        <div className="grid grid-cols-1 gap-1">
          {requirements.map(req => (
            <div 
              key={req.key}
              className={`flex items-center gap-2 text-xs ${
                req.met ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                req.met ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              {req.text}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // ============================================================================================
  // RENDERIZADO PRINCIPAL
  // ============================================================================================
  
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barra de progreso y nivel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {analysis.icon}
            <span className="text-sm font-medium">
              Fortaleza: {analysis.message}
            </span>
            <Badge 
              variant="outline" 
              className="text-xs"
            >
              {analysis.score}/100
            </Badge>
          </div>
        </div>
        
        <Progress 
          value={analysis.progress} 
          className="h-2"
        />
      </div>
      
      {/* Advertencia para contraseñas débiles */}
      {analysis.level === 'very-weak' || analysis.level === 'weak' ? (
        <Alert className="border-orange-200 bg-orange-50">
          <ShieldAlert className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {analysis.level === 'very-weak' 
              ? '⚠️ Contraseña muy débil. Por favor, mejórala para mayor seguridad.'
              : '⚠️ Contraseña débil. Considera agregar más caracteres o variedad.'
            }
          </AlertDescription>
        </Alert>
      ) : analysis.level === 'strong' ? (
        <Alert className="border-green-200 bg-green-50">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ ¡Excelente! Esta contraseña es muy segura.
          </AlertDescription>
        </Alert>
      ) : null}
      
      {/* Lista de requisitos */}
      {renderRequirements()}
    </div>
  );
};

export default PasswordStrength;
