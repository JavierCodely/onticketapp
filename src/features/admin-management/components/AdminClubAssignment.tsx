// ================================================================================================
// COMPONENTE DE ASIGNACIÓN DE CLUBS PARA ADMINISTRADORES
// ================================================================================================
// Este componente maneja la selección de clubs que serán asignados al administrador:
// - Muestra lista de clubs disponibles
// - Permite seleccionar/deseleccionar múltiples clubs
// - Muestra estado de cada club
// - Proporciona resumen de clubs seleccionados
// ================================================================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// ================================================================================================
// TIPOS E INTERFACES
// ================================================================================================

interface Club {
  id: string;                      // ID único del club
  name: string;                    // Nombre del club
  slug: string;                    // Slug URL-friendly
  status: 'active' | 'inactive';   // Estado del club
  description?: string;            // Descripción opcional del club
  location?: string;               // Ubicación opcional del club
}

interface AdminClubAssignmentProps {
  clubs: Club[];                   // Lista de todos los clubs disponibles
  selectedClubs: string[];         // IDs de clubs actualmente seleccionados
  onClubToggle: (clubId: string) => void; // Callback para toggle de club
  isLoading?: boolean;             // Si está cargando clubs
}

// ================================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================================

const AdminClubAssignment: React.FC<AdminClubAssignmentProps> = ({
  clubs,
  selectedClubs,
  onClubToggle,
  isLoading = false
}) => {
  
  // ============================================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================================
  
  /**
   * Verifica si un club está seleccionado
   * @param clubId - ID del club a verificar
   * @returns true si el club está seleccionado
   */
  const isClubSelected = (clubId: string): boolean => {
    return selectedClubs.includes(clubId);
  };

  /**
   * Obtiene estadísticas de la selección actual
   * @returns Objeto con estadísticas de selección
   */
  const getSelectionStats = () => {
    const totalClubs = clubs.length;
    const selectedCount = selectedClubs.length;
    const activeClubs = clubs.filter(club => club.status === 'active').length;
    const selectedActiveClubs = clubs.filter(club => 
      isClubSelected(club.id) && club.status === 'active'
    ).length;

    return {
      totalClubs,
      selectedCount,
      activeClubs,
      selectedActiveClubs,
      selectionPercentage: totalClubs > 0 ? Math.round((selectedCount / totalClubs) * 100) : 0
    };
  };

  /**
   * Obtiene el color de badge apropiado para el estado del club
   * @param status - Estado del club
   * @returns Variant del badge
   */
  const getStatusBadgeVariant = (status: Club['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  /**
   * Maneja el clic en un club para seleccionar/deseleccionar
   * @param clubId - ID del club clickeado
   */
  const handleClubClick = (clubId: string) => {
    // Propagar el toggle al componente padre
    onClubToggle(clubId);
  };

  // ============================================================================================
  // COMPONENTES AUXILIARES
  // ============================================================================================
  
  /**
   * Componente para mostrar un club individual
   */
  const ClubItem: React.FC<{ club: Club }> = ({ club }) => {
    const isSelected = isClubSelected(club.id);
    
    return (
      <div 
        className={`flex items-center space-x-3 p-3 border rounded-lg transition-all duration-200 cursor-pointer hover:bg-accent/30 ${
          isSelected ? 'bg-accent/20 border-primary/30' : 'hover:border-accent'
        }`}
        onClick={() => handleClubClick(club.id)}
      >
        {/* Checkbox de selección */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => handleClubClick(club.id)}
          className="pointer-events-none" // Evitar doble trigger
        />
        
        {/* Información principal del club */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            {/* Nombre del club */}
            <p className="font-medium text-sm truncate">{club.name}</p>
            
            {/* Badge de estado */}
            <Badge 
              variant={getStatusBadgeVariant(club.status)}
              className="text-xs"
            >
              {club.status === 'active' ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          
          {/* Slug del club */}
          <p className="text-xs text-muted-foreground truncate">
            Slug: {club.slug}
          </p>
          
          {/* Descripción si existe */}
          {club.description && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {club.description}
            </p>
          )}
          
          {/* Ubicación si existe */}
          {club.location && (
            <p className="text-xs text-muted-foreground truncate">
              📍 {club.location}
            </p>
          )}
        </div>
        
        {/* Indicador visual de selección */}
        {isSelected && (
          <div className="w-2 h-2 bg-primary rounded-full" />
        )}
      </div>
    );
  };

  /**
   * Componente para mostrar estadísticas de selección
   */
  const SelectionSummary: React.FC = () => {
    const stats = getSelectionStats();
    
    if (stats.selectedCount === 0) {
      return (
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">
            No hay clubs seleccionados
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Clubs seleccionados:</span>
          <span className="font-medium">
            {stats.selectedCount} de {stats.totalClubs}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Clubs activos seleccionados:</span>
          <span className="font-medium text-green-600">
            {stats.selectedActiveClubs}
          </span>
        </div>
        
        {/* Barra de progreso simple */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${stats.selectionPercentage}%` }}
          />
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          {stats.selectionPercentage}% de clubs seleccionados
        </p>
      </div>
    );
  };

  // ============================================================================================
  // RENDER PRINCIPAL
  // ============================================================================================
  
  // Mostrar mensaje si no hay clubs disponibles
  if (!isLoading && clubs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clubs Asignados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
            <p className="text-sm text-muted-foreground">
              No hay clubs disponibles para asignar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Contacta al administrador del sistema
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Clubs Asignados</span>
          {isLoading && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Lista de clubs */}
        <div className="space-y-3 mb-6">
          {clubs.map((club) => (
            <ClubItem key={club.id} club={club} />
          ))}
        </div>
        
        {/* Resumen de selección */}
        {clubs.length > 0 && (
          <div className="pt-4 border-t">
            <SelectionSummary />
          </div>
        )}
        
        {/* Información adicional */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h5 className="text-xs font-medium mb-2">Información importante:</h5>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Los administradores solo pueden gestionar clubs asignados</li>
            <li>• Se puede cambiar la asignación en cualquier momento</li>
            <li>• Los clubs inactivos no afectan el funcionamiento</li>
            {selectedClubs.length > 0 && (
              <li className="text-green-600 font-medium">
                • {selectedClubs.length} club{selectedClubs.length !== 1 ? 's' : ''} será{selectedClubs.length !== 1 ? 'n' : ''} asignado{selectedClubs.length !== 1 ? 's' : ''}
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminClubAssignment;
