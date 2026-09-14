// Configuración pública del portfolio. La clave publishable se usa en el navegador;
// la protección de los datos depende de las políticas RLS de Supabase.
// Las variables de Vite permiten conectar otro proyecto sin cambiar este archivo.
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://smkubvnmnjsxcdfuwfxm.supabase.co',
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_m8_9XjEBhS3CD6yGzGVXCA_mRjCoL8N',
}
