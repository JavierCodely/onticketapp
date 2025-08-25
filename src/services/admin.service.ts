// Servicio para manejar operaciones CRUD de administradores
import { supabase } from '@/lib/supabase';
import type { Profile, UserClub, Club } from '@/types/database';

export interface AdminWithClub extends Profile {
  user_clubs?: (UserClub & { club: Club })[];
}

export interface CreateAdminData {
  full_name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'club_admin';
  is_super_admin: boolean;
  club_id?: string;
  club_role?: 'owner' | 'manager' | 'supervisor' | 'staff';
}

export class AdminService {
  // Obtener todos los administradores con sus clubs
  static async getAllAdmins(): Promise<AdminWithClub[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_clubs(
          *,
          club:clubs(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al cargar administradores: ${error.message}`);
    }

    return data || [];
  }

  // Obtener clubs activos
  static async getActiveClubs(): Promise<Club[]> {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) {
      throw new Error(`Error al cargar clubs: ${error.message}`);
    }

    return data || [];
  }
}