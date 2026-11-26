-- Update role admin menggunakan user_id dari auth.users
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'kinarafutri@gmail.com');
