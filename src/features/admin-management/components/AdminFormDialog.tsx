// ================================================================================================
// DIÁLOGO PRINCIPAL DEL FORMULARIO DE ADMINISTRADORES
// ================================================================================================
// Este es el componente principal que orquesta todo el formulario de administradores.
// Combina todos los sub-componentes y maneja el flujo principal de crear/editar.
// ================================================================================================

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Componentes específicos del formulario de administradores
import AdminPersonalInfo from './AdminPersonalInfo';
import AdminSystemConfig from './AdminSystemConfig';
import AdminClubAssignment from './AdminClubAssignment';

// Hook personalizado para la lógica del formulario
import { useAdminForm } from '../hooks/useAdminForm';

// ================================================================================================
// TIPOS E INTERFACES
// ================================================================================================

interface AdminFormDialogProps {
  open: boolean;                   // Si el diálogo está abierto
  editingAdmin: any | null;        // Administrador en edición o null para crear
  clubs: any[];                    // Lista de clubs disponibles
  onClose: () => void;             // Callback al cerrar el diálogo
  onSuccess: () => void;           // Callback tras operación exitosa
}

// ================================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================================

const AdminFormDialog: React.FC<AdminFormDialogProps> = ({
  open,
  editingAdmin,
  clubs,
  onClose,
  onSuccess
}) => {
  
  // ============================================================================================
  // HOOK PERSONALIZADO
  // ============================================================================================
  
  // Usar el hook personalizado que maneja toda la lógica del formulario
  const {
    // Estado del formulario
    formData,
    loading,
    error,
    
    // Validaciones
    isFormValid,
    
    // Handlers
    handleInputChange,
    handleClubToggle,
    handleSave,
    
    // Información adicional
    isEditing,
    clubsCount
  } = useAdminForm({
    open,
    editingAdmin,
    clubs,
    onSuccess
  });

  // ============================================================================================
  // HANDLERS LOCALES
  // ============================================================================================
  
  /**
   * Maneja el cierre del diálogo con confirmación si hay cambios sin guardar
   */
  const handleClose = () => {
    // TODO: Agregar confirmación si hay cambios sin guardar
    // Por ahora, cerrar directamente
    onClose();
  };

  /**
   * Maneja el clic en el botón de guardar
   */
  const handleSaveClick = async () => {
    // Ejecutar guardado a través del hook
    await handleSave();
  };

  // ============================================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================================
  
  /**
   * Genera el título del diálogo basado en el modo
   * @returns Título apropiado para el diálogo
   */
  const getDialogTitle = (): string => {
    if (isEditing) {
      return `Editar Administrador`;
    } else {
      return 'Nuevo Administrador';
    }
  };

  /**
   * Genera el texto del botón de guardar basado en el estado
   * @returns Texto apropiado para el botón
   */
  const getSaveButtonText = (): string => {
    if (loading) {
      return 'Guardando...';
    }
    
    if (isEditing) {
      return 'Actualizar';
    } else {
      return 'Crear';
    }
  };

  /**
   * Determina si se debe mostrar el componente de asignación de clubs
   * @returns true si debe mostrar clubs
   */
  const shouldShowClubs = (): boolean => {
    return clubs.length > 0;
  };

  // ============================================================================================
  // COMPONENTES AUXILIARES
  // ============================================================================================
  
  /**
   * Componente para mostrar errores
   */
  const ErrorDisplay: React.FC = () => {
    if (!error) return null;
    
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  };

  /**
   * Componente para los botones de acción del footer
   */
  const ActionButtons: React.FC = () => (
    <div className="flex justify-end gap-3">
      {/* Botón Cancelar */}
      <Button 
        variant="outline" 
        onClick={handleClose}
        disabled={loading}
        type="button"
      >
        Cancelar
      </Button>
      
      {/* Botón Guardar */}
      <Button 
        onClick={handleSaveClick}
        disabled={loading || !isFormValid}
        type="button"
      >
        {getSaveButtonText()}
      </Button>
    </div>
  );

  /**
   * Información de debug (solo en desarrollo)
   */
  const DebugInfo: React.FC = () => {
    // Solo mostrar en modo desarrollo
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <details className="mt-4 p-2 bg-muted/50 rounded text-xs">
        <summary className="cursor-pointer font-medium">Debug Info (Dev Only)</summary>
        <div className="mt-2 space-y-1">
          <div>Modo: {isEditing ? 'Edición' : 'Creación'}</div>
          <div>Clubs disponibles: {clubsCount}</div>
          <div>Clubs seleccionados: {formData.selectedClubs.length}</div>
          <div>Formulario válido: {isFormValid ? 'Sí' : 'No'}</div>
          <div>Cargando: {loading ? 'Sí' : 'No'}</div>
          {editingAdmin && <div>Admin ID: {editingAdmin.id}</div>}
        </div>
      </details>
    );
  };

  // ============================================================================================
  // RENDER PRINCIPAL
  // ============================================================================================
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        
        {/* ========================================================================== */}
        {/* HEADER DEL DIÁLOGO */}
        {/* ========================================================================== */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {getDialogTitle()}
          </DialogTitle>
          {/* Subtítulo con información adicional */}
          {isEditing && editingAdmin && (
            <p className="text-sm text-muted-foreground">
              Editando: {editingAdmin.email}
            </p>
          )}
        </DialogHeader>

        {/* ========================================================================== */}
        {/* CONTENIDO DEL FORMULARIO */}
        {/* ========================================================================== */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* Mostrar errores si existen */}
          <ErrorDisplay />

          <div className="space-y-6">
            
            {/* ====================================================================== */}
            {/* SECCIÓN: INFORMACIÓN PERSONAL */}
            {/* ====================================================================== */}
            <AdminPersonalInfo
              formData={{
                email: formData.email,
                full_name: formData.full_name,
                password: formData.password,
                salary: formData.salary
              }}
              isEditing={isEditing}
              onInputChange={handleInputChange}
            />

            {/* ====================================================================== */}
            {/* SECCIÓN: CONFIGURACIÓN DEL SISTEMA */}
            {/* ====================================================================== */}
            <AdminSystemConfig
              formData={{
                role: formData.role,
                status: formData.status
              }}
              onInputChange={handleInputChange}
            />

            {/* ====================================================================== */}
            {/* SECCIÓN: ASIGNACIÓN DE CLUBS (solo si hay clubs disponibles) */}
            {/* ====================================================================== */}
            {shouldShowClubs() && (
              <AdminClubAssignment
                clubs={clubs}
                selectedClubs={formData.selectedClubs}
                onClubToggle={handleClubToggle}
                isLoading={false} // El loading se maneja a nivel de diálogo
              />
            )}

            {/* Información de debug */}
            <DebugInfo />
            
          </div>
        </div>

        {/* ========================================================================== */}
        {/* FOOTER CON BOTONES DE ACCIÓN */}
        {/* ========================================================================== */}
        <div className="px-6 py-4 border-t bg-muted/50">
          <ActionButtons />
          
          {/* Información adicional en el footer */}
          <div className="mt-3 text-center">
            <p className="text-xs text-muted-foreground">
              {isEditing 
                ? 'Los cambios se aplicarán inmediatamente al guardar'
                : 'Se creará un nuevo administrador en el sistema'
              }
            </p>
            
            {/* Mostrar estado de validación */}
            {!isFormValid && (
              <p className="text-xs text-amber-600 mt-1">
                Completa todos los campos obligatorios para continuar
              </p>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default AdminFormDialog;
