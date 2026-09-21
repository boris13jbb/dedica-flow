-- Storage buckets configuration
-- Create buckets for media assets

-- Projects assets bucket (images, audio, video)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-assets',
  'project-assets',
  true,
  52428800, -- 50MB
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/webm'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project-assets bucket

-- Allow authenticated users to upload files to their workspace
CREATE POLICY "Users can upload to their workspace"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT w.id::text
    FROM workspaces w
    INNER JOIN workspace_members wm ON w.id = wm.workspace_id
    WHERE wm.user_id = auth.uid()
  )
);

-- Allow authenticated users to read files from their workspace
CREATE POLICY "Users can read their workspace files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT w.id::text
    FROM workspaces w
    INNER JOIN workspace_members wm ON w.id = wm.workspace_id
    WHERE wm.user_id = auth.uid()
  )
);

-- Allow authenticated users to update files in their workspace
CREATE POLICY "Users can update their workspace files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT w.id::text
    FROM workspaces w
    INNER JOIN workspace_members wm ON w.id = wm.workspace_id
    WHERE wm.user_id = auth.uid()
  )
);

-- Allow authenticated users to delete files from their workspace
CREATE POLICY "Users can delete their workspace files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT w.id::text
    FROM workspaces w
    INNER JOIN workspace_members wm ON w.id = wm.workspace_id
    WHERE wm.user_id = auth.uid()
  )
);

-- Allow public read access for published projects
CREATE POLICY "Public can read public files"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'project-assets'
);
