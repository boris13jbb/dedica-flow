# Variables de Entorno para Vercel

Antes de desplegar, asegúrate de configurar estas variables de entorno en Vercel:

## Variables Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

## Cómo Obtener las Variables

1. **Ve a tu proyecto de Supabase**: https://supabase.com/dashboard
2. **Selecciona tu proyecto**
3. **Ve a Settings → API**
4. **Copia**:
   - URL: `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key: `SUPABASE_SERVICE_ROLE_KEY`

## Configuración en Vercel

Una vez que hagas clic en el botón "Publish", Vercel te pedirá:

1. **Conectar cuenta** (si es la primera vez)
2. **Nombre del proyecto** (sugerido: dedicastudio)
3. **Variables de entorno** (pega las 3 variables de arriba)

## Después del Deployment

1. **Ejecuta las migraciones** en Supabase:
   - `supabase/migrations/20260921000000_initial_schema.sql`
   - `supabase/migrations/20260921010000_storage_setup.sql`

2. **Verifica el sitio**:
   - Login funciona
   - Puedes crear proyectos
   - Las escenas se renderizan

3. **URLs**:
   - Admin: `https://tu-dominio.vercel.app/admin`
   - Login: `https://tu-dominio.vercel.app/login`
   - Público: `https://tu-dominio.vercel.app/p/[slug]`

---

**¡Listo para deployment!** Haz clic en el botón "Publish" que aparece arriba. 🚀
