-- Check if bike_type_id column exists in rentals table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'rentals'
AND column_name = 'bike_type_id';

-- Check recent rentals and their bike_type_id
SELECT id, user_id, bike_type_id, status, created_at
FROM rentals
ORDER BY created_at DESC
LIMIT 5;
