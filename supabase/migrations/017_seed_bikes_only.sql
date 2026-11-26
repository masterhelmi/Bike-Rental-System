-- Check if bikes table is empty and seed if needed
DO 440
DECLARE
    bike_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO bike_count FROM bikes;

    IF bike_count = 0 THEN
        -- Insert bikes (50 bikes total) using existing bike types
        -- 25 Sepeda Gowes 1 Orang
        INSERT INTO bikes (bike_code, bike_type_id, status, current_location)
        SELECT
          'G1-' || LPAD(i::text, 3, '0'),
          (SELECT id FROM bike_types WHERE name = 'Sepeda Gowes 1 Orang'),
          'available',
          'Main Station'
        FROM generate_series(1, 25) AS i
        ON CONFLICT DO NOTHING;

        -- 15 Sepeda Gowes 2 Orang
        INSERT INTO bikes (bike_code, bike_type_id, status, current_location)
        SELECT
          'G2-' || LPAD(i::text, 3, '0'),
          (SELECT id FROM bike_types WHERE name = 'Sepeda Gowes 2 Orang'),
          'available',
          'Main Station'
        FROM generate_series(1, 15) AS i
        ON CONFLICT DO NOTHING;

        -- 10 Sepeda Listrik
        INSERT INTO bikes (bike_code, bike_type_id, status, current_location)
        SELECT
          'EL-' || LPAD(i::text, 3, '0'),
          (SELECT id FROM bike_types WHERE name = 'Sepeda Listrik'),
          'available',
          'Main Station'
        FROM generate_series(1, 10) AS i
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Seeded bikes data successfully';
    ELSE
        RAISE NOTICE 'Bikes table already has data, skipping seed';
    END IF;
END 440;
