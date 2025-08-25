// Tipos TypeScript que representan nuestra estructura de base de datos de Supabase

// Enum para los roles del sistema
export type UserRole = 'super_admin' | 'club_admin';

// Enum para los roles dentro de un club específico
export type ClubRole = 'owner' | 'manager' | 'supervisor' | 'staff';

// Enum para el estado del club
export type ClubStatus = 'active' | 'inactive' | 'suspended';

// Enum para el plan de suscripción
export type SubscriptionPlan = 'basic' | 'premium' | 'enterprise';

// Interfaz para el perfil del usuario (tabla profiles)
export interface Profile {
  id: string; // UUID que coincide con auth.users.id
  email: string; // Email del usuario
  full_name: string | null; // Nombre completo (opcional)
  avatar_url: string | null; // URL del avatar (opcional)
  role: UserRole; // Rol a nivel sistema
  is_super_admin: boolean; // Indica si es super administrador
  phone: string | null; // Teléfono (opcional)
  preferences: Record<string, any>; // Preferencias como JSON
  last_login_at: string | null; // Último login como timestamp
  created_at: string; // Fecha de creación
  updated_at: string; // Última actualización
}

// Interfaz para los clubs (tabla clubs)
export interface Club {
  id: string; // UUID único del club
  name: string; // Nombre del club
  slug: string; // URL amigable única
  description: string | null; // Descripción (opcional)
  logo_url: string | null; // URL del logo (opcional)
  address: string | null; // Dirección física (opcional)
  phone: string | null; // Teléfono (opcional)
  email: string | null; // Email de contacto (opcional)
  timezone: string; // Zona horaria
  currency: string; // Moneda utilizada
  status: ClubStatus; // Estado del club
  plan: SubscriptionPlan; // Plan de suscripción
  settings: Record<string, any>; // Configuraciones como JSON
  created_at: string; // Fecha de creación
  updated_at: string; // Última actualización
}

// Interfaz para la relación usuario-club (tabla user_clubs)
export interface UserClub {
  id: string; // UUID único de la relación
  user_id: string; // ID del usuario
  club_id: string; // ID del club
  role: ClubRole; // Rol del usuario en este club
  permissions: Record<string, any>; // Permisos específicos como JSON
  is_active: boolean; // Si está activo en este club
  joined_at: string; // Fecha de unión al club
}

// Tipo principal para la estructura de la base de datos de Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile; // Tipo para leer datos
        Insert: Omit<Profile, 'created_at' | 'updated_at'>; // Tipo para insertar
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>; // Tipo para actualizar
      };
      clubs: {
        Row: Club;
        Insert: Omit<Club, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Club, 'id' | 'created_at'>>;
      };
      user_clubs: {
        Row: UserClub;
        Insert: Omit<UserClub, 'id' | 'joined_at'>;
        Update: Partial<Omit<UserClub, 'id' | 'user_id' | 'club_id' | 'joined_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      // Función que retorna los clubs del usuario actual
      get_user_clubs: {
        Args: Record<PropertyKey, never>;
        Returns: string[]; // Array de UUIDs
      };
      // Función que verifica si el usuario es super admin
      is_super_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      // Función que verifica rol en club específico
      has_club_role: {
        Args: {
          club_uuid: string;
          required_role: ClubRole;
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      club_role: ClubRole;
      club_status: ClubStatus;
      subscription_plan: SubscriptionPlan;
    };
  };
}
