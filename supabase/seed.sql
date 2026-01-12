-- Seed data for Level-Up Life
-- Creates sample family, users, quests, and XP logs for testing

-- Create test users in auth.users first
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'parent@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'caregiver@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'emma@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Insert sample family
INSERT INTO public.family (id, owner_user_id, name, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Smith Family', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert family members
-- Parent (owner)
INSERT INTO public.family_member (id, family_id, user_id, role, created_at)
VALUES 
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'parent', NOW())
ON CONFLICT (family_id, user_id) DO NOTHING;

-- Second parent/caregiver
INSERT INTO public.family_member (id, family_id, user_id, role, created_at)
VALUES 
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'caregiver', NOW())
ON CONFLICT (family_id, user_id) DO NOTHING;

-- Insert child profiles
INSERT INTO public.child_profile (id, family_id, display_name, birthdate, mode_override, avatar_url, created_at, updated_at)
VALUES 
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Emma Smith', '2015-03-15', 'child', NULL, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Noah Smith', '2018-07-22', 'child', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Link one child to a user account (optional, for testing child login)
INSERT INTO public.child_account_link (id, child_id, user_id, activated_at)
VALUES 
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW())
ON CONFLICT (child_id) DO NOTHING;

-- Insert sample quests
INSERT INTO public.quest (id, family_id, domain, title, description, cadence, difficulty, xp_reward, is_system, created_by_user_id, created_at, updated_at)
VALUES 
  ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', 'academics', 'Complete homework', 'Finish all assigned homework', 'daily', 2, 15, FALSE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', 'behavior', 'Make your bed', 'Make your bed in the morning', 'daily', 1, 10, FALSE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555553', '11111111-1111-1111-1111-111111111111', 'athletics', 'Exercise for 30 minutes', 'Any physical activity for 30 minutes', 'daily', 3, 20, FALSE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555554', '11111111-1111-1111-1111-111111111111', 'health', 'Eat vegetables', 'Eat vegetables with lunch or dinner', 'daily', 2, 10, FALSE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'behavior', 'Clean your room', 'Clean and organize your room', 'weekly', 3, 30, FALSE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert quest instances for Emma (past week)
INSERT INTO public.quest_instance (id, child_id, quest_id, period_start, period_end, status, completed_at, notes, created_at, updated_at)
VALUES 
  -- Completed quests
  ('66666666-6666-6666-6666-666666666661', '33333333-3333-3333-3333-333333333331', '55555555-5555-5555-5555-555555555551', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '23 hours', 'completed', NOW() - INTERVAL '1 day' + INTERVAL '3 hours', 'Finished all math and reading', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('66666666-6666-6666-6666-666666666662', '33333333-3333-3333-3333-333333333331', '55555555-5555-5555-5555-555555555552', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '23 hours', 'completed', NOW() - INTERVAL '1 day' + INTERVAL '1 hour', 'Bed made perfectly!', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('66666666-6666-6666-6666-666666666663', '33333333-3333-3333-3333-333333333331', '55555555-5555-5555-5555-555555555553', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '23 hours', 'completed', NOW() - INTERVAL '1 day' + INTERVAL '4 hours', 'Went for a bike ride', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  
  -- Today's quests (some pending, some in progress)
  ('66666666-6666-6666-6666-666666666664', '33333333-3333-3333-3333-333333333331', '55555555-5555-5555-5555-555555555551', NOW(), NOW() + INTERVAL '23 hours', 'in_progress', NULL, NULL, NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666665', '33333333-3333-3333-3333-333333333331', '55555555-5555-5555-5555-555555555552', NOW(), NOW() + INTERVAL '23 hours', 'completed', NOW() + INTERVAL '1 hour', NULL, NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333331', '55555555-5555-5555-5555-555555555553', NOW(), NOW() + INTERVAL '23 hours', 'pending', NULL, NULL, NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666667', '33333333-3333-3333-3333-333333333331', '55555555-5555-5555-5555-555555555554', NOW(), NOW() + INTERVAL '23 hours', 'pending', NULL, NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert quest instances for Noah (fewer, younger child)
INSERT INTO public.quest_instance (id, child_id, quest_id, period_start, period_end, status, completed_at, notes, created_at, updated_at)
VALUES 
  ('77777777-7777-7777-7777-777777777771', '33333333-3333-3333-3333-333333333332', '55555555-5555-5555-5555-555555555552', NOW(), NOW() + INTERVAL '23 hours', 'completed', NOW() + INTERVAL '2 hours', 'Great job!', NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777772', '33333333-3333-3333-3333-333333333332', '55555555-5555-5555-5555-555555555554', NOW(), NOW() + INTERVAL '23 hours', 'pending', NULL, NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert XP logs (from completed quests and manual awards)
INSERT INTO public.xp_log (id, child_id, domain, amount, reason, quest_instance_id, created_at)
VALUES 
  -- Emma's XP from yesterday
  ('88888888-8888-8888-8888-888888888881', '33333333-3333-3333-3333-333333333331', 'academics', 15, 'Completed homework quest', '66666666-6666-6666-6666-666666666661', NOW() - INTERVAL '1 day' + INTERVAL '3 hours'),
  ('88888888-8888-8888-8888-888888888882', '33333333-3333-3333-3333-333333333331', 'behavior', 10, 'Made bed quest', '66666666-6666-6666-6666-666666666662', NOW() - INTERVAL '1 day' + INTERVAL '1 hour'),
  ('88888888-8888-8888-8888-888888888883', '33333333-3333-3333-3333-333333333331', 'athletics', 20, 'Exercise quest', '66666666-6666-6666-6666-666666666663', NOW() - INTERVAL '1 day' + INTERVAL '4 hours'),
  
  -- Emma's XP from today
  ('88888888-8888-8888-8888-888888888884', '33333333-3333-3333-3333-333333333331', 'behavior', 10, 'Made bed quest', '66666666-6666-6666-6666-666666666665', NOW() + INTERVAL '1 hour'),
  
  -- Manual bonus XP for Emma
  ('88888888-8888-8888-8888-888888888885', '33333333-3333-3333-3333-333333333331', 'general', 50, 'Helped sibling with homework', NULL, NOW() - INTERVAL '2 days'),
  
  -- Noah's XP
  ('88888888-8888-8888-8888-888888888886', '33333333-3333-3333-3333-333333333332', 'behavior', 10, 'Made bed quest', '77777777-7777-7777-7777-777777777771', NOW() + INTERVAL '2 hours'),
  ('88888888-8888-8888-8888-888888888887', '33333333-3333-3333-3333-333333333332', 'general', 25, 'Cleaned up toys without being asked', NULL, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Show summary
DO $$
DECLARE
  emma_total INTEGER;
  noah_total INTEGER;
BEGIN
  SELECT public.get_child_total_xp('33333333-3333-3333-3333-333333333331') INTO emma_total;
  SELECT public.get_child_total_xp('33333333-3333-3333-3333-333333333332') INTO noah_total;
  
  RAISE NOTICE 'Seed data loaded successfully!';
  RAISE NOTICE 'Emma total XP: %', emma_total;
  RAISE NOTICE 'Noah total XP: %', noah_total;
END $$;
