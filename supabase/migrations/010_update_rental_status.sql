-- Update rental status enum to include new statuses
-- This requires recreating the enum, so we need to update the table

-- Step 1: Add new columns to track the changes temporarily
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS new_status VARCHAR(20);

-- Step 2: Update existing data
UPDATE rentals SET new_status = status;

-- Step 3: Drop the enum constraint
ALTER TABLE rentals ALTER COLUMN status DROP DEFAULT;
ALTER TABLE rentals ALTER COLUMN status TYPE VARCHAR(20) USING status::VARCHAR(20);

-- Step 4: Update the status values
UPDATE rentals SET status = 'pending_payment' WHERE new_status = 'active' AND payment_status = 'pending';
UPDATE rentals SET status = 'rejected' WHERE new_status = 'cancelled' AND payment_status = 'pending';

-- Step 5: Add check constraint for valid statuses
ALTER TABLE rentals ADD CONSTRAINT check_rental_status 
  CHECK (status IN ('pending_payment', 'active', 'completed', 'overdue', 'cancelled', 'rejected'));

-- Step 6: Drop temporary column
ALTER TABLE rentals DROP COLUMN IF EXISTS new_status;
