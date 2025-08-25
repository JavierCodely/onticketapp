// Formulario para crear/editar clubs - Replicando lógica exitosa del debug
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Club } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Interfaz para los datos del formulario
interface ClubFormData {
  name: string;
  slug: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'basic' | 'premium' | 'enterprise';
}

// Props del componente
interface ClubFormProps {
  open: boolean;           
  editingClub: Club | null; 
  onClose: () => void;     
  onSuccess: () => void;   
}

const ClubForm: React.FC<ClubFormProps> = ({
  open,
  editingClub,
  onClose,
  onSuccess
}) => {
  // Hook de autenticación para acceder a secureQuery
  const { secureQuery } = useAuth();
  
  // Estado local del formulario - EXACTAMENTE como en el debug exitoso
  const [formData, setFormData] = useState<ClubFormData>({
    name: '',
    slug: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    plan: 'basic'
  });
  
  // Estado para controlar el botón de envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState<Partial<ClubFormData>>({});

  // Función para generar slug automáticamente desde el nombre
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Effect EXACTO del debug que funcionaba - PATRÓN CRÍTICO
  useEffect(() => {
    if (open) {
      console.log(`Diálogo abierto. Editing club: ${editingClub?.id || 'NUEVO'}`);
      
      if (editingClub) {
        // Modo edición: cargar datos del club existente
        setFormData({
          name: editingClub.name || '',
          slug: editingClub.slug || '',
          description: editingClub.description || '',
          email: editingClub.email || '',
          phone: editingClub.phone || '',
          address: editingClub.address || '',
          status: editingClub.status || 'active',
          plan: editingClub.plan || 'basic'
        });
        console.log(`Datos cargados en el formulario`);
      } else {
        // Modo creación: formulario vacío
        setFormData({
          name: '',
          slug: '',
          description: '',
          email: '',
          phone: '',
          address: '',
          status: 'active',
          plan: 'basic'
        });
        console.log(`Formulario resetado para nuevo club`);
      }
      
      // CRÍTICO: Reset inmediato del estado isSubmitting
      setIsSubmitting(false);
      console.log(`Estado isSubmitting resetado a false`);
      
      // Limpiar errores
      setFormErrors({});
    }
  }, [open, editingClub]); // Dependencias EXACTAS del debug exitoso

  // Función para manejar cambios en los campos del formulario
  const handleFieldChange = (field: keyof ClubFormData, value: string) => {
    // Actualizar el campo específico
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generar slug cuando se cambia el nombre (solo en modo creación)
    if (field === 'name' && !editingClub) {
      const newSlug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        slug: newSlug
      }));
    }
    
    // Limpiar error del campo si existe
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Función para validar el formulario antes del envío
  const validateForm = (): boolean => {
    const errors: Partial<ClubFormData> = {};
    
    // Validar nombre (obligatorio)
    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    
    // Validar slug (obligatorio y formato)
    if (!formData.slug.trim()) {
      errors.slug = 'El slug es obligatorio';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'El slug solo puede contener letras minúsculas, números y guiones';
    }
    
    // Validar email (formato si se proporciona)
    if (formData.email && !/^\S+@\S+$/.test(formData.email)) {
      errors.email = 'Formato de email inválido';
    }
    
    // Actualizar errores y retornar si es válido
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Función principal para guardar el club - REPLICANDO LÓGICA EXITOSA
  const handleSave = async () => {
    console.log(`Iniciando guardado...`);
    console.log(`Datos del formulario: ${JSON.stringify(formData)}`);
    console.log(`Es edición: ${!!editingClub}`);
    
    // Validar formulario antes de proceder
    if (!validateForm()) {
      console.log(`❌ Validación fallida`);
      return;
    }
    
    // CRÍTICO: Marcar como enviando INMEDIATAMENTE
    console.log(`Estado cambiado a isSubmitting = true`);
    setIsSubmitting(true);
    
    try {
      // Preparar datos EXACTAMENTE como en el debug exitoso
      const dataToSave = {
        ...formData,
        updated_at: new Date().toISOString(),
        // Solo agregar campos de creación si es un club nuevo
        ...(editingClub ? {} : {
          timezone: 'America/Argentina/Buenos_Aires',
          currency: 'ARS',
          settings: {},
          created_at: new Date().toISOString()
        })
      };
      
      console.log(`Datos a guardar: ${JSON.stringify(dataToSave)}`);
      
      // Determinar operación y condiciones EXACTAMENTE como en debug
      const operation = editingClub ? 'update' : 'insert';
      const conditions = editingClub ? { id: editingClub.id } : undefined;
      
      console.log(`Operación: ${operation}`);
      console.log(`Condiciones: ${JSON.stringify(conditions)}`);
      
      // Ejecutar la operación usando secureQuery
      const result = await secureQuery(
        'clubs',
        operation,
        dataToSave,
        conditions
      );
      
      console.log(`Resultado de secureQuery: ${JSON.stringify(result)}`);
      
      // Verificar si hubo error
      if (result.error) {
        console.log(`❌ Error en secureQuery: ${JSON.stringify(result.error)}`);
        throw new Error(result.error.message || 'Error desconocido');
      }
      
      console.log(`SUCCESS: Club guardado exitosamente`);
      console.log(`Datos retornados: ${JSON.stringify(result.data)}`);
      
      // CRÍTICO: Usar setTimeout EXACTAMENTE como en el debug exitoso
      setTimeout(() => {
        console.log(`Cerrando diálogo y notificando éxito...`);
        setIsSubmitting(false);
        onSuccess(); // Recargar lista de clubs
        onClose();   // Cerrar diálogo
      }, 100);
      
    } catch (error) {
      // Manejar errores
      console.error('💥 Error al guardar club:', error);
      alert(`Error al ${editingClub ? 'actualizar' : 'crear'} club: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`);
      setIsSubmitting(false);
    }
  };

  // Función para cerrar el diálogo y resetear estado
  const handleClose = () => {
    setIsSubmitting(false);
    setFormErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {/* Header del diálogo */}
        <DialogHeader>
          <DialogTitle>
            {editingClub ? 'Editar Club' : 'Nuevo Club'}
          </DialogTitle>
          <DialogDescription>
            {editingClub 
              ? `Modificando: ${editingClub.name}`
              : 'Crear un nuevo club en el sistema'
            }
          </DialogDescription>
        </DialogHeader>
        
        {/* Campos del formulario */}
        <div className="space-y-4">
          {/* Campo Nombre - Obligatorio */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Club *</Label>
            <Input
              id="name"
              placeholder="Ej: Club Atlético River Plate"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={formErrors.name ? 'border-red-500' : ''}
            />
            {formErrors.name && (
              <p className="text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>

          {/* Campo Slug - Obligatorio, auto-generado en creación */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL amigable) *</Label>
            <Input
              id="slug"
              placeholder="club-atletico-river-plate"
              value={formData.slug}
              onChange={(e) => handleFieldChange('slug', e.target.value)}
              className={formErrors.slug ? 'border-red-500' : ''}
            />
            {formErrors.slug && (
              <p className="text-sm text-red-500">{formErrors.slug}</p>
            )}
          </div>

          {/* Campos opcionales en grid 2x2 */}
          <div className="grid grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contacto@club.com"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+54 11 1234-5678"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              />
            </div>
          </div>

          {/* Descripción - campo ancho */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="Descripción del club..."
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
            />
          </div>

          {/* Dirección - campo ancho */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              placeholder="Dirección física del club"
              value={formData.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
            />
          </div>

          {/* Selects para Estado y Plan */}
          <div className="grid grid-cols-2 gap-4">
            {/* Estado del club */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="suspended">Suspendido</option>
              </select>
            </div>

            {/* Plan de suscripción */}
            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <select
                id="plan"
                value={formData.plan}
                onChange={(e) => handleFieldChange('plan', e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background"
              >
                <option value="basic">Básico</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <DialogFooter>
          {/* Botón cancelar */}
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          
          {/* Botón guardar/crear */}
          <Button 
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : (editingClub ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClubForm;