ALTER TABLE users
  ADD COLUMN full_name VARCHAR(120) NULL AFTER email,
  ADD COLUMN phone_number VARCHAR(20) NULL AFTER full_name;
