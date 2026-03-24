CREATE TABLE IF NOT EXISTS prepkarta_subchapters (
  id CHAR(36) PRIMARY KEY,
  chapter_id CHAR(36) NOT NULL,
  name VARCHAR(160) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_prepkarta_chapter_subchapter (chapter_id, name),
  INDEX idx_prepkarta_subchapters_chapter (chapter_id),
  CONSTRAINT fk_prepkarta_subchapters_chapter
    FOREIGN KEY (chapter_id) REFERENCES prepkarta_concepts(id) ON DELETE CASCADE
);
