
-- Add 'team_member' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'team_member';

-- Team members table (linking team member to owner doctor)
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  suspended_by UUID,
  suspended_at TIMESTAMP WITH TIME ZONE,
  reactivated_by UUID,
  reactivated_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT team_members_member_id_unique UNIQUE (member_id)
);

CREATE INDEX idx_team_members_owner ON public.team_members(owner_id);
CREATE INDEX idx_team_members_member ON public.team_members(member_id);
CREATE INDEX idx_team_members_status ON public.team_members(status);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
CREATE POLICY "Admins can do everything with team_members"
ON public.team_members FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can view their team members"
ON public.team_members FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update their team members"
ON public.team_members FOR UPDATE
USING (auth.uid() = owner_id);

-- Global settings for team member access
CREATE TABLE public.team_member_global_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allowed_course_ids TEXT[] NOT NULL DEFAULT '{}',
  swipefile_access BOOLEAN NOT NULL DEFAULT true,
  calculators_access BOOLEAN NOT NULL DEFAULT false,
  hof_circle_access BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.team_member_global_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for global settings
CREATE POLICY "Anyone authenticated can view team_member settings"
ON public.team_member_global_settings FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update team_member settings"
ON public.team_member_global_settings FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert team_member settings"
ON public.team_member_global_settings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.team_member_global_settings (
  allowed_course_ids,
  swipefile_access,
  calculators_access,
  hof_circle_access
) VALUES (
  '{}',
  true,
  false,
  false
);

-- Trigger for updated_at on team_member_global_settings
CREATE TRIGGER update_team_member_global_settings_updated_at
BEFORE UPDATE ON public.team_member_global_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
