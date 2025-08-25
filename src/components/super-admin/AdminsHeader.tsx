// ================================================================================================
// HEADER DE GESTIÓN DE ADMINISTRADORES - COMPONENTE DE INTERFAZ
// ================================================================================================
// Este componente se encarga del header de la página de administradores,
// incluyendo título, descripción, botón de crear y barra de búsqueda.
// ================================================================================================

import React from 'react';

// Importaciones de componentes UI de Shadcn
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Iconos de Lucide React
import { 
  PlusIcon,  // Ícono de agregar (+)
  Users,     // Ícono de usuarios
  Search     // Ícono de búsqueda
} from 'lucide-react';

// ================================================================================================
// INTERFACE DE PROPS DEL COMPONENTE
// ================================================================================================
interface AdminsHeaderProps {
  searchTerm: string;                           // Término de búsqueda actual
  onSearchChange: (term: string) => void;       // Callback cuando cambia la búsqueda
  onNewAdmin: () => void;                       // Callback para crear nuevo administrador
  totalAdmins: number;                          // Total de administradores
  filteredCount: number;                        // Cantidad después del filtro
}

// ================================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================================
const AdminsHeader: React.FC<AdminsHeaderProps> = ({
  searchTerm,      // Término de búsqueda recibido como prop
  onSearchChange,  // Función para cambiar búsqueda recibida como prop
  onNewAdmin,      // Función para nuevo admin recibida como prop
  totalAdmins,     // Total de admins recibido como prop
  filteredCount    // Count filtrado recibido como prop
}) => {
  
  // ============================================================================================
  // FUNCIÓN PARA MANEJAR CAMBIO EN INPUT DE BÚSQUEDA
  // ============================================================================================
  
  // Función que se ejecuta cuando el usuario escribe en el campo de búsqueda
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value; // Obtener el nuevo valor del input
    onSearchChange(newValue);             // Llamar callback con el nuevo valor
  };
  
  // ============================================================================================
  // RENDERIZADO DEL COMPONENTE
  // ============================================================================================
  
  return (
    <CardHeader>
      {/* ============================================================================ */}
      {/* SECCIÓN: TÍTULO Y BOTÓN DE ACCIÓN */}
      {/* ============================================================================ */}
      <div className="flex items-center justify-between">
        {/* Información del título y descripción */}
        <div>
          {/* Título principal con ícono */}
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="w-5 h-5" />  {/* Ícono de usuarios */}
            Gestión de Administradores
          </CardTitle>
          
          {/* Descripción explicativa */}
          <CardDescription>
            Administra los usuarios del sistema y sus permisos
          </CardDescription>
        </div>
        
        {/* Botón para crear nuevo administrador */}
        <Button 
          onClick={onNewAdmin}              // Ejecutar callback al hacer clic
          className="flex items-center gap-2" // Alineación de ícono y texto
        >
          <PlusIcon className="w-4 h-4" />   {/* Ícono de agregar */}
          Nuevo Administrador
        </Button>
      </div>
      
      {/* ============================================================================ */}
      {/* SECCIÓN: BARRA DE BÚSQUEDA Y ESTADÍSTICAS */}
      {/* ============================================================================ */}
      <div className="flex items-center space-x-2 mt-4">
        {/* Contenedor de input de búsqueda con ícono */}
        <div className="relative flex-1 max-w-sm">
          {/* Ícono de búsqueda posicionado absolutamente dentro del input */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          
          {/* Input de búsqueda con padding para el ícono */}
          <Input
            placeholder="Buscar por email, nombre o club..."  // Texto de ayuda
            value={searchTerm}                               // Valor controlado
            onChange={handleSearchChange}                    // Handler para cambios
            className="pl-10"                               // Padding izquierdo para el ícono
          />
        </div>
        
        {/* Estadísticas de resultados */}
        <div className="text-sm text-gray-500">
          {/* Mostrar conteo actual vs total */}
          {filteredCount} de {totalAdmins} administradores
        </div>
      </div>
    </CardHeader>
  );
};

export default AdminsHeader;
