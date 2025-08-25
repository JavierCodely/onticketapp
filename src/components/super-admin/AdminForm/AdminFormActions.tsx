// ================================================================================================
// BOTONES DE ACCIÓN DEL FORMULARIO DE ADMINISTRADORES
// ================================================================================================
// Componente que maneja los botones de Cancelar y Guardar con sus estados
// ================================================================================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// ================================================================================================
// INTERFACES
// ================================================================================================

interface AdminFormActionsProps {
  // Estados
  isSubmitting: boolean;   // Si está guardando actualmente
  isFormValid: boolean;    // Si el formulario es válido
  isEditing: boolean;      // Si está editando (true) o creando (false)
  
  // Callbacks
  onCancel: () => void;    // Función para cancelar
  onSave: () => void;      // Función para guardar
}

// ================================================================================================
// COMPONENTE
// ================================================================================================

const AdminFormActions: React.FC<AdminFormActionsProps> = ({
  isSubmitting,
  isFormValid,
  isEditing,
  onCancel,
  onSave
}) => {
  
  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      
      {/* ==================================================================================== */}
      {/* BOTÓN CANCELAR */}
      {/* ==================================================================================== */}
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting} // Deshabilitar mientras se está guardando
      >
        Cancelar
      </Button>
      
      {/* ==================================================================================== */}
      {/* BOTÓN GUARDAR */}
      {/* ==================================================================================== */}
      <Button 
        onClick={onSave}
        disabled={!isFormValid || isSubmitting} // Deshabilitar si no es válido o está guardando
        className="min-w-[120px]" // Ancho mínimo para evitar que cambie de tamaño
      >
        {isSubmitting ? (
          /* Estado de carga: mostrar spinner y texto de guardando */
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          /* Estado normal: mostrar texto según el modo */
          isEditing ? 'Actualizar' : 'Crear Administrador'
        )}
      </Button>
      
    </div>
  );
};

export default AdminFormActions;
