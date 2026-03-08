-- Seed Low Level Design chapter groups for PrepKarta.
-- total_questions is set to subtopic count for each chapter group.

SET @lld_subject_id := (
  SELECT id
  FROM prepkarta_subjects
  WHERE name = 'Low Level Design'
  LIMIT 1
);

SET @lld_subject_id := IFNULL(@lld_subject_id, UUID());

INSERT INTO prepkarta_subjects (id, name)
VALUES (@lld_subject_id, 'Low Level Design')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO prepkarta_concepts (id, subject_id, name, total_questions)
VALUES
  (UUID(), @lld_subject_id, 'Foundations', 5),
  (UUID(), @lld_subject_id, 'Fundamental Design Problems', 2),
  (UUID(), @lld_subject_id, 'Intermediate Design Problems', 7),
  (UUID(), @lld_subject_id, 'Advanced Design Problems', 13),
  (UUID(), @lld_subject_id, 'Conclusion', 2)
ON DUPLICATE KEY UPDATE
  total_questions = VALUES(total_questions);
