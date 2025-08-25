// ================================================================================================
// GESTIÓN DE ADMINISTRADORES - PÁGINA PRINCIPAL REFACTORIZADA
// ================================================================================================
// Esta página actúa como orquestador principal para la gestión de administradores.
// Utiliza hooks especializados y componentes modulares para mantener el código limpio
// y fácil de mantener. Cada responsabilidad está separada en su propio módulo.
// ================================================================================================

import React, { useState } from 'react';

// Hooks especializados para lógica de negocio
import { useAdminsData } from '@/hooks/useAdminsData';           // Hook para datos y carga
import { useAdminsOperations } from '@/hooks/useAdminsOperations'; // Hook para operaciones CRUD

// Componentes especializados para UI
import AdminsHeader from '@/components/super-admin/AdminsHeader';   // Header con búsqueda
import AdminsTable from '@/components/super-admin/AdminsTable';     // Tabla de datos

// Componente refactorizado del formulario
import { AdminFormDialog } from '@/features/admin-management';

// Tipos TypeScript
import type { AdminWithClubs } from '@/features/admin-management';

// Componentes UI base de Shadcn
import {
  Card,
  CardContent,
} from '@/components/ui/card';

// ================================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================================
const AdminsManagement: React.FC = () => {
  
  // ============================================================================================
  // HOOKS ESPECIALIZADOS PARA LÓGICA DE NEGOCIO
  // ============================================================================================
  
  // Hook que maneja toda la lógica de datos: carga, filtrado, búsqueda
  const {
    admins,           // Lista completa de administradores cargados
    filteredAdmins,   // Lista filtrada según criterios de búsqueda
    clubs,           // Lista de clubs disponibles para asignación
    loading,         // Estados de carga (admins, clubs, operations)
    filters,         // Estado actual de filtros (searchTerm, etc.)
    setSearchTerm,   // Función para cambiar término de búsqueda
    loadAdmins       // Función para recargar administradores
  } = useAdminsData();
  
  // Hook que maneja todas las operaciones CRUD: eliminar, cambiar estado
  const {
    handleDeleteAdmin,      // Función para eliminar administrador con confirmación
    handleToggleAdminStatus, // Función para activar/desactivar administrador
    ConfirmDialog          // Componente de diálogo de confirmación
  } = useAdminsOperations(loadAdmins); // Pasamos callback de recarga
  
  // ============================================================================================
  // ESTADOS LOCALES PARA CONTROL DE UI
  // ============================================================================================
  
  // Estado para controlar si el formulario de administrador está abierto
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  
  // Estado para el administrador que se está editando (null = crear nuevo)
  const [editingAdmin, setEditingAdmin] = useState<AdminWithClubs | null>(null);
  
  // ============================================================================================
  // FUNCIONES DE MANEJO DE FORMULARIO
  // ============================================================================================
  
  // Función para abrir el formulario en modo creación de nuevo administrador
  const handleNewAdmin = () => {
    setEditingAdmin(null);      // No hay admin en edición (modo crear)
    setAdminDialogOpen(true);   // Abrir el diálogo del formulario
  };
  
  // Función para abrir el formulario en modo edición de administrador existente
  const handleEditAdmin = (admin: AdminWithClubs) => {
    try {
      console.log('🔧 [AdminsManagement] handleEditAdmin iniciado', { admin });
      console.log('🔧 [AdminsManagement] Datos del admin a editar:', {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        status: admin.status,
        clubs: admin.clubs
      });
      
      setEditingAdmin(admin);     // Establecer admin a editar
      console.log('🔧 [AdminsManagement] editingAdmin establecido');
      
      setAdminDialogOpen(true);   // Abrir el diálogo del formulario
      console.log('🔧 [AdminsManagement] Diálogo abierto');
      
    } catch (error) {
      console.error('❌ [AdminsManagement] Error en handleEditAdmin:', error);
    }
  };
  
  // Función para cerrar el formulario y limpiar estado
  const handleCloseAdminDialog = () => {
    setAdminDialogOpen(false);  // Cerrar el diálogo
    setEditingAdmin(null);      // Limpiar admin en edición
  };
  
  // ============================================================================================
  // RENDERIZADO PRINCIPAL
  // ============================================================================================
  
  return (
    <div className="p-6 space-y-6">
      {/* ============================================================================ */}
      {/* CARD PRINCIPAL CON HEADER Y TABLA */}
      {/* ============================================================================ */}
      <Card>
        {/* Header con título, botón de crear y barra de búsqueda */}
        <AdminsHeader
          searchTerm={filters.searchTerm}           // Término de búsqueda actual
          onSearchChange={setSearchTerm}            // Función para cambiar búsqueda
          onNewAdmin={handleNewAdmin}               // Función para crear nuevo admin
          totalAdmins={admins.length}               // Total de admins cargados
          filteredCount={filteredAdmins.length}    // Cantidad después del filtro
        />
        
        {/* Contenido con tabla de administradores */}
        <CardContent>
          <AdminsTable
            admins={filteredAdmins}                 // Lista filtrada de administradores
            loading={loading.admins}                // Estado de carga de administradores
            onEdit={handleEditAdmin}                // Función para editar admin
            onDelete={handleDeleteAdmin}            // Función para eliminar admin
            onToggleStatus={handleToggleAdminStatus} // Función para cambiar estado
          />
        </CardContent>
      </Card>

      {/* ============================================================================ */}
      {/* FORMULARIO MODAL PARA CREAR/EDITAR ADMINISTRADORES */}
      {/* ============================================================================ */}
      <AdminFormDialog
        open={adminDialogOpen}                      // Estado de apertura del diálogo
        editingAdmin={editingAdmin}                 // Admin en edición (null = crear)
        clubs={clubs}                              // Lista de clubs disponibles
        onClose={handleCloseAdminDialog}           // Función para cerrar formulario
        onSuccess={loadAdmins}                     // Función para recargar datos después del éxito
      />
      
      {/* ============================================================================ */}
      {/* DIÁLOGO DE CONFIRMACIÓN PARA OPERACIONES */}
      {/* ============================================================================ */}
      <ConfirmDialog />  {/* Componente de confirmación del hook useAdminsOperations */}
    </div>
  );
};

export default AdminsManagement;
