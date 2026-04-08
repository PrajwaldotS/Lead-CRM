-- Seed data for demo/development
-- Run: psql -U postgres -d leadcrm -f migrations/002_seed.sql

INSERT INTO leads (name, phone, location, category, status, source, attempt_count, priority, last_contacted_at, next_follow_up)
VALUES
  ('Spice Garden Restaurant', '+919876543210', 'Mumbai, Maharashtra', 'Restaurant', 'interested', 'apify', 3, 1, NOW() - INTERVAL '2 days', NOW() + INTERVAL '1 day'),
  ('Green Valley Cafe', '+919876543211', 'Pune, Maharashtra', 'Cafe', 'call_back_later', 'apify', 2, 0, NOW() - INTERVAL '3 days', NOW()),
  ('Royal Gym & Fitness', '+919876543212', 'Bangalore, Karnataka', 'Gym', 'not_called', 'apify', 0, 0, NULL, NULL),
  ('Bright Dental Clinic', '+919876543213', 'Delhi, NCR', 'Healthcare', 'whatsapp_sent', 'apify', 1, 0, NOW() - INTERVAL '1 day', NOW() + INTERVAL '3 days'),
  ('Tech Solutions Ltd', '+919876543214', 'Hyderabad, Telangana', 'IT Services', 'negotiation', 'apify', 5, 2, NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days'),
  ('Fashion Hub Boutique', '+919876543215', 'Chennai, Tamil Nadu', 'Retail', 'not_interested', 'apify', 2, 0, NOW() - INTERVAL '5 days', NULL),
  ('Sunrise School', '+919876543216', 'Jaipur, Rajasthan', 'Education', 'called_no_answer', 'apify', 4, 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day'),
  ('Quick Fix Plumbing', '+919876543217', 'Kolkata, West Bengal', 'Home Services', 'converted', 'apify', 6, 0, NOW() - INTERVAL '7 days', NULL),
  ('Elegant Salon', '+919876543218', 'Ahmedabad, Gujarat', 'Salon', 'not_called', 'apify', 0, 0, NULL, NULL),
  ('Fresh Farm Organics', '+919876543219', 'Lucknow, UP', 'Agriculture', 'wrong_number', 'apify', 1, 0, NOW() - INTERVAL '6 days', NULL),
  ('AutoCare Workshop', '+919876543220', 'Chandigarh', 'Automotive', 'not_called', 'apify', 0, 0, NULL, NULL),
  ('Happy Paws Pet Shop', '+919876543221', 'Goa', 'Pet Care', 'interested', 'apify', 2, 1, NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Seed some activities for existing leads
INSERT INTO activities (lead_id, type, note, outcome_status, follow_up_date, created_at)
VALUES
  (1, 'call', 'Spoke with owner, interested in a basic website for online ordering', 'interested', NOW() + INTERVAL '1 day', NOW() - INTERVAL '2 days'),
  (1, 'call', 'Left voicemail, no answer', 'called_no_answer', NULL, NOW() - INTERVAL '5 days'),
  (1, 'whatsapp', 'Sent portfolio link via WhatsApp', 'whatsapp_sent', NULL, NOW() - INTERVAL '4 days'),
  (2, 'call', 'Owner busy, asked to call back tomorrow', 'call_back_later', NOW(), NOW() - INTERVAL '3 days'),
  (2, 'call', 'No answer on first attempt', 'called_no_answer', NULL, NOW() - INTERVAL '6 days'),
  (4, 'whatsapp', 'Sent website pricing brochure', 'whatsapp_sent', NOW() + INTERVAL '3 days', NOW() - INTERVAL '1 day'),
  (5, 'call', 'Discussing pricing for custom web app', 'negotiation', NOW() + INTERVAL '2 days', NOW() - INTERVAL '1 day'),
  (5, 'call', 'Initial call - very interested in custom solution', 'interested', NULL, NOW() - INTERVAL '3 days'),
  (5, 'whatsapp', 'Shared proposal document', 'whatsapp_sent', NULL, NOW() - INTERVAL '2 days'),
  (8, 'call', 'Deal closed! Website project confirmed', 'converted', NULL, NOW() - INTERVAL '7 days'),
  (8, 'call', 'Follow up on proposal, agreed to move forward', 'negotiation', NULL, NOW() - INTERVAL '10 days'),
  (8, 'call', 'Sent proposal, will review by Friday', 'interested', NULL, NOW() - INTERVAL '14 days')
ON CONFLICT DO NOTHING;
