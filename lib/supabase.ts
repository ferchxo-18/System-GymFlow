import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// Limpiamos la URL por si el usuario incluyó /rest/v1/ por accidente
supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

if (!isSupabaseConfigured) {
  console.warn("⚠️ Supabase no está configurado. Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY faltan. Usando datos locales.");
} else {
  console.log("✅ Supabase conectado exitosamente.");
}

// Create a single supabase client for interacting with your database
// If configurations are missing, it will export null to prevent crashing
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
