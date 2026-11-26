-- Migration: Late Penalty System (Grace Period + Tiered Penalties)
-- This replaces the old flat fine system with a more flexible tiered penalty system

-- Add new columns to rentals table for penalty tracking
ALTER TABLE rentals
ADD COLUMN IF NOT EXISTS actual_return_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS penalty_amount BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS overdue_minutes BIGINT DEFAULT 0;

-- Create penalties table for detailed penalty tracking
CREATE TABLE IF NOT EXISTS penalties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    overdue_minutes BIGINT NOT NULL,
    penalty_tier VARCHAR(20) NOT NULL CHECK (penalty_tier IN ('none', 'light', 'medium', 'heavy', 'severe')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'waived')),
    created_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP,
    waived_by UUID REFERENCES profiles(id),
    waived_reason TEXT
);

-- Create function to calculate late penalty based on overdue minutes
CREATE OR REPLACE FUNCTION calculate_late_penalty(
    end_time TIMESTAMP,
    actual_return_time TIMESTAMP
) RETURNS BIGINT AS $$
DECLARE
    overdue_minutes BIGINT;
    penalty BIGINT;
BEGIN
    -- Calculate overdue minutes
    overdue_minutes := EXTRACT(EPOCH FROM (actual_return_time - end_time)) / 60;

    -- Grace period: 0-5 minutes - no penalty
    IF overdue_minutes <= 5 THEN
        RETURN 0;
    -- 5-10 minutes: Rp 10.000 (light)
    ELSIF overdue_minutes <= 10 THEN
        RETURN 10000;
    -- 10-30 minutes: Rp 20.000 (medium)
    ELSIF overdue_minutes <= 30 THEN
        RETURN 20000;
    -- 30-60 minutes: Rp 50.000 (heavy)
    ELSIF overdue_minutes <= 60 THEN
        RETURN 50000;
    -- > 60 minutes: Rp 100.000 (severe - maximum)
    ELSE
        RETURN 100000;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to get penalty tier based on overdue minutes
CREATE OR REPLACE FUNCTION get_penalty_tier(
    overdue_minutes BIGINT
) RETURNS VARCHAR(20) AS $$
BEGIN
    IF overdue_minutes <= 5 THEN
        RETURN 'none';
    ELSIF overdue_minutes <= 10 THEN
        RETURN 'light';
    ELSIF overdue_minutes <= 30 THEN
        RETURN 'medium';
    ELSIF overdue_minutes <= 60 THEN
        RETURN 'heavy';
    ELSE
        RETURN 'severe';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security for penalties table
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;

-- RLS Policies for penalties
-- Users can view their own penalties
CREATE POLICY "Users can view own penalties"
ON penalties FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all penalties
CREATE POLICY "Admins can view all penalties"
ON penalties FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Only admins can insert penalties (system will use service role)
CREATE POLICY "Admins can insert penalties"
ON penalties FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Only admins can update penalties (for waiving)
CREATE POLICY "Admins can update penalties"
ON penalties FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Only admins can delete penalties
CREATE POLICY "Admins can delete penalties"
ON penalties FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_penalties_rental_id ON penalties(rental_id);
CREATE INDEX IF NOT EXISTS idx_penalties_user_id ON penalties(user_id);
CREATE INDEX IF NOT EXISTS idx_penalties_status ON penalties(status);
CREATE INDEX IF NOT EXISTS idx_penalties_created_at ON penalties(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE penalties IS 'Records of late return penalties for rentals';
COMMENT ON FUNCTION calculate_late_penalty IS 'Calculates penalty amount based on overdue minutes using tiered system';
COMMENT ON FUNCTION get_penalty_tier IS 'Returns penalty tier based on overdue minutes';
