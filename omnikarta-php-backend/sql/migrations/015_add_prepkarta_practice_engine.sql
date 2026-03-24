CREATE TABLE IF NOT EXISTS prepkarta_subjects (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prepkarta_concepts (
  id CHAR(36) PRIMARY KEY,
  subject_id CHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  total_questions INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_prepkarta_subject_concept (subject_id, name),
  INDEX idx_prepkarta_concepts_subject (subject_id),
  CONSTRAINT fk_prepkarta_concepts_subject
    FOREIGN KEY (subject_id) REFERENCES prepkarta_subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prepkarta_questions (
  id CHAR(36) PRIMARY KEY,
  concept_id CHAR(36) NOT NULL,
  type ENUM('single_choice', 'multiple_choice') NOT NULL DEFAULT 'single_choice',
  question_text TEXT NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  explanation TEXT NOT NULL,
  question_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prepkarta_questions_concept_order (concept_id, question_order),
  CONSTRAINT fk_prepkarta_questions_concept
    FOREIGN KEY (concept_id) REFERENCES prepkarta_concepts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prepkarta_options (
  id CHAR(36) PRIMARY KEY,
  question_id CHAR(36) NOT NULL,
  text VARCHAR(500) NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prepkarta_options_question (question_id),
  CONSTRAINT fk_prepkarta_options_question
    FOREIGN KEY (question_id) REFERENCES prepkarta_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prepkarta_user_concept_progress (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  concept_id CHAR(36) NOT NULL,
  last_question_index INT NOT NULL DEFAULT 0,
  mastery_score DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
  attempts_count INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  wrong_answers INT NOT NULL DEFAULT 0,
  total_practice_seconds INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_prepkarta_user_concept_progress (user_id, concept_id),
  INDEX idx_prepkarta_user_concept_progress_user (user_id),
  CONSTRAINT fk_prepkarta_user_concept_progress_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_prepkarta_user_concept_progress_concept
    FOREIGN KEY (concept_id) REFERENCES prepkarta_concepts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prepkarta_user_answer_history (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  concept_id CHAR(36) NOT NULL,
  question_id CHAR(36) NOT NULL,
  selected_options JSON NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  repetition_level INT NOT NULL DEFAULT 0,
  repeat_after_attempts INT NOT NULL DEFAULT 0,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prepkarta_answer_user_concept (user_id, concept_id, attempted_at),
  INDEX idx_prepkarta_answer_question (question_id),
  CONSTRAINT fk_prepkarta_answer_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_prepkarta_answer_concept
    FOREIGN KEY (concept_id) REFERENCES prepkarta_concepts(id) ON DELETE CASCADE,
  CONSTRAINT fk_prepkarta_answer_question
    FOREIGN KEY (question_id) REFERENCES prepkarta_questions(id) ON DELETE CASCADE
);

-- Seed minimal subject/concept/question set for Linked List practice.
SET @subject_dsa_id := UUID();
SET @subject_system_design_id := UUID();

INSERT INTO prepkarta_subjects (id, name)
VALUES
  (@subject_dsa_id, 'DSA'),
  (@subject_system_design_id, 'System Design')
ON DUPLICATE KEY UPDATE name = VALUES(name);

SET @concept_linked_list_id := UUID();
INSERT INTO prepkarta_concepts (id, subject_id, name, total_questions)
VALUES
  (@concept_linked_list_id, (SELECT id FROM prepkarta_subjects WHERE name = 'DSA' LIMIT 1), 'Linked List', 3)
ON DUPLICATE KEY UPDATE total_questions = VALUES(total_questions);

SET @q1 := UUID();
SET @q2 := UUID();
SET @q3 := UUID();

INSERT INTO prepkarta_questions (id, concept_id, type, question_text, difficulty, explanation, question_order)
VALUES
  (@q1, (SELECT id FROM prepkarta_concepts WHERE name = 'Linked List' LIMIT 1), 'single_choice', 'What is the time complexity of inserting a node at the head of a singly linked list?', 'easy', 'Head insertion only updates one pointer, so it is O(1).', 1),
  (@q2, (SELECT id FROM prepkarta_concepts WHERE name = 'Linked List' LIMIT 1), 'single_choice', 'Which operation is typically O(n) in a singly linked list?', 'easy', 'Accessing by index requires traversal from head, so it is O(n).', 2),
  (@q3, (SELECT id FROM prepkarta_concepts WHERE name = 'Linked List' LIMIT 1), 'multiple_choice', 'Select all true statements about linked lists.', 'medium', 'Linked lists provide dynamic sizing and efficient head insertions but not cache-friendly random access.', 3)
ON DUPLICATE KEY UPDATE question_text = VALUES(question_text), explanation = VALUES(explanation);

INSERT INTO prepkarta_options (id, question_id, text, is_correct)
VALUES
  (UUID(), @q1, 'O(1)', 1),
  (UUID(), @q1, 'O(log n)', 0),
  (UUID(), @q1, 'O(n)', 0),
  (UUID(), @q1, 'O(n log n)', 0),
  (UUID(), @q2, 'Insert at head', 0),
  (UUID(), @q2, 'Delete head', 0),
  (UUID(), @q2, 'Find element by index', 1),
  (UUID(), @q2, 'Update head pointer', 0),
  (UUID(), @q3, 'Linked lists support O(1) head insertion.', 1),
  (UUID(), @q3, 'Linked lists require contiguous memory allocation.', 0),
  (UUID(), @q3, 'Random index access is usually O(n).', 1),
  (UUID(), @q3, 'Linked lists are always faster than arrays for traversal.', 0);
