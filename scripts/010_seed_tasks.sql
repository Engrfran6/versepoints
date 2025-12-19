-- Part 10: Seed Initial Tasks

INSERT INTO public.tasks (title, description, points_reward, task_type, action_url, verification_type)
VALUES 
  ('Follow on Twitter', 'Follow our official Twitter account for updates', 10, 'social', 'https://twitter.com/versepoints', 'manual'),
  ('Join Discord', 'Join our Discord community and introduce yourself', 15, 'social', 'https://discord.gg/versepoints', 'manual'),
  ('Share on Social Media', 'Share VersePoints with your friends on any social platform', 20, 'social', NULL, 'manual'),
  ('Complete Profile', 'Add a username and verify your email', 5, 'daily', NULL, 'auto'),
  ('First Mining', 'Complete your first daily mining session', 25, 'special', NULL, 'auto'),
  ('Refer 5 Friends', 'Successfully refer 5 friends who complete mining', 100, 'referral', NULL, 'auto'),
  ('Refer 10 Friends', 'Successfully refer 10 friends who complete mining', 250, 'referral', NULL, 'auto')
ON CONFLICT DO NOTHING;
