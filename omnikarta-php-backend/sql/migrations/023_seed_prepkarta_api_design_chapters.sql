-- Seed API Design chapter groups for PrepKarta.
-- total_questions is set to subtopic count for each chapter group.

SET @api_design_subject_id := (
  SELECT id
  FROM prepkarta_subjects
  WHERE name = 'API Design'
  LIMIT 1
);

SET @api_design_subject_id := IFNULL(@api_design_subject_id, UUID());

INSERT INTO prepkarta_subjects (id, name)
VALUES (@api_design_subject_id, 'API Design')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO prepkarta_concepts (id, subject_id, name, total_questions)
VALUES
  (UUID(), @api_design_subject_id, 'Foundations', 7),
  (UUID(), @api_design_subject_id, 'Core Design Fundamentals', 2),
  (UUID(), @api_design_subject_id, 'Foundational Design Problems', 5),
  (UUID(), @api_design_subject_id, 'Advanced Real World API Designs', 11),
  (UUID(), @api_design_subject_id, 'Reliability and Production Readiness', 2)
ON DUPLICATE KEY UPDATE
  total_questions = VALUES(total_questions);
