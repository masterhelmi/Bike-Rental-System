-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE bike_status AS ENUM ('available', 'rented', 'maintenance', 'unavailable');
CREATE TYPE rental_status AS ENUM ('active', 'completed', 'overdue', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'partial');
CREATE TYPE payment_method AS ENUM ('transfer', 'qris', 'cash', 'e-wallet');
CREATE TYPE queue_status AS ENUM ('waiting', 'notified', 'assigned', 'cancelled', 'expired');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bike_types table
CREATE TABLE bike_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  hourly_rate INTEGER NOT NULL, -- in Rupiah
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bikes table
CREATE TABLE bikes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bike_code TEXT UNIQUE NOT NULL,
  bike_type_id UUID REFERENCES bike_types(id) ON DELETE SET NULL,
  status bike_status DEFAULT 'available',
  current_location TEXT,
  last_maintenance TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rentals table
CREATE TABLE rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bike_id UUID REFERENCES bikes(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  is_extended BOOLEAN DEFAULT FALSE,
  extension_count INTEGER DEFAULT 0,
  status rental_status DEFAULT 'active',
  total_amount INTEGER NOT NULL,
  paid_amount INTEGER DEFAULT 0,
  payment_status payment_status DEFAULT 'pending',
  fine_amount INTEGER DEFAULT 0,
  is_fined BOOLEAN DEFAULT FALSE,
  lock_version INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create queue table
CREATE TABLE queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bike_id UUID REFERENCES bikes(id) ON DELETE SET NULL,
  bike_type_id UUID REFERENCES bike_types(id) ON DELETE SET NULL,
  position INTEGER,
  status queue_status DEFAULT 'waiting',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  assigned_bike_id UUID REFERENCES bikes(id) ON DELETE SET NULL,
  lock_version INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  transaction_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create operational_hours table
CREATE TABLE operational_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL DEFAULT '06:00',
  close_time TIME NOT NULL DEFAULT '19:00',
  is_closed BOOLEAN DEFAULT FALSE,
  UNIQUE(day_of_week)
);

-- Create indexes for better performance
CREATE INDEX idx_bikes_status ON bikes(status);
CREATE INDEX idx_bikes_type ON bikes(bike_type_id);
CREATE INDEX idx_rentals_user ON rentals(user_id);
CREATE INDEX idx_rentals_bike ON rentals(bike_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_start_time ON rentals(start_time);
CREATE INDEX idx_queue_user ON queue(user_id);
CREATE INDEX idx_queue_bike ON queue(bike_id);
CREATE INDEX idx_queue_status ON queue(status);
CREATE INDEX idx_queue_position ON queue(position);
CREATE INDEX idx_payments_rental ON payments(rental_id);
CREATE INDEX idx_payments_user ON payments(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bike_types_updated_at BEFORE UPDATE ON bike_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bikes_updated_at BEFORE UPDATE ON bikes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON rentals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();