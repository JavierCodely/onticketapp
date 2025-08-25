// ================================================================================================
// HOOK PARA GESTIÓN DE DATOS DE ADMINISTRADORES
// ================================================================================================
// Este hook encapsula toda la lógica relacionada con la carga, filtrado y gestión
// de datos de administradores, separando la lógica de negocio de los componentes UI.
// ================================================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Club } from '@/types/database';
import type { AdminWithClubs, AdminFilters, AdminLoadingState } from '@/types/admin';

// ================================================================================================
// INTERFACE DEL HOOK
// ================================================================================================
// Define lo que retorna el hook para uso en componentes
interface UseAdminsDataReturn {
  // Estados principales
  admins: AdminWithClubs[];        // Lista completa de administradores
  filteredAdmins: AdminWithClubs[]; // Lista filtrada según búsqueda
  clubs: Club[];                   // Lista de clubs disponibles
  loading: AdminLoadingState;      // Estados de carga
  
  // Filtros y búsqueda
  filters: AdminFilters;           // Estado actual de filtros
  setSearchTerm: (term: string) => void; // Función para cambiar término de búsqueda
  
  // Operaciones de datos
  loadAdmins: () => Promise<void>; // Recargar lista de administradores
  loadClubs: () => Promise<void>;  // Recargar lista de clubs
}

// ================================================================================================
// IMPLEMENTACIÓN DEL HOOK
// ================================================================================================
export function useAdminsData(): UseAdminsDataReturn {
  // Hook de autenticación para acceso a secureQuery
  const { secureQuery } = useAuth();
  
  // Hook para mostrar notificaciones de error
  const { toast } = useToast();
  
  // ============================================================================================
  // ESTADOS PRINCIPALES
  // ============================================================================================
  
  // Estado para lista completa de administradores cargados desde la base de datos
  const [admins, setAdmins] = useState<AdminWithClubs[]>([]);
  
  // Estado para lista de clubs disponibles en el sistema
  const [clubs, setClubs] = useState<Club[]>([]);
  
  // Estado para controlar diferentes tipos de carga
  const [loading, setLoading] = useState<AdminLoadingState>({
    admins: true,    // Inicialmente cargando administradores
    clubs: true,     // Inicialmente cargando clubs
    operation: false // No hay operaciones en curso
  });
  
  // Estado para filtros de búsqueda y filtrado
  const [filters, setFilters] = useState<AdminFilters>({
    searchTerm: '',           // Sin término de búsqueda inicial
    roleFilter: 'all',        // Mostrar todos los roles
    statusFilter: 'all'       // Mostrar todos los estados
  });
  
  // ============================================================================================
  // FUNCIÓN PARA CARGAR CLUBS DISPONIBLES
  // ============================================================================================
  
  // Función memoizada para cargar todos los clubs del sistema
  // Se usa para mostrar opciones en formularios de asignación
  const loadClubs = useCallback(async () => {
    try {
      console.log('🏢 [useAdminsData] Iniciando carga de clubs...');
      
      // Activar estado de carga para clubs
      setLoading(prev => ({ ...prev, clubs: true }));
      
      // Ejecutar query segura para obtener todos los clubs
      const { data, error } = await secureQuery<Club>('clubs', 'select');
      
      // Verificar si hubo error en la consulta
      if (error) {
        console.error('❌ [useAdminsData] Error cargando clubs:', error);
        throw new Error(error.message || 'Error al cargar clubs');
      }
      
      // Actualizar estado con clubs obtenidos (o array vacío si no hay datos)
      setClubs(data || []);
      console.log(`✅ [useAdminsData] Clubs cargados: ${data?.length || 0} clubs`);
      
    } catch (error) {
      // Manejar errores y mostrar notificación al usuario
      console.error('💥 [useAdminsData] Error en loadClubs:', error);
      toast({
        title: "❌ Error",
        description: `Error al cargar clubs: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      // Desactivar estado de carga siempre, independiente del resultado
      setLoading(prev => ({ ...prev, clubs: false }));
    }
  }, [secureQuery, toast]); // Dependencias para useMemo
  
  // ============================================================================================
  // FUNCIÓN PARA CARGAR ADMINISTRADORES CON SUS CLUBS
  // ============================================================================================
  
  // Función memoizada para cargar todos los administradores desde la nueva tabla
  // Incluye clubs asignados, roles, y datos formateados para la UI
  const loadAdmins = useCallback(async () => {
    try {
      console.log('👥 [useAdminsData] Iniciando carga de administradores desde tabla administradores...');
      
      // Activar estado de carga para administradores
      setLoading(prev => ({ ...prev, admins: true }));
      
      // 1. Obtener todos los administradores de la nueva tabla
      const result = await secureQuery('administradores', 'select');
      
      // Verificar errores en la consulta
      if (result?.error) {
        console.error('❌ [useAdminsData] Error cargando administradores:', result.error);
        throw new Error(result.error.message || 'Error al cargar administradores');
      }
      
      // Si no hay administradores, establecer arrays vacíos y terminar
      if (!result?.data || result.data.length === 0) {
        console.log('ℹ️ [useAdminsData] No se encontraron administradores');
        setAdmins([]);
        return;
      }
      
      console.log(`📊 [useAdminsData] Administradores obtenidos: ${result.data.length}`);
      
      // 2. Para cada administrador, enriquecer con información de clubs
      const adminsWithClubs: AdminWithClubs[] = await Promise.all(
        result.data.map(async (admin: any) => {
          try {
            // Obtener relaciones administrador-club para este administrador específico
            const clubsResult = await secureQuery(
              'administrador_clubs', 
              'select', 
              undefined, 
              { administrador_id: admin.id, is_active: true }
            );
            
            // Si hay error, no fallar completamente, solo loggear
            if (clubsResult?.error) {
              console.error(`❌ [useAdminsData] Error obteniendo clubs para ${admin.email}:`, clubsResult.error);
            }
            
            // Extraer IDs de clubs de las relaciones
            const clubRelations = clubsResult?.data || [];
            const clubIds = clubRelations.map((relation: any) => relation.club_id);
            
            // Obtener información detallada de cada club
            let adminClubs: any[] = [];
            if (clubIds.length > 0) {
              // Por simplicidad, obtenemos todos los clubs y filtramos por ID
              const allClubsResult = await secureQuery('clubs', 'select');
              if (allClubsResult?.data) {
                adminClubs = allClubsResult.data.filter((club: any) => clubIds.includes(club.id));
              }
            }
            
            // Formatear fechas y estados para mostrar en la UI
            const lastLoginDisplay = admin.last_login 
              ? new Date(admin.last_login).toLocaleDateString('es-ES') // Formato español
              : 'Nunca'; // Texto por defecto si nunca se logueó
              
            const statusDisplay = admin.is_super_admin 
              ? 'Super Admin'    // Texto para super administradores
              : 'Admin de Club'; // Texto para administradores regulares

            // Obtener badge de estado según el status del administrador
            const statusBadge = admin.status === 'active' ? 'Activo' : 
                               admin.status === 'inactive' ? 'Inactivo' :
                               admin.status === 'suspended' ? 'Suspendido' :
                               admin.status === 'terminated' ? 'Terminado' : 
                               admin.status;
            
            // Construir objeto AdminWithClubs con toda la información
            const adminWithClubs: AdminWithClubs = {
              ...admin,                               // Spread de todos los campos del administrador
              clubs: adminClubs,                      // Clubs con información completa
              user_clubs: clubRelations,              // Relaciones originales
              total_clubs: adminClubs.length,         // Conteo para mostrar en UI
              last_login_display: lastLoginDisplay,   // Fecha formateada
              status_display: statusDisplay,          // Rol formateado
              status_badge: statusBadge,              // Estado formateado
              account_locked_display: admin.account_locked ? 'Bloqueada' : 'Normal'
            };
            
            console.log(`✅ [useAdminsData] Procesado admin: ${admin.email} (${adminClubs.length} clubs)`);
            return adminWithClubs;
            
          } catch (error) {
            // Si hay error procesando un admin específico, no fallar todo
            console.error(`💥 [useAdminsData] Error procesando admin ${admin.email}:`, error);
            
            // Retornar admin con información mínima en caso de error
            return {
              ...admin,
              clubs: [],                    // Sin clubs
              user_clubs: [],               // Sin relaciones
              total_clubs: 0,               // Conteo cero
              last_login_display: 'Error',  // Indicador de error
              status_display: admin.is_super_admin ? 'Super Admin' : 'Admin de Club',
              status_badge: 'Error',
              account_locked_display: 'Error'
            } as AdminWithClubs;
          }
        })
      );
      
      // 3. Actualizar estado con administradores procesados
      setAdmins(adminsWithClubs);
      console.log(`✅ [useAdminsData] Administradores cargados: ${adminsWithClubs.length} admins`);
      
    } catch (error) {
      // Manejar errores generales y mostrar notificación
      console.error('💥 [useAdminsData] Error en loadAdmins:', error);
      toast({
        title: "❌ Error",
        description: `Error al cargar administradores: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      // Desactivar estado de carga siempre
      setLoading(prev => ({ ...prev, admins: false }));
    }
  }, [secureQuery, toast]); // Dependencias para useCallback
  
  // ============================================================================================
  // FUNCIÓN PARA CAMBIAR TÉRMINO DE BÚSQUEDA
  // ============================================================================================
  
  // Función para actualizar el término de búsqueda en los filtros
  const setSearchTerm = useCallback((term: string) => {
    setFilters(prev => ({
      ...prev,            // Mantener otros filtros
      searchTerm: term    // Actualizar solo el término de búsqueda
    }));
  }, []);
  
  // ============================================================================================
  // COMPUTACIÓN DE ADMINISTRADORES FILTRADOS
  // ============================================================================================
  
  // Memo para calcular administradores filtrados basado en criterios de búsqueda
  const filteredAdmins = useMemo(() => {
    // Si no hay término de búsqueda, retornar todos los administradores
    if (!filters.searchTerm.trim()) {
      return admins;
    }
    
    // Convertir término de búsqueda a minúsculas para comparación case-insensitive
    const searchLower = filters.searchTerm.toLowerCase();
    
    // Filtrar administradores por múltiples campos
    return admins.filter(admin => {
      // Buscar en email del administrador
      const emailMatch = admin.email?.toLowerCase().includes(searchLower);
      
      // Buscar en nombre completo del administrador
      const nameMatch = admin.full_name?.toLowerCase().includes(searchLower);
      
      // Buscar en rol del administrador
      const roleMatch = admin.role?.toLowerCase().includes(searchLower);
      
      // Buscar en nombres o slugs de clubs asignados
      const clubsMatch = admin.clubs.some(club => 
        club.name?.toLowerCase().includes(searchLower) ||    // Nombre del club
        club.slug?.toLowerCase().includes(searchLower)       // Slug del club
      );
      
      // Retornar true si coincide con cualquier criterio
      return emailMatch || nameMatch || roleMatch || clubsMatch;
    });
  }, [admins, filters.searchTerm]); // Recalcular cuando cambien admins o búsqueda
  
  // ============================================================================================
  // EFFECT PARA CARGA INICIAL DE DATOS
  // ============================================================================================
  
  // Effect que se ejecuta al montar el componente para cargar datos iniciales
  useEffect(() => {
    console.log('🔥 [useAdminsData] Hook montado - Cargando datos iniciales...');
    
    // Cargar datos en paralelo para mejor rendimiento
    Promise.all([
      loadAdmins(),  // Cargar administradores
      loadClubs()    // Cargar clubs
    ]).catch(error => {
      // Manejar errores generales de carga inicial
      console.error('💥 [useAdminsData] Error cargando datos iniciales:', error);
    });
  }, []); // Array vacío = ejecutar solo al montar
  
  // ============================================================================================
  // RETORNO DEL HOOK
  // ============================================================================================
  
  // Retornar objeto con todos los estados y funciones para uso en componentes
  return {
    // Estados de datos
    admins,          // Lista completa de administradores
    filteredAdmins,  // Lista filtrada según criterios
    clubs,           // Lista de clubs disponibles
    loading,         // Estados de carga
    
    // Estados de filtros
    filters,         // Filtros actuales
    setSearchTerm,   // Función para cambiar búsqueda
    
    // Funciones de operaciones
    loadAdmins,      // Recargar administradores
    loadClubs        // Recargar clubs
  };
}
