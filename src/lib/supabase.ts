// Cliente de Supabase configurado para persistir sesiones correctamente
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Variables de entorno de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar que las variables estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno de Supabase no configuradas');
}

// Singleton para mantener una sola instancia del cliente
let supabaseInstance: SupabaseClient<Database> | null = null;

// Función para limpiar configuraciones anteriores incompatibles
function cleanupOldConfig() {
  // Limpiar cualquier configuración anterior que pueda interferir
  if (typeof window !== 'undefined') {
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') && key.includes('auth-token')
    );
    keysToRemove.forEach(key => {
      console.log('🧹 Limpiando configuración anterior:', key);
      localStorage.removeItem(key);
    });
  }
}

// Función para crear/obtener la única instancia de Supabase
function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    // Limpiar configuración anterior una sola vez
    cleanupOldConfig();
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Configuración para PERSISTIR sesiones correctamente
        autoRefreshToken: true, // SÍ refresca automáticamente el token
        persistSession: true, // SÍ persiste la sesión en localStorage
        detectSessionInUrl: true, // SÍ detecta tokens en la URL
        storage: window.localStorage // USA localStorage para persistir sesiones
      }
    });
  }
  return supabaseInstance;
}

// Exportamos la instancia singleton de Supabase
export const supabase = getSupabaseClient();
