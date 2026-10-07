-- Update bike types to match new requirements
-- First, delete existing bikes
DELETE FROM bikes;

-- Delete existing bike types
DELETE FROM bike_types;

-- Insert new bike types
INSERT INTO bike_types (name, hourly_rate, description) VALUES
  ('Sepeda Gowes 1 Orang', 3000, 'Sepeda gowes standar untuk 1 orang'),
  ('Sepeda Gowes 2 Orang', 6000, 'Sepeda gowes tandem untuk 2 orang'),
  ('Sepeda Listrik', 30000, 'Sepeda listrik untuk perjalanan mudah dan cepat');

-- Insert new bikes (50 bikes total)
-- 25 Sepeda Gowes 1 Orang
INSERT INTO bikes (bike_code, bike_type_id, status, current_location) 
SELECT 
  'G1-' || LPAD(i::text, 3, '0'),
  (SELECT id FROM bike_types WHERE name = 'Sepeda Gowes 1 Orang'),
  'available',
  'Main Station'
FROM generate_series(1, 25) AS i;

-- 15 Sepeda Gowes 2 Orang
INSERT INTO bikes (bike_code, bike_type_id, status, current_location) 
SELECT 
  'G2-' || LPAD(i::text, 3, '0'),
  (SELECT id FROM bike_types WHERE name = 'Sepeda Gowes 2 Orang'),
  'available',
  'Main Station'
FROM generate_series(1, 15) AS i;

-- 10 Sepeda Listrik
INSERT INTO bikes (bike_code, bike_type_id, status, current_location) 
SELECT 
  'EL-' || LPAD(i::text, 3, '0'),
  (SELECT id FROM bike_types WHERE name = 'Sepeda Listrik'),
  'available',
  'Main Station'
FROM generate_series(1, 10) AS i;
