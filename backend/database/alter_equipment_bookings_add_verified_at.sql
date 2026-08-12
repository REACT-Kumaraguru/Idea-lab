-- Add verified_at for admin QR verification
-- Run this if the column does not exist yet.
ALTER TABLE equipment_bookings ADD COLUMN verified_at DATETIME NULL;
