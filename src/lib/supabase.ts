// Importamos el cliente de Supabase para conectar con nuestra base de datos
import { createClient, SupabaseClient } from '@supabase/supabase-js';
// Importamos el tipo de base de datos generado desde nuestra schema
import type { Database } from '@/types/database';

// URL de nuestro proyecto Supabase (debe estar en variables de entorno)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Clave pública/anon de Supabase (debe estar en variables de entorno)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificamos que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno de Supabase no configuradas');
}

// Variable global para asegurar una sola instancia (singleton)
let supabaseInstance: SupabaseClient<Database> | null = null;

// Función para crear/obtener la única instancia de Supabase
function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Configuración para NO persistir sesiones (siempre pedir login)
        autoRefreshToken: false, // No refresca automáticamente el token
        persistSession: false, // NO persiste la sesión en localStorage
        detectSessionInUrl: false, // No detecta tokens en la URL
        storage: undefined // No usa ningún storage para persistir
      }
    });
  }
  return supabaseInstance;
}

// Exportamos la instancia singleton de Supabase
export const supabase = getSupabaseClient();
