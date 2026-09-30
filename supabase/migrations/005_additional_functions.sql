-- Function to reorder queue after cancellation
CREATE OR REPLACE FUNCTION reorder_queue_after_cancellation(cancelled_position INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE queue
  SET position = position - 1
  WHERE status = 'waiting'
  AND position > cancelled_position;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's current active rental
CREATE OR REPLACE FUNCTION get_user_active_rental(user_id UUID)
RETURNS JSON AS $$
DECLARE
  rental_record RECORD;
  result JSON;
BEGIN
  SELECT * INTO rental_record
  FROM rentals
  WHERE user_id = user_id
  AND status = 'active'
  ORDER BY start_time DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('found', false);
  END IF;

  SELECT json_build_object(
    'found', true,
    'rental', row_to_json(rental_record)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's queue position
CREATE OR REPLACE FUNCTION get_user_queue_position(user_id UUID)
RETURNS JSON AS $$
DECLARE
  queue_record RECORD;
  bikes_ahead INTEGER;
  result JSON;
BEGIN
  SELECT * INTO queue_record
  FROM queue
  WHERE user_id = user_id
  AND status IN ('waiting', 'notified')
  ORDER BY joined_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('in_queue', false);
  END IF;

  -- Count bikes ahead in queue
  SELECT COUNT(*) INTO bikes_ahead
  FROM queue
  WHERE status = 'waiting'
  AND position < queue_record.position;

  SELECT json_build_object(
    'in_queue', true,
    'queue', row_to_json(queue_record),
    'bikes_ahead', bikes_ahead
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get available bikes count by type
CREATE OR REPLACE FUNCTION get_available_bikes_count()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_object_agg(
    bike_type_name,
    count
  ) INTO result
  FROM (
    SELECT 
      bt.name as bike_type_name,
      COUNT(b.id) as count
    FROM bike_types bt
    LEFT JOIN bikes b ON b.bike_type_id = bt.id AND b.status = 'available'
    GROUP BY bt.name
  ) counts;

  RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql;

-- Function to get daily statistics
CREATE OR REPLACE FUNCTION get_daily_statistics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
  total_rentals INTEGER;
  active_rentals INTEGER;
  completed_rentals INTEGER;
  total_revenue BIGINT;
  queue_length INTEGER;
  result JSON;
BEGIN
  -- Total rentals for the day
  SELECT COUNT(*) INTO total_rentals
  FROM rentals
  WHERE DATE(start_time) = target_date;

  -- Currently active rentals
  SELECT COUNT(*) INTO active_rentals
  FROM rentals
  WHERE status = 'active';

  -- Completed rentals for the day
  SELECT COUNT(*) INTO completed_rentals
  FROM rentals
  WHERE status = 'completed'
  AND DATE(actual_end_time) = target_date;

  -- Total revenue for the day
  SELECT COALESCE(SUM(total_amount), 0) INTO total_revenue
  FROM rentals
  WHERE DATE(start_time) = target_date
  AND payment_status = 'paid';

  -- Current queue length
  SELECT COUNT(*) INTO queue_length
  FROM queue
  WHERE status = 'waiting';

  SELECT json_build_object(
    'date', target_date,
    'total_rentals', total_rentals,
    'active_rentals', active_rentals,
    'completed_rentals', completed_rentals,
    'total_revenue', total_revenue,
    'queue_length', queue_length
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;