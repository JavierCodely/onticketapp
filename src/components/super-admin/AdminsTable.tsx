// ================================================================================================
// TABLA DE ADMINISTRADORES - COMPONENTE DE VISUALIZACIÓN
// ================================================================================================
// Este componente se encarga únicamente de mostrar la tabla de administradores
// con toda la información formateada, incluyendo acciones y estados de carga.
// ================================================================================================

import React from 'react';
import type { AdminWithClubs, AdminOperationCallbacks } from '@/types/admin';

// Importaciones de componentes UI de Shadcn para la tabla
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Iconos de Lucide React para la interfaz
import { 
  MoreHorizontal,  // Ícono de menú (tres puntos)
  Edit,            // Ícono de editar
  Trash2,          // Ícono de eliminar
  UserCheck,       // Ícono de activar/desactivar
  Users,           // Ícono de usuario
  Mail,            // Ícono de email
  Phone,           // Ícono de teléfono
  Calendar         // Ícono de fecha
} from 'lucide-react';

// ================================================================================================
// INTERFACE DE PROPS DEL COMPONENTE
// ================================================================================================
interface AdminsTableProps {
  admins: AdminWithClubs[];           // Lista de administradores a mostrar
  loading: boolean;                   // Estado de carga de los datos
  onEdit: (admin: AdminWithClubs) => void;          // Callback para editar administrador
  onDelete: (admin: AdminWithClubs) => Promise<void>; // Callback para eliminar administrador
  onToggleStatus: (admin: AdminWithClubs) => Promise<void>; // Callback para cambiar estado
}

// ================================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================================
const AdminsTable: React.FC<AdminsTableProps> = ({
  admins,        // Lista de administradores recibida como prop
  loading,       // Estado de carga recibido como prop
  onEdit,        // Función de edición recibida como prop
  onDelete,      // Función de eliminación recibida como prop
  onToggleStatus // Función de cambio de estado recibida como prop
}) => {
  
  // ============================================================================================
  // FUNCIÓN PARA RENDERIZAR BADGE DE ROL DEL ADMINISTRADOR
  // ============================================================================================
  
  // Función que retorna el badge apropiado según el tipo de administrador
  const renderRoleBadge = (admin: AdminWithClubs) => {
    // Si es super administrador, mostrar badge especial
    if (admin.is_super_admin) {
      return (
        <Badge 
          variant="default" 
          className="bg-purple-100 text-purple-800" // Estilo púrpura para super admin
        >
          Super Admin
        </Badge>
      );
    } else {
      // Si es administrador regular, mostrar badge secundario
      return (
        <Badge variant="secondary">
          Admin de Club
        </Badge>
      );
    }
  };

  // ============================================================================================
  // FUNCIÓN PARA RENDERIZAR BADGE DE ESTADO DEL ADMINISTRADOR
  // ============================================================================================
  
  // Función que retorna el badge apropiado según el estado del administrador
  const renderStatusBadge = (admin: AdminWithClubs) => {
    // Determinar el estilo según el estado
    switch (admin.status) {
      case 'active':
        return (
          <Badge 
            variant="default" 
            className="bg-green-100 text-green-800" // Verde para activo
          >
            Activo
          </Badge>
        );
      case 'inactive':
        return (
          <Badge 
            variant="secondary" 
            className="bg-gray-100 text-gray-800" // Gris para inactivo
          >
            Inactivo
          </Badge>
        );
      case 'suspended':
        return (
          <Badge 
            variant="destructive" 
            className="bg-yellow-100 text-yellow-800" // Amarillo para suspendido
          >
            Suspendido
          </Badge>
        );
      case 'terminated':
        return (
          <Badge 
            variant="destructive" 
            className="bg-red-100 text-red-800" // Rojo para terminado
          >
            Terminado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {admin.status || 'Desconocido'}
          </Badge>
        );
    }
  };
  
  // ============================================================================================
  // FUNCIÓN PARA RENDERIZAR LISTA DE CLUBS COMO BADGES
  // ============================================================================================
  
  // Función que muestra los clubs asignados como badges con límite visual
  const renderClubsBadges = (clubs: any[]) => {
    // Si no tiene clubs asignados, mostrar texto informativo
    if (clubs.length === 0) {
      return (
        <span className="text-gray-500 text-sm">
          Sin clubs asignados
        </span>
      );
    }
    
    // Si tiene clubs, mostrar como badges con límite de 2 visibles
    return (
      <div className="flex flex-wrap gap-1">
        {/* Mostrar los primeros 2 clubs como badges */}
        {clubs.slice(0, 2).map(club => (
          <Badge 
            key={club.id}           // Key único para React
            variant="outline"       // Estilo de borde
            className="text-xs"     // Texto pequeño
          >
            {club.name}             {/* Nombre del club */}
          </Badge>
        ))}
        
        {/* Si hay más de 2 clubs, mostrar badge con conteo */}
        {clubs.length > 2 && (
          <Badge 
            variant="outline" 
            className="text-xs"
          >
            +{clubs.length - 2} más  {/* Mostrar cuántos clubs adicionales hay */}
          </Badge>
        )}
      </div>
    );
  };
  
  // ============================================================================================
  // RENDERIZADO CONDICIONAL SEGÚN ESTADO
  // ============================================================================================
  
  // Si está cargando, mostrar indicador de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          {/* Spinner animado de carga */}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-500">Cargando administradores...</p>
        </div>
      </div>
    );
  }
  
  // Si no hay administradores, mostrar mensaje informativo
  if (admins.length === 0) {
    return (
      <div className="text-center py-8">
        {/* Ícono de usuarios grande */}
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No se encontraron administradores
        </h3>
        <p className="text-gray-500 mb-4">
          Intenta con otros términos de búsqueda o crea el primer administrador
        </p>
      </div>
    );
  }
  
  // ============================================================================================
  // RENDERIZADO DE LA TABLA CON DATOS
  // ============================================================================================
  
  return (
    <Table>
      {/* Header de la tabla con columnas definidas */}
      <TableHeader>
        <TableRow>
          <TableHead>Administrador</TableHead>    {/* Información personal */}
          <TableHead>Rol</TableHead>              {/* Tipo de administrador */}
          <TableHead>Estado</TableHead>           {/* Estado activo/inactivo */}
          <TableHead>Clubs Asignados</TableHead>  {/* Clubs asociados */}
          <TableHead>Último Login</TableHead>     {/* Fecha de último acceso */}
          <TableHead>Fecha Creación</TableHead>   {/* Fecha de creación del admin */}
          <TableHead className="text-right">Acciones</TableHead> {/* Botones de acción */}
        </TableRow>
      </TableHeader>
      
      {/* Cuerpo de la tabla con datos de administradores */}
      <TableBody>
        {admins.map((admin) => (
          <TableRow key={admin.id}>  {/* Key único para cada fila */}
            
            {/* ============================================================================ */}
            {/* COLUMNA: INFORMACIÓN DEL ADMINISTRADOR */}
            {/* ============================================================================ */}
            <TableCell>
              <div className="flex items-center space-x-3">
                {/* Avatar con ícono de usuario */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
                
                {/* Información textual del administrador */}
                <div>
                  {/* Nombre completo o email como fallback */}
                  <div className="font-medium">
                    {admin.full_name || admin.email}
                  </div>
                  
                  {/* Email con ícono */}
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {admin.email}
                  </div>
                  
                  {/* Teléfono con ícono (solo si existe) */}
                  {admin.phone && (
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {admin.phone}
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
            
            {/* ============================================================================ */}
            {/* COLUMNA: ROL DEL ADMINISTRADOR */}
            {/* ============================================================================ */}
            <TableCell>
              {renderRoleBadge(admin)} {/* Badge según tipo de admin */}
            </TableCell>
            
            {/* ============================================================================ */}
            {/* COLUMNA: ESTADO DEL ADMINISTRADOR */}
            {/* ============================================================================ */}
            <TableCell>
              {renderStatusBadge(admin)} {/* Badge según estado del admin */}
            </TableCell>
            
            {/* ============================================================================ */}
            {/* COLUMNA: CLUBS ASIGNADOS */}
            {/* ============================================================================ */}
            <TableCell>
              {renderClubsBadges(admin.clubs)} {/* Badges de clubs */}
            </TableCell>
            
            {/* ============================================================================ */}
            {/* COLUMNA: ÚLTIMO LOGIN */}
            {/* ============================================================================ */}
            <TableCell>
              <div className="text-sm text-gray-900">
                {admin.last_login_display} {/* Fecha formateada */}
              </div>
            </TableCell>
            
            {/* ============================================================================ */}
            {/* COLUMNA: FECHA DE CREACIÓN */}
            {/* ============================================================================ */}
            <TableCell>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(admin.created_at).toLocaleDateString('es-ES')} {/* Fecha formateada */}
              </div>
            </TableCell>
            
            {/* ============================================================================ */}
            {/* COLUMNA: ACCIONES (DROPDOWN MENÚ) */}
            {/* ============================================================================ */}
            <TableCell className="text-right">
              <DropdownMenu>
                {/* Trigger del dropdown (botón de tres puntos) */}
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span> {/* Texto para screen readers */}
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                
                {/* Contenido del dropdown */}
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Opción: Editar administrador */}
                  <DropdownMenuItem onClick={() => onEdit(admin)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  
                  {/* Opción: Habilitar/Deshabilitar */}
                  <DropdownMenuItem onClick={() => onToggleStatus(admin)}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    {admin.status === 'active' ? 'Deshabilitar' : 'Habilitar'}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Opción: Eliminar administrador (estilo destructivo) */}
                  <DropdownMenuItem 
                    onClick={() => onDelete(admin)}
                    className="text-red-600" // Color rojo para acción peligrosa
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AdminsTable;
