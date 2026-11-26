-- Add bike_type_id column to rentals table
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS bike_type_id UUID REFERENCES bike_types(id) ON DELETE SET NULL;

-- Update existing rentals that don't have bike_type_id
-- Set them to the first bike type as default
UPDATE rentals 
SET bike_type_id = (SELECT id FROM bike_types LIMIT 1)
WHERE bike_type_id IS NULL AND bike_id IS NOT NULL;
