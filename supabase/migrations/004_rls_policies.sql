-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow public read access to bikes and bike_types
ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bike_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_hours ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Bike types policies (public read, admin write)
CREATE POLICY "Public can view bike types"
  ON bike_types FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert bike types"
  ON bike_types FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update bike types"
  ON bike_types FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete bike types"
  ON bike_types FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Bikes policies (public read, admin write)
CREATE POLICY "Public can view bikes"
  ON bikes FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert bikes"
  ON bikes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update bikes"
  ON bikes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete bikes"
  ON bikes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Rentals policies
CREATE POLICY "Users can view own rentals"
  ON rentals FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all rentals"
  ON rentals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own rentals"
  ON rentals FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert rentals"
  ON rentals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own rentals"
  ON rentals FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can update all rentals"
  ON rentals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Queue policies
CREATE POLICY "Users can view own queue"
  ON queue FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all queue"
  ON queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own queue"
  ON queue FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert queue"
  ON queue FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own queue"
  ON queue FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can update all queue"
  ON queue FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can delete own queue"
  ON queue FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can delete all queue"
  ON queue FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert payments"
  ON payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all payments"
  ON payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Operational hours policies (public read, admin write)
CREATE POLICY "Public can view operational hours"
  ON operational_hours FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert operational hours"
  ON operational_hours FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update operational hours"
  ON operational_hours FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete operational hours"
  ON operational_hours FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();