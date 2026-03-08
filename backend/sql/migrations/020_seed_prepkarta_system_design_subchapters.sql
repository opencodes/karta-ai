-- Seed System Design subchapters from provided map.
-- Requires chapter groups seeded (019) and subchapters table (017).

INSERT INTO prepkarta_subchapters (id, chapter_id, name)
SELECT UUID(), c.id, x.subchapter_name
FROM (
  SELECT 'System Design Interview Basics' AS chapter_name, 'System Design Interview Overview' AS subchapter_name UNION ALL
  SELECT 'System Design Interview Basics', 'Preparation Strategies' UNION ALL
  SELECT 'System Design Interview Basics', 'Fundamental Concepts' UNION ALL
  SELECT 'System Design Interview Basics', 'Key Resources' UNION ALL
  SELECT 'System Design Interview Basics', 'Performance Tips' UNION ALL

  SELECT 'Core Concepts', 'Availability and Consistency' UNION ALL
  SELECT 'Core Concepts', 'Back-of-the-envelope Calculations' UNION ALL
  SELECT 'Core Concepts', 'System Design Building Blocks' UNION ALL
  SELECT 'Core Concepts', 'Foundations of Distributed Storage Systems' UNION ALL

  SELECT 'Databases', 'Database Types' UNION ALL
  SELECT 'Databases', 'Data Replication' UNION ALL
  SELECT 'Databases', 'Data Partitioning' UNION ALL
  SELECT 'Databases', 'Database Trade-offs' UNION ALL

  SELECT 'Distributed Storage and Caching', 'Key-value Store Design' UNION ALL
  SELECT 'Distributed Storage and Caching', 'Content Delivery Network (CDN)' UNION ALL
  SELECT 'Distributed Storage and Caching', 'Distributed Cache Design' UNION ALL
  SELECT 'Distributed Storage and Caching', 'Distributed Messaging Queue' UNION ALL
  SELECT 'Distributed Storage and Caching', 'Pub-Sub Systems' UNION ALL

  SELECT 'Traffic and Scalability', 'Rate Limiter Design' UNION ALL
  SELECT 'Traffic and Scalability', 'Blob Store Design' UNION ALL

  SELECT 'Search and Communication', 'Distributed Search Systems' UNION ALL
  SELECT 'Search and Communication', 'Distributed System Communication' UNION ALL

  SELECT 'Design Case Studies 1', 'Design YouTube' UNION ALL
  SELECT 'Design Case Studies 1', 'Design Google Maps' UNION ALL
  SELECT 'Design Case Studies 1', 'Design Uber' UNION ALL
  SELECT 'Design Case Studies 1', 'Design Instagram' UNION ALL

  SELECT 'Wrap Up', 'Concluding Building Blocks Discussion' UNION ALL
  SELECT 'Wrap Up', 'RESHADED Problem-Solving Approach' UNION ALL

  SELECT 'Design Case Studies 2', 'Design News Feed System' UNION ALL
  SELECT 'Design Case Studies 2', 'Design Web Crawler' UNION ALL
  SELECT 'Design Case Studies 2', 'Design WhatsApp' UNION ALL
  SELECT 'Design Case Studies 2', 'Design Typeahead Suggestion' UNION ALL
  SELECT 'Design Case Studies 2', 'Design Collaborative Editing Service (Google Docs)' UNION ALL

  SELECT 'Large Scale Storage Systems', 'Google File System (GFS)' UNION ALL
  SELECT 'Large Scale Storage Systems', 'Google BigTable' UNION ALL
  SELECT 'Large Scale Storage Systems', 'Many-core Key-value Store' UNION ALL
  SELECT 'Large Scale Storage Systems', 'Scaling Memcache' UNION ALL
  SELECT 'Large Scale Storage Systems', 'Amazon DynamoDB' UNION ALL

  SELECT 'Coordination and Locking', 'Two-phase Locking (2PL)' UNION ALL
  SELECT 'Coordination and Locking', 'Google Chubby Locking Service' UNION ALL
  SELECT 'Coordination and Locking', 'ZooKeeper' UNION ALL

  SELECT 'Data Processing and Streaming', 'MapReduce' UNION ALL
  SELECT 'Data Processing and Streaming', 'Apache Kafka' UNION ALL

  SELECT 'Consensus and Transactions', 'Two-phase Commit (2PC)' UNION ALL
  SELECT 'Consensus and Transactions', 'Paxos Consensus Algorithm' UNION ALL
  SELECT 'Consensus and Transactions', 'Raft Consensus Algorithm' UNION ALL

  SELECT 'Reliability', 'Spectacular Failures Case Studies' UNION ALL
  SELECT 'Reliability', 'Concluding Remarks'
) x
INNER JOIN prepkarta_subjects s
  ON s.name = 'System Design'
INNER JOIN prepkarta_concepts c
  ON c.subject_id = s.id
 AND c.name = x.chapter_name
ON DUPLICATE KEY UPDATE name = VALUES(name);
