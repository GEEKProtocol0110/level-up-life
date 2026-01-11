-- Level-Up Life Initial Schema
-- Creates core tables with RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- FAMILY & MEMBERS
-- ============================================================================

CREATE TABLE family (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_owner ON family(owner_user_id);

-- Family members: parents, caregivers, and children
CREATE TYPE family_role AS ENUM ('parent', 'caregiver', 'child');

CREATE TABLE family_member (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role family_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

CREATE INDEX idx_family_member_family ON family_member(family_id);
CREATE INDEX idx_family_member_user ON family_member(user_id);

-- ============================================================================
-- CHILD PROFILES
-- ============================================================================

CREATE TYPE mode_type AS ENUM ('child', 'youth', 'adult', 'legacy');

CREATE TABLE child_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  birthdate DATE NOT NULL,
  mode_override mode_type,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_child_profile_family ON child_profile(family_id);

-- Links a child profile to a user account when child login is activated
CREATE TABLE child_account_link (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES child_profile(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(child_id),
  UNIQUE(user_id)
);

CREATE INDEX idx_child_account_link_child ON child_account_link(child_id);
CREATE INDEX idx_child_account_link_user ON child_account_link(user_id);

-- ============================================================================
-- QUESTS
-- ============================================================================

CREATE TYPE quest_domain AS ENUM ('academics', 'behavior', 'athletics', 'health', 'recipes', 'money', 'general');
CREATE TYPE quest_cadence AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

CREATE TABLE quest (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  domain quest_domain NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT,
  cadence quest_cadence NOT NULL DEFAULT 'daily',
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  xp_reward INTEGER NOT NULL DEFAULT 10,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quest_family ON quest(family_id);
CREATE INDEX idx_quest_domain ON quest(domain);

-- ============================================================================
-- QUEST INSTANCES
-- ============================================================================

CREATE TYPE quest_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'skipped');

CREATE TABLE quest_instance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES child_profile(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quest(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  status quest_status NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quest_instance_child ON quest_instance(child_id);
CREATE INDEX idx_quest_instance_quest ON quest_instance(quest_id);
CREATE INDEX idx_quest_instance_period ON quest_instance(period_start, period_end);
CREATE INDEX idx_quest_instance_status ON quest_instance(status);

-- ============================================================================
-- XP LOGS
-- ============================================================================

CREATE TABLE xp_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES child_profile(id) ON DELETE CASCADE,
  domain quest_domain NOT NULL DEFAULT 'general',
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  quest_instance_id UUID REFERENCES quest_instance(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_xp_log_child ON xp_log(child_id);
CREATE INDEX idx_xp_log_domain ON xp_log(domain);
CREATE INDEX idx_xp_log_created ON xp_log(created_at);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE family ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_account_link ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FAMILY POLICIES
-- ============================================================================

-- Users can read their own families
CREATE POLICY "Users can read their own families" ON family
  FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_member
      WHERE family_member.family_id = family.id
      AND family_member.user_id = auth.uid()
    )
  );

-- Users can create their own family
CREATE POLICY "Users can create their own family" ON family
  FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

-- Only family owner can update
CREATE POLICY "Family owner can update" ON family
  FOR UPDATE
  USING (owner_user_id = auth.uid());

-- Only family owner can delete
CREATE POLICY "Family owner can delete" ON family
  FOR DELETE
  USING (owner_user_id = auth.uid());

-- ============================================================================
-- FAMILY MEMBER POLICIES
-- ============================================================================

-- Users can read family members of their families
CREATE POLICY "Users can read family members" ON family_member
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_member fm
      WHERE fm.family_id = family_member.family_id
      AND fm.user_id = auth.uid()
    )
  );

-- Parents can add members
CREATE POLICY "Parents can add family members" ON family_member
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family f
      WHERE f.id = family_member.family_id
      AND (
        f.owner_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM family_member fm
          WHERE fm.family_id = family_member.family_id
          AND fm.user_id = auth.uid()
          AND fm.role = 'parent'
        )
      )
    )
  );

-- ============================================================================
-- CHILD PROFILE POLICIES
-- ============================================================================

-- Users can read child profiles in their families
CREATE POLICY "Users can read child profiles in their family" ON child_profile
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_member
      WHERE family_member.family_id = child_profile.family_id
      AND family_member.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM child_account_link
      WHERE child_account_link.child_id = child_profile.id
      AND child_account_link.user_id = auth.uid()
    )
  );

-- Parents/caregivers can create child profiles
CREATE POLICY "Parents can create child profiles" ON child_profile
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_member
      WHERE family_member.family_id = child_profile.family_id
      AND family_member.user_id = auth.uid()
      AND family_member.role IN ('parent', 'caregiver')
    )
  );

-- Parents/caregivers can update child profiles
CREATE POLICY "Parents can update child profiles" ON child_profile
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_member
      WHERE family_member.family_id = child_profile.family_id
      AND family_member.user_id = auth.uid()
      AND family_member.role IN ('parent', 'caregiver')
    )
  );

-- ============================================================================
-- CHILD ACCOUNT LINK POLICIES
-- ============================================================================

-- Users can read their own child account links
CREATE POLICY "Users can read child account links" ON child_account_link
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM child_profile cp
      JOIN family_member fm ON fm.family_id = cp.family_id
      WHERE cp.id = child_account_link.child_id
      AND fm.user_id = auth.uid()
      AND fm.role IN ('parent', 'caregiver')
    )
  );

-- Parents can create child account links
CREATE POLICY "Parents can create child account links" ON child_account_link
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM child_profile cp
      JOIN family_member fm ON fm.family_id = cp.family_id
      WHERE cp.id = child_account_link.child_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'parent'
    )
  );

-- ============================================================================
-- QUEST POLICIES
-- ============================================================================

-- Users can read quests in their families
CREATE POLICY "Users can read family quests" ON quest
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_member
      WHERE family_member.family_id = quest.family_id
      AND family_member.user_id = auth.uid()
    )
  );

-- Parents/caregivers can create quests
CREATE POLICY "Parents can create quests" ON quest
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_member
      WHERE family_member.family_id = quest.family_id
      AND family_member.user_id = auth.uid()
      AND family_member.role IN ('parent', 'caregiver')
    )
  );

-- Parents/caregivers can update quests
CREATE POLICY "Parents can update quests" ON quest
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_member
      WHERE family_member.family_id = quest.family_id
      AND family_member.user_id = auth.uid()
      AND family_member.role IN ('parent', 'caregiver')
    )
  );

-- ============================================================================
-- QUEST INSTANCE POLICIES
-- ============================================================================

-- Users can read quest instances for children in their family
CREATE POLICY "Users can read quest instances" ON quest_instance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM child_profile cp
      JOIN family_member fm ON fm.family_id = cp.family_id
      WHERE cp.id = quest_instance.child_id
      AND fm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM child_account_link cal
      WHERE cal.child_id = quest_instance.child_id
      AND cal.user_id = auth.uid()
    )
  );

-- Parents/caregivers can create quest instances
CREATE POLICY "Parents can create quest instances" ON quest_instance
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM child_profile cp
      JOIN family_member fm ON fm.family_id = cp.family_id
      WHERE cp.id = quest_instance.child_id
      AND fm.user_id = auth.uid()
      AND fm.role IN ('parent', 'caregiver')
    )
  );

-- Parents/caregivers and child users can update quest instances
CREATE POLICY "Users can update quest instances" ON quest_instance
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM child_profile cp
      JOIN family_member fm ON fm.family_id = cp.family_id
      WHERE cp.id = quest_instance.child_id
      AND fm.user_id = auth.uid()
      AND fm.role IN ('parent', 'caregiver')
    )
    OR EXISTS (
      SELECT 1 FROM child_account_link cal
      WHERE cal.child_id = quest_instance.child_id
      AND cal.user_id = auth.uid()
    )
  );

-- ============================================================================
-- XP LOG POLICIES
-- ============================================================================

-- Users can read XP logs for children in their family
CREATE POLICY "Users can read xp logs" ON xp_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM child_profile cp
      JOIN family_member fm ON fm.family_id = cp.family_id
      WHERE cp.id = xp_log.child_id
      AND fm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM child_account_link cal
      WHERE cal.child_id = xp_log.child_id
      AND cal.user_id = auth.uid()
    )
  );

-- Parents/caregivers can create XP logs
CREATE POLICY "Parents can create xp logs" ON xp_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM child_profile cp
      JOIN family_member fm ON fm.family_id = cp.family_id
      WHERE cp.id = xp_log.child_id
      AND fm.user_id = auth.uid()
      AND fm.role IN ('parent', 'caregiver')
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get total XP for a child
CREATE OR REPLACE FUNCTION get_child_total_xp(p_child_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(SUM(amount), 0)::INTEGER
  FROM xp_log
  WHERE child_id = p_child_id;
$$;

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_family_updated_at
  BEFORE UPDATE ON family
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_child_profile_updated_at
  BEFORE UPDATE ON child_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quest_updated_at
  BEFORE UPDATE ON quest
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quest_instance_updated_at
  BEFORE UPDATE ON quest_instance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
