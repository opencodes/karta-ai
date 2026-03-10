CREATE TABLE IF NOT EXISTS edukarta_progress_profiles (
  user_id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NULL,
  progress_data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_edukarta_progress_profiles_org (organization_id),
  CONSTRAINT fk_edukarta_progress_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_edukarta_progress_profiles_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);
