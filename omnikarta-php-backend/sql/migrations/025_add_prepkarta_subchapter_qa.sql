CREATE TABLE IF NOT EXISTS prepkarta_subchapter_qa (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  organization_id CHAR(36) NULL,
  subchapter_id CHAR(36) NOT NULL,
  question VARCHAR(400) NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prepkarta_subchapter_qa_user_subchapter (user_id, subchapter_id),
  CONSTRAINT fk_prepkarta_subchapter_qa_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_prepkarta_subchapter_qa_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
  CONSTRAINT fk_prepkarta_subchapter_qa_subchapter
    FOREIGN KEY (subchapter_id) REFERENCES prepkarta_subchapters(id) ON DELETE CASCADE
);
