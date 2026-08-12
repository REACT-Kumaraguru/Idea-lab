-- Run once to add submission_batch_id for grouping cart submissions as one request.
-- equipment_bookings: one batch ID per cart submission (same user, same submit-cart call).
ALTER TABLE equipment_bookings
ADD COLUMN submission_batch_id VARCHAR(64) NULL;
