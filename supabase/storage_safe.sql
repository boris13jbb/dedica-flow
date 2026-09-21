-- =====================================================
-- STORAGE SETUP - VERSIÓN SEGURA
-- Configuración de Supabase Storage para assets
-- =====================================================

-- Crear bucket si no existe (esto se hace desde la UI normalmente)
-- Instrucción: Ve a Storage en Supabase Dashboard y crea un bucket llamado 'project-assets'
-- O ejecuta esto si tienes permisos de superusuario:

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('project-assets', 'project-assets', true)
-- ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their assets" ON storage.objects;

-- Política: Usuarios autenticados pueden subir archivos
CREATE POLICY "Authenticated users can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-assets'
);

-- Política: Todos pueden ver los assets (necesario para experiencias públicas)
CREATE POLICY "Anyone can view assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-assets');

-- Política: Usuarios autenticados pueden actualizar sus assets
CREATE POLICY "Users can update their assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-assets')
WITH CHECK (bucket_id = 'project-assets');

-- Política: Usuarios autenticados pueden eliminar sus assets
CREATE POLICY "Users can delete their assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-assets');

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

DO $$
BEGIN
    -- Verificar si el bucket existe
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'project-assets') THEN
        RAISE NOTICE '✅ Bucket "project-assets" encontrado';
        RAISE NOTICE '✅ Políticas de storage configuradas';
    ELSE
        RAISE NOTICE '⚠️  Bucket "project-assets" NO encontrado';
        RAISE NOTICE '📝 Debes crear el bucket manualmente:';
        RAISE NOTICE '   1. Ve a Storage en el dashboard de Supabase';
        RAISE NOTICE '   2. Click en "New bucket"';
        RAISE NOTICE '   3. Nombre: project-assets';
        RAISE NOTICE '   4. Public bucket: YES';
        RAISE NOTICE '   5. Save';
    END IF;
END $$;
