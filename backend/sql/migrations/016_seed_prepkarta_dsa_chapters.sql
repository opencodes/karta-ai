-- Seed DSA subject chapters for PrepKarta.
-- Based on provided chapter group map (group -> list of subtopics).
-- total_questions is set to subtopic count for each chapter group.

SET @dsa_subject_id := (
  SELECT id
  FROM prepkarta_subjects
  WHERE name = 'DSA'
  LIMIT 1
);

SET @dsa_subject_id := IFNULL(@dsa_subject_id, UUID());

INSERT INTO prepkarta_subjects (id, name)
VALUES (@dsa_subject_id, 'DSA')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO prepkarta_concepts (id, subject_id, name, total_questions)
VALUES
  (UUID(), @dsa_subject_id, 'Mathematics and Complexity', 7),
  (UUID(), @dsa_subject_id, 'Arrays and Strings', 13),
  (UUID(), @dsa_subject_id, 'Linked List', 8),
  (UUID(), @dsa_subject_id, 'Stack', 7),
  (UUID(), @dsa_subject_id, 'Queue', 6),
  (UUID(), @dsa_subject_id, 'Recursion and Backtracking', 9),
  (UUID(), @dsa_subject_id, 'Trees', 11),
  (UUID(), @dsa_subject_id, 'Heap', 7),
  (UUID(), @dsa_subject_id, 'Hashing', 7),
  (UUID(), @dsa_subject_id, 'Graphs', 14),
  (UUID(), @dsa_subject_id, 'Greedy Algorithms', 7),
  (UUID(), @dsa_subject_id, 'Dynamic Programming', 14),
  (UUID(), @dsa_subject_id, 'Searching and Sorting', 9),
  (UUID(), @dsa_subject_id, 'Bit Manipulation', 7),
  (UUID(), @dsa_subject_id, 'Advanced Data Structures', 8),
  (UUID(), @dsa_subject_id, 'Advanced Algorithmic Paradigms', 8),
  (UUID(), @dsa_subject_id, 'Design Based DSA', 8)
ON DUPLICATE KEY UPDATE
  total_questions = VALUES(total_questions);
