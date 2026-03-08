-- Seed Low Level Design subchapters from provided map.
-- Requires chapter groups seeded (021) and subchapters table (017).

INSERT INTO prepkarta_subchapters (id, chapter_id, name)
SELECT UUID(), c.id, x.subchapter_name
FROM (
  SELECT 'Foundations' AS chapter_name, 'Course Introduction and Prerequisites' AS subchapter_name UNION ALL
  SELECT 'Foundations', 'Cornerstones of Object-Oriented Programming' UNION ALL
  SELECT 'Foundations', 'Object-Oriented Analysis and Design' UNION ALL
  SELECT 'Foundations', 'Object-Oriented Design Principles (SOLID)' UNION ALL
  SELECT 'Foundations', 'Design Patterns (Creational, Structural, Behavioral)' UNION ALL

  SELECT 'Fundamental Design Problems', 'Approaching Real-world Design Problems' UNION ALL
  SELECT 'Fundamental Design Problems', 'Designing a Parking Lot System' UNION ALL

  SELECT 'Intermediate Design Problems', 'Designing an Elevator System' UNION ALL
  SELECT 'Intermediate Design Problems', 'Designing a Library Management System' UNION ALL
  SELECT 'Intermediate Design Problems', 'Designing the Amazon Locker Service' UNION ALL
  SELECT 'Intermediate Design Problems', 'Designing a Vending Machine' UNION ALL
  SELECT 'Intermediate Design Problems', 'Designing an Online Blackjack Game' UNION ALL
  SELECT 'Intermediate Design Problems', 'Designing a Meeting Scheduler' UNION ALL
  SELECT 'Intermediate Design Problems', 'Designing a Movie Ticket Booking System' UNION ALL

  SELECT 'Advanced Design Problems', 'Designing a Car Rental System' UNION ALL
  SELECT 'Advanced Design Problems', 'Designing an ATM System' UNION ALL
  SELECT 'Advanced Design Problems', 'Designing a Chess Game' UNION ALL
  SELECT 'Advanced Design Problems', 'Designing a Hotel Management System' UNION ALL
  SELECT 'Advanced Design Problems', 'Designing the Amazon Online Shopping System' UNION ALL
  SELECT 'Advanced Design Problems', 'Designing Stack Overflow' UNION ALL
  SELECT 'Advanced Design Problems', 'Designing a Restaurant Management System' UNION ALL
  SELECT 'Advanced Design Problems', 'Designing Facebook' UNION ALL
  SELECT 'Advanced Design Problems', 'Designing an Online Stock Brokerage System' UNION ALL
  SELECT 'Advanced Design Problems', 'Designing a Jigsaw Puzzle' UNION ALL
  SELECT 'Advanced Design Problems', 'Designing an Airline Management System' UNION ALL
  SELECT 'Advanced Design Problems', 'Designing Cricinfo' UNION ALL
  SELECT 'Advanced Design Problems', 'Designing LinkedIn' UNION ALL

  SELECT 'Conclusion', 'Object-Oriented Design Interview Tips' UNION ALL
  SELECT 'Conclusion', 'Course Wrap-Up'
) x
INNER JOIN prepkarta_subjects s
  ON s.name = 'Low Level Design'
INNER JOIN prepkarta_concepts c
  ON c.subject_id = s.id
 AND c.name = x.chapter_name
ON DUPLICATE KEY UPDATE name = VALUES(name);
