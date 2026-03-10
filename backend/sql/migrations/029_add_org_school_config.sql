CREATE TABLE IF NOT EXISTS organization_boards (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_org_board (organization_id, name),
  INDEX idx_org_boards_org (organization_id),
  CONSTRAINT fk_org_boards_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS organization_classes (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_org_class (organization_id, name),
  INDEX idx_org_classes_org (organization_id),
  CONSTRAINT fk_org_classes_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS organization_class_boards (
  id CHAR(36) PRIMARY KEY,
  class_id CHAR(36) NOT NULL,
  board_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_class_board (class_id, board_id),
  INDEX idx_class_boards_class (class_id),
  INDEX idx_class_boards_board (board_id),
  CONSTRAINT fk_class_boards_class
    FOREIGN KEY (class_id) REFERENCES organization_classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_class_boards_board
    FOREIGN KEY (board_id) REFERENCES organization_boards(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS organization_class_subjects (
  id CHAR(36) PRIMARY KEY,
  class_id CHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_class_subject (class_id, name),
  INDEX idx_class_subjects_class (class_id),
  CONSTRAINT fk_class_subjects_class
    FOREIGN KEY (class_id) REFERENCES organization_classes(id) ON DELETE CASCADE
);
