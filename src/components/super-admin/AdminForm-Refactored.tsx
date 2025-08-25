// ================================================================================================
// FORMULARIO DE ADMINISTRADORES REFACTORIZADO
// ================================================================================================
// Este es el formulario principal que combina todos los componentes más pequeños
// y usa el hook personalizado para manejar la lógica de negocio
// ================================================================================================

import React from 'react';

// Componentes de UI base
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Hook personalizado con toda la lógica
import { useAdminForm } from '@/hooks/useAdminForm';

// Componentes especializados del formulario
import AdminFormHeader from './AdminForm/AdminFormHeader';
import AdminBasicInfo from './AdminForm/AdminBasicInfo';
import AdminWorkInfo from './AdminForm/AdminWorkInfo';
import AdminClubAssignment from './AdminForm/AdminClubAssignment';
import AdminFormActions from './AdminForm/AdminFormActions';

// Logging
import { log } from '@/shared/utils/logger';

// ================================================================================================
// INTERFACES
// ================================================================================================

// Estructura de un club (definida aquí para evitar duplicación)
interface Club {
  id: string;
  name: string;
  slug: string;
  status: string;
}

// Props que recibe el componente principal
interface AdminFormRefactoredProps {
  open: boolean;                    // Si el diálogo está abierto
  editingAdmin: any | null;         // Administrador en edición (null = crear nuevo)
  clubs: Club[];                    // Lista de clubs disponibles
  onClose: () => void;              // Callback para cerrar el diálogo
  onSuccess: () => void;            // Callback cuando se guarda exitosamente
}

// ================================================================================================
// CONSTANTES
// ================================================================================================

const COMPONENT_NAME = 'AdminForm-Refactored'; // Para logging

// ================================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================================

const AdminFormRefactored: React.FC<AdminFormRefactoredProps> = ({
  open,           // Estado de apertura del diálogo
  editingAdmin,   // Administrador a editar (null = crear nuevo)
  clubs,          // Lista de clubs disponibles
  onClose,        // Función para cerrar
  onSuccess       // Función de éxito
}) => {
  
  // ============================================================================================
  // LOGGING INICIAL
  // ============================================================================================
  
  // Log cada vez que se renderiza el componente
  log.info(COMPONENT_NAME, 'render', `Formulario ${open ? 'abierto' : 'cerrado'}`, {
    isEditing: !!editingAdmin,
    adminId: editingAdmin?.id || 'nuevo',
    clubsCount: clubs.length
  });
  
  // ============================================================================================
  // HOOK PERSONALIZADO CON TODA LA LÓGICA
  // ============================================================================================
  
  // Este hook maneja todo: estado, validaciones, guardado, etc.
  const {
    // Estados del formulario
    formData,
    
    // Estados de UI
    isSubmitting,
    showPassword,
    passwordGenerated,
    
    // Validaciones en tiempo real
    realtimeValidation,
    
    // Funciones principales
    handleInputChange,
    handleClubToggle,
    handleGeneratePassword,
    handleSave,
    handleClose,
    
    // Funciones de UI
    togglePasswordVisibility,
    
    // Estado calculado
    isFormValid,
    
    // Función de debug
    debugCurrentState
    
  } = useAdminForm({
    editingAdmin,
    clubs,
    onSuccess,
    onClose
  });
  
  // ============================================================================================
  // FUNCIONES AUXILIARES PARA SIMPLIFICAR CALLBACKS
  // ============================================================================================
  
  // Funciones wrapper para los callbacks de campos específicos
  // Esto hace que el código sea más limpio y fácil de leer
  
  const handleEmailChange = (value: string) => handleInputChange('email', value);
  const handleNameChange = (value: string) => handleInputChange('full_name', value);
  const handlePasswordChange = (value: string) => handleInputChange('password', value);
  const handleSalaryChange = (value: string) => handleInputChange('salary', value);
  const handleRoleChange = (value: 'club_admin' | 'super_admin') => handleInputChange('role', value);
  const handleStatusChange = (active: boolean) => handleInputChange('status', active ? 'active' : 'inactive');
  
  // ============================================================================================
  // DETERMINAR MODO DE OPERACIÓN
  // ============================================================================================
  
  const isEditing = !!editingAdmin; // true si hay un admin para editar
  
  // ============================================================================================
  // RENDERIZADO PRINCIPAL
  // ============================================================================================
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        
        {/* ==================================================================================== */}
        {/* HEADER DEL FORMULARIO */}
        {/* ==================================================================================== */}
        <AdminFormHeader isEditing={isEditing} />

        {/* ==================================================================================== */}
        {/* CONTENIDO DEL FORMULARIO */}
        {/* ==================================================================================== */}
        <div className="space-y-6">
          
          {/* ============================================================================ */}
          {/* SECCIÓN: INFORMACIÓN BÁSICA */}
          {/* ============================================================================ */}
          <AdminBasicInfo
            // Datos actuales
            email={formData.email}
            full_name={formData.full_name}
            password={formData.password}
            
            // Estados de UI
            showPassword={showPassword}
            passwordGenerated={passwordGenerated}
            
            // Errores de validación
            emailError={realtimeValidation.email}
            nameError={realtimeValidation.full_name}
            passwordError={realtimeValidation.password}
            
            // Flags
            isEditing={isEditing}
            
            // Callbacks
            onEmailChange={handleEmailChange}
            onNameChange={handleNameChange}
            onPasswordChange={handlePasswordChange}
            onTogglePasswordVisibility={togglePasswordVisibility}
            onGeneratePassword={handleGeneratePassword}
          />

          {/* ============================================================================ */}
          {/* SECCIÓN: INFORMACIÓN LABORAL */}
          {/* ============================================================================ */}
          <AdminWorkInfo
            // Datos actuales
            salary={formData.salary}
            role={formData.role}
            status={formData.status}
            
            // Errores de validación
            salaryError={realtimeValidation.salary}
            
            // Callbacks
            onSalaryChange={handleSalaryChange}
            onRoleChange={handleRoleChange}
            onStatusChange={handleStatusChange}
          />

          {/* ============================================================================ */}
          {/* SECCIÓN: ASIGNACIÓN DE CLUBS */}
          {/* ============================================================================ */}
          <AdminClubAssignment
            // Datos
            clubs={clubs}
            selectedClubs={formData.selectedClubs}
            
            // Callbacks
            onClubToggle={handleClubToggle}
          />

          {/* ============================================================================ */}
          {/* BOTÓN DE DEBUG TEMPORAL (solo en desarrollo) */}
          {/* ============================================================================ */}
          {process.env.NODE_ENV === 'development' && (
            <div className="flex justify-center pt-2 border-t border-dashed border-gray-300">
              <button 
                type="button"
                onClick={debugCurrentState}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-300"
              >
                🔍 Debug Estado del Formulario
              </button>
            </div>
          )}

          {/* ============================================================================ */}
          {/* BOTONES DE ACCIÓN */}
          {/* ============================================================================ */}
          <AdminFormActions
            // Estados
            isSubmitting={isSubmitting}
            isFormValid={isFormValid}
            isEditing={isEditing}
            
            // Callbacks
            onCancel={handleClose}
            onSave={handleSave}
          />

        </div>

      </DialogContent>
    </Dialog>
  );
};

export default AdminFormRefactored;
