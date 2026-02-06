-- Migration: Change balance column from BIGINT to DOUBLE
-- Run this on production server

ALTER TABLE users MODIFY COLUMN balance DOUBLE DEFAULT 0.0;

-- Verify the change
DESCRIBE users;
