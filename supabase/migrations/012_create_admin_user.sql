-- Create admin user manually
-- Using a specific UUID to avoid UUID generation issues

-- First, insert into auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'kinarafutri@gmail.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Kinarafutri", "phone": "081282731682", "role": "admin"}',
  NOW(),
  NOW(),
  'authenticated'
);

-- Then create profile
INSERT INTO profiles (id, full_name, phone, role, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Kinarafutri',
  '081282731682',
  'admin',
  NOW(),
  NOW()
);
