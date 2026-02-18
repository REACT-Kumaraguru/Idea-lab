-- Use price_per_hour only: drop rent_amount so price_per_hour is the single price field.
-- Run this after deploying the code that uses only pricePerHour.
-- If price_per_hour does not exist yet, run first: ALTER TABLE equipments ADD COLUMN price_per_hour DECIMAL(10, 2) NULL;

ALTER TABLE equipments DROP COLUMN rent_amount;
