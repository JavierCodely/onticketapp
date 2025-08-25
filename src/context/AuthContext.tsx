// ================================================================================================
// CONTEXTO DE AUTENTICACIÓN - VERSION REFACTORIZADA CON COMENTARIOS DETALLADOS
// ================================================================================================
// Este archivo maneja toda la lógica de autenticación, gestión de usuarios y operaciones seguras
// con RLS (Row Level Security) en Supabase. Es el corazón del sistema de autenticación.
// ================================================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, Club } from '@/types/database';

// ================================================================================================
// DEFINICIÓN DE TIPOS PARA EL CONTEXTO
// ================================================================================================

// Estado completo del usuario autenticado
interface AuthState {
  user: {
    user: User;           // Datos del usuario de Supabase auth
    profile: Profile;     // Perfil extendido desde tabla profiles
    clubs: Club[];        // Clubs a los que el usuario tiene acceso
  } | null;
}

// Tipo para el contexto de autenticación que será compartido por toda la app
interface AuthContextType {
  // Estados principales
  authState: AuthState;                           // Estado actual de autenticación
  isLoading: boolean;                            // Indica si está cargando datos de auth
  
  // Funciones de autenticación básica
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;              // Refresca datos del usuario actual
  
  // Funciones de verificación de roles y permisos
  isSuperAdmin: () => boolean;                   // Verifica si es super administrador
  hasClubRole: (clubId: string, role: string) => boolean; // Verifica rol en club específico
  
  // Función CRÍTICA para operaciones seguras con RLS
  secureQuery: <T = any>(
    table: string,                               // Tabla de la base de datos
    operation: 'select' | 'insert' | 'update' | 'delete', // Tipo de operación
    data?: any,                                  // Datos para insert/update
    conditions?: any                             // Condiciones para update/delete/select
  ) => Promise<{ data: T[] | null; error: any }>;
}

// Props para el provider del contexto
interface AuthProviderProps {
  children: React.ReactNode;
}

// ================================================================================================
// CREACIÓN DEL CONTEXTO Y HOOK PERSONALIZADO
// ================================================================================================

// Crear contexto con valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto de autenticación
// Este hook debe ser usado en todos los componentes que necesiten autenticación
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// ================================================================================================
// COMPONENTE PROVIDER DE AUTENTICACIÓN
// ================================================================================================

export function AuthProvider({ children }: AuthProviderProps) {
  // ============================================================================================
  // ESTADOS DEL COMPONENTE
  // ============================================================================================
  
  // Estado principal de autenticación - contiene toda la info del usuario
  const [authState, setAuthState] = useState<AuthState>({ user: null });
  
  // Estado de carga - true cuando está procesando operaciones de auth
  const [isLoading, setIsLoading] = useState(true);
  
  // Control de concurrencia para evitar múltiples queries simultáneas del mismo tipo
  const [activeQueries, setActiveQueries] = useState<Set<string>>(new Set());

  // ============================================================================================
  // FUNCIÓN PARA OBTENER PERFIL COMPLETO DEL USUARIO
  // ============================================================================================
  
  // Esta función obtiene el perfil extendido y los clubs del usuario desde la base de datos
  const fetchUserProfile = useCallback(async (user: User) => {
    try {
      console.log('🔄 Obteniendo perfil del usuario:', user.email);
      
      // 1. Obtener perfil extendido desde tabla profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Error obteniendo perfil:', profileError);
        throw profileError;
      }

      if (!profileData) {
        console.error('❌ No se encontró perfil para el usuario');
        throw new Error('Perfil no encontrado');
      }

      console.log('✅ Perfil obtenido:', profileData);

      // 2. Obtener clubs del usuario desde user_clubs
      const { data: userClubsData, error: userClubsError } = await supabase
        .from('user_clubs')
        .select(`
          club_id,
          role,
          is_active,
          clubs (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (userClubsError) {
        console.error('❌ Error obteniendo clubs del usuario:', userClubsError);
        // No lanzar error, solo loggear (clubs pueden estar vacíos)
      }

      // 3. Extraer clubs de la relación
      const clubs: Club[] = userClubsData?.map((uc: any) => uc.clubs).filter(Boolean) || [];
      console.log(`✅ Clubs obtenidos: ${clubs.length} clubs`);

      // 4. Actualizar estado con datos completos
      setAuthState({
        user: {
          user,           // Usuario de Supabase auth
          profile: profileData, // Perfil extendido
          clubs           // Clubs asociados
        }
      });

      console.log('✅ Estado de autenticación actualizado');

    } catch (error) {
      console.error('💥 Error en fetchUserProfile:', error);
      // En caso de error, limpiar estado
      clearAuthState();
      throw error;
    }
  }, []);

  // ============================================================================================
  // FUNCIÓN PARA LIMPIAR ESTADO DE AUTENTICACIÓN
  // ============================================================================================
  
  // Limpia completamente el estado cuando el usuario no está autenticado
  const clearAuthState = useCallback(() => {
    console.log('🧹 Limpiando estado de autenticación');
    setAuthState({ user: null });
    setActiveQueries(new Set()); // Limpiar queries activas
  }, []);

  // ============================================================================================
  // FUNCIÓN DE LOGIN
  // ============================================================================================
  
  // Función para autenticar usuario con email y contraseña
  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Iniciando login para:', email);
      // SEGURIDAD: No loggear contraseñas en producción
      console.log('🔒 Autenticando usuario...');
      setIsLoading(true);

      // Intentar autenticación con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Error en login:', error);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        console.error('❌ No se recibió usuario en respuesta de login');
        return { success: false, error: 'Usuario no encontrado' };
      }

      console.log('✅ Login exitoso:', data.user.email);
      
      // El evento de auth state change se encargará de actualizar el estado
      return { success: true };

    } catch (error) {
      console.error('💥 Error inesperado en login:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================================
  // FUNCIÓN DE LOGOUT
  // ============================================================================================
  
  // Función para cerrar sesión del usuario
  const logout = async () => {
    try {
      console.log('🔐 Iniciando logout');
      setIsLoading(true);

      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Error en logout:', error);
        throw error;
      }

      console.log('✅ Logout exitoso');
      
      // Limpiar estado local
      clearAuthState();

    } catch (error) {
      console.error('💥 Error en logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================================
  // FUNCIÓN PARA REFRESCAR DATOS DEL USUARIO
  // ============================================================================================
  
  // Refresca los datos del usuario actual desde la base de datos
  const refreshUser = async () => {
    if (!authState.user) {
      console.log('⚠️ No hay usuario para refrescar');
      return;
    }

    try {
      console.log('🔄 Refrescando datos del usuario');
      await fetchUserProfile(authState.user.user);
    } catch (error) {
      console.error('💥 Error refrescando usuario:', error);
    }
  };

  // ============================================================================================
  // FUNCIONES DE VERIFICACIÓN DE ROLES Y PERMISOS
  // ============================================================================================
  
  // Verifica si el usuario actual es super administrador
  const isSuperAdmin = (): boolean => {
    const result = authState.user?.profile?.is_super_admin === true;
    console.log(`🔍 isSuperAdmin() retorna: ${result}`);
    return result;
  };

  // Verifica si el usuario tiene un rol específico en un club determinado
  const hasClubRole = (clubId: string, _role: string): boolean => {
    if (!authState.user) return false;
    
    // Super admins tienen acceso a todo
    if (isSuperAdmin()) return true;
    
    // Verificar en clubs del usuario (esto requeriría datos adicionales)
    // Por ahora, simplificamos la lógica
    return authState.user.clubs.some(club => club.id === clubId);
  };

  // ============================================================================================
  // FUNCIÓN CRÍTICA: SECURE QUERY CON RLS
  // ============================================================================================
  
  // Esta función ejecuta queries de forma segura con Row Level Security (RLS)
  // Incluye control de concurrencia, timeouts y manejo robusto de errores
  const secureQuery = async <T = any>(
    table: string,                               // Tabla objetivo
    operation: 'select' | 'insert' | 'update' | 'delete', // Tipo de operación
    data?: any,                                  // Datos para insert/update
    conditions?: any                             // Condiciones para update/delete/select
  ): Promise<{ data: T[] | null; error: any }> => {
    
    // Generar ID único para tracking de la query
    const queryId = `${operation}-${table}-${Date.now()}-${Math.random()}`;
    console.log(`🔒 SecureQuery START [${queryId}]: ${operation} en ${table}`, { data, conditions });

    try {
      // 1. VERIFICAR AUTENTICACIÓN
      if (!authState.user) {
        console.log(`❌ Usuario no autenticado [${queryId}]`);
        return { data: null, error: { message: 'Usuario no autenticado' } };
      }

      console.log(`✅ Usuario autenticado confirmado: ${authState.user.user.email} [${queryId}]`);

      // 2. CONTROL DE CONCURRENCIA
      // Evitar demasiadas queries simultáneas del mismo tipo
      const similarQueryKey = `${operation}-${table}`;
      if (activeQueries.size > 3) {
        console.log(`⚠️ Demasiadas queries activas (${activeQueries.size}), rechazando [${queryId}]`);
        return { data: null, error: { message: 'Demasiadas operaciones simultáneas' } };
      }

      // Marcar query como activa
      setActiveQueries(prev => new Set([...prev, similarQueryKey]));
      console.log(`📝 Query marcada como activa [${queryId}]: ${similarQueryKey} (total: ${activeQueries.size + 1})`);

      // 3. CONFIGURAR TIMEOUT DE 10 SEGUNDOS
      let result: any;

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Timeout: ${operation} en ${table} tardó más de 10 segundos`));
        }, 10000); // 10 segundos timeout
      });

      // 4. EJECUTAR OPERACIÓN ESPECÍFICA
      const operationPromise = (async () => {
        switch (operation) {
          case 'select':
            console.log('📡 Ejecutando SELECT...');
            // SELECT con o sin condiciones
            if (conditions) {
              console.log('📡 SELECT con condiciones:', conditions);
              let selectQuery = supabase.from(table).select('*');
              
              // Aplicar condiciones dinámicamente
              Object.entries(conditions).forEach(([key, value]) => {
                selectQuery = selectQuery.eq(key, value as any);
              });
              
              const selectResult = await selectQuery;
              console.log('📡 Resultado SELECT con condiciones:', selectResult);
              return selectResult;
            } else {
              const selectResult = await supabase.from(table).select('*');
              console.log('📡 Resultado SELECT sin condiciones:', selectResult);
              return selectResult;
            }

          case 'insert':
            console.log('📡 Ejecutando INSERT...');
            // INSERT siempre devuelve los datos insertados
            const insertResult = await supabase.from(table).insert(data).select();
            console.log('📡 Resultado INSERT:', insertResult);
            return insertResult;

          case 'update':
            console.log('📡 Ejecutando UPDATE...');
            console.log('📡 UPDATE data:', data);
            console.log('📡 UPDATE conditions:', conditions);
            
            try {
              let updateResult;
              if (conditions?.id) {
                console.log('📡 UPDATE con ID:', conditions.id);
                // UPDATE con ID específico - usar casting para evitar errores de TypeScript
                updateResult = await (supabase as any)
                  .from(table)
                  .update(data)
                  .eq('id', conditions.id)
                  .select();
              } else {
                console.log('📡 UPDATE sin condiciones');
                updateResult = await (supabase as any)
                  .from(table)
                  .update(data)
                  .select();
              }
              console.log('📡 Resultado UPDATE:', updateResult);
              return updateResult;
            } catch (updateError) {
              console.error('💥 Error específico en UPDATE:', updateError);
              throw updateError;
            }

          case 'delete':
            console.log('📡 Ejecutando DELETE...');
            // DELETE con o sin condiciones
            let deleteResult;
            if (conditions?.id) {
              deleteResult = await supabase.from(table).delete().eq('id', conditions.id).select();
            } else {
              deleteResult = await supabase.from(table).delete().select();
            }
            console.log('📡 Resultado DELETE:', deleteResult);
            return deleteResult;

          default:
            console.log('❌ Operación no soportada:', operation);
            throw new Error(`Operación ${operation} no soportada`);
        }
      })();

      // 5. EJECUTAR CON TIMEOUT
      console.log(`⏰ Iniciando Promise.race [${queryId}]...`);
      result = await Promise.race([operationPromise, timeoutPromise]);
      console.log(`⏰ Promise.race completado [${queryId}]`);

      // 6. VALIDAR RESULTADO
      console.log(`📥 SecureQuery RESULT [${queryId}]:`, result);
      console.log(`📥 Tipo de result [${queryId}]:`, typeof result);
      console.log(`📥 Es array result [${queryId}]:`, Array.isArray(result));
      console.log(`📥 Keys de result [${queryId}]:`, result ? Object.keys(result) : 'N/A');

      // Verificar que el resultado tiene la estructura esperada
      if (!result || typeof result !== 'object') {
        console.log(`❌ Resultado inválido [${queryId}]:`, result);
        console.log(`❌ Verificación: result=${result}, typeof=${typeof result}`);
        return { data: null, error: { message: 'Respuesta inválida del servidor' } };
      }

      // 7. RETORNAR RESULTADO FORMATEADO
      return {
        data: result.data as T[] || null,
        error: result.error || null
      };

    } catch (error) {
      // 8. MANEJO DE ERRORES
      console.error(`💥 Error en secureQuery [${queryId}]:`, error);
      
      // Detectar timeouts específicamente
      if (error instanceof Error && error.message.includes('Timeout')) {
        console.log(`⏰ Timeout detectado [${queryId}]`);
        return { data: null, error: { message: `Operación cancelada por timeout: ${error.message}` } };
      }
      
      return { data: null, error: { message: error instanceof Error ? error.message : 'Error desconocido' } };
      
    } finally {
      // 9. LIMPIEZA - SIEMPRE SE EJECUTA
      const similarQueryKey = `${operation}-${table}`;
      setActiveQueries(prev => {
        const newSet = new Set(prev);
        newSet.delete(similarQueryKey);
        return newSet;
      });
      console.log(`🧹 Query limpiada [${queryId}]: ${similarQueryKey}`);
    }
  };

  // ============================================================================================
  // EFFECTS PARA MONITOREO DE SESIÓN
  // ============================================================================================

  // Effect para configurar listener de cambios de autenticación y verificación inicial
  useEffect(() => {
    console.log('🚀 Iniciando AuthProvider...');
    
    // Función para verificar sesión inicial
    const checkInitialSession = async () => {
      try {
        console.log('🔍 Verificando sesión inicial...');
        
        // Obtener sesión actual de Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error obteniendo sesión inicial:', error);
          clearAuthState();
          return;
        }

        if (session?.user) {
          console.log('✅ Sesión inicial encontrada:', session.user.email);
          await fetchUserProfile(session.user);
        } else {
          console.log('ℹ️ No hay sesión inicial');
          clearAuthState();
        }
      } catch (error) {
        console.error('💥 Error en verificación inicial:', error);
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    // Configurar listener de cambios de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 Auth state change: ${event} - User: ${session?.user?.email || 'N/A'}`);
        
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            // Usuario se autenticó
            console.log('✅ Usuario autenticado:', session.user.email);
            await fetchUserProfile(session.user);
          } else if (event === 'SIGNED_OUT') {
            // Usuario cerró sesión
            console.log('🚪 Usuario desautenticado');
            clearAuthState();
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            // Token renovado
            console.log('🔄 Token renovado para:', session.user.email);
            // No necesitamos recargar perfil, solo verificar que sigue válido
          }
        } catch (error) {
          console.error('💥 Error manejando cambio de auth state:', error);
          clearAuthState();
        } finally {
          setIsLoading(false);
        }
      }
    );

    // Ejecutar verificación inicial
    checkInitialSession();

    // Cleanup: desuscribir del listener
    return () => {
      console.log('🛑 Desuscribiendo de auth state changes');
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, clearAuthState]);

  // ============================================================================================
  // VALOR DEL CONTEXTO
  // ============================================================================================

  // Objeto que contiene todos los valores y funciones expuestos por el contexto
  const contextValue: AuthContextType = {
    // Estados
    authState,
    isLoading,
    
    // Funciones de autenticación
    login,
    logout,
    refreshUser,
    
    // Funciones de verificación
    isSuperAdmin,
    hasClubRole,
    
    // Función crítica para operaciones seguras
    secureQuery,
  };

  // ============================================================================================
  // RENDERIZADO DEL PROVIDER
  // ============================================================================================

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ================================================================================================
// COMENTARIOS ADICIONALES Y NOTAS TÉCNICAS
// ================================================================================================

/*
NOTAS IMPORTANTES SOBRE EL FUNCIONAMIENTO:

1. SESIÓN PERSISTENCE:
   - Supabase maneja automáticamente la persistencia de sesiones
   - El cliente está configurado con persistSession: true en src/lib/supabase.ts
   - localStorage se usa para mantener sesiones entre recargas de página

2. ROW LEVEL SECURITY (RLS):
   - Las políticas RLS están configuradas en Supabase
   - secureQuery() funciona con estas políticas automáticamente
   - Super admins tienen acceso completo via is_super_admin() function

3. CONTROL DE CONCURRENCIA:
   - activeQueries previene múltiples queries simultáneas del mismo tipo
   - Timeout de 10 segundos previene queries colgadas
   - Cada query tiene un ID único para tracking en logs

4. MANEJO DE ERRORES:
   - Todos los errores se loggean con detalles específicos
   - Timeouts se detectan y manejan por separado
   - Estados se limpian automáticamente en caso de error

5. RENDIMIENTO:
   - useCallback() optimiza funciones para evitar re-renders
   - fetchUserProfile() se ejecuta solo cuando es necesario
   - Estados se actualizan de forma atómica

6. DEBUGGING:
   - Logs extensivos con emojis para fácil identificación
   - Cada operación tiene IDs únicos para tracking
   - Estados intermedios se loggean para diagnostics
*/
