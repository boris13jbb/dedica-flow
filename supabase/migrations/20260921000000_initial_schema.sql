-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workspaces_owner ON workspaces(owner_user_id);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);

-- Create workspace_members table
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);

-- Create templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  cover_url TEXT,
  schema_json JSONB NOT NULL DEFAULT '{}',
  default_config JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_workspace ON templates(workspace_id);
CREATE INDEX idx_templates_key ON templates(key);
CREATE INDEX idx_templates_system ON templates(is_system, is_active);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  draft_config JSONB NOT NULL DEFAULT '{}',
  cover_asset_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, slug)
);

CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_projects_slug ON projects(workspace_id, slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);

-- Create scenes table
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scene_key TEXT NOT NULL,
  scene_type TEXT NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 5000,
  trigger_mode TEXT NOT NULL DEFAULT 'auto' CHECK (trigger_mode IN ('auto', 'click', 'manual')),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, scene_key)
);

CREATE INDEX idx_scenes_project ON scenes(project_id);
CREATE INDEX idx_scenes_position ON scenes(project_id, position);

-- Create assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'audio', 'video')),
  bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  duration_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_workspace ON assets(workspace_id);
CREATE INDEX idx_assets_project ON assets(project_id);
CREATE INDEX idx_assets_type ON assets(type);

-- Create publications table
CREATE TABLE publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  slug TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'superseded')),
  published_by UUID NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unpublished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, version)
);

CREATE INDEX idx_publications_project ON publications(project_id);
CREATE INDEX idx_publications_slug ON publications(slug, status);
CREATE INDEX idx_publications_status ON publications(status);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_workspace ON audit_logs(workspace_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspaces
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their workspaces"
  ON workspaces FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role = 'owner'
    )
  );

CREATE POLICY "Authenticated users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

-- RLS Policies for workspace_members
CREATE POLICY "Members can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage workspace members"
  ON workspace_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role = 'owner'
    )
  );

-- RLS Policies for templates
CREATE POLICY "Anyone can view system templates"
  ON templates FOR SELECT
  USING (is_system = TRUE AND is_active = TRUE);

CREATE POLICY "Members can view workspace templates"
  ON templates FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = templates.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage workspace templates"
  ON templates FOR ALL
  USING (
    workspace_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = templates.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for projects
CREATE POLICY "Members can view workspace projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Editors can update projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for scenes
CREATE POLICY "Members can view scenes"
  ON scenes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE projects.id = scenes.project_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can manage scenes"
  ON scenes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE projects.id = scenes.project_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'editor')
    )
  );

-- RLS Policies for assets
CREATE POLICY "Members can view workspace assets"
  ON assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = assets.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can upload assets"
  ON assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = assets.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Editors can delete assets"
  ON assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = assets.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'editor')
    )
  );

-- RLS Policies for publications (admin view)
CREATE POLICY "Members can view workspace publications"
  ON publications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE projects.id = publications.project_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create publications"
  ON publications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE projects.id = publications.project_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Editors can update publications"
  ON publications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE projects.id = publications.project_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin', 'editor')
    )
  );

-- Special public policy for active publications (for anonymous users viewing experiences)
CREATE POLICY "Anyone can view active publications"
  ON publications FOR SELECT
  USING (status = 'active');

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = audit_logs.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (TRUE);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenes_updated_at
  BEFORE UPDATE ON scenes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
