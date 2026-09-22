-- Fix bootstrap + recursive RLS on workspace_members.
-- Helper SECURITY DEFINER evita recursión al evaluar policies.

CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_owner(ws_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()
      AND role = 'owner'
  );
$$;

REVOKE ALL ON FUNCTION public.is_workspace_member(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_workspace_owner(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_workspace_owner(uuid) TO authenticated;

DROP POLICY IF EXISTS "Users can view their workspaces" ON workspaces;
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR public.is_workspace_member(id)
  );

DROP POLICY IF EXISTS "Owners can view own workspaces" ON workspaces;
CREATE POLICY "Owners can view own workspaces"
  ON workspaces FOR SELECT
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "Members can view workspace members" ON workspace_members;
CREATE POLICY "Members can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS "Users can join as first owner" ON workspace_members;
CREATE POLICY "Users can join as first owner"
  ON workspace_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'owner'
    AND EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
        AND w.owner_user_id = auth.uid()
    )
  );
