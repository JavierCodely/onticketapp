// ================================================================================================
// HEADER DEL FORMULARIO DE ADMINISTRADORES
// ================================================================================================
// Componente simple que muestra el título del diálogo según si está creando o editando
// ================================================================================================

import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Shield } from 'lucide-react';

// ================================================================================================
// INTERFACES
// ================================================================================================

interface AdminFormHeaderProps {
  isEditing: boolean; // true = editando, false = creando nuevo
}

// ================================================================================================
// COMPONENTE
// ================================================================================================

const AdminFormHeader: React.FC<AdminFormHeaderProps> = ({ isEditing }) => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        {/* Icono cambia según el modo */}
        {isEditing ? (
          <User className="h-5 w-5" />  // Icono de usuario para edición
        ) : (
          <Shield className="h-5 w-5" /> // Icono de escudo para creación
        )}
        
        {/* Título cambia según el modo */}
        {isEditing ? 'Editar Administrador' : 'Nuevo Administrador'}
      </DialogTitle>
    </DialogHeader>
  );
};

export default AdminFormHeader;
