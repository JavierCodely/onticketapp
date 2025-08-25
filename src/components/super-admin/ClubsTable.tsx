// Componente de tabla para mostrar clubs
import React from 'react';
import type { Club } from '@/types/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';

interface ClubsTableProps {
  clubs: Club[];
  loading: boolean;
  onEdit: (club: Club) => void;
  onDelete: (club: Club) => void;
  onToggleStatus: (club: Club) => void;
}

const ClubsTable: React.FC<ClubsTableProps> = ({
  clubs,
  loading,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default" as const,
      inactive: "secondary" as const,
      suspended: "destructive" as const,
    };
    
    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const variants = {
      basic: "secondary" as const,
      premium: "default" as const,
      enterprise: "destructive" as const,
    };
    
    const labels = {
      basic: 'Básico',
      premium: 'Premium',
      enterprise: 'Enterprise',
    };

    return (
      <Badge variant={variants[plan as keyof typeof variants] || "secondary"}>
        {labels[plan as keyof typeof labels] || plan}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Cargando clubs...</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clubs.map((club) => (
          <TableRow key={club.id}>
            <TableCell className="font-medium">{club.name}</TableCell>
            <TableCell className="font-mono text-sm">{club.slug}</TableCell>
            <TableCell>{club.email || 'Sin email'}</TableCell>
            <TableCell>{getStatusBadge(club.status)}</TableCell>
            <TableCell>{getPlanBadge(club.plan)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(club)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                
                <Switch 
                  checked={club.status === 'active'}
                  onCheckedChange={() => onToggleStatus(club)}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(club)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        
        {clubs.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center h-32">
              <p className="text-muted-foreground">No hay clubs registrados</p>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ClubsTable;
