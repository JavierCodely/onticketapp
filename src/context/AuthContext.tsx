// Context de React para manejar la autenticación global de la aplicación

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { 
  AuthContextType, 
  AuthState, 
  AuthUser, 
  LoginCredentials, 
  LoginResponse,
  UserClubWithDetails 
} from '@/types/auth';
import type { Profile } from '@/types/database';

// Creamos el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props para el proveedor del contexto
interface AuthProviderProps {
  children: React.ReactNode;
}

// Proveedor del contexto de autenticación
export function AuthProvider({ children }: AuthProviderProps) {
  // Estado de autenticación inicial (con loading para verificar sesión actual)
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true, // SÍ verificamos si hay una sesión activa al cargar
    error: null
  });

  // Función para obtener el perfil completo del usuario con sus clubs
  const fetchUserProfile = useCallback(async (userId: string): Promise<AuthUser | null> => {
    try {
      // Obtenemos el perfil del usuario desde la tabla profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error al obtener perfil:', profileError);
        return null;
      }

      // Obtenemos los clubs del usuario con detalles completos
      const { data: userClubs, error: clubsError } = await supabase
        .from('user_clubs')
        .select(`
          *,
          club:clubs(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (clubsError) {
        console.error('Error al obtener clubs:', clubsError);
        return null;
      }

      // Obtenemos el usuario de Supabase auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error al obtener usuario auth:', userError);
        return null;
      }

      // Transformamos los datos para que coincidan con nuestro tipo
      const clubsWithDetails: UserClubWithDetails[] = (userClubs || []).map(uc => ({
        id: uc.id,
        user_id: uc.user_id,
        club_id: uc.club_id,
        role: uc.role,
        permissions: uc.permissions,
        is_active: uc.is_active,
        joined_at: uc.joined_at,
        club: uc.club
      }));

      return {
        user,
        profile,
        clubs: clubsWithDetails
      };
    } catch (error) {
      console.error('Error en fetchUserProfile:', error);
      return null;
    }
  }, []);

  // Función simplificada para limpiar el estado (solo logout)
  const clearAuthState = useCallback(() => {
    setAuthState({
      user: null,
      loading: false,
      error: null
    });
  }, []);

  // Función para hacer login
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Intentamos hacer login con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return {
          success: false,
          error: error.message
        };
      }

      if (data.user) {
        // Si el login fue exitoso, obtenemos el perfil completo
        const authUser = await fetchUserProfile(data.user.id);
        
        if (authUser) {
          setAuthState({
            user: authUser,
            loading: false,
            error: null
          });
          
          return {
            success: true,
            user: authUser
          };
        } else {
          setAuthState(prev => ({ ...prev, loading: false, error: 'Error al cargar perfil' }));
          return {
            success: false,
            error: 'Error al cargar perfil de usuario'
          };
        }
      }

      return {
        success: false,
        error: 'Error desconocido en el login'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // Función para hacer logout
  const logout = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Cerramos sesión en Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error al hacer logout:', error);
      }
      
      // Limpiamos cualquier storage local manualmente por si acaso
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
        // Limpiamos todo lo relacionado con supabase
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Limpiamos el estado independientemente del resultado
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error en logout:', error);
      // Limpiamos el estado incluso si hay error
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
    }
  };

  // Función para refrescar los datos del usuario (simplificada)
  const refreshUser = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const authUser = await fetchUserProfile(user.id);
        if (authUser) {
          setAuthState({
            user: authUser,
            loading: false,
            error: null
          });
        }
      } else {
        clearAuthState();
      }
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      clearAuthState();
    }
  };

  // Función para verificar si el usuario tiene un rol específico en un club
  const hasClubRole = (clubId: string, role: string): boolean => {
    if (!authState.user) return false;
    
    return authState.user.clubs.some(
      club => club.club_id === clubId && club.role === role
    );
  };

  // Función para verificar si el usuario es super administrador
  const isSuperAdmin = (): boolean => {
    return authState.user?.profile.is_super_admin || false;
  };

  // Effect para verificar sesión inicial y escuchar cambios
  useEffect(() => {
    let mounted = true; // Flag para evitar actualizaciones si el componente se desmonta
    
    // Función para verificar sesión inicial
    const checkInitialSession = async () => {
      try {
        console.log('Verificando sesión inicial...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return; // Si el componente se desmontó, no actualizar
        
        if (error) {
          console.error('Error al verificar sesión:', error);
          setAuthState({
            user: null,
            loading: false,
            error: error.message
          });
          return;
        }

        if (session?.user) {
          // Hay una sesión activa, obtener perfil
          console.log('Sesión encontrada para:', session.user.email);
          const authUser = await fetchUserProfile(session.user.id);
          
          if (!mounted) return;
          
          setAuthState({
            user: authUser,
            loading: false,
            error: authUser ? null : 'Error al cargar perfil'
          });
        } else {
          // No hay sesión activa
          console.log('No hay sesión activa');
          setAuthState({
            user: null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (!mounted) return;
        
        console.error('Error en checkInitialSession:', error);
        setAuthState({
          user: null,
          loading: false,
          error: 'Error al verificar sesión'
        });
      }
    };

    // Verificar sesión inicial
    checkInitialSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          clearAuthState();
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Usuario se logueó, obtener perfil
          const authUser = await fetchUserProfile(session.user.id);
          if (mounted) {
            setAuthState({
              user: authUser,
              loading: false,
              error: authUser ? null : 'Error al cargar perfil'
            });
          }
        }
      }
    );

    // Cleanup: marcar como desmontado y cancelar suscripción
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Sin dependencias para evitar bucles

  // Valor del contexto que se provee a los componentes hijos
  const contextValue: AuthContextType = {
    authState,
    login,
    logout,
    refreshUser,
    hasClubRole,
    isSuperAdmin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}
