// ================================================================================================
// SECCIÓN DE ASIGNACIÓN DE CLUBS DEL ADMINISTRADOR
// ================================================================================================
// Componente que permite seleccionar/deseleccionar clubs para el administrador
// ================================================================================================

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ================================================================================================
// INTERFACES
// ================================================================================================

// Estructura de un club
interface Club {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface AdminClubAssignmentProps {
  // Datos
  clubs: Club[];           // Lista de todos los clubs disponibles
  selectedClubs: string[]; // IDs de clubs seleccionados
  
  // Callbacks
  onClubToggle: (clubId: string) => void; // Función para seleccionar/deseleccionar club
}

// ================================================================================================
// COMPONENTE
// ================================================================================================

const AdminClubAssignment: React.FC<AdminClubAssignmentProps> = ({
  clubs,
  selectedClubs,
  onClubToggle
}) => {
  
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        
        {/* Título de la sección */}
        <h3 className="text-lg font-semibold">Clubs Asignados</h3>
        
        {/* ==================================================================================== */}
        {/* VERIFICAR SI HAY CLUBS DISPONIBLES */}
        {/* ==================================================================================== */}
        {clubs.length === 0 ? (
          
          /* Mensaje cuando no hay clubs disponibles */
          <Alert>
            <AlertDescription>
              No hay clubs disponibles. Cree clubs primero en la pestaña "Clubs".
            </AlertDescription>
          </Alert>
          
        ) : (
          
          /* Lista de clubs disponibles para seleccionar */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {clubs.map((club) => (
              
              <div
                key={club.id}
                className={`
                  flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors
                  ${selectedClubs.includes(club.id)
                    ? 'border-primary bg-primary/5'  // Estilo cuando está seleccionado
                    : 'border-gray-200 hover:border-gray-300' // Estilo cuando no está seleccionado
                  }
                `}
                onClick={() => onClubToggle(club.id)} // Manejar click en toda la card
              >
                
                {/* Checkbox visual */}
                <input
                  type="checkbox"
                  checked={selectedClubs.includes(club.id)} // Checked si está en la lista
                  onChange={() => onClubToggle(club.id)}     // Manejar cambio del checkbox
                  className="rounded"
                />
                
                {/* Información del club */}
                <div className="flex-1">
                  {/* Nombre del club */}
                  <p className="font-medium">{club.name}</p>
                  
                  {/* Slug del club */}
                  <p className="text-sm text-muted-foreground">{club.slug}</p>
                </div>
                
                {/* Badge del estado del club */}
                <Badge variant={club.status === 'active' ? 'default' : 'secondary'}>
                  {club.status}
                </Badge>
                
              </div>
            ))}
          </div>
        )}

        {/* ==================================================================================== */}
        {/* INFORMACIÓN DE CLUBS SELECCIONADOS */}
        {/* ==================================================================================== */}
        {selectedClubs.length > 0 && (
          <Alert>
            <AlertDescription>
              Clubs seleccionados: {selectedClubs.length}
            </AlertDescription>
          </Alert>
        )}

      </CardContent>
    </Card>
  );
};

export default AdminClubAssignment;
