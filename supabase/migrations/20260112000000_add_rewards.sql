-- Add rewards system to Level-Up Life

-- ============================================================================
-- REWARDS TABLE
-- ============================================================================

CREATE TABLE public.reward (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.family(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  xp_cost INTEGER NOT NULL CHECK (xp_cost > 0),
  icon TEXT,
  created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reward_family_id ON public.reward(family_id);

-- ============================================================================
-- REWARD REDEMPTIONS TABLE
-- ============================================================================

CREATE TABLE public.reward_redemption (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.child_profile(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES public.reward(id) ON DELETE CASCADE,
  xp_spent INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  notes TEXT
);

CREATE INDEX idx_reward_redemption_child_id ON public.reward_redemption(child_id);
CREATE INDEX idx_reward_redemption_reward_id ON public.reward_redemption(reward_id);
CREATE INDEX idx_reward_redemption_status ON public.reward_redemption(status);

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE public.reward ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemption ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- REWARD POLICIES
-- ============================================================================

-- Family members can read rewards
CREATE POLICY "Users can read family rewards" ON public.reward
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_member
      WHERE family_member.family_id = reward.family_id
      AND family_member.user_id = auth.uid()
    )
  );

-- Parents/caregivers can create rewards
CREATE POLICY "Parents can create rewards" ON public.reward
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_member
      WHERE family_member.family_id = reward.family_id
      AND family_member.user_id = auth.uid()
      AND family_member.role IN ('parent', 'caregiver')
    )
  );

-- Parents/caregivers can update rewards
CREATE POLICY "Parents can update rewards" ON public.reward
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_member
      WHERE family_member.family_id = reward.family_id
      AND family_member.user_id = auth.uid()
      AND family_member.role IN ('parent', 'caregiver')
    )
  );

-- Parents/caregivers can delete rewards
CREATE POLICY "Parents can delete rewards" ON public.reward
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_member
      WHERE family_member.family_id = reward.family_id
      AND family_member.user_id = auth.uid()
      AND family_member.role IN ('parent', 'caregiver')
    )
  );

-- ============================================================================
-- REWARD REDEMPTION POLICIES
-- ============================================================================

-- Family members can read redemptions for their children
CREATE POLICY "Users can read reward redemptions" ON public.reward_redemption
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.child_profile cp
      JOIN public.family_member fm ON fm.family_id = cp.family_id
      WHERE cp.id = reward_redemption.child_id
      AND fm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.child_account_link
      WHERE child_account_link.child_id = reward_redemption.child_id
      AND child_account_link.user_id = auth.uid()
    )
  );

-- Children can request rewards (create redemption with pending status)
CREATE POLICY "Children can request rewards" ON public.reward_redemption
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.child_account_link
      WHERE child_account_link.child_id = reward_redemption.child_id
      AND child_account_link.user_id = auth.uid()
    )
  );

-- Parents/caregivers can approve/reject redemptions
CREATE POLICY "Parents can approve reward redemptions" ON public.reward_redemption
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.child_profile cp
      JOIN public.family_member fm ON fm.family_id = cp.family_id
      WHERE cp.id = reward_redemption.child_id
      AND fm.user_id = auth.uid()
      AND fm.role IN ('parent', 'caregiver')
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_reward_updated_at
  BEFORE UPDATE ON public.reward
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
