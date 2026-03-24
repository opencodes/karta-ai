-- Seed System Design chapter groups for PrepKarta.
-- total_questions is set to subtopic count for each chapter group.

SET @sd_subject_id := (
  SELECT id
  FROM prepkarta_subjects
  WHERE name = 'System Design'
  LIMIT 1
);

SET @sd_subject_id := IFNULL(@sd_subject_id, UUID());

INSERT INTO prepkarta_subjects (id, name)
VALUES (@sd_subject_id, 'System Design')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO prepkarta_concepts (id, subject_id, name, total_questions)
VALUES
  (UUID(), @sd_subject_id, 'System Design Interview Basics', 5),
  (UUID(), @sd_subject_id, 'Core Concepts', 4),
  (UUID(), @sd_subject_id, 'Databases', 4),
  (UUID(), @sd_subject_id, 'Distributed Storage and Caching', 5),
  (UUID(), @sd_subject_id, 'Traffic and Scalability', 2),
  (UUID(), @sd_subject_id, 'Search and Communication', 2),
  (UUID(), @sd_subject_id, 'Design Case Studies 1', 4),
  (UUID(), @sd_subject_id, 'Wrap Up', 2),
  (UUID(), @sd_subject_id, 'Design Case Studies 2', 5),
  (UUID(), @sd_subject_id, 'Large Scale Storage Systems', 5),
  (UUID(), @sd_subject_id, 'Coordination and Locking', 3),
  (UUID(), @sd_subject_id, 'Data Processing and Streaming', 2),
  (UUID(), @sd_subject_id, 'Consensus and Transactions', 3),
  (UUID(), @sd_subject_id, 'Reliability', 2)
ON DUPLICATE KEY UPDATE
  total_questions = VALUES(total_questions);
