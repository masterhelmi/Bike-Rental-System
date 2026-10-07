-- Function to calculate rental duration
CREATE OR REPLACE FUNCTION calculate_rental_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.actual_end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.actual_end_time - NEW.start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update bike status based on rental status
CREATE OR REPLACE FUNCTION update_bike_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE bikes SET status = 'rented' WHERE id = NEW.bike_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      UPDATE bikes SET status = 'available' WHERE id = NEW.bike_id;
    ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      UPDATE bikes SET status = 'available' WHERE id = NEW.bike_id;
    ELSIF NEW.status = 'active' AND OLD.status != 'active' THEN
      UPDATE bikes SET status = 'rented' WHERE id = NEW.bike_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to assign queue position
CREATE OR REPLACE FUNCTION assign_queue_position()
RETURNS TRIGGER AS $$
DECLARE
  max_position INTEGER;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'waiting' THEN
    SELECT COALESCE(MAX(position), 0) INTO max_position 
    FROM queue 
    WHERE status = 'waiting';
    NEW.position := max_position + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check and mark overdue rentals
CREATE OR REPLACE FUNCTION check_overdue_rentals()
RETURNS void AS $$
BEGIN
  UPDATE rentals 
  SET status = 'overdue'
  WHERE status = 'active' 
  AND end_time < NOW()
  AND actual_end_time IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to apply fine when rental becomes overdue
CREATE OR REPLACE FUNCTION apply_overdue_fine()
RETURNS TRIGGER AS $$
DECLARE
  fine_amount INTEGER := 100000; -- Rp 100.000
BEGIN
  IF NEW.status = 'overdue' AND OLD.status != 'overdue' AND NEW.is_fined = false THEN
    NEW.fine_amount := fine_amount;
    NEW.is_fined := true;
    NEW.total_amount := NEW.total_amount + fine_amount;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to extend rental duration
CREATE OR REPLACE FUNCTION extend_rental_duration(rental_id UUID, extension_minutes INTEGER)
RETURNS JSON AS $$
DECLARE
  current_rental RECORD;
  new_end_time TIMESTAMP WITH TIME ZONE;
  queue_count INTEGER;
BEGIN
  -- Get current rental with lock
  SELECT * INTO current_rental
  FROM rentals
  WHERE id = rental_id
  FOR UPDATE;

  -- Check if rental exists and is active
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Rental not found');
  END IF;

  IF current_rental.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Rental is not active');
  END IF;

  -- Check max extensions (max 2)
  IF current_rental.extension_count >= 2 THEN
    RETURN json_build_object('success', false, 'error', 'Maximum extensions reached');
  END IF;

  -- Check if there's queue for this bike
  SELECT COUNT(*) INTO queue_count
  FROM queue
  WHERE bike_id = current_rental.bike_id
  AND status = 'waiting';

  IF queue_count > 0 THEN
    RETURN json_build_object('success', false, 'error', 'Cannot extend: queue exists for this bike');
  END IF;

  -- Calculate new end time (1 hour = 60 minutes)
  new_end_time := current_rental.end_time + (extension_minutes || ' minutes')::INTERVAL;

  -- Update rental
  UPDATE rentals
  SET 
    end_time = new_end_time,
    is_extended = TRUE,
    extension_count = extension_count + 1,
    lock_version = lock_version + 1,
    updated_at = NOW()
  WHERE id = rental_id;

  RETURN json_build_object('success', true, 'new_end_time', new_end_time);
END;
$$ LANGUAGE plpgsql;

-- Function to join queue with lock
CREATE OR REPLACE FUNCTION join_queue_with_lock(user_id UUID, bike_id UUID DEFAULT NULL, bike_type_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  existing_queue RECORD;
  bike RECORD;
  new_queue_id UUID;
BEGIN
  -- Check if user already in queue
  SELECT * INTO existing_queue
  FROM queue
  WHERE user_id = user_id
  AND status IN ('waiting', 'notified');

  IF FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User already in queue');
  END IF;

  -- If bike_id specified, check if bike is available
  IF bike_id IS NOT NULL THEN
    SELECT * INTO bike
    FROM bikes
    WHERE id = bike_id;

    IF NOT FOUND THEN
      RETURN json_build_object('success', false, 'error', 'Bike not found');
    END IF;

    IF bike.status = 'available' THEN
      -- Direct assignment if bike is available
      UPDATE bikes SET status = 'rented' WHERE id = bike_id;
      
      INSERT INTO rentals (user_id, bike_id, start_time, end_time, total_amount, payment_status)
      VALUES (
        user_id, 
        bike_id, 
        NOW(), 
        NOW() + INTERVAL '1 hour',
        (SELECT hourly_rate FROM bike_types WHERE id = bike.bike_type_id),
        'paid'
      )
      RETURNING id INTO new_queue_id;

      RETURN json_build_object('success', true, 'direct_assignment', true, 'rental_id', new_queue_id);
    END IF;
  END IF;

  -- Insert into queue
  INSERT INTO queue (user_id, bike_id, bike_type_id)
  VALUES (user_id, bike_id, bike_type_id)
  RETURNING id INTO new_queue_id;

  RETURN json_build_object('success', true, 'queue_id', new_queue_id);
END;
$$ LANGUAGE plpgsql;

-- Function to process queue and assign bikes
CREATE OR REPLACE FUNCTION process_queue_assignment()
RETURNS JSON AS $$
DECLARE
  available_bike RECORD;
  queue_item RECORD;
  notification_result JSON;
BEGIN
  -- Get available bikes
  FOR available_bike IN 
    SELECT id, bike_type_id FROM bikes WHERE status = 'available'
  LOOP
    -- Find first waiting user for this bike or bike type
    SELECT * INTO queue_item
    FROM queue
    WHERE (bike_id = available_bike.id OR bike_type_id = available_bike.bike_type_id OR (bike_id IS NULL AND bike_type_id IS NULL))
    AND status = 'waiting'
    ORDER BY position ASC
    LIMIT 1
    FOR UPDATE;

    IF FOUND THEN
      -- Update queue status to notified
      UPDATE queue
      SET 
        status = 'notified',
        notified_at = NOW(),
        expires_at = NOW() + INTERVAL '15 minutes',
        assigned_bike_id = available_bike.id,
        lock_version = lock_version + 1,
        updated_at = NOW()
      WHERE id = queue_item.id;

      notification_result := json_build_object(
        'queue_id', queue_item.id,
        'user_id', queue_item.user_id,
        'bike_id', available_bike.id,
        'expires_at', NOW() + INTERVAL '15 minutes'
      );
    END IF;
  END LOOP;

  RETURN json_build_object('success', true, 'processed', true);
END;
$$ LANGUAGE plpgsql;

-- Function to check queue timeout
CREATE OR REPLACE FUNCTION check_queue_timeout()
RETURNS void AS $$
DECLARE
  expired_queue RECORD;
BEGIN
  -- Find expired queue items (notified but not responded within 15 minutes)
  FOR expired_queue IN
    SELECT id, user_id, bike_id, bike_type_id
    FROM queue
    WHERE status = 'notified'
    AND expires_at < NOW()
  LOOP
    -- Skip to next in queue
    UPDATE queue
    SET 
      status = 'expired',
      position = NULL,
      updated_at = NOW()
    WHERE id = expired_queue.id;

    -- Reorder remaining queue
    UPDATE queue
    SET position = position - 1
    WHERE status = 'waiting'
    AND position > (SELECT position FROM queue WHERE id = expired_queue.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER calculate_rental_duration_trigger
  BEFORE UPDATE ON rentals
  FOR EACH ROW
  WHEN (NEW.actual_end_time IS DISTINCT FROM OLD.actual_end_time)
  EXECUTE FUNCTION calculate_rental_duration();

CREATE TRIGGER update_bike_status_trigger
  AFTER INSERT OR UPDATE ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION update_bike_status();

CREATE TRIGGER assign_queue_position_trigger
  BEFORE INSERT ON queue
  FOR EACH ROW
  EXECUTE FUNCTION assign_queue_position();

CREATE TRIGGER apply_overdue_fine_trigger
  AFTER UPDATE ON rentals
  FOR EACH ROW
  WHEN (NEW.status = 'overdue' AND OLD.status != 'overdue')
  EXECUTE FUNCTION apply_overdue_fine();