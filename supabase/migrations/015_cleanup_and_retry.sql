-- Hapus data yang gagal
DELETE FROM profiles WHERE id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Cek apakah user sudah ada dengan email ini
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'kinarafutri@gmail.com';
