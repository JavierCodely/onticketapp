// Página de gestión de clubs para super admin
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Club } from '@/types/database';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, Building2 } from 'lucide-react';

import ClubsTable from '@/components/super-admin/ClubsTable';
import ClubForm from '@/components/super-admin/ClubForm';

const ClubsManagement: React.FC = () => {
  // Hook de autenticación para acceder a secureQuery
  const { secureQuery } = useAuth();
  
  // Estados del componente
  const [clubs, setClubs] = useState<Club[]>([]);           // Lista de clubs
  const [loading, setLoading] = useState(true);             // Estado de carga
  const [dialogOpen, setDialogOpen] = useState(false);      // Control del diálogo
  const [editingClub, setEditingClub] = useState<Club | null>(null); // Club en edición

  // Función para cargar todos los clubs desde la base de datos
  const loadClubs = async () => {
    try {
      console.log('🔄 Iniciando loadClubs...');
      setLoading(true); // Mostrar indicador de carga
      
      // Usar secureQuery para obtener clubs con RLS
      console.log('📡 Llamando secureQuery...');
      const { data, error } = await secureQuery<Club>('clubs', 'select');
      
      console.log('📥 Resultado secureQuery:', { data, error, count: data?.length });
      
      // Verificar si hubo error en la consulta
      if (error) {
        console.log('❌ Error en secureQuery:', error);
        throw new Error(error.message || 'Error desconocido al cargar clubs');
      }
      
      // Verificar que data existe
      if (!data) {
        console.log('⚠️ No se recibieron datos de secureQuery');
        console.log('📊 Respuesta completa:', { data, error });
      }
      
      // Actualizar estado con los clubs obtenidos
      setClubs(data || []);
      console.log(`✅ Clubs cargados: ${data?.length || 0} clubs`);
    } catch (error) {
      // Manejar errores y mostrar mensaje al usuario
      console.error('💥 Error cargando clubs:', error);
      alert(`Error al cargar clubs: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      // Ocultar indicador de carga siempre
      setLoading(false);
      console.log('🏁 loadClubs terminado');
    }
  };

  // Effect para cargar datos iniciales al montar el componente
  useEffect(() => {
    console.log('🔥 ClubsManagement montado - Cargando clubs...');
    loadClubs();
  }, []); // Sin dependencias, se ejecuta solo una vez

  // Función para abrir el diálogo en modo creación
  const handleNewClub = () => {
    setEditingClub(null);    // No hay club en edición
    setDialogOpen(true);     // Abrir diálogo
  };

  // Función para abrir el diálogo en modo edición
  const handleEditClub = (club: Club) => {
    setEditingClub(club);    // Establecer club a editar
    setDialogOpen(true);     // Abrir diálogo
  };

  // Función para cerrar el diálogo y limpiar estado
  const handleCloseDialog = () => {
    setDialogOpen(false);    // Cerrar diálogo
    setEditingClub(null);    // Limpiar club en edición
  };

  // Función para eliminar un club con confirmación
  const handleDeleteClub = async (club: Club) => {
    // Mostrar confirmación al usuario
    if (!confirm(`¿Estás seguro de que deseas eliminar el club "${club.name}"?`)) {
      return; // Usuario canceló
    }
    
    try {
      // Usar secureQuery para eliminar el club
      const { error } = await secureQuery(
        'clubs',
        'delete',
        undefined,
        { id: club.id }
      );
      
      // Verificar si hubo error
      if (error) {
        throw new Error(error.message);
      }
      
      // Recargar lista de clubs después de eliminar
      await loadClubs();
    } catch (error) {
      // Manejar errores
      console.error('Error eliminando club:', error);
      alert(`Error al eliminar club: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // Función para cambiar el estado de un club (activo/inactivo)
  const handleToggleStatus = async (club: Club) => {
    // Determinar nuevo estado
    const newStatus = club.status === 'active' ? 'inactive' : 'active';
    
    try {
      // Usar secureQuery para actualizar solo el estado
      const { error } = await secureQuery(
        'clubs',
        'update',
        {
          status: newStatus,
          updated_at: new Date().toISOString()
        },
        { id: club.id }
      );
      
      // Verificar si hubo error
      if (error) {
        throw new Error(error.message);
      }
      
      // Recargar lista de clubs para mostrar cambios
      await loadClubs();
    } catch (error) {
      // Manejar errores
      console.error('Error cambiando estado:', error);
      alert(`Error al cambiar estado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Gestión de Clubs
              </CardTitle>
              <CardDescription>
                Administra los clubs del sistema
              </CardDescription>
            </div>
            
            <Button onClick={handleNewClub}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Nuevo Club
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <ClubsTable
            clubs={clubs}
            loading={loading}
            onEdit={handleEditClub}
            onDelete={handleDeleteClub}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* Formulario final para crear/editar clubs */}
      <ClubForm
        open={dialogOpen}
        editingClub={editingClub}
        onClose={handleCloseDialog}
        onSuccess={loadClubs}
      />
    </div>
  );
};

export default ClubsManagement;
