-- Cek apakah user sudah ada di auth.users
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'kinarafutri@gmail.com';

-- Jika user belum ada di auth.users, insert manual
-- Hapus profile yang sudah ada dulu untuk duplikasi
DELETE FROM profiles WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert ke auth.users dengan benar
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
)
ON CONFLICT (email) DO NOTHING;

-- Insert ke profiles
INSERT INTO profiles (id, full_name, phone, role, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Kinarafutri',
  '081282731682',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET 
  full_name = 'Kinarafutri',
  phone = '081282731682',
  role = 'admin',
  updated_at = NOW();
