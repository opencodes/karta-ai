CREATE TABLE IF NOT EXISTS edukarta_subject_chapters (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  organization_id CHAR(36) NULL,
  subject VARCHAR(80) NOT NULL,
  chapter_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_edukarta_user_subject_chapter (user_id, subject, chapter_name),
  INDEX idx_edukarta_subject_chapters_user_subject (user_id, subject),
  CONSTRAINT fk_edukarta_subject_chapters_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_edukarta_subject_chapters_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);
