// ================================================================================================
// SECCIÓN DE INFORMACIÓN LABORAL DEL ADMINISTRADOR
// ================================================================================================
// Componente que maneja: salario, rol del sistema, estado activo/inactivo
// ================================================================================================

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';

// ================================================================================================
// INTERFACES
// ================================================================================================

interface AdminWorkInfoProps {
  // Datos del formulario
  salary: string;
  role: 'club_admin' | 'super_admin';
  status: 'active' | 'inactive';
  
  // Validaciones
  salaryError?: string;
  
  // Callbacks
  onSalaryChange: (value: string) => void;
  onRoleChange: (value: 'club_admin' | 'super_admin') => void;
  onStatusChange: (active: boolean) => void;
}

// ================================================================================================
// COMPONENTE
// ================================================================================================

const AdminWorkInfo: React.FC<AdminWorkInfoProps> = ({
  // Props de datos
  salary,
  role,
  status,
  
  // Props de validación
  salaryError,
  
  // Props de callbacks
  onSalaryChange,
  onRoleChange,
  onStatusChange
}) => {
  
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        
        {/* Título de la sección */}
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Información Laboral
        </h3>

        {/* Grid de dos columnas para organizar los campos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* ==================================================================================== */}
          {/* CAMPO: SALARIO MENSUAL */}
          {/* ==================================================================================== */}
          <div className="space-y-2">
            <Label htmlFor="salary">Salario Mensual</Label>
            
            {/* Input numérico para el salario */}
            <Input
              id="salary"
              type="number"
              placeholder="0.00"
              value={salary}
              onChange={(e) => onSalaryChange(e.target.value)}
              className={salaryError ? 'border-red-500' : ''} // Borde rojo si hay error
            />
            
            {/* Mensaje de error si existe */}
            {salaryError && (
              <p className="text-sm text-red-500">{salaryError}</p>
            )}
          </div>

          {/* ==================================================================================== */}
          {/* CAMPO: ROL DEL SISTEMA */}
          {/* ==================================================================================== */}
          <div className="space-y-2">
            <Label>Rol del Sistema</Label>
            
            {/* Select para elegir el rol */}
            <Select 
              value={role} 
              onValueChange={onRoleChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="club_admin">Administrador de Club</SelectItem>
                <SelectItem value="super_admin">Super Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ==================================================================================== */}
        {/* CAMPO: ESTADO DE LA CUENTA */}
        {/* ==================================================================================== */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          
          {/* Información del campo */}
          <div className="space-y-1">
            <Label>Estado de la Cuenta</Label>
            <p className="text-sm text-muted-foreground">
              Controla si el administrador puede iniciar sesión y realizar operaciones
            </p>
          </div>
          
          {/* Controles del estado */}
          <div className="flex items-center gap-3">
            
            {/* Badge visual del estado actual */}
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {status === 'active' ? 'Habilitado' : 'Deshabilitado'}
            </Badge>
            
            {/* Switch para cambiar el estado */}
            <Switch
              checked={status === 'active'} // Checked si está activo
              onCheckedChange={(checked) => onStatusChange(checked)} // Callback cuando cambia
            />
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default AdminWorkInfo;
