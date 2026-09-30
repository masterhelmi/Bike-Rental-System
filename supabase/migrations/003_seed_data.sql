-- Insert bike types with different hourly rates
INSERT INTO bike_types (name, hourly_rate, description) VALUES
  ('Mountain Bike', 10000, 'Sepeda gunung untuk off-road trails'),
  ('City Bike', 5000, 'Sepeda kota untuk perjalanan urban'),
  ('Road Bike', 15000, 'Sepeda balap untuk kecepatan tinggi'),
  ('Electric Bike', 20000, 'Sepeda listrik untuk perjalanan mudah'),
  ('Kids Bike', 3000, 'Sepeda untuk anak-anak');

-- Insert operational hours (06:00 - 19:00 every day)
INSERT INTO operational_hours (day_of_week, open_time, close_time, is_closed) VALUES
  (0, '06:00', '19:00', FALSE), -- Sunday
  (1, '06:00', '19:00', FALSE), -- Monday
  (2, '06:00', '19:00', FALSE), -- Tuesday
  (3, '06:00', '19:00', FALSE), -- Wednesday
  (4, '06:00', '19:00', FALSE), -- Thursday
  (5, '06:00', '19:00', FALSE), -- Friday
  (6, '06:00', '19:00', FALSE); -- Saturday

-- Insert sample bikes (50 bikes total)
-- 20 Mountain Bikes
INSERT INTO bikes (bike_code, bike_type_id, status, current_location) 
SELECT 
  'MTB-' || LPAD(i::text, 3, '0'),
  (SELECT id FROM bike_types WHERE name = 'Mountain Bike'),
  'available',
  'Main Station'
FROM generate_series(1, 20) AS i;

-- 15 City Bikes
INSERT INTO bikes (bike_code, bike_type_id, status, current_location) 
SELECT 
  'CTY-' || LPAD(i::text, 3, '0'),
  (SELECT id FROM bike_types WHERE name = 'City Bike'),
  'available',
  'Main Station'
FROM generate_series(1, 15) AS i;

-- 8 Road Bikes
INSERT INTO bikes (bike_code, bike_type_id, status, current_location) 
SELECT 
  'RD-' || LPAD(i::text, 3, '0'),
  (SELECT id FROM bike_types WHERE name = 'Road Bike'),
  'available',
  'Main Station'
FROM generate_series(1, 8) AS i;

-- 5 Electric Bikes
INSERT INTO bikes (bike_code, bike_type_id, status, current_location) 
SELECT 
  'EB-' || LPAD(i::text, 3, '0'),
  (SELECT id FROM bike_types WHERE name = 'Electric Bike'),
  'available',
  'Main Station'
FROM generate_series(1, 5) AS i;

-- 2 Kids Bikes
INSERT INTO bikes (bike_code, bike_type_id, status, current_location) 
SELECT 
  'KIDS-' || LPAD(i::text, 3, '0'),
  (SELECT id FROM bike_types WHERE name = 'Kids Bike'),
  'available',
  'Main Station'
FROM generate_series(1, 2) AS i;