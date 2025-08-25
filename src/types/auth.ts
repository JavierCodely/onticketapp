// Tipos específicos para la autenticación en nuestra aplicación

import type { User } from '@supabase/supabase-js';
import type { Profile, UserClub, Club } from './database';

// Interfaz para el usuario autenticado con su perfil completo
export interface AuthUser {
  user: User; // Usuario de Supabase auth
  profile: Profile; // Perfil extendido de nuestra tabla profiles
  clubs: UserClubWithDetails[]; // Clubs a los que tiene acceso con detalles
}

// Interfaz que combina la relación usuario-club con detalles del club
export interface UserClubWithDetails extends UserClub {
  club: Club; // Detalles completos del club
}

// Estado de autenticación de la aplicación
export interface AuthState {
  user: AuthUser | null; // Usuario autenticado o null si no está logueado
  loading: boolean; // Indica si estamos cargando datos de autenticación
  error: string | null; // Error de autenticación si existe
}

// Credenciales para el login
export interface LoginCredentials {
  email: string; // Email del usuario
  password: string; // Contraseña
}

// Respuesta del proceso de login
export interface LoginResponse {
  success: boolean; // Si el login fue exitoso
  user?: AuthUser; // Usuario autenticado si fue exitoso
  error?: string; // Mensaje de error si falló
}

// Context de autenticación que se proporciona a toda la aplicación
export interface AuthContextType {
  // Estado actual de autenticación
  authState: AuthState;
  
  // Función para hacer login
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  
  // Función para hacer logout
  logout: () => Promise<void>;
  
  // Función para refrescar los datos del usuario
  refreshUser: () => Promise<void>;
  
  // Función para verificar si el usuario tiene un rol específico en un club
  hasClubRole: (clubId: string, role: string) => boolean;
  
  // Función para verificar si el usuario es super administrador
  isSuperAdmin: () => boolean;
}
