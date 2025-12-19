-- Update social media tasks with correct links

DELETE FROM public.tasks WHERE task_type = 'social';

INSERT INTO public.tasks (title, description, points_reward, task_type, action_url, verification_type)
VALUES 
  ('Join Telegram', 'Join our Telegram community and stay updated', 50, 'social', 'https://t.me/VerseEstate001', 'manual'),
  ('Subscribe on YouTube', 'Subscribe to our YouTube channel for updates and tutorials', 75, 'social', 'https://youtube.com/@verseestate001?si=x4cHGhBypOZyW1W_', 'manual'),
  ('Follow on TikTok', 'Follow us on TikTok for short-form content', 50, 'social', 'https://www.tiktok.com/@verseestate5?_r=1&_t=ZS-926FGcRqut5', 'manual'),
  ('Follow on Instagram', 'Follow us on Instagram for visual updates', 50, 'social', 'https://www.instagram.com/verse_estate?igsh=ZXpuOGZwanVybDFw', 'manual'),
  ('Join WhatsApp Channel', 'Join our WhatsApp channel for instant notifications', 50, 'social', 'https://whatsapp.com/channel/0029VbBlIG7CXC3SvpwBTF2U', 'manual'),
  ('Join Discord', 'Join our Discord community and introduce yourself', 100, 'social', 'https://discord.gg/2RtpUKYt', 'manual');
