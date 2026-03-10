CREATE TABLE IF NOT EXISTS organization_ebooks (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  uploaded_by CHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NULL,
  isbn VARCHAR(32) NULL,
  description TEXT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  storage_path VARCHAR(512) NOT NULL,
  status ENUM('uploaded', 'indexed', 'failed') NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_org_ebooks_org (organization_id),
  INDEX idx_org_ebooks_uploaded_by (uploaded_by),
  INDEX idx_org_ebooks_status (status),
  CONSTRAINT fk_org_ebooks_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_org_ebooks_user
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);
