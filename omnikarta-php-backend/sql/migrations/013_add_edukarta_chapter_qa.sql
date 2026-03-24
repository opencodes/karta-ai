CREATE TABLE IF NOT EXISTS edukarta_chapter_qa (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  organization_id CHAR(36) NULL,
  subject VARCHAR(80) NOT NULL,
  chapter VARCHAR(200) NOT NULL,
  question VARCHAR(400) NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_edukarta_chapter_qa_user_subject_chapter (user_id, subject, chapter),
  CONSTRAINT fk_edukarta_chapter_qa_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_edukarta_chapter_qa_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);
