-- =====================================================
-- MIGRACIÓN COMPLETA - VERSIÓN SEGURA
-- Se puede ejecutar múltiples veces sin errores
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- WORKSPACES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);

-- =====================================================
-- WORKSPACE_MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  scenes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(workspace_id, slug);

-- =====================================================
-- PROJECT_ASSETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS project_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio')),
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  size BIGINT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_assets_project ON project_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_type ON project_assets(project_id, type);

-- =====================================================
-- PUBLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, version)
);

CREATE INDEX IF NOT EXISTS idx_publications_project ON publications(project_id);
CREATE INDEX IF NOT EXISTS idx_publications_active ON publications(project_id, is_active) WHERE is_active = true;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can update their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can delete their workspaces" ON workspaces;

DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Admins can manage workspace members" ON workspace_members;

DROP POLICY IF EXISTS "Members can view workspace projects" ON projects;
DROP POLICY IF EXISTS "Members can create projects" ON projects;
DROP POLICY IF EXISTS "Members can update projects" ON projects;
DROP POLICY IF EXISTS "Members can delete projects" ON projects;

DROP POLICY IF EXISTS "Members can view project assets" ON project_assets;
DROP POLICY IF EXISTS "Anyone can view assets" ON project_assets;
DROP POLICY IF EXISTS "Members can manage assets" ON project_assets;

DROP POLICY IF EXISTS "Members can view publications" ON publications;
DROP POLICY IF EXISTS "Anyone can view active publications" ON publications;
DROP POLICY IF EXISTS "Members can manage publications" ON publications;

-- Workspaces Policies
CREATE POLICY "Users can view their workspaces" ON workspaces
  FOR SELECT USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their workspaces" ON workspaces
  FOR UPDATE USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete their workspaces" ON workspaces
  FOR DELETE USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Workspace Members Policies
CREATE POLICY "Users can view workspace members" ON workspace_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage workspace members" ON workspace_members
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Projects Policies
CREATE POLICY "Members can view workspace projects" ON projects
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create projects" ON projects
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update projects" ON projects
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can delete projects" ON projects
  FOR DELETE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Project Assets Policies
CREATE POLICY "Members can view project assets" ON project_assets
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view assets" ON project_assets
  FOR SELECT USING (true);

CREATE POLICY "Members can manage assets" ON project_assets
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

-- Publications Policies
CREATE POLICY "Members can view publications" ON publications
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active publications" ON publications
  FOR SELECT USING (is_active = true);

CREATE POLICY "Members can manage publications" ON publications
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;

-- Create triggers
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Migración completada exitosamente!';
    RAISE NOTICE 'Tablas creadas: workspaces, workspace_members, projects, project_assets, publications';
    RAISE NOTICE 'RLS policies configuradas';
    RAISE NOTICE 'Triggers configurados';
END $$;
