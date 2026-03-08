-- Seed API Design subchapters from provided map.
-- Requires chapter groups seeded (023) and subchapters table (017).

INSERT INTO prepkarta_subchapters (id, chapter_id, name)
SELECT UUID(), c.id, x.subchapter_name
FROM (
  SELECT 'Foundations' AS chapter_name, 'Introduction to API Roles and Design Principles' AS subchapter_name UNION ALL
  SELECT 'Foundations', 'Network Protocols and Socket Communication' UNION ALL
  SELECT 'Foundations', 'Client-Server Communication Models' UNION ALL
  SELECT 'Foundations', 'Common Data Formats for Web APIs' UNION ALL
  SELECT 'Foundations', 'Comparison of API Architectural Styles (REST, GraphQL, gRPC)' UNION ALL
  SELECT 'Foundations', 'API Design Security (TLS, Validation, Auth, Authorization)' UNION ALL
  SELECT 'Foundations', 'Important API Concepts (Versioning, Rate Limiting, Evolution, Caching)' UNION ALL

  SELECT 'Core Design Fundamentals', 'Back-of-the-Envelope Calculations for Latency' UNION ALL
  SELECT 'Core Design Fundamentals', 'Foundational API Design Frameworks and Conventions' UNION ALL

  SELECT 'Foundational Design Problems', 'Design a Search Service API' UNION ALL
  SELECT 'Foundational Design Problems', 'Design a File Service API' UNION ALL
  SELECT 'Foundational Design Problems', 'Design a Comment Service API' UNION ALL
  SELECT 'Foundational Design Problems', 'Design a Pub-Sub Service API' UNION ALL
  SELECT 'Foundational Design Problems', 'Concluding Foundational Design Problems' UNION ALL

  SELECT 'Advanced Real World API Designs', 'YouTube Streaming API Design' UNION ALL
  SELECT 'Advanced Real World API Designs', 'Facebook Messenger API Design' UNION ALL
  SELECT 'Advanced Real World API Designs', 'Google Maps API Design' UNION ALL
  SELECT 'Advanced Real World API Designs', 'Chess Game API Design with AI Mentor' UNION ALL
  SELECT 'Advanced Real World API Designs', 'Zoom Real-time Conferencing API Design' UNION ALL
  SELECT 'Advanced Real World API Designs', 'LeetCode Platform API Design' UNION ALL
  SELECT 'Advanced Real World API Designs', 'Stripe Payment Gateway API Design' UNION ALL
  SELECT 'Advanced Real World API Designs', 'Twitter API Design' UNION ALL
  SELECT 'Advanced Real World API Designs', 'Uber API Design' UNION ALL
  SELECT 'Advanced Real World API Designs', 'CamelCamelCamel API Design' UNION ALL
  SELECT 'Advanced Real World API Designs', 'Gaming Platform API Design' UNION ALL

  SELECT 'Reliability and Production Readiness', 'API Failures and Mitigation Strategies' UNION ALL
  SELECT 'Reliability and Production Readiness', 'API Design Best Practices and Further Learning'
) x
INNER JOIN prepkarta_subjects s
  ON s.name = 'API Design'
INNER JOIN prepkarta_concepts c
  ON c.subject_id = s.id
 AND c.name = x.chapter_name
ON DUPLICATE KEY UPDATE name = VALUES(name);
