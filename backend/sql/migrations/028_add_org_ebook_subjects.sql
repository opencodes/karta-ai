ALTER TABLE organization_ebooks
  ADD COLUMN subject VARCHAR(120) NOT NULL AFTER uploaded_by,
  ADD COLUMN board VARCHAR(120) NOT NULL AFTER subject,
  ADD COLUMN class_level VARCHAR(40) NOT NULL AFTER board,
  ADD INDEX idx_org_ebooks_subject (subject),
  ADD INDEX idx_org_ebooks_board (board),
  ADD INDEX idx_org_ebooks_class_level (class_level);
