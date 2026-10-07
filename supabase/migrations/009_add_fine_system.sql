-- Add fine_amount column to rentals table
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS fine_amount INTEGER DEFAULT 0;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS is_fined BOOLEAN DEFAULT FALSE;

-- Function to calculate and apply fine for overdue rentals
CREATE OR REPLACE FUNCTION apply_overdue_fine()
RETURNS void AS 884
DECLARE
  overdue_rental RECORD;
  fine_amount INTEGER := 100000; -- Rp 100.000
BEGIN
  FOR overdue_rental IN 
    SELECT id, user_id, total_amount
    FROM rentals
    WHERE status = 'overdue'
    AND is_fined = false
  LOOP
    -- Update rental with fine
    UPDATE rentals
    SET 
      fine_amount = fine_amount,
      is_fined = true,
      total_amount = total_amount + fine_amount,
      updated_at = NOW()
    WHERE id = overdue_rental.id;
  END LOOP;
END;
884 LANGUAGE plpgsql;
