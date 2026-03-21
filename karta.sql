CREATE DATABASE  IF NOT EXISTS `karta` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `karta`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: karta
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '7454fa53-1765-11f1-aba7-2cf05d836a82:1-858';

--
-- Table structure for table `edukarta_chapter_qa`
--

DROP TABLE IF EXISTS `edukarta_chapter_qa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `edukarta_chapter_qa` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `organization_id` char(36) DEFAULT NULL,
  `subject` varchar(80) NOT NULL,
  `chapter` varchar(200) NOT NULL,
  `question` varchar(400) NOT NULL,
  `answer` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_edukarta_chapter_qa_user_subject_chapter` (`user_id`,`subject`,`chapter`),
  KEY `fk_edukarta_chapter_qa_org` (`organization_id`),
  CONSTRAINT `fk_edukarta_chapter_qa_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_edukarta_chapter_qa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `edukarta_chapter_qa`
--

LOCK TABLES `edukarta_chapter_qa` WRITE;
/*!40000 ALTER TABLE `edukarta_chapter_qa` DISABLE KEYS */;
INSERT INTO `edukarta_chapter_qa` VALUES ('7557799d-1aa5-11f1-ba17-2cf05d836a82','d9063124-1aa3-11f1-ba17-2cf05d836a82','753cd715-1aa3-11f1-ba17-2cf05d836a82','Mathematics','Fractions - Whole, Half, Quarter','Give me a complete chapter summary for revision.','### Chapter Summary\n* Fractions are a way to show a part of a whole.\n* A whole is a complete object or group.\n* A half is equal to 1/2 of a whole.\n* A quarter is equal to 1/4 of a whole.\n* We can show fractions using numbers and symbols, like 1/2 or 1/4.\n* We can also show fractions using pictures or diagrams.\n* Fractions can be equal or unequal.\n* We can compare fractions by finding a common denominator.\n\n### Key Terms\n* Whole: a complete object or group\n* Half: 1/2 of a whole\n* Quarter: 1/4 of a whole\n* Denominator: the number below the line in a fraction\n* Numerator: the number above the line in a fraction\n* Equal fractions: fractions that have the same value\n* Unequal fractions: fractions that have different values\n* Common denominator: a number that both fractions can use\n\n### Important Formulas/Facts\n* None in this chapter\n\n### Common Mistakes to Avoid\n* Confusing the numerator and denominator\n* Not using a common denominator when comparing fractions\n* Not understanding that a fraction can be equal to a whole number\n* Not recognizing that a fraction can be greater than 1\n* Not using pictures or diagrams to help understand fractions\n\n### Quick Revision Checklist\n1. Can you define a whole and a fraction?\n2. Can you show a half and a quarter of a whole?\n3. Can you compare two fractions using a common denominator?\n4. Can you recognize equal and unequal fractions?\n5. Can you explain the concept of a denominator and numerator?\n6. Can you give an example of a fraction that is equal to a whole number?\n\n### Practice Questions\n1. What is a half of a whole? \n   a) 1/2\n   b) 1/4\n   c) 3/4\n   d) 2/3\n\n2. Which of the following fractions is equal to a whole number?\n   a) 1/2\n   b) 3/4\n   c) 2/3\n   d) 5/5\n\n3. Compare the fractions 1/2 and 1/4. Which one is greater?\n   a) 1/2\n   b) 1/4\n   c) They are equal\n   d) Cannot be compared\n\n4. What is the denominator of the fraction 3/5?\n   a) 3\n   b) 5\n   c) 10\n   d) 15\n\n5. A pizza is cut into 8 equal pieces. If you eat 2 pieces, what fraction of the pizza have you eaten?\n   a) 1/4\n   b) 1/2\n   c) 2/3\n   d) 3/4\n\nIf you want further help with this chapter, I can also provide:\n- Extra short summary for quick revision\n- Important exam questions with answers\n- A clear and easy mind map\n- Hindi notes for quick understanding\n- MCQs for exam preparation','2026-03-08 04:15:36'),('bea69105-1a9f-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','History','PART I: HISTORY - Where, When and How-The Medieval Period in India','Give me a complete chapter summary for revision.','### Chapter Summary\n* The Medieval Period in India started from the 8th century and lasted till the 12th century.\n* This period saw the rise of various kingdoms and empires, including the Rashtrakutas, Pratiharas, and Chalukyas.\n* The Medieval Period was marked by the growth of trade and commerce, with the establishment of trade routes and the development of new technologies.\n* The period also saw the rise of Buddhism and Jainism, with many temples and monuments being built during this time.\n* The Medieval Period was also marked by the invasions of foreign powers, including the Turks and the Ghaznavids.\n* The period saw the emergence of new social classes, including the Brahmins, Kshatriyas, and Vaishyas.\n* The Medieval Period laid the foundation for the growth of Indian culture and civilization.\n\n### Key Terms\n* Medieval Period: The period of Indian history from the 8th to the 12th century.\n* Rashtrakutas: A powerful kingdom that ruled much of India during the Medieval Period.\n* Pratiharas: A powerful kingdom that ruled much of India during the Medieval Period.\n* Chalukyas: A powerful kingdom that ruled much of India during the Medieval Period.\n* Buddhism: A major religion that emerged in India during the Medieval Period.\n* Jainism: A major religion that emerged in India during the Medieval Period.\n* Trade and Commerce: The growth of trade and commerce during the Medieval Period.\n* Social Classes: The emergence of new social classes during the Medieval Period.\n* Brahmins: A social class of priests and scholars.\n* Kshatriyas: A social class of warriors and rulers.\n* Vaishyas: A social class of merchants and traders.\n\n### Important Formulas/Facts\n* None\n\n### Common Mistakes to Avoid\n* Confusing the Medieval Period with the Vedic Period.\n* Not knowing the names of the major kingdoms and empires of the Medieval Period.\n* Not understanding the significance of Buddhism and Jainism during the Medieval Period.\n* Not knowing the names of the major social classes of the Medieval Period.\n* Not understanding the impact of foreign invasions on Indian society during the Medieval Period.\n\n### Quick Revision Checklist\n* Study the major kingdoms and empires of the Medieval Period.\n* Understand the significance of Buddhism and Jainism during the Medieval Period.\n* Learn the names of the major social classes of the Medieval Period.\n* Understand the impact of foreign invasions on Indian society during the Medieval Period.\n* Study the growth of trade and commerce during the Medieval Period.\n* Review the major events and developments of the Medieval Period.\n\n### Practice Questions\n1. What was the name of the powerful kingdom that ruled much of India during the Medieval Period?\na) Rashtrakutas\nb) Pratiharas\nc) Chalukyas\nd) All of the above\n\nAnswer: d) All of the above\n\n2. Which of the following religions emerged in India during the Medieval Period?\na) Hinduism\nb) Buddhism\nc) Jainism\nd) All of the above\n\nAnswer: d) All of the above\n\n3. What was the name of the social class of warriors and rulers during the Medieval Period?\na) Brahmins\nb) Kshatriyas\nc) Vaishyas\nd) Shudras\n\nAnswer: b) Kshatriyas\n\n4. Which of the following was a major impact of foreign invasions on Indian society during the Medieval Period?\na) Growth of trade and commerce\nb) Emergence of new social classes\nc) Decline of Indian culture and civilization\nd) All of the above\n\nAnswer: c) Decline of Indian culture and civilization\n\n5. What was the name of the powerful kingdom that ruled much of India during the 12th century?\na) Rashtrakutas\nb) Pratiharas\nc) Chalukyas\nd) Delhi Sultanate\n\nAnswer: d) Delhi Sultanate\n\nIf you want further help with this chapter, I can also provide:\n- Extra short summary for quick revision\n- Important exam questions with answers\n- A clear and easy mind map\n- Hindi notes for quick understanding\n- MCQs for exam preparation','2026-03-08 03:34:42'),('c8a90ef3-1a9f-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','History','PART I: HISTORY - Where, When and How-The Medieval Period in India','Hindi notes for quick understanding','### Medieval Period in India - Key Points in Hindi\n#### महत्वपूर्ण बिंदु\n\n* मध्ययुगीन काल भारत में 8वीं शताब्दी से 12वीं शताब्दी तक चला।\n* इस काल में विभिन्न राज्यों और साम्राज्यों का उदय हुआ, जिनमें राष्ट्रकूट, प्रतिहार और चालुक्य शामिल हैं।\n* मध्ययुगीन काल में व्यापार और वाणिज्य का विकास हुआ, जिसमें व्यापार मार्गों की स्थापना और नए प्रौद्योगिकियों का विकास हुआ।\n* इस काल में बौद्ध धर्म और जैन धर्म का उदय हुआ, जिसमें कई मंदिर और स्मारक बनाए गए।\n* मध्ययुगीन काल में विदेशी शक्तियों के आक्रमण भी हुए, जिनमें तुर्क और गाज़नविद शामिल हैं।\n* इस काल में नए सामाजिक वर्गों का उदय हुआ, जिनमें ब्राह्मण, क्षत्रिय और वैश्य शामिल हैं।\n* मध्ययुगीन काल भारतीय संस्कृति और सभ्यता के विकास के लिए आधार स्थापित किया।','2026-03-08 03:34:59'),('dc96aef5-1aa5-11f1-ba17-2cf05d836a82','d9063124-1aa3-11f1-ba17-2cf05d836a82','753cd715-1aa3-11f1-ba17-2cf05d836a82','Mathematics','Multiplication - Repeated Addition, Multiplication using Number Line, Multiplication Tables, Multiplying numbers, Multiplication in Daily life','Create a model question paper','### Model Question Paper for Class 1 Mathematics - Multiplication\n\n#### Section A: Multiple Choice Questions (Choose the correct answer)\n\n1. What is multiplication?\na) Adding two numbers\nb) Adding a number a certain number of times\nc) Subtracting two numbers\nd) Multiplying two numbers\n\nAnswer: b) Adding a number a certain number of times\n\n2. What is the product of 3 x 4?\na) 10\nb) 12\nc) 15\nd) 20\n\nAnswer: b) 12\n\n3. Which of the following is a real-life example of multiplication?\na) Counting money\nb) Counting toys\nc) Counting time\nd) All of the above\n\nAnswer: d) All of the above\n\n#### Section B: Short Answer Questions\n\n1. What is repeated addition? Give an example.\n\nAnswer: Repeated addition is a method to find the product of two numbers by adding a number a certain number of times. Example: 3 x 4 = 3 + 3 + 3 + 3 = 12\n\n2. How can we use a number line to understand multiplication?\n\nAnswer: We can use a number line to understand multiplication by counting the number of steps from the starting point to the ending point.\n\n#### Section C: Long Answer Questions\n\n1. Explain the concept of multiplication tables and how they help us find the product of two numbers quickly.\n\nAnswer: Multiplication tables are a way to quickly find the product of two numbers by memorizing the products of numbers up to 10. For example, the multiplication table for 3 is: 3 x 1 = 3, 3 x 2 = 6, 3 x 3 = 9, and so on.\n\n2. Give an example of how multiplication is used in daily life.\n\nAnswer: Multiplication is used in daily life to solve problems related to time, money, and measurement. For example, if we have 3 groups of 4 pencils, we can use multiplication to find the total number of pencils: 3 x 4 = 12 pencils.','2026-03-08 04:18:29');
/*!40000 ALTER TABLE `edukarta_chapter_qa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `edukarta_progress_profiles`
--

DROP TABLE IF EXISTS `edukarta_progress_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `edukarta_progress_profiles` (
  `user_id` char(36) NOT NULL,
  `organization_id` char(36) DEFAULT NULL,
  `progress_data` json NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  KEY `idx_edukarta_progress_profiles_org` (`organization_id`),
  CONSTRAINT `fk_edukarta_progress_profiles_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_edukarta_progress_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `edukarta_progress_profiles`
--

LOCK TABLES `edukarta_progress_profiles` WRITE;
/*!40000 ALTER TABLE `edukarta_progress_profiles` DISABLE KEYS */;
INSERT INTO `edukarta_progress_profiles` VALUES ('da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','{\"terms\": [\"Term - 1\", \"Term - 2\"], \"subjects\": [{\"id\": \"a1396ea1-2901-4827-985b-d1add517d18e\", \"name\": \"Mathematics\", \"bookTypes\": [\"Classwork Notebook\", \"Homework Notebook\", \"Textbook\"], \"noWorkBookTypes\": [], \"yearlyBookTypes\": []}, {\"id\": \"af11b589-e475-4ebb-a7bd-f2fcf60b6d8e\", \"name\": \"History\", \"bookTypes\": [\"Classwork Notebook\", \"Homework Notebook\", \"Textbook\", \"Workbook\"], \"noWorkBookTypes\": [], \"yearlyBookTypes\": []}], \"selectedTerm\": \"Term - 2\", \"progressState\": {\"a1396ea1-2901-4827-985b-d1add517d18e\": {\"Term - 1\": {\"Classwork Notebook\": {\"Algebraic Expressions\": {\"done\": true, \"noWork\": false, \"bookType\": \"Classwork Notebook\", \"startDate\": \"2026-03-10\", \"returnedDate\": \"2026-03-14\", \"submissionDate\": \"2026-03-12\"}, \"Linear Equations In One Variable\": {\"done\": true, \"noWork\": false, \"bookType\": \"Classwork Notebook\", \"startDate\": \"2026-03-25\", \"returnedDate\": \"2026-04-04\", \"submissionDate\": \"2026-03-27\"}}}}}, \"selectedSubjectId\": \"af11b589-e475-4ebb-a7bd-f2fcf60b6d8e\", \"selectedBookTypeBySubject\": {\"a1396ea1-2901-4827-985b-d1add517d18e\": \"Homework Notebook\", \"af11b589-e475-4ebb-a7bd-f2fcf60b6d8e\": \"Classwork Notebook\"}}','2026-03-10 01:27:08','2026-03-10 16:35:59');
/*!40000 ALTER TABLE `edukarta_progress_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `edukarta_student_profiles`
--

DROP TABLE IF EXISTS `edukarta_student_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `edukarta_student_profiles` (
  `user_id` char(36) NOT NULL,
  `organization_id` char(36) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `board` varchar(80) NOT NULL,
  `class_level` varchar(20) NOT NULL,
  `subjects` json NOT NULL,
  `completed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  KEY `idx_edukarta_student_profiles_org` (`organization_id`),
  CONSTRAINT `fk_edukarta_student_profiles_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_edukarta_student_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `edukarta_student_profiles`
--

LOCK TABLES `edukarta_student_profiles` WRITE;
/*!40000 ALTER TABLE `edukarta_student_profiles` DISABLE KEYS */;
INSERT INTO `edukarta_student_profiles` VALUES ('d9063124-1aa3-11f1-ba17-2cf05d836a82','753cd715-1aa3-11f1-ba17-2cf05d836a82','Trisha Jha','CBSE','1','[\"English\", \"Mathematics\", \"Hindi\", \"EVS\"]','2026-03-08 04:08:52','2026-03-08 04:08:52'),('da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Rishi Raj','CBSE','7','[\"English\", \"Mathematics\", \"Science\", \"Hindi\", \"Kanada\", \"History\", \"Geography\", \"Civics\"]','2026-03-07 13:54:28','2026-03-08 02:26:10');
/*!40000 ALTER TABLE `edukarta_student_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `edukarta_subject_chapters`
--

DROP TABLE IF EXISTS `edukarta_subject_chapters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `edukarta_subject_chapters` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `organization_id` char(36) DEFAULT NULL,
  `subject` varchar(80) NOT NULL,
  `chapter_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_edukarta_user_subject_chapter` (`user_id`,`subject`,`chapter_name`),
  KEY `idx_edukarta_subject_chapters_user_subject` (`user_id`,`subject`),
  KEY `fk_edukarta_subject_chapters_org` (`organization_id`),
  CONSTRAINT `fk_edukarta_subject_chapters_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_edukarta_subject_chapters_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `edukarta_subject_chapters`
--

LOCK TABLES `edukarta_subject_chapters` WRITE;
/*!40000 ALTER TABLE `edukarta_subject_chapters` DISABLE KEYS */;
INSERT INTO `edukarta_subject_chapters` VALUES ('5c4eb43d-1aa5-11f1-ba17-2cf05d836a82','d9063124-1aa3-11f1-ba17-2cf05d836a82','753cd715-1aa3-11f1-ba17-2cf05d836a82','Mathematics','Fractions - Whole, Half, Quarter','2026-03-08 04:14:54','2026-03-08 04:14:54'),('5c4ebc1a-1aa5-11f1-ba17-2cf05d836a82','d9063124-1aa3-11f1-ba17-2cf05d836a82','753cd715-1aa3-11f1-ba17-2cf05d836a82','Mathematics','Multiplication - Repeated Addition, Multiplication using Number Line, Multiplication Tables, Multiplying numbers, Multiplication in Daily life','2026-03-08 04:14:54','2026-03-08 04:14:54'),('5c4ebe02-1aa5-11f1-ba17-2cf05d836a82','d9063124-1aa3-11f1-ba17-2cf05d836a82','753cd715-1aa3-11f1-ba17-2cf05d836a82','Mathematics','Measurement - Length, Weight, Capacity','2026-03-08 04:14:54','2026-03-08 04:14:54'),('5c4ebf86-1aa5-11f1-ba17-2cf05d836a82','d9063124-1aa3-11f1-ba17-2cf05d836a82','753cd715-1aa3-11f1-ba17-2cf05d836a82','Mathematics','Time - Clock, Telling the Time, Days of a Week, Months of a year','2026-03-08 04:14:54','2026-03-08 04:14:54'),('5c4ec1a9-1aa5-11f1-ba17-2cf05d836a82','d9063124-1aa3-11f1-ba17-2cf05d836a82','753cd715-1aa3-11f1-ba17-2cf05d836a82','Mathematics','Money - Coins and Notes, Exchanging Money','2026-03-08 04:14:54','2026-03-08 04:14:54'),('5c4ec33e-1aa5-11f1-ba17-2cf05d836a82','d9063124-1aa3-11f1-ba17-2cf05d836a82','753cd715-1aa3-11f1-ba17-2cf05d836a82','Mathematics','Patterns - Types of Patterns, Patterns in Shapes, Patterns in Colours, Patterns in Numbers','2026-03-08 04:14:54','2026-03-08 04:14:54'),('baf9d3b9-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','History','PART I: HISTORY - Where, When and How-The Medieval Period in India','2026-03-08 02:23:01','2026-03-08 02:23:01'),('baf9dcaf-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','History','PART I: HISTORY - New Kings and Kingdoms','2026-03-08 02:23:01','2026-03-08 02:23:01'),('baf9dea4-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','History','PART I: HISTORY - The Delhi Sultanate (1206-1526 CE)','2026-03-08 02:23:01','2026-03-08 02:23:01'),('baf9e085-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','History','PART I: HISTORY - The Mughal Empire','2026-03-08 02:23:01','2026-03-08 02:23:01'),('baf9e22d-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','History','PART I: HISTORY - Architecture of Medieval India','2026-03-08 02:23:01','2026-03-08 02:23:01'),('baf9e39a-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','History','PART I: HISTORY - Towns, Trade and Craftspeople','2026-03-08 02:23:01','2026-03-08 02:23:01'),('baf9e509-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','History','PART I: HISTORY - Social Change in Tribal and Nomadic Communities','2026-03-08 02:23:01','2026-03-08 02:23:01'),('baf9e657-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','History','PART I: HISTORY - Popular Beliefs and Religious Debates','2026-03-08 02:23:01','2026-03-08 02:23:01'),('baf9e7b4-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','History','PART I: HISTORY - The Growth of Regional Cultures','2026-03-08 02:23:01','2026-03-08 02:23:01'),('baf9e926-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','History','PART I: HISTORY - Political Changes in the 18th century CE','2026-03-08 02:23:01','2026-03-08 02:23:01'),('cd9f1a91-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Geography','PART II: GEOGRAPHY - The Interior of the Earth','2026-03-08 02:23:32','2026-03-08 02:23:32'),('cd9f2131-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Geography','PART II: GEOGRAPHY - Our Environment','2026-03-08 02:23:32','2026-03-08 02:23:32'),('cd9f22cc-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Geography','PART II: GEOGRAPHY - The Changing Face of the Earth','2026-03-08 02:23:32','2026-03-08 02:23:32'),('cd9f2467-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Geography','PART II: GEOGRAPHY - The Atmosphere','2026-03-08 02:23:32','2026-03-08 02:23:32'),('cd9f25cb-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Geography','PART II: GEOGRAPHY - Elements of Weather and Climate','2026-03-08 02:23:32','2026-03-08 02:23:32'),('cd9f2813-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Geography','PART II: GEOGRAPHY - Atmospheric Pressure and Winds','2026-03-08 02:23:32','2026-03-08 02:23:32'),('cd9f296d-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Geography','PART II: GEOGRAPHY - Humidity and Rainfall','2026-03-08 02:23:32','2026-03-08 02:23:32'),('cd9f2ac4-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Geography','PART II: GEOGRAPHY - The Hydrosphere','2026-03-08 02:23:32','2026-03-08 02:23:32'),('cd9f2c20-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Geography','PART II: GEOGRAPHY - Natural Vegetation and Wildlife','2026-03-08 02:23:32','2026-03-08 02:23:32'),('cd9f2d82-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Geography','PART II: GEOGRAPHY - The Human Environment: Settlements, Transport and Communication','2026-03-08 02:23:32','2026-03-08 02:23:32'),('cd9f2f19-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Geography','PART II: GEOGRAPHY - Life in the Tropical and Sub-Tropical Regions','2026-03-08 02:23:32','2026-03-08 02:23:32'),('cd9f309b-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Geography','PART II: GEOGRAPHY - Life in the Temperate Grasslands: The Prairie and the Veldt','2026-03-08 02:23:32','2026-03-08 02:23:32'),('cd9f31f9-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Geography','PART II: GEOGRAPHY - Life in the Deserts: Sahara and Ladakh','2026-03-08 02:23:32','2026-03-08 02:23:32'),('dbe2b25e-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Civics','PART III: SOCIAL AND POLITICAL LIFE - Democracy','2026-03-08 02:23:56','2026-03-08 02:23:56'),('dbe2b9a8-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Civics','PART III: SOCIAL AND POLITICAL LIFE - Institutional Representation of Democracy','2026-03-08 02:23:56','2026-03-08 02:23:56'),('dbe2bb56-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Civics','PART III: SOCIAL AND POLITICAL LIFE - State Government','2026-03-08 02:23:56','2026-03-08 02:23:56'),('dbe2bcc4-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Civics','PART III: SOCIAL AND POLITICAL LIFE - Role Played by Gender','2026-03-08 02:23:56','2026-03-08 02:23:56'),('dbe2be64-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Civics','PART III: SOCIAL AND POLITICAL LIFE - Media and Democracy','2026-03-08 02:23:56','2026-03-08 02:23:56'),('dbe2c04b-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Civics','PART III: SOCIAL AND POLITICAL LIFE - Advertising and Media','2026-03-08 02:23:56','2026-03-08 02:23:56'),('dbe2c2b4-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Civics','PART III: SOCIAL AND POLITICAL LIFE - Markets Around Us','2026-03-08 02:23:56','2026-03-08 02:23:56'),('dbe2c414-1a95-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Civics','PART III: SOCIAL AND POLITICAL LIFE - A Wholesale Market-The Sarees of Kanchipuram','2026-03-08 02:23:56','2026-03-08 02:23:56'),('fc9288ad-1aa2-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Mathematics','Algebraic Expressions','2026-03-08 03:57:54','2026-03-08 03:57:54'),('fc928e40-1aa2-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','Mathematics','Linear Equations In One Variable','2026-03-08 03:57:54','2026-03-08 03:57:54');
/*!40000 ALTER TABLE `edukarta_subject_chapters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feature_usage_logs`
--

DROP TABLE IF EXISTS `feature_usage_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feature_usage_logs` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `module_id` char(36) NOT NULL,
  `feature_id` char(36) DEFAULT NULL,
  `request_payload` json DEFAULT NULL,
  `response_payload` json DEFAULT NULL,
  `tokens_used` int DEFAULT NULL,
  `execution_time_ms` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_feature_logs_user` (`user_id`),
  KEY `fk_feature_usage_logs_module` (`module_id`),
  KEY `fk_feature_usage_logs_feature` (`feature_id`),
  CONSTRAINT `fk_feature_usage_logs_feature` FOREIGN KEY (`feature_id`) REFERENCES `module_features` (`id`),
  CONSTRAINT `fk_feature_usage_logs_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`),
  CONSTRAINT `fk_feature_usage_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feature_usage_logs`
--

LOCK TABLES `feature_usage_logs` WRITE;
/*!40000 ALTER TABLE `feature_usage_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `feature_usage_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module_access_requests`
--

DROP TABLE IF EXISTS `module_access_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module_access_requests` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `module_id` char(36) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reason` text,
  `review_note` text,
  `reviewed_by` char(36) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_module_requests_org` (`organization_id`),
  KEY `idx_module_requests_user` (`user_id`),
  KEY `idx_module_requests_status` (`status`),
  KEY `fk_module_requests_module` (`module_id`),
  KEY `fk_module_requests_reviewer` (`reviewed_by`),
  CONSTRAINT `fk_module_requests_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_module_requests_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_module_requests_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_module_requests_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module_access_requests`
--

LOCK TABLES `module_access_requests` WRITE;
/*!40000 ALTER TABLE `module_access_requests` DISABLE KEYS */;
INSERT INTO `module_access_requests` VALUES ('1fd40b1f-1aa4-11f1-ba17-2cf05d836a82','753cd715-1aa3-11f1-ba17-2cf05d836a82','d9063124-1aa3-11f1-ba17-2cf05d836a82','9f3e2570-1a08-11f1-ba17-2cf05d836a82','approved',NULL,NULL,'9596e196-1aa3-11f1-ba17-2cf05d836a82','2026-03-07 22:36:19','2026-03-08 04:06:03','2026-03-08 04:06:19'),('756ad7fc-1a2a-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','9f3e2570-1a08-11f1-ba17-2cf05d836a82','approved',NULL,NULL,'bd907ae9-1a08-11f1-ba17-2cf05d836a82','2026-03-07 08:05:21','2026-03-07 13:35:08','2026-03-07 13:35:21'),('ba06aeaf-1a10-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','9f3e2227-1a08-11f1-ba17-2cf05d836a82','approved',NULL,NULL,'bd907ae9-1a08-11f1-ba17-2cf05d836a82','2026-03-07 05:04:24','2026-03-07 10:30:56','2026-03-07 10:34:24');
/*!40000 ALTER TABLE `module_access_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module_dependencies`
--

DROP TABLE IF EXISTS `module_dependencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module_dependencies` (
  `id` char(36) NOT NULL,
  `module_id` char(36) NOT NULL,
  `depends_on_module_id` char(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_module_dependency` (`module_id`,`depends_on_module_id`),
  KEY `fk_module_dependencies_depends_on` (`depends_on_module_id`),
  CONSTRAINT `fk_module_dependencies_depends_on` FOREIGN KEY (`depends_on_module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_module_dependencies_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module_dependencies`
--

LOCK TABLES `module_dependencies` WRITE;
/*!40000 ALTER TABLE `module_dependencies` DISABLE KEYS */;
/*!40000 ALTER TABLE `module_dependencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module_features`
--

DROP TABLE IF EXISTS `module_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module_features` (
  `id` char(36) NOT NULL,
  `module_id` char(36) NOT NULL,
  `feature_key` varchar(100) NOT NULL,
  `feature_name` varchar(255) DEFAULT NULL,
  `description` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_module_feature` (`module_id`,`feature_key`),
  CONSTRAINT `fk_module_features_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module_features`
--

LOCK TABLES `module_features` WRITE;
/*!40000 ALTER TABLE `module_features` DISABLE KEYS */;
/*!40000 ALTER TABLE `module_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module_permissions`
--

DROP TABLE IF EXISTS `module_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module_permissions` (
  `id` char(36) NOT NULL,
  `module_id` char(36) NOT NULL,
  `permission_id` char(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_module_permission` (`module_id`,`permission_id`),
  KEY `fk_module_permissions_permission` (`permission_id`),
  CONSTRAINT `fk_module_permissions_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_module_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module_permissions`
--

LOCK TABLES `module_permissions` WRITE;
/*!40000 ALTER TABLE `module_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `module_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module_usage`
--

DROP TABLE IF EXISTS `module_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module_usage` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `module_id` char(36) NOT NULL,
  `feature_key` varchar(100) DEFAULT NULL,
  `usage_count` int NOT NULL DEFAULT '0',
  `usage_period` varchar(50) NOT NULL DEFAULT 'monthly',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_module_usage_user` (`user_id`),
  KEY `idx_module_usage_module` (`module_id`),
  CONSTRAINT `fk_module_usage_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`),
  CONSTRAINT `fk_module_usage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module_usage`
--

LOCK TABLES `module_usage` WRITE;
/*!40000 ALTER TABLE `module_usage` DISABLE KEYS */;
/*!40000 ALTER TABLE `module_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modules` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `description` text,
  `is_core` tinyint(1) NOT NULL DEFAULT '0',
  `icon` varchar(255) DEFAULT NULL,
  `route_prefix` varchar(100) DEFAULT NULL,
  `version` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modules`
--

LOCK TABLES `modules` WRITE;
/*!40000 ALTER TABLE `modules` DISABLE KEYS */;
INSERT INTO `modules` VALUES ('9f3e2227-1a08-11f1-ba17-2cf05d836a82','todokarta','todokarta','TodoKarta','Core personal task management module',1,NULL,'/api/todokarta','1.0.0',1,'2026-03-07 09:32:55','2026-03-07 09:32:55'),('9f3e2570-1a08-11f1-ba17-2cf05d836a82','edukarta','edukarta','EduKarta','Education module',0,NULL,'/api/edukarta','1.0.0',1,'2026-03-07 09:32:55','2026-03-07 09:32:55'),('9f3e2665-1a08-11f1-ba17-2cf05d836a82','prepkarta','prepkarta','PrepKarta','Exam prep module',0,NULL,'/api/prepkarta','1.0.0',1,'2026-03-07 09:32:55','2026-03-07 09:32:55');
/*!40000 ALTER TABLE `modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_api_keys`
--

DROP TABLE IF EXISTS `organization_api_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_api_keys` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `name` varchar(191) NOT NULL,
  `key_hash` char(64) NOT NULL,
  `key_prefix` varchar(32) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_hash` (`key_hash`),
  KEY `idx_org_api_keys_org` (`organization_id`),
  CONSTRAINT `fk_org_api_keys_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_api_keys`
--

LOCK TABLES `organization_api_keys` WRITE;
/*!40000 ALTER TABLE `organization_api_keys` DISABLE KEYS */;
/*!40000 ALTER TABLE `organization_api_keys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_boards`
--

DROP TABLE IF EXISTS `organization_boards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_boards` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_org_board` (`organization_id`,`name`),
  KEY `idx_org_boards_org` (`organization_id`),
  CONSTRAINT `fk_org_boards_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_boards`
--

LOCK TABLES `organization_boards` WRITE;
/*!40000 ALTER TABLE `organization_boards` DISABLE KEYS */;
INSERT INTO `organization_boards` VALUES ('029b0501-e0e6-40ed-8697-4acbe8d6a945','b1363e11-1a08-11f1-ba17-2cf05d836a82','CBSE','2026-03-10 09:57:06');
/*!40000 ALTER TABLE `organization_boards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_class_boards`
--

DROP TABLE IF EXISTS `organization_class_boards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_class_boards` (
  `id` char(36) NOT NULL,
  `class_id` char(36) NOT NULL,
  `board_id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_class_board` (`class_id`,`board_id`),
  KEY `idx_class_boards_class` (`class_id`),
  KEY `idx_class_boards_board` (`board_id`),
  CONSTRAINT `fk_class_boards_board` FOREIGN KEY (`board_id`) REFERENCES `organization_boards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_class_boards_class` FOREIGN KEY (`class_id`) REFERENCES `organization_classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_class_boards`
--

LOCK TABLES `organization_class_boards` WRITE;
/*!40000 ALTER TABLE `organization_class_boards` DISABLE KEYS */;
INSERT INTO `organization_class_boards` VALUES ('02f9f9e3-c90f-4655-bb0f-4e2c95b3c486','07871002-c1eb-4aa6-bd4d-134ef822ef0f','029b0501-e0e6-40ed-8697-4acbe8d6a945','2026-03-10 09:57:07'),('0d07574f-2de7-4184-8c3c-591f07fa140b','0884e0a1-4645-485f-b222-c75dc298de1e','029b0501-e0e6-40ed-8697-4acbe8d6a945','2026-03-10 09:57:07'),('37ec0a79-027f-429b-87f5-4a2c451ce52c','2ca43245-e24f-45f2-9d54-b7ff42b4b4bf','029b0501-e0e6-40ed-8697-4acbe8d6a945','2026-03-10 09:57:06'),('43227057-8e12-423b-aeea-a1192dad9c5a','2b9f8999-4051-4c59-8420-360512907d4e','029b0501-e0e6-40ed-8697-4acbe8d6a945','2026-03-10 09:57:06'),('4df7407c-a4a1-4823-965b-b5abfbdef31f','a483fd3b-bf65-4d4b-954b-faf2f4910f6b','029b0501-e0e6-40ed-8697-4acbe8d6a945','2026-03-10 09:57:06'),('6fb9107d-4404-41b9-97f4-7b2138d5a678','743e1fcb-60cc-4791-8a8d-89cffaba6617','029b0501-e0e6-40ed-8697-4acbe8d6a945','2026-03-10 09:57:07'),('c15323a8-0fc0-4e1f-a522-ac628159b180','4443b92b-c152-45ea-8bd2-42d080d06b5e','029b0501-e0e6-40ed-8697-4acbe8d6a945','2026-03-10 09:57:07'),('d4550dfa-5b11-4baf-a01f-8bfc176abfd5','409bf45e-29d4-4ea3-a4aa-eb1bcc9dbae3','029b0501-e0e6-40ed-8697-4acbe8d6a945','2026-03-10 09:57:07'),('ef4e405c-7be6-4d9b-8525-736a7243e6cf','12197da7-5cbd-4403-a10c-9043d6c9cbed','029b0501-e0e6-40ed-8697-4acbe8d6a945','2026-03-10 09:57:07'),('f6e8d783-754d-4ea3-9bd4-6f0da258f1bd','4ccd05c3-d97a-49fd-a9b7-631c1fd9d173','029b0501-e0e6-40ed-8697-4acbe8d6a945','2026-03-10 09:57:06');
/*!40000 ALTER TABLE `organization_class_boards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_class_subjects`
--

DROP TABLE IF EXISTS `organization_class_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_class_subjects` (
  `id` char(36) NOT NULL,
  `class_id` char(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_class_subject` (`class_id`,`name`),
  KEY `idx_class_subjects_class` (`class_id`),
  CONSTRAINT `fk_class_subjects_class` FOREIGN KEY (`class_id`) REFERENCES `organization_classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_class_subjects`
--

LOCK TABLES `organization_class_subjects` WRITE;
/*!40000 ALTER TABLE `organization_class_subjects` DISABLE KEYS */;
INSERT INTO `organization_class_subjects` VALUES ('00aabf2d-81fc-4df5-b2f4-f4688fc99a9e','a483fd3b-bf65-4d4b-954b-faf2f4910f6b','2Lang','2026-03-10 09:57:06'),('00fe5658-391c-4c35-810f-346d08542d98','2ca43245-e24f-45f2-9d54-b7ff42b4b4bf','Chem','2026-03-10 09:57:06'),('066c88d0-9367-40c3-9294-771bb5b43785','4443b92b-c152-45ea-8bd2-42d080d06b5e','2Lang','2026-03-10 09:57:07'),('06b69cc8-0abc-4198-a35f-b15d0f511906','2ca43245-e24f-45f2-9d54-b7ff42b4b4bf','Cultural','2026-03-10 09:57:06'),('084b7479-907b-4a87-8cfb-9d1c7dfc6807','4443b92b-c152-45ea-8bd2-42d080d06b5e','English','2026-03-10 09:57:07'),('09aec85b-f266-4dbf-95f1-707f7e3421a5','743e1fcb-60cc-4791-8a8d-89cffaba6617','English','2026-03-10 09:57:07'),('0bdad461-5815-494e-bb3e-7c772c5f6c23','2b9f8999-4051-4c59-8420-360512907d4e','2Lang','2026-03-10 09:57:06'),('197c9241-6b6e-4cf7-b34c-3528a89fb925','12197da7-5cbd-4403-a10c-9043d6c9cbed','Math','2026-03-10 09:57:07'),('1da365a6-2825-44b6-b7a9-8d9e7d8b76f0','a483fd3b-bf65-4d4b-954b-faf2f4910f6b','Math','2026-03-10 09:57:06'),('256a6887-950e-4abe-b9f2-446c2332fa92','07871002-c1eb-4aa6-bd4d-134ef822ef0f','Math','2026-03-10 09:57:07'),('26b9b8f3-6c00-4a02-baa5-9b47040c7a37','4ccd05c3-d97a-49fd-a9b7-631c1fd9d173','Math','2026-03-10 09:57:07'),('2c62d7da-c99d-46cf-8814-7c32c661ed9e','07871002-c1eb-4aa6-bd4d-134ef822ef0f','PE','2026-03-10 09:57:07'),('2f4b5151-d516-4a32-9866-399cbf2b8153','2ca43245-e24f-45f2-9d54-b7ff42b4b4bf','English','2026-03-10 09:57:06'),('3570e456-3d19-4276-a944-5ccc56436271','0884e0a1-4645-485f-b222-c75dc298de1e','English','2026-03-10 09:57:07'),('448ab9af-a7be-4fff-bea6-e4ff2184488a','12197da7-5cbd-4403-a10c-9043d6c9cbed','English','2026-03-10 09:57:07'),('4bf9b37c-eb07-450f-8fda-86549cc4d45e','2ca43245-e24f-45f2-9d54-b7ff42b4b4bf','2Lang','2026-03-10 09:57:06'),('5754147b-435b-43c4-a690-5b6094460c8b','07871002-c1eb-4aa6-bd4d-134ef822ef0f','English','2026-03-10 09:57:07'),('5dfa8493-b399-4cec-8bc4-0eb9604b45ca','743e1fcb-60cc-4791-8a8d-89cffaba6617','Math','2026-03-10 09:57:07'),('5ea7910a-cc3a-4a7e-81fa-da582c84e46f','4443b92b-c152-45ea-8bd2-42d080d06b5e','Chem','2026-03-10 09:57:07'),('5ec78d87-0644-4a95-aefa-ad84d685a341','4443b92b-c152-45ea-8bd2-42d080d06b5e','Math','2026-03-10 09:57:07'),('5f673089-ba80-4ad2-a3f4-8cda6b0d1374','4ccd05c3-d97a-49fd-a9b7-631c1fd9d173','2Lang','2026-03-10 09:57:06'),('6299232c-520c-4604-8822-9d2a6edc8d47','4ccd05c3-d97a-49fd-a9b7-631c1fd9d173','English','2026-03-10 09:57:07'),('648b99b7-a46a-4ea1-8bef-2dc6fa148243','0884e0a1-4645-485f-b222-c75dc298de1e','PE','2026-03-10 09:57:07'),('6ba1c140-9e09-48fe-9ef1-0cb5ca795050','743e1fcb-60cc-4791-8a8d-89cffaba6617','Chem','2026-03-10 09:57:07'),('6dfe3cac-8f94-4002-a185-5aa4acdbe22e','0884e0a1-4645-485f-b222-c75dc298de1e','2Lang','2026-03-10 09:57:07'),('7304bac9-e1c8-40e3-872d-eeade3df8e62','a483fd3b-bf65-4d4b-954b-faf2f4910f6b','English','2026-03-10 09:57:06'),('739041ea-d79f-4461-b75c-bb03fd5f3344','0884e0a1-4645-485f-b222-c75dc298de1e','Chem','2026-03-10 09:57:07'),('850b3675-7e89-4d8c-aefb-5a27014df34d','2ca43245-e24f-45f2-9d54-b7ff42b4b4bf','PE','2026-03-10 09:57:06'),('86928128-11ab-445a-8600-50dad42012c7','4ccd05c3-d97a-49fd-a9b7-631c1fd9d173','Chem','2026-03-10 09:57:07'),('8cbf9cf4-9601-4183-a822-6bf87ce9cf5e','12197da7-5cbd-4403-a10c-9043d6c9cbed','Chem','2026-03-10 09:57:07'),('93c96e7e-bdd1-4876-861f-fd5e0c9bf05a','743e1fcb-60cc-4791-8a8d-89cffaba6617','2Lang','2026-03-10 09:57:07'),('9821c6cd-def5-4ee7-b6bb-edb4b828ffaa','a483fd3b-bf65-4d4b-954b-faf2f4910f6b','Chem','2026-03-10 09:57:06'),('a00c0a3b-0d7f-4c68-838b-0979cc999d2f','409bf45e-29d4-4ea3-a4aa-eb1bcc9dbae3','Chem','2026-03-10 09:57:07'),('a1a0d9c8-518d-49c4-a7d8-4153b4d26e13','2ca43245-e24f-45f2-9d54-b7ff42b4b4bf','Math','2026-03-10 09:57:06'),('a6ab156e-6834-4584-97d5-7ef068f90eae','2b9f8999-4051-4c59-8420-360512907d4e','Chem','2026-03-10 09:57:06'),('a6becb24-ca5e-489f-9122-372c4f14f931','4443b92b-c152-45ea-8bd2-42d080d06b5e','PE','2026-03-10 09:57:07'),('ae02adb4-b4f9-4228-a46f-6a3335ec2a22','0884e0a1-4645-485f-b222-c75dc298de1e','Math','2026-03-10 09:57:07'),('b0b93f21-4881-46be-a770-dbef1f7d612a','409bf45e-29d4-4ea3-a4aa-eb1bcc9dbae3','English','2026-03-10 09:57:07'),('ca704e4f-b26d-4d1b-b123-f20e94b156bf','409bf45e-29d4-4ea3-a4aa-eb1bcc9dbae3','Math','2026-03-10 09:57:07'),('cb105294-6710-4be9-bb1f-cfd24d243e43','a483fd3b-bf65-4d4b-954b-faf2f4910f6b','PE','2026-03-10 09:57:06'),('d8a81a0a-6b6a-4e4f-831d-6e54f9eec74b','07871002-c1eb-4aa6-bd4d-134ef822ef0f','2Lang','2026-03-10 09:57:07'),('d8cc86b2-aa66-47f1-88bb-271b84dffb4f','12197da7-5cbd-4403-a10c-9043d6c9cbed','2Lang','2026-03-10 09:57:07'),('d8e26536-a138-4d9f-993a-ef14f839d6a2','07871002-c1eb-4aa6-bd4d-134ef822ef0f','Chem','2026-03-10 09:57:07'),('da06cedb-3628-4913-9e91-6ed0e12abcf8','2b9f8999-4051-4c59-8420-360512907d4e','English','2026-03-10 09:57:06'),('e0b163bc-6bb6-44ee-bd5c-59a1876051bb','4ccd05c3-d97a-49fd-a9b7-631c1fd9d173','PE','2026-03-10 09:57:07'),('e134ccbc-f406-418b-9ccd-ff97cec29703','743e1fcb-60cc-4791-8a8d-89cffaba6617','PE','2026-03-10 09:57:07'),('e492140a-c4da-4444-86d1-563ec0d742cb','12197da7-5cbd-4403-a10c-9043d6c9cbed','PE','2026-03-10 09:57:07'),('ea0401dc-5725-48c8-a86a-01a01aeec411','2b9f8999-4051-4c59-8420-360512907d4e','PE','2026-03-10 09:57:06'),('eada01d1-40bb-4318-bf33-2ad26f6e5557','409bf45e-29d4-4ea3-a4aa-eb1bcc9dbae3','2Lang','2026-03-10 09:57:07'),('ecab71e9-cddc-49de-a2be-2d6d1f5d6ec3','409bf45e-29d4-4ea3-a4aa-eb1bcc9dbae3','PE','2026-03-10 09:57:07'),('f0f495af-9db9-4403-8f2f-74e2c50e6f07','2b9f8999-4051-4c59-8420-360512907d4e','Math','2026-03-10 09:57:06');
/*!40000 ALTER TABLE `organization_class_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_classes`
--

DROP TABLE IF EXISTS `organization_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_classes` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_org_class` (`organization_id`,`name`),
  KEY `idx_org_classes_org` (`organization_id`),
  CONSTRAINT `fk_org_classes_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_classes`
--

LOCK TABLES `organization_classes` WRITE;
/*!40000 ALTER TABLE `organization_classes` DISABLE KEYS */;
INSERT INTO `organization_classes` VALUES ('07871002-c1eb-4aa6-bd4d-134ef822ef0f','b1363e11-1a08-11f1-ba17-2cf05d836a82','4','2026-03-10 09:57:07'),('0884e0a1-4645-485f-b222-c75dc298de1e','b1363e11-1a08-11f1-ba17-2cf05d836a82','5','2026-03-10 09:57:07'),('12197da7-5cbd-4403-a10c-9043d6c9cbed','b1363e11-1a08-11f1-ba17-2cf05d836a82','9','2026-03-10 09:57:07'),('2b9f8999-4051-4c59-8420-360512907d4e','b1363e11-1a08-11f1-ba17-2cf05d836a82','10','2026-03-10 09:57:06'),('2ca43245-e24f-45f2-9d54-b7ff42b4b4bf','b1363e11-1a08-11f1-ba17-2cf05d836a82','1','2026-03-10 09:57:06'),('409bf45e-29d4-4ea3-a4aa-eb1bcc9dbae3','b1363e11-1a08-11f1-ba17-2cf05d836a82','7','2026-03-10 09:57:07'),('4443b92b-c152-45ea-8bd2-42d080d06b5e','b1363e11-1a08-11f1-ba17-2cf05d836a82','8','2026-03-10 09:57:07'),('4ccd05c3-d97a-49fd-a9b7-631c1fd9d173','b1363e11-1a08-11f1-ba17-2cf05d836a82','3','2026-03-10 09:57:06'),('743e1fcb-60cc-4791-8a8d-89cffaba6617','b1363e11-1a08-11f1-ba17-2cf05d836a82','6','2026-03-10 09:57:07'),('a483fd3b-bf65-4d4b-954b-faf2f4910f6b','b1363e11-1a08-11f1-ba17-2cf05d836a82','2','2026-03-10 09:57:06');
/*!40000 ALTER TABLE `organization_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_ebooks`
--

DROP TABLE IF EXISTS `organization_ebooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_ebooks` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `uploaded_by` char(36) DEFAULT NULL,
  `subject` varchar(120) NOT NULL,
  `board` varchar(120) NOT NULL,
  `class_level` varchar(40) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `isbn` varchar(32) DEFAULT NULL,
  `description` text,
  `original_name` varchar(255) NOT NULL,
  `stored_name` varchar(255) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_size` bigint unsigned NOT NULL,
  `storage_path` varchar(512) NOT NULL,
  `status` enum('uploaded','indexed','failed') NOT NULL DEFAULT 'uploaded',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_org_ebooks_org` (`organization_id`),
  KEY `idx_org_ebooks_uploaded_by` (`uploaded_by`),
  KEY `idx_org_ebooks_status` (`status`),
  KEY `idx_org_ebooks_subject` (`subject`),
  KEY `idx_org_ebooks_board` (`board`),
  KEY `idx_org_ebooks_class_level` (`class_level`),
  CONSTRAINT `fk_org_ebooks_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_org_ebooks_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_ebooks`
--

LOCK TABLES `organization_ebooks` WRITE;
/*!40000 ALTER TABLE `organization_ebooks` DISABLE KEYS */;
/*!40000 ALTER TABLE `organization_ebooks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_modules`
--

DROP TABLE IF EXISTS `organization_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_modules` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `module_id` char(36) NOT NULL,
  `status` enum('active','trial','expired','suspended') NOT NULL DEFAULT 'trial',
  `starts_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_org_module` (`organization_id`,`module_id`),
  KEY `idx_org_modules_org` (`organization_id`),
  KEY `idx_org_modules_status` (`status`),
  KEY `fk_org_modules_module` (`module_id`),
  CONSTRAINT `fk_org_modules_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_org_modules_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_modules`
--

LOCK TABLES `organization_modules` WRITE;
/*!40000 ALTER TABLE `organization_modules` DISABLE KEYS */;
INSERT INTO `organization_modules` VALUES ('0b7435d6-1aa4-11f1-ba17-2cf05d836a82','753cd715-1aa3-11f1-ba17-2cf05d836a82','9f3e2570-1a08-11f1-ba17-2cf05d836a82','active','2026-03-07 22:35:29',NULL,'2026-03-08 04:05:29'),('48bdb7de-1a0d-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','9f3e2227-1a08-11f1-ba17-2cf05d836a82','active','2026-03-07 04:36:18',NULL,'2026-03-07 10:06:18'),('6cfc90b7-1a2a-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','9f3e2570-1a08-11f1-ba17-2cf05d836a82','active','2026-03-07 08:04:54',NULL,'2026-03-07 13:34:54'),('9f3fc25d-1a08-11f1-ba17-2cf05d836a82','9f38e409-1a08-11f1-ba17-2cf05d836a82','9f3e2570-1a08-11f1-ba17-2cf05d836a82','active','2026-03-07 04:02:55',NULL,'2026-03-07 09:32:55'),('9f3fc594-1a08-11f1-ba17-2cf05d836a82','9f38e409-1a08-11f1-ba17-2cf05d836a82','9f3e2665-1a08-11f1-ba17-2cf05d836a82','active','2026-03-07 04:02:55',NULL,'2026-03-07 09:32:55'),('9f3fc702-1a08-11f1-ba17-2cf05d836a82','9f38e409-1a08-11f1-ba17-2cf05d836a82','9f3e2227-1a08-11f1-ba17-2cf05d836a82','active','2026-03-07 04:02:55',NULL,'2026-03-07 09:32:55'),('cc49f337-1aa8-11f1-ba17-2cf05d836a82','524a35dc-1aa8-11f1-ba17-2cf05d836a82','9f3e2665-1a08-11f1-ba17-2cf05d836a82','active','2026-03-07 23:09:30',NULL,'2026-03-08 04:39:30');
/*!40000 ALTER TABLE `organization_modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_subscriptions`
--

DROP TABLE IF EXISTS `organization_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_subscriptions` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `plan_id` char(36) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `auto_renew` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_org_plan` (`organization_id`,`plan_id`),
  KEY `fk_org_subscriptions_plan` (`plan_id`),
  CONSTRAINT `fk_org_subscriptions_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_org_subscriptions_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_subscriptions`
--

LOCK TABLES `organization_subscriptions` WRITE;
/*!40000 ALTER TABLE `organization_subscriptions` DISABLE KEYS */;
INSERT INTO `organization_subscriptions` VALUES ('3f905e96-1a0d-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','9f3eafc7-1a08-11f1-ba17-2cf05d836a82','active','2026-03-07 04:36:18',NULL,1,'2026-03-07 10:06:02','2026-03-07 10:06:18'),('924a4499-1a28-11f1-ba17-2cf05d836a82','b1363e11-1a08-11f1-ba17-2cf05d836a82','9f3eb253-1a08-11f1-ba17-2cf05d836a82','active','2026-03-07 08:04:54',NULL,1,'2026-03-07 13:21:38','2026-03-07 13:34:54'),('bd2f4a34-1aa8-11f1-ba17-2cf05d836a82','524a35dc-1aa8-11f1-ba17-2cf05d836a82','9f3eb31d-1a08-11f1-ba17-2cf05d836a82','active','2026-03-07 23:09:30',NULL,1,'2026-03-08 04:39:05','2026-03-08 04:39:30'),('e01f4fd4-1aa3-11f1-ba17-2cf05d836a82','753cd715-1aa3-11f1-ba17-2cf05d836a82','9f3eb253-1a08-11f1-ba17-2cf05d836a82','active','2026-03-07 22:35:29',NULL,1,'2026-03-08 04:04:16','2026-03-08 04:05:29');
/*!40000 ALTER TABLE `organization_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `owner_user_id` char(36) DEFAULT NULL,
  `plan` varchar(100) NOT NULL DEFAULT 'starter',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_organizations_owner` (`owner_user_id`),
  CONSTRAINT `fk_organizations_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES ('524a35dc-1aa8-11f1-ba17-2cf05d836a82','Interview Master','interview-master','63a4cef7-1aa8-11f1-ba17-2cf05d836a82','starter',1,'2026-03-08 04:36:06','2026-03-08 04:36:48'),('753cd715-1aa3-11f1-ba17-2cf05d836a82','Sri Chaitanya Techno School','chaitanya-school','9596e196-1aa3-11f1-ba17-2cf05d836a82','starter',1,'2026-03-08 04:01:17','2026-03-08 04:02:49'),('9f38e409-1a08-11f1-ba17-2cf05d836a82','Root Organization','root-org','9f3a050a-1a08-11f1-ba17-2cf05d836a82','enterprise',1,'2026-03-07 09:32:55','2026-03-07 09:32:55'),('b1363e11-1a08-11f1-ba17-2cf05d836a82','NPS School','nps-school','bd907ae9-1a08-11f1-ba17-2cf05d836a82','starter',1,'2026-03-07 09:33:26','2026-03-07 09:33:49');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `resource` varchar(100) NOT NULL,
  `action` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES ('9f3b72ae-1a08-11f1-ba17-2cf05d836a82','Create Users','users.create','users','create','Create users'),('9f3b7561-1a08-11f1-ba17-2cf05d836a82','Update Users','users.update','users','update','Update users'),('9f3b7628-1a08-11f1-ba17-2cf05d836a82','Delete Users','users.delete','users','delete','Delete users'),('9f3b769b-1a08-11f1-ba17-2cf05d836a82','View Users','users.view','users','view','View users'),('9f3b7710-1a08-11f1-ba17-2cf05d836a82','Create Roles','roles.create','roles','create','Create roles'),('9f3b7780-1a08-11f1-ba17-2cf05d836a82','Update Roles','roles.update','roles','update','Update roles'),('9f3b7809-1a08-11f1-ba17-2cf05d836a82','Create Tickets','tickets.create','tickets','create','Create tickets'),('9f3b788a-1a08-11f1-ba17-2cf05d836a82','Assign Tickets','tickets.assign','tickets','assign','Assign tickets'),('9f3b78fd-1a08-11f1-ba17-2cf05d836a82','View Billing','billing.view','billing','view','View billing'),('9f3b7968-1a08-11f1-ba17-2cf05d836a82','Update Billing','billing.update','billing','update','Update billing');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_module_features`
--

DROP TABLE IF EXISTS `plan_module_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_module_features` (
  `id` char(36) NOT NULL,
  `plan_module_id` char(36) NOT NULL,
  `feature_id` char(36) NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `usage_limit` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_plan_module_feature` (`plan_module_id`,`feature_id`),
  KEY `fk_plan_module_features_feature` (`feature_id`),
  CONSTRAINT `fk_plan_module_features_feature` FOREIGN KEY (`feature_id`) REFERENCES `module_features` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_plan_module_features_plan_module` FOREIGN KEY (`plan_module_id`) REFERENCES `plan_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_module_features`
--

LOCK TABLES `plan_module_features` WRITE;
/*!40000 ALTER TABLE `plan_module_features` DISABLE KEYS */;
/*!40000 ALTER TABLE `plan_module_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_modules`
--

DROP TABLE IF EXISTS `plan_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_modules` (
  `id` char(36) NOT NULL,
  `plan_id` char(36) NOT NULL,
  `module_id` char(36) NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `usage_limit` int DEFAULT NULL,
  `api_rate_limit` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_plan_module` (`plan_id`,`module_id`),
  KEY `idx_plan_modules_plan` (`plan_id`),
  KEY `fk_plan_modules_module` (`module_id`),
  CONSTRAINT `fk_plan_modules_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_plan_modules_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_modules`
--

LOCK TABLES `plan_modules` WRITE;
/*!40000 ALTER TABLE `plan_modules` DISABLE KEYS */;
INSERT INTO `plan_modules` VALUES ('9f3f410c-1a08-11f1-ba17-2cf05d836a82','9f3eb253-1a08-11f1-ba17-2cf05d836a82','9f3e2570-1a08-11f1-ba17-2cf05d836a82',1,NULL,NULL,'2026-03-07 09:32:55'),('9f3f4493-1a08-11f1-ba17-2cf05d836a82','9f3eb31d-1a08-11f1-ba17-2cf05d836a82','9f3e2665-1a08-11f1-ba17-2cf05d836a82',1,NULL,NULL,'2026-03-07 09:32:55'),('9f3f45f1-1a08-11f1-ba17-2cf05d836a82','9f3eafc7-1a08-11f1-ba17-2cf05d836a82','9f3e2227-1a08-11f1-ba17-2cf05d836a82',1,NULL,NULL,'2026-03-07 09:32:55');
/*!40000 ALTER TABLE `plan_modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prepkarta_concepts`
--

DROP TABLE IF EXISTS `prepkarta_concepts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prepkarta_concepts` (
  `id` char(36) NOT NULL,
  `subject_id` char(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `total_questions` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_prepkarta_subject_concept` (`subject_id`,`name`),
  KEY `idx_prepkarta_concepts_subject` (`subject_id`),
  CONSTRAINT `fk_prepkarta_concepts_subject` FOREIGN KEY (`subject_id`) REFERENCES `prepkarta_subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prepkarta_concepts`
--

LOCK TABLES `prepkarta_concepts` WRITE;
/*!40000 ALTER TABLE `prepkarta_concepts` DISABLE KEYS */;
INSERT INTO `prepkarta_concepts` VALUES ('0683b150-1ac6-11f1-ba17-2cf05d836a82','d2dbaf97-1abe-11f1-ba17-2cf05d836a82','Foundations',7,'2026-03-08 08:08:44'),('0683b711-1ac6-11f1-ba17-2cf05d836a82','d2dbaf97-1abe-11f1-ba17-2cf05d836a82','Core Design Fundamentals',2,'2026-03-08 08:08:44'),('0683b85c-1ac6-11f1-ba17-2cf05d836a82','d2dbaf97-1abe-11f1-ba17-2cf05d836a82','Foundational Design Problems',5,'2026-03-08 08:08:44'),('0683b964-1ac6-11f1-ba17-2cf05d836a82','d2dbaf97-1abe-11f1-ba17-2cf05d836a82','Advanced Real World API Designs',11,'2026-03-08 08:08:44'),('0683ba59-1ac6-11f1-ba17-2cf05d836a82','d2dbaf97-1abe-11f1-ba17-2cf05d836a82','Reliability and Production Readiness',2,'2026-03-08 08:08:44'),('2f99d0c7-1aba-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Linked List',8,'2026-03-08 06:43:59'),('dfb733fc-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Mathematics and Complexity',7,'2026-03-08 08:07:38'),('dfb73882-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Arrays and Strings',13,'2026-03-08 08:07:38'),('dfb73feb-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Stack',7,'2026-03-08 08:07:38'),('dfb74154-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Queue',6,'2026-03-08 08:07:38'),('dfb74260-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Recursion and Backtracking',9,'2026-03-08 08:07:38'),('dfb74365-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Trees',11,'2026-03-08 08:07:38'),('dfb74471-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Heap',7,'2026-03-08 08:07:38'),('dfb745e6-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Hashing',7,'2026-03-08 08:07:38'),('dfb74708-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Graphs',14,'2026-03-08 08:07:38'),('dfb747fc-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Greedy Algorithms',7,'2026-03-08 08:07:38'),('dfb748ec-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Dynamic Programming',14,'2026-03-08 08:07:38'),('dfb749ed-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Searching and Sorting',9,'2026-03-08 08:07:38'),('dfb74ae0-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Bit Manipulation',7,'2026-03-08 08:07:38'),('dfb74bd2-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Advanced Data Structures',8,'2026-03-08 08:07:38'),('dfb74cc1-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Advanced Algorithmic Paradigms',8,'2026-03-08 08:07:38'),('dfb74dac-1ac5-11f1-ba17-2cf05d836a82','2f9546e9-1aba-11f1-ba17-2cf05d836a82','Design Based DSA',8,'2026-03-08 08:07:38'),('efbe6718-1ac5-11f1-ba17-2cf05d836a82','2f96375f-1aba-11f1-ba17-2cf05d836a82','System Design Interview Basics',5,'2026-03-08 08:08:05'),('efbe6da1-1ac5-11f1-ba17-2cf05d836a82','2f96375f-1aba-11f1-ba17-2cf05d836a82','Core Concepts',4,'2026-03-08 08:08:05'),('efbe6ed5-1ac5-11f1-ba17-2cf05d836a82','2f96375f-1aba-11f1-ba17-2cf05d836a82','Databases',4,'2026-03-08 08:08:05'),('efbe6fd4-1ac5-11f1-ba17-2cf05d836a82','2f96375f-1aba-11f1-ba17-2cf05d836a82','Distributed Storage and Caching',5,'2026-03-08 08:08:05'),('efbe70f8-1ac5-11f1-ba17-2cf05d836a82','2f96375f-1aba-11f1-ba17-2cf05d836a82','Traffic and Scalability',2,'2026-03-08 08:08:05'),('efbe725d-1ac5-11f1-ba17-2cf05d836a82','2f96375f-1aba-11f1-ba17-2cf05d836a82','Search and Communication',2,'2026-03-08 08:08:05'),('efbe7351-1ac5-11f1-ba17-2cf05d836a82','2f96375f-1aba-11f1-ba17-2cf05d836a82','Design Case Studies 1',4,'2026-03-08 08:08:05'),('efbe7457-1ac5-11f1-ba17-2cf05d836a82','2f96375f-1aba-11f1-ba17-2cf05d836a82','Wrap Up',2,'2026-03-08 08:08:05'),('efbe754a-1ac5-11f1-ba17-2cf05d836a82','2f96375f-1aba-11f1-ba17-2cf05d836a82','Design Case Studies 2',5,'2026-03-08 08:08:05'),('efbe7630-1ac5-11f1-ba17-2cf05d836a82','2f96375f-1aba-11f1-ba17-2cf05d836a82','Large Scale Storage Systems',5,'2026-03-08 08:08:05'),('efbe7726-1ac5-11f1-ba17-2cf05d836a82','2f96375f-1aba-11f1-ba17-2cf05d836a82','Coordination and Locking',3,'2026-03-08 08:08:05'),('efbe7812-1ac5-11f1-ba17-2cf05d836a82','2f96375f-1aba-11f1-ba17-2cf05d836a82','Data Processing and Streaming',2,'2026-03-08 08:08:05'),('efbe78fb-1ac5-11f1-ba17-2cf05d836a82','2f96375f-1aba-11f1-ba17-2cf05d836a82','Consensus and Transactions',3,'2026-03-08 08:08:05'),('efbe79e2-1ac5-11f1-ba17-2cf05d836a82','2f96375f-1aba-11f1-ba17-2cf05d836a82','Reliability',2,'2026-03-08 08:08:05'),('fa7826ee-1ac5-11f1-ba17-2cf05d836a82','bc932b1d-1abe-11f1-ba17-2cf05d836a82','Foundations',5,'2026-03-08 08:08:23'),('fa782be8-1ac5-11f1-ba17-2cf05d836a82','bc932b1d-1abe-11f1-ba17-2cf05d836a82','Fundamental Design Problems',2,'2026-03-08 08:08:23'),('fa782d10-1ac5-11f1-ba17-2cf05d836a82','bc932b1d-1abe-11f1-ba17-2cf05d836a82','Intermediate Design Problems',7,'2026-03-08 08:08:23'),('fa782e0b-1ac5-11f1-ba17-2cf05d836a82','bc932b1d-1abe-11f1-ba17-2cf05d836a82','Advanced Design Problems',13,'2026-03-08 08:08:23'),('fa782efb-1ac5-11f1-ba17-2cf05d836a82','bc932b1d-1abe-11f1-ba17-2cf05d836a82','Conclusion',2,'2026-03-08 08:08:23');
/*!40000 ALTER TABLE `prepkarta_concepts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prepkarta_options`
--

DROP TABLE IF EXISTS `prepkarta_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prepkarta_options` (
  `id` char(36) NOT NULL,
  `question_id` char(36) NOT NULL,
  `text` varchar(500) NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_prepkarta_options_question` (`question_id`),
  CONSTRAINT `fk_prepkarta_options_question` FOREIGN KEY (`question_id`) REFERENCES `prepkarta_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prepkarta_options`
--

LOCK TABLES `prepkarta_options` WRITE;
/*!40000 ALTER TABLE `prepkarta_options` DISABLE KEYS */;
INSERT INTO `prepkarta_options` VALUES ('2f9f9688-1aba-11f1-ba17-2cf05d836a82','2f9c61ca-1aba-11f1-ba17-2cf05d836a82','O(1)',1,'2026-03-08 06:43:59'),('2f9f99b9-1aba-11f1-ba17-2cf05d836a82','2f9c61ca-1aba-11f1-ba17-2cf05d836a82','O(log n)',0,'2026-03-08 06:43:59'),('2f9f9abc-1aba-11f1-ba17-2cf05d836a82','2f9c61ca-1aba-11f1-ba17-2cf05d836a82','O(n)',0,'2026-03-08 06:43:59'),('2f9f9b76-1aba-11f1-ba17-2cf05d836a82','2f9c61ca-1aba-11f1-ba17-2cf05d836a82','O(n log n)',0,'2026-03-08 06:43:59'),('2f9f9c2e-1aba-11f1-ba17-2cf05d836a82','2f9cdccc-1aba-11f1-ba17-2cf05d836a82','Insert at head',0,'2026-03-08 06:43:59'),('2f9f9ce6-1aba-11f1-ba17-2cf05d836a82','2f9cdccc-1aba-11f1-ba17-2cf05d836a82','Delete head',0,'2026-03-08 06:43:59'),('2f9f9dad-1aba-11f1-ba17-2cf05d836a82','2f9cdccc-1aba-11f1-ba17-2cf05d836a82','Find element by index',1,'2026-03-08 06:43:59'),('2f9f9e62-1aba-11f1-ba17-2cf05d836a82','2f9cdccc-1aba-11f1-ba17-2cf05d836a82','Update head pointer',0,'2026-03-08 06:43:59'),('2f9f9f15-1aba-11f1-ba17-2cf05d836a82','2f9d5e77-1aba-11f1-ba17-2cf05d836a82','Linked lists support O(1) head insertion.',1,'2026-03-08 06:43:59'),('2f9f9fbe-1aba-11f1-ba17-2cf05d836a82','2f9d5e77-1aba-11f1-ba17-2cf05d836a82','Linked lists require contiguous memory allocation.',0,'2026-03-08 06:43:59'),('2f9fa06f-1aba-11f1-ba17-2cf05d836a82','2f9d5e77-1aba-11f1-ba17-2cf05d836a82','Random index access is usually O(n).',1,'2026-03-08 06:43:59'),('2f9fa161-1aba-11f1-ba17-2cf05d836a82','2f9d5e77-1aba-11f1-ba17-2cf05d836a82','Linked lists are always faster than arrays for traversal.',0,'2026-03-08 06:43:59');
/*!40000 ALTER TABLE `prepkarta_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prepkarta_questions`
--

DROP TABLE IF EXISTS `prepkarta_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prepkarta_questions` (
  `id` char(36) NOT NULL,
  `concept_id` char(36) NOT NULL,
  `type` enum('single_choice','multiple_choice') NOT NULL DEFAULT 'single_choice',
  `question_text` text NOT NULL,
  `difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
  `explanation` text NOT NULL,
  `question_order` int NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_prepkarta_questions_concept_order` (`concept_id`,`question_order`),
  CONSTRAINT `fk_prepkarta_questions_concept` FOREIGN KEY (`concept_id`) REFERENCES `prepkarta_concepts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prepkarta_questions`
--

LOCK TABLES `prepkarta_questions` WRITE;
/*!40000 ALTER TABLE `prepkarta_questions` DISABLE KEYS */;
INSERT INTO `prepkarta_questions` VALUES ('2f9c61ca-1aba-11f1-ba17-2cf05d836a82','2f99d0c7-1aba-11f1-ba17-2cf05d836a82','single_choice','What is the time complexity of inserting a node at the head of a singly linked list?','easy','Head insertion only updates one pointer, so it is O(1).',1,'2026-03-08 06:43:59'),('2f9cdccc-1aba-11f1-ba17-2cf05d836a82','2f99d0c7-1aba-11f1-ba17-2cf05d836a82','single_choice','Which operation is typically O(n) in a singly linked list?','easy','Accessing by index requires traversal from head, so it is O(n).',2,'2026-03-08 06:43:59'),('2f9d5e77-1aba-11f1-ba17-2cf05d836a82','2f99d0c7-1aba-11f1-ba17-2cf05d836a82','multiple_choice','Select all true statements about linked lists.','medium','Linked lists provide dynamic sizing and efficient head insertions but not cache-friendly random access.',3,'2026-03-08 06:43:59');
/*!40000 ALTER TABLE `prepkarta_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prepkarta_subchapter_qa`
--

DROP TABLE IF EXISTS `prepkarta_subchapter_qa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prepkarta_subchapter_qa` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `organization_id` char(36) DEFAULT NULL,
  `subchapter_id` char(36) NOT NULL,
  `question` varchar(400) NOT NULL,
  `answer` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_prepkarta_subchapter_qa_user_subchapter` (`user_id`,`subchapter_id`),
  KEY `fk_prepkarta_subchapter_qa_org` (`organization_id`),
  KEY `fk_prepkarta_subchapter_qa_subchapter` (`subchapter_id`),
  CONSTRAINT `fk_prepkarta_subchapter_qa_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prepkarta_subchapter_qa_subchapter` FOREIGN KEY (`subchapter_id`) REFERENCES `prepkarta_subchapters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_prepkarta_subchapter_qa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prepkarta_subchapter_qa`
--

LOCK TABLES `prepkarta_subchapter_qa` WRITE;
/*!40000 ALTER TABLE `prepkarta_subchapter_qa` DISABLE KEYS */;
INSERT INTO `prepkarta_subchapter_qa` VALUES ('b82cac0e-1ad0-11f1-ba17-2cf05d836a82','8a32df72-1aa8-11f1-ba17-2cf05d836a82','524a35dc-1aa8-11f1-ba17-2cf05d836a82','ead40117-1ac5-11f1-ba17-2cf05d836a82','Give me a concise subchapter summary for revision.','**Advanced Sliding Window**\n\n**Overview**\nAdvanced Sliding Window is a paradigm that extends the traditional sliding window technique by incorporating additional data structures and algorithms to optimize performance and memory usage.\n\n**Key Concepts**\n\n• **Segment Trees**: Data structures used to store and query prefix sums or other aggregated values.\n• **Binary Indexed Trees (Fenwick Trees)**: Data structures used to store and query prefix sums or other aggregated values.\n• **Segmented Suffix Arrays**: Data structures used to store and query suffix arrays.\n• **Dynamic Programming**: Algorithmic technique used to solve problems by breaking them down into smaller subproblems.\n• **Memoization**: Optimization technique used to store and reuse previously computed results.\n\n**Architecture & Flow**\n\n1. Initialize the sliding window with the required data structure (e.g., Segment Tree, Binary Indexed Tree).\n2. Process the input data in a streaming fashion, updating the data structure as necessary.\n3. Use the data structure to query the required aggregated values (e.g., prefix sums, suffix arrays).\n4. Update the sliding window based on the query results.\n\n**Important Facts / Formulas**\n\n• **Time Complexity**: O(n log n) for Segment Trees and Binary Indexed Trees, where n is the size of the input data.\n• **Space Complexity**: O(n) for Segment Trees and Binary Indexed Trees, where n is the size of the input data.\n• **Tradeoff**: Between time and space complexity, depending on the specific use case.\n\n**Common Mistakes**\n\n• **Incorrectly implementing the data structure**: Failing to update the data structure correctly can lead to incorrect results.\n• **Not considering edge cases**: Failing to consider edge cases can lead to incorrect results or unexpected behavior.\n• **Not optimizing for memory usage**: Failing to optimize for memory usage can lead to performance issues.\n\n**Interview Deep-Dive Prompts**\n\n1. How would you optimize the sliding window technique for a large input dataset?\n2. What are the tradeoffs between using a Segment Tree and a Binary Indexed Tree?\n3. How would you handle edge cases in a sliding window implementation?\n4. What are the performance implications of using a dynamic programming approach?\n5. How would you optimize the memory usage of a sliding window implementation?\n\n**Quick Revision Checklist**\n\n• Understand the key concepts of Advanced Sliding Window.\n• Know how to implement Segment Trees and Binary Indexed Trees.\n• Understand the tradeoffs between time and space complexity.\n• Be able to optimize the sliding window technique for large input datasets.\n• Be able to handle edge cases in a sliding window implementation.\n\n**Practice Questions**\n\n1. Implement a Segment Tree to store and query prefix sums for an array of integers.\n2. Design a Binary Indexed Tree to store and query prefix sums for an array of integers.\n3. Implement a sliding window technique using a dynamic programming approach to solve a string matching problem.\n4. Optimize the memory usage of a sliding window implementation using a Segment Tree.\n5. Design a system to handle large input datasets using a sliding window technique.\n\n**Interview Readiness Verdict**\n\nThis subchapter summary provides a solid foundation for understanding Advanced Sliding Window. However, to be fully prepared for product-based companies, you should also practice implementing the techniques and algorithms discussed in this subchapter. Additionally, you should be familiar with real-world systems and technologies that use these techniques, such as Google\'s MapReduce and Apache Spark.','2026-03-08 09:25:17'),('e3fa6cc0-1adb-11f1-ba17-2cf05d836a82','8a32df72-1aa8-11f1-ba17-2cf05d836a82','524a35dc-1aa8-11f1-ba17-2cf05d836a82','ead4021f-1ac5-11f1-ba17-2cf05d836a82','Generate MCQs for Advanced Two Pointers','{\n  \"subject\": \"DSA\",\n  \"chapter\": \"Advanced Algorithmic Paradigms\",\n  \"subchapter\": \"Advanced Two Pointers\",\n  \"mcqs\": [\n    {\n      \"id\": 1,\n      \"difficulty\": \"easy\",\n      \"question\": \"Given two sorted arrays, find the median of the combined array using two pointers.\",\n      \"options\": {\n        \"A\": \"Use a single loop to iterate through both arrays and find the median.\",\n        \"B\": \"Use two pointers, one for each array, to find the median.\",\n        \"C\": \"Merge the two arrays into a single array and then find the median.\",\n        \"D\": \"Use a binary search approach to find the median.\"\n      },\n      \"correctAnswer\": \"B\",\n      \"explanation\": \"The two-pointer technique is suitable for this problem as it allows us to efficiently find the median of the combined array.\"\n    },\n    {\n      \"id\": 2,\n      \"difficulty\": \"medium\",\n      \"question\": \"Given a string of parentheses, find the minimum number of operations (insertions or deletions) to make the string balanced using two pointers.\",\n      \"options\": {\n        \"A\": \"Use a stack to keep track of the opening parentheses and then count the number of operations.\",\n        \"B\": \"Use two pointers, one at the beginning and one at the end of the string, to find the minimum number of operations.\",\n        \"C\": \"Iterate through the string and count the number of opening and closing parentheses, then calculate the minimum number of operations.\",\n        \"D\": \"Use a dynamic programming approach to find the minimum number of operations.\"\n      },\n      \"correctAnswer\": \"B\",\n      \"explanation\": \"The two-pointer technique is suitable for this problem as it allows us to efficiently find the minimum number of operations to make the string balanced.\"\n    },\n    {\n      \"id\": 3,\n      \"difficulty\": \"hard\",\n      \"question\": \"Given two linked lists, find the intersection node of the two lists using two pointers.\",\n      \"options\": {\n        \"A\": \"Use a single loop to iterate through both lists and find the intersection node.\",\n        \"B\": \"Use two pointers, one for each list, to find the intersection node.\",\n        \"C\": \"Merge the two lists into a single list and then find the intersection node.\",\n        \"D\": \"Use a hash table to store the nodes of one list and then find the intersection node in the other list.\"\n      },\n      \"correctAnswer\": \"B\",\n      \"explanation\": \"The two-pointer technique is suitable for this problem as it allows us to efficiently find the intersection node of the two lists.\"\n    },\n    {\n      \"id\": 4,\n      \"difficulty\": \"easy\",\n      \"question\": \"Given a sorted array, find the first duplicate element using two pointers.\",\n      \"options\": {\n        \"A\": \"Use a single loop to iterate through the array and find the first duplicate element.\",\n        \"B\": \"Use two pointers, one at the beginning and one at the end of the array, to find the first duplicate element.\",\n        \"C\": \"Iterate through the array and use a hash table to keep track of the elements, then find the first duplicate element.\",\n        \"D\": \"Use a binary search approach to find the first duplicate element.\"\n      },\n      \"correctAnswer\": \"B\",\n      \"explanation\": \"The two-pointer technique is suitable for this problem as it allows us to efficiently find the first duplicate element in the array.\"\n    },\n    {\n      \"id\": 5,\n      \"difficulty\": \"hard\",\n      \"question\": \"Given a string of characters, find the longest palindromic substring using two pointers.\",\n      \"options\": {\n        \"A\": \"Use a single loop to iterate through the string and find the longest palindromic substring.\",\n        \"B\": \"Use two pointers, one at the beginning and one at the end of the string, to find the longest palindromic substring.\",\n        \"C\": \"Iterate through the string and use a hash table to keep track of the characters, then find the longest palindromic substring.\",\n        \"D\": \"Use a dynamic programming approach to find the longest palindromic substring.\"\n      },\n      \"correctAnswer\": \"B\",\n      \"explanation\": \"The two-pointer technique is suitable for this problem as it allows us to efficiently find the longest palindromic substring in the string.\"\n    }\n  ]\n}','2026-03-08 10:45:15'),('fb7baf02-1ad0-11f1-ba17-2cf05d836a82','8a32df72-1aa8-11f1-ba17-2cf05d836a82','524a35dc-1aa8-11f1-ba17-2cf05d836a82','ead40117-1ac5-11f1-ba17-2cf05d836a82','Explain with a very simple example in plain english','**Advanced Sliding Window: Follow-up Study Guide**\n\n**Overview**\nAdvanced Sliding Window is a paradigm that extends the traditional sliding window technique by incorporating additional data structures and algorithms to optimize performance and memory usage.\n\n**Key Concepts**\n\n• **Segment Trees**: Data structures used to store and query prefix sums or other aggregated values.\n• **Binary Indexed Trees (Fenwick Trees)**: Data structures used to store and query prefix sums or other aggregated values.\n• **Segmented Suffix Arrays**: Data structures used to store and query suffix arrays.\n• **Dynamic Programming**: Algorithmic technique used to solve problems by breaking them down into smaller subproblems.\n• **Memoization**: Optimization technique used to store and reuse previously computed results.\n\n**Architecture & Flow**\n\n1. Initialize the sliding window with the required data structure (e.g., Segment Tree, Binary Indexed Tree).\n2. Process the input data in a streaming fashion, updating the data structure as necessary.\n3. Use the data structure to query the required aggregated values (e.g., prefix sums, suffix arrays).\n4. Update the sliding window based on the query results.\n\n**Important Facts / Formulas**\n\n• **Time Complexity**: O(n log n) for Segment Trees and Binary Indexed Trees, where n is the size of the input data.\n• **Space Complexity**: O(n) for Segment Trees and Binary Indexed Trees, where n is the size of the input data.\n• **Tradeoff**: Between time and space complexity, depending on the specific use case.\n\n**Common Mistakes**\n\n• **Incorrectly implementing the data structure**: Failing to update the data structure correctly can lead to incorrect results.\n• **Not considering edge cases**: Failing to consider edge cases can lead to incorrect results or unexpected behavior.\n• **Not optimizing for memory usage**: Failing to optimize for memory usage can lead to performance issues.\n\n**Interview Deep-Dive Prompts**\n\n1. How would you optimize the sliding window technique for a large input dataset?\n2. What are the tradeoffs between using a Segment Tree and a Binary Indexed Tree?\n3. How would you handle edge cases in a sliding window implementation?\n4. What are the performance implications of using a dynamic programming approach?\n5. How would you optimize the memory usage of a sliding window implementation?\n\n**Quick Revision Checklist**\n\n• Understand the key concepts of Advanced Sliding Window.\n• Know how to implement Segment Trees and Binary Indexed Trees.\n• Understand the tradeoffs between time and space complexity.\n• Be able to optimize the sliding window technique for large input datasets.\n• Be able to handle edge cases in a sliding window implementation.\n\n**Practice Questions**\n\n1. Implement a Segment Tree to store and query prefix sums for an array of integers.\n2. Design a Binary Indexed Tree to store and query prefix sums for an array of integers.\n3. Implement a sliding window technique using a dynamic programming approach to solve a string matching problem.\n4. Optimize the memory usage of a sliding window implementation using a Segment Tree.\n5. Design a system to handle large input datasets using a sliding window technique.\n\n**Example: Simple Window Sum**\n\nSuppose we have an array of integers `[1, 2, 3, 4, 5]` and we want to calculate the sum of the elements within a sliding window of size `3`. The window starts at the beginning of the array and moves to the right.\n\nUsing a Segment Tree, we can store the prefix sums of the array as follows:\n\n`[1, 3, 6, 10, 15]`\n\nWhen the window moves to the right, we can query the prefix sums to calculate the sum of the elements within the window.\n\nFor example, when the window is at `[2, 3, 4]`, we can query the prefix sums to get `[1, 3, 6]` and `[1, 3, 6] + 4 = 9`.\n\n**Interview Readiness Verdict**\n\nThis follow-up study guide provides additional insights and practice questions to help you master Advanced Sliding Window. To be fully prepared for product-based companies, you should also practice implementing the techniques and algorithms discussed in this subchapter and be familiar with real-world systems and technologies that use these techniques.\n\n**Additional Preparation Needed**\n\n* Practice implementing Segment Trees and Binary Indexed Trees.\n* Study real-world systems and technologies that use these techniques, such as Google\'s MapReduce and Apache Spark.\n* Review the','2026-03-08 09:27:09');
/*!40000 ALTER TABLE `prepkarta_subchapter_qa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prepkarta_subchapters`
--

DROP TABLE IF EXISTS `prepkarta_subchapters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prepkarta_subchapters` (
  `id` char(36) NOT NULL,
  `chapter_id` char(36) NOT NULL,
  `name` varchar(160) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_prepkarta_chapter_subchapter` (`chapter_id`,`name`),
  KEY `idx_prepkarta_subchapters_chapter` (`chapter_id`),
  CONSTRAINT `fk_prepkarta_subchapters_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `prepkarta_concepts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prepkarta_subchapters`
--

LOCK TABLES `prepkarta_subchapters` WRITE;
/*!40000 ALTER TABLE `prepkarta_subchapters` DISABLE KEYS */;
INSERT INTO `prepkarta_subchapters` VALUES ('013c04f8-1ac6-11f1-ba17-2cf05d836a82','fa782e0b-1ac5-11f1-ba17-2cf05d836a82','Designing a Car Rental System','2026-03-08 08:08:35'),('013c09e9-1ac6-11f1-ba17-2cf05d836a82','fa782e0b-1ac5-11f1-ba17-2cf05d836a82','Designing an ATM System','2026-03-08 08:08:35'),('013c0b30-1ac6-11f1-ba17-2cf05d836a82','fa782e0b-1ac5-11f1-ba17-2cf05d836a82','Designing a Chess Game','2026-03-08 08:08:35'),('013c0c47-1ac6-11f1-ba17-2cf05d836a82','fa782e0b-1ac5-11f1-ba17-2cf05d836a82','Designing a Hotel Management System','2026-03-08 08:08:35'),('013c0d5a-1ac6-11f1-ba17-2cf05d836a82','fa782e0b-1ac5-11f1-ba17-2cf05d836a82','Designing the Amazon Online Shopping System','2026-03-08 08:08:35'),('013c0e6e-1ac6-11f1-ba17-2cf05d836a82','fa782e0b-1ac5-11f1-ba17-2cf05d836a82','Designing Stack Overflow','2026-03-08 08:08:35'),('013c0f8e-1ac6-11f1-ba17-2cf05d836a82','fa782e0b-1ac5-11f1-ba17-2cf05d836a82','Designing a Restaurant Management System','2026-03-08 08:08:35'),('013ca035-1ac6-11f1-ba17-2cf05d836a82','fa782e0b-1ac5-11f1-ba17-2cf05d836a82','Designing Facebook','2026-03-08 08:08:35'),('013ca1e4-1ac6-11f1-ba17-2cf05d836a82','fa782e0b-1ac5-11f1-ba17-2cf05d836a82','Designing an Online Stock Brokerage System','2026-03-08 08:08:35'),('013ca315-1ac6-11f1-ba17-2cf05d836a82','fa782e0b-1ac5-11f1-ba17-2cf05d836a82','Designing a Jigsaw Puzzle','2026-03-08 08:08:35'),('013ca4ef-1ac6-11f1-ba17-2cf05d836a82','fa782e0b-1ac5-11f1-ba17-2cf05d836a82','Designing an Airline Management System','2026-03-08 08:08:35'),('013ca61a-1ac6-11f1-ba17-2cf05d836a82','fa782e0b-1ac5-11f1-ba17-2cf05d836a82','Designing Cricinfo','2026-03-08 08:08:35'),('013ca72e-1ac6-11f1-ba17-2cf05d836a82','fa782e0b-1ac5-11f1-ba17-2cf05d836a82','Designing LinkedIn','2026-03-08 08:08:35'),('013ca892-1ac6-11f1-ba17-2cf05d836a82','fa782efb-1ac5-11f1-ba17-2cf05d836a82','Object-Oriented Design Interview Tips','2026-03-08 08:08:35'),('013ca99d-1ac6-11f1-ba17-2cf05d836a82','fa782efb-1ac5-11f1-ba17-2cf05d836a82','Course Wrap-Up','2026-03-08 08:08:35'),('013caac5-1ac6-11f1-ba17-2cf05d836a82','fa7826ee-1ac5-11f1-ba17-2cf05d836a82','Course Introduction and Prerequisites','2026-03-08 08:08:35'),('013cac0d-1ac6-11f1-ba17-2cf05d836a82','fa7826ee-1ac5-11f1-ba17-2cf05d836a82','Cornerstones of Object-Oriented Programming','2026-03-08 08:08:35'),('013cad1b-1ac6-11f1-ba17-2cf05d836a82','fa7826ee-1ac5-11f1-ba17-2cf05d836a82','Object-Oriented Analysis and Design','2026-03-08 08:08:35'),('013cae27-1ac6-11f1-ba17-2cf05d836a82','fa7826ee-1ac5-11f1-ba17-2cf05d836a82','Object-Oriented Design Principles (SOLID)','2026-03-08 08:08:35'),('013caf43-1ac6-11f1-ba17-2cf05d836a82','fa7826ee-1ac5-11f1-ba17-2cf05d836a82','Design Patterns (Creational, Structural, Behavioral)','2026-03-08 08:08:35'),('013cb07e-1ac6-11f1-ba17-2cf05d836a82','fa782be8-1ac5-11f1-ba17-2cf05d836a82','Approaching Real-world Design Problems','2026-03-08 08:08:35'),('013cb172-1ac6-11f1-ba17-2cf05d836a82','fa782be8-1ac5-11f1-ba17-2cf05d836a82','Designing a Parking Lot System','2026-03-08 08:08:35'),('013cb291-1ac6-11f1-ba17-2cf05d836a82','fa782d10-1ac5-11f1-ba17-2cf05d836a82','Designing an Elevator System','2026-03-08 08:08:35'),('013cb38a-1ac6-11f1-ba17-2cf05d836a82','fa782d10-1ac5-11f1-ba17-2cf05d836a82','Designing a Library Management System','2026-03-08 08:08:35'),('013cb4c9-1ac6-11f1-ba17-2cf05d836a82','fa782d10-1ac5-11f1-ba17-2cf05d836a82','Designing the Amazon Locker Service','2026-03-08 08:08:35'),('013cb5cc-1ac6-11f1-ba17-2cf05d836a82','fa782d10-1ac5-11f1-ba17-2cf05d836a82','Designing a Vending Machine','2026-03-08 08:08:35'),('013cb6cf-1ac6-11f1-ba17-2cf05d836a82','fa782d10-1ac5-11f1-ba17-2cf05d836a82','Designing an Online Blackjack Game','2026-03-08 08:08:35'),('013cb7cf-1ac6-11f1-ba17-2cf05d836a82','fa782d10-1ac5-11f1-ba17-2cf05d836a82','Designing a Meeting Scheduler','2026-03-08 08:08:35'),('013cb8e7-1ac6-11f1-ba17-2cf05d836a82','fa782d10-1ac5-11f1-ba17-2cf05d836a82','Designing a Movie Ticket Booking System','2026-03-08 08:08:35'),('0bbcc724-1ac6-11f1-ba17-2cf05d836a82','0683b964-1ac6-11f1-ba17-2cf05d836a82','YouTube Streaming API Design','2026-03-08 08:08:52'),('0bbccce6-1ac6-11f1-ba17-2cf05d836a82','0683b964-1ac6-11f1-ba17-2cf05d836a82','Facebook Messenger API Design','2026-03-08 08:08:52'),('0bbcce27-1ac6-11f1-ba17-2cf05d836a82','0683b964-1ac6-11f1-ba17-2cf05d836a82','Google Maps API Design','2026-03-08 08:08:52'),('0bbccf37-1ac6-11f1-ba17-2cf05d836a82','0683b964-1ac6-11f1-ba17-2cf05d836a82','Chess Game API Design with AI Mentor','2026-03-08 08:08:52'),('0bbcd03e-1ac6-11f1-ba17-2cf05d836a82','0683b964-1ac6-11f1-ba17-2cf05d836a82','Zoom Real-time Conferencing API Design','2026-03-08 08:08:52'),('0bbcd15a-1ac6-11f1-ba17-2cf05d836a82','0683b964-1ac6-11f1-ba17-2cf05d836a82','LeetCode Platform API Design','2026-03-08 08:08:52'),('0bbcd26a-1ac6-11f1-ba17-2cf05d836a82','0683b964-1ac6-11f1-ba17-2cf05d836a82','Stripe Payment Gateway API Design','2026-03-08 08:08:52'),('0bbcd368-1ac6-11f1-ba17-2cf05d836a82','0683b964-1ac6-11f1-ba17-2cf05d836a82','Twitter API Design','2026-03-08 08:08:52'),('0bbcd463-1ac6-11f1-ba17-2cf05d836a82','0683b964-1ac6-11f1-ba17-2cf05d836a82','Uber API Design','2026-03-08 08:08:52'),('0bbcd561-1ac6-11f1-ba17-2cf05d836a82','0683b964-1ac6-11f1-ba17-2cf05d836a82','CamelCamelCamel API Design','2026-03-08 08:08:52'),('0bbcd667-1ac6-11f1-ba17-2cf05d836a82','0683b964-1ac6-11f1-ba17-2cf05d836a82','Gaming Platform API Design','2026-03-08 08:08:52'),('0bbcd79f-1ac6-11f1-ba17-2cf05d836a82','0683b711-1ac6-11f1-ba17-2cf05d836a82','Back-of-the-Envelope Calculations for Latency','2026-03-08 08:08:52'),('0bbcd89b-1ac6-11f1-ba17-2cf05d836a82','0683b711-1ac6-11f1-ba17-2cf05d836a82','Foundational API Design Frameworks and Conventions','2026-03-08 08:08:52'),('0bbcd9c0-1ac6-11f1-ba17-2cf05d836a82','0683b85c-1ac6-11f1-ba17-2cf05d836a82','Design a Search Service API','2026-03-08 08:08:52'),('0bbcdabe-1ac6-11f1-ba17-2cf05d836a82','0683b85c-1ac6-11f1-ba17-2cf05d836a82','Design a File Service API','2026-03-08 08:08:52'),('0bbcdbc0-1ac6-11f1-ba17-2cf05d836a82','0683b85c-1ac6-11f1-ba17-2cf05d836a82','Design a Comment Service API','2026-03-08 08:08:52'),('0bbcdcc8-1ac6-11f1-ba17-2cf05d836a82','0683b85c-1ac6-11f1-ba17-2cf05d836a82','Design a Pub-Sub Service API','2026-03-08 08:08:52'),('0bbcddd1-1ac6-11f1-ba17-2cf05d836a82','0683b85c-1ac6-11f1-ba17-2cf05d836a82','Concluding Foundational Design Problems','2026-03-08 08:08:52'),('0bbcdef7-1ac6-11f1-ba17-2cf05d836a82','0683b150-1ac6-11f1-ba17-2cf05d836a82','Introduction to API Roles and Design Principles','2026-03-08 08:08:52'),('0bbcdff7-1ac6-11f1-ba17-2cf05d836a82','0683b150-1ac6-11f1-ba17-2cf05d836a82','Network Protocols and Socket Communication','2026-03-08 08:08:52'),('0bbce0f2-1ac6-11f1-ba17-2cf05d836a82','0683b150-1ac6-11f1-ba17-2cf05d836a82','Client-Server Communication Models','2026-03-08 08:08:52'),('0bbce1f3-1ac6-11f1-ba17-2cf05d836a82','0683b150-1ac6-11f1-ba17-2cf05d836a82','Common Data Formats for Web APIs','2026-03-08 08:08:52'),('0bbce2f7-1ac6-11f1-ba17-2cf05d836a82','0683b150-1ac6-11f1-ba17-2cf05d836a82','Comparison of API Architectural Styles (REST, GraphQL, gRPC)','2026-03-08 08:08:52'),('0bbce407-1ac6-11f1-ba17-2cf05d836a82','0683b150-1ac6-11f1-ba17-2cf05d836a82','API Design Security (TLS, Validation, Auth, Authorization)','2026-03-08 08:08:52'),('0bbce4f9-1ac6-11f1-ba17-2cf05d836a82','0683b150-1ac6-11f1-ba17-2cf05d836a82','Important API Concepts (Versioning, Rate Limiting, Evolution, Caching)','2026-03-08 08:08:52'),('0bbce637-1ac6-11f1-ba17-2cf05d836a82','0683ba59-1ac6-11f1-ba17-2cf05d836a82','API Failures and Mitigation Strategies','2026-03-08 08:08:52'),('0bbce739-1ac6-11f1-ba17-2cf05d836a82','0683ba59-1ac6-11f1-ba17-2cf05d836a82','API Design Best Practices and Further Learning','2026-03-08 08:08:52'),('ead339a8-1ac5-11f1-ba17-2cf05d836a82','dfb733fc-1ac5-11f1-ba17-2cf05d836a82','Time and Space Complexity','2026-03-08 08:07:57'),('ead33e05-1ac5-11f1-ba17-2cf05d836a82','dfb733fc-1ac5-11f1-ba17-2cf05d836a82','Logarithms and Exponentials','2026-03-08 08:07:57'),('ead33f64-1ac5-11f1-ba17-2cf05d836a82','dfb733fc-1ac5-11f1-ba17-2cf05d836a82','Recurrence Relations','2026-03-08 08:07:57'),('ead3406c-1ac5-11f1-ba17-2cf05d836a82','dfb733fc-1ac5-11f1-ba17-2cf05d836a82','Modular Arithmetic','2026-03-08 08:07:57'),('ead3416f-1ac5-11f1-ba17-2cf05d836a82','dfb733fc-1ac5-11f1-ba17-2cf05d836a82','Prime Numbers and Sieve of Eratosthenes','2026-03-08 08:07:57'),('ead34295-1ac5-11f1-ba17-2cf05d836a82','dfb733fc-1ac5-11f1-ba17-2cf05d836a82','GCD and LCM','2026-03-08 08:07:57'),('ead34386-1ac5-11f1-ba17-2cf05d836a82','dfb733fc-1ac5-11f1-ba17-2cf05d836a82','Fast Exponentiation','2026-03-08 08:07:57'),('ead344cd-1ac5-11f1-ba17-2cf05d836a82','dfb73882-1ac5-11f1-ba17-2cf05d836a82','Static and Dynamic Arrays','2026-03-08 08:07:57'),('ead34633-1ac5-11f1-ba17-2cf05d836a82','dfb73882-1ac5-11f1-ba17-2cf05d836a82','Prefix Sum','2026-03-08 08:07:57'),('ead34734-1ac5-11f1-ba17-2cf05d836a82','dfb73882-1ac5-11f1-ba17-2cf05d836a82','Sliding Window Technique','2026-03-08 08:07:57'),('ead348a8-1ac5-11f1-ba17-2cf05d836a82','dfb73882-1ac5-11f1-ba17-2cf05d836a82','Two Pointer Technique','2026-03-08 08:07:57'),('ead349aa-1ac5-11f1-ba17-2cf05d836a82','dfb73882-1ac5-11f1-ba17-2cf05d836a82','Kadane\'s Algorithm','2026-03-08 08:07:57'),('ead34a9c-1ac5-11f1-ba17-2cf05d836a82','dfb73882-1ac5-11f1-ba17-2cf05d836a82','Sorting an Array','2026-03-08 08:07:57'),('ead34b92-1ac5-11f1-ba17-2cf05d836a82','dfb73882-1ac5-11f1-ba17-2cf05d836a82','Searching in Array','2026-03-08 08:07:57'),('ead34c81-1ac5-11f1-ba17-2cf05d836a82','dfb73882-1ac5-11f1-ba17-2cf05d836a82','Matrix Traversal','2026-03-08 08:07:57'),('ead34d80-1ac5-11f1-ba17-2cf05d836a82','dfb73882-1ac5-11f1-ba17-2cf05d836a82','String Basics','2026-03-08 08:07:57'),('ead34e8d-1ac5-11f1-ba17-2cf05d836a82','dfb73882-1ac5-11f1-ba17-2cf05d836a82','Pattern Searching','2026-03-08 08:07:57'),('ead34f7b-1ac5-11f1-ba17-2cf05d836a82','dfb73882-1ac5-11f1-ba17-2cf05d836a82','String Hashing','2026-03-08 08:07:57'),('ead3507a-1ac5-11f1-ba17-2cf05d836a82','dfb73882-1ac5-11f1-ba17-2cf05d836a82','Palindrome Problems','2026-03-08 08:07:57'),('ead35181-1ac5-11f1-ba17-2cf05d836a82','dfb73882-1ac5-11f1-ba17-2cf05d836a82','Anagram Problems','2026-03-08 08:07:57'),('ead352bd-1ac5-11f1-ba17-2cf05d836a82','2f99d0c7-1aba-11f1-ba17-2cf05d836a82','Singly Linked List','2026-03-08 08:07:57'),('ead353c2-1ac5-11f1-ba17-2cf05d836a82','2f99d0c7-1aba-11f1-ba17-2cf05d836a82','Doubly Linked List','2026-03-08 08:07:57'),('ead354b0-1ac5-11f1-ba17-2cf05d836a82','2f99d0c7-1aba-11f1-ba17-2cf05d836a82','Circular Linked List','2026-03-08 08:07:57'),('ead355a6-1ac5-11f1-ba17-2cf05d836a82','2f99d0c7-1aba-11f1-ba17-2cf05d836a82','Fast and Slow Pointer Technique','2026-03-08 08:07:57'),('ead356a9-1ac5-11f1-ba17-2cf05d836a82','2f99d0c7-1aba-11f1-ba17-2cf05d836a82','Detect Cycle','2026-03-08 08:07:57'),('ead357a6-1ac5-11f1-ba17-2cf05d836a82','2f99d0c7-1aba-11f1-ba17-2cf05d836a82','Reverse Linked List','2026-03-08 08:07:57'),('ead358a3-1ac5-11f1-ba17-2cf05d836a82','2f99d0c7-1aba-11f1-ba17-2cf05d836a82','Merge Two Lists','2026-03-08 08:07:57'),('ead35995-1ac5-11f1-ba17-2cf05d836a82','2f99d0c7-1aba-11f1-ba17-2cf05d836a82','LRU Cache Design','2026-03-08 08:07:57'),('ead35ab2-1ac5-11f1-ba17-2cf05d836a82','dfb73feb-1ac5-11f1-ba17-2cf05d836a82','Stack Implementation','2026-03-08 08:07:57'),('ead35ba9-1ac5-11f1-ba17-2cf05d836a82','dfb73feb-1ac5-11f1-ba17-2cf05d836a82','Balanced Parentheses','2026-03-08 08:07:57'),('ead35ca3-1ac5-11f1-ba17-2cf05d836a82','dfb73feb-1ac5-11f1-ba17-2cf05d836a82','Infix Prefix Postfix Expressions','2026-03-08 08:07:57'),('ead35dcb-1ac5-11f1-ba17-2cf05d836a82','dfb73feb-1ac5-11f1-ba17-2cf05d836a82','Next Greater Element','2026-03-08 08:07:57'),('ead35ef2-1ac5-11f1-ba17-2cf05d836a82','dfb73feb-1ac5-11f1-ba17-2cf05d836a82','Monotonic Stack','2026-03-08 08:07:57'),('ead35ffc-1ac5-11f1-ba17-2cf05d836a82','dfb73feb-1ac5-11f1-ba17-2cf05d836a82','Min Stack','2026-03-08 08:07:57'),('ead360f9-1ac5-11f1-ba17-2cf05d836a82','dfb73feb-1ac5-11f1-ba17-2cf05d836a82','Largest Rectangle in Histogram','2026-03-08 08:07:57'),('ead36232-1ac5-11f1-ba17-2cf05d836a82','dfb74154-1ac5-11f1-ba17-2cf05d836a82','Queue Implementation','2026-03-08 08:07:57'),('ead3632d-1ac5-11f1-ba17-2cf05d836a82','dfb74154-1ac5-11f1-ba17-2cf05d836a82','Circular Queue','2026-03-08 08:07:57'),('ead3641f-1ac5-11f1-ba17-2cf05d836a82','dfb74154-1ac5-11f1-ba17-2cf05d836a82','Deque','2026-03-08 08:07:57'),('ead36510-1ac5-11f1-ba17-2cf05d836a82','dfb74154-1ac5-11f1-ba17-2cf05d836a82','Priority Queue','2026-03-08 08:07:57'),('ead3660a-1ac5-11f1-ba17-2cf05d836a82','dfb74154-1ac5-11f1-ba17-2cf05d836a82','Sliding Window Maximum','2026-03-08 08:07:57'),('ead36700-1ac5-11f1-ba17-2cf05d836a82','dfb74154-1ac5-11f1-ba17-2cf05d836a82','BFS using Queue','2026-03-08 08:07:57'),('ead36832-1ac5-11f1-ba17-2cf05d836a82','dfb74260-1ac5-11f1-ba17-2cf05d836a82','Recursion Basics','2026-03-08 08:07:57'),('ead3692e-1ac5-11f1-ba17-2cf05d836a82','dfb74260-1ac5-11f1-ba17-2cf05d836a82','Tail Recursion','2026-03-08 08:07:57'),('ead36a77-1ac5-11f1-ba17-2cf05d836a82','dfb74260-1ac5-11f1-ba17-2cf05d836a82','Subsets','2026-03-08 08:07:57'),('ead36b85-1ac5-11f1-ba17-2cf05d836a82','dfb74260-1ac5-11f1-ba17-2cf05d836a82','Permutations','2026-03-08 08:07:57'),('ead36c7b-1ac5-11f1-ba17-2cf05d836a82','dfb74260-1ac5-11f1-ba17-2cf05d836a82','Combination Sum','2026-03-08 08:07:57'),('ead36d69-1ac5-11f1-ba17-2cf05d836a82','dfb74260-1ac5-11f1-ba17-2cf05d836a82','N Queens Problem','2026-03-08 08:07:57'),('ead36e5a-1ac5-11f1-ba17-2cf05d836a82','dfb74260-1ac5-11f1-ba17-2cf05d836a82','Sudoku Solver','2026-03-08 08:07:57'),('ead36f5a-1ac5-11f1-ba17-2cf05d836a82','dfb74260-1ac5-11f1-ba17-2cf05d836a82','Rat in a Maze','2026-03-08 08:07:57'),('ead37049-1ac5-11f1-ba17-2cf05d836a82','dfb74260-1ac5-11f1-ba17-2cf05d836a82','Backtracking on Strings','2026-03-08 08:07:57'),('ead37174-1ac5-11f1-ba17-2cf05d836a82','dfb74365-1ac5-11f1-ba17-2cf05d836a82','Binary Tree Basics','2026-03-08 08:07:57'),('ead3727b-1ac5-11f1-ba17-2cf05d836a82','dfb74365-1ac5-11f1-ba17-2cf05d836a82','Tree Traversals','2026-03-08 08:07:57'),('ead37379-1ac5-11f1-ba17-2cf05d836a82','dfb74365-1ac5-11f1-ba17-2cf05d836a82','Height and Depth of Tree','2026-03-08 08:07:57'),('ead37483-1ac5-11f1-ba17-2cf05d836a82','dfb74365-1ac5-11f1-ba17-2cf05d836a82','Diameter of Tree','2026-03-08 08:07:57'),('ead3758e-1ac5-11f1-ba17-2cf05d836a82','dfb74365-1ac5-11f1-ba17-2cf05d836a82','Lowest Common Ancestor','2026-03-08 08:07:57'),('ead3768f-1ac5-11f1-ba17-2cf05d836a82','dfb74365-1ac5-11f1-ba17-2cf05d836a82','Binary Search Tree','2026-03-08 08:07:57'),('ead37780-1ac5-11f1-ba17-2cf05d836a82','dfb74365-1ac5-11f1-ba17-2cf05d836a82','Balanced Trees','2026-03-08 08:07:57'),('ead37876-1ac5-11f1-ba17-2cf05d836a82','dfb74365-1ac5-11f1-ba17-2cf05d836a82','AVL Tree Basics','2026-03-08 08:07:57'),('ead3796a-1ac5-11f1-ba17-2cf05d836a82','dfb74365-1ac5-11f1-ba17-2cf05d836a82','Tree Serialization','2026-03-08 08:07:57'),('ead37a67-1ac5-11f1-ba17-2cf05d836a82','dfb74365-1ac5-11f1-ba17-2cf05d836a82','Segment Tree','2026-03-08 08:07:57'),('ead37b66-1ac5-11f1-ba17-2cf05d836a82','dfb74365-1ac5-11f1-ba17-2cf05d836a82','Fenwick Tree','2026-03-08 08:07:57'),('ead37c82-1ac5-11f1-ba17-2cf05d836a82','dfb74471-1ac5-11f1-ba17-2cf05d836a82','Binary Heap','2026-03-08 08:07:57'),('ead37d70-1ac5-11f1-ba17-2cf05d836a82','dfb74471-1ac5-11f1-ba17-2cf05d836a82','Min Heap and Max Heap','2026-03-08 08:07:57'),('ead37e6d-1ac5-11f1-ba17-2cf05d836a82','dfb74471-1ac5-11f1-ba17-2cf05d836a82','Heap Sort','2026-03-08 08:07:57'),('ead37f9c-1ac5-11f1-ba17-2cf05d836a82','dfb74471-1ac5-11f1-ba17-2cf05d836a82','Priority Queue Applications','2026-03-08 08:07:57'),('ead380ae-1ac5-11f1-ba17-2cf05d836a82','dfb74471-1ac5-11f1-ba17-2cf05d836a82','K Largest and K Smallest Elements','2026-03-08 08:07:57'),('ead381b8-1ac5-11f1-ba17-2cf05d836a82','dfb74471-1ac5-11f1-ba17-2cf05d836a82','Median in Stream','2026-03-08 08:07:57'),('ead382b1-1ac5-11f1-ba17-2cf05d836a82','dfb74471-1ac5-11f1-ba17-2cf05d836a82','Merge K Sorted Lists','2026-03-08 08:07:57'),('ead383d8-1ac5-11f1-ba17-2cf05d836a82','dfb745e6-1ac5-11f1-ba17-2cf05d836a82','Hash Table Basics','2026-03-08 08:07:57'),('ead384c0-1ac5-11f1-ba17-2cf05d836a82','dfb745e6-1ac5-11f1-ba17-2cf05d836a82','Collision Handling','2026-03-08 08:07:57'),('ead385b1-1ac5-11f1-ba17-2cf05d836a82','dfb745e6-1ac5-11f1-ba17-2cf05d836a82','HashMap and HashSet','2026-03-08 08:07:57'),('ead386ba-1ac5-11f1-ba17-2cf05d836a82','dfb745e6-1ac5-11f1-ba17-2cf05d836a82','Frequency Counting','2026-03-08 08:07:57'),('ead387ac-1ac5-11f1-ba17-2cf05d836a82','dfb745e6-1ac5-11f1-ba17-2cf05d836a82','Two Sum and K Sum Problems','2026-03-08 08:07:57'),('ead388a6-1ac5-11f1-ba17-2cf05d836a82','dfb745e6-1ac5-11f1-ba17-2cf05d836a82','Rolling Hash','2026-03-08 08:07:57'),('ead389a2-1ac5-11f1-ba17-2cf05d836a82','dfb745e6-1ac5-11f1-ba17-2cf05d836a82','Caching Basics','2026-03-08 08:07:57'),('ead38ad4-1ac5-11f1-ba17-2cf05d836a82','dfb74708-1ac5-11f1-ba17-2cf05d836a82','Graph Representation','2026-03-08 08:07:57'),('ead38bd9-1ac5-11f1-ba17-2cf05d836a82','dfb74708-1ac5-11f1-ba17-2cf05d836a82','Breadth First Search','2026-03-08 08:07:57'),('ead38ccc-1ac5-11f1-ba17-2cf05d836a82','dfb74708-1ac5-11f1-ba17-2cf05d836a82','Depth First Search','2026-03-08 08:07:57'),('ead38dbf-1ac5-11f1-ba17-2cf05d836a82','dfb74708-1ac5-11f1-ba17-2cf05d836a82','Topological Sort','2026-03-08 08:07:57'),('ead38eb6-1ac5-11f1-ba17-2cf05d836a82','dfb74708-1ac5-11f1-ba17-2cf05d836a82','Cycle Detection','2026-03-08 08:07:57'),('ead38fa7-1ac5-11f1-ba17-2cf05d836a82','dfb74708-1ac5-11f1-ba17-2cf05d836a82','Shortest Path Algorithms','2026-03-08 08:07:57'),('ead390a8-1ac5-11f1-ba17-2cf05d836a82','dfb74708-1ac5-11f1-ba17-2cf05d836a82','Dijkstra Algorithm','2026-03-08 08:07:57'),('ead391a1-1ac5-11f1-ba17-2cf05d836a82','dfb74708-1ac5-11f1-ba17-2cf05d836a82','Bellman Ford Algorithm','2026-03-08 08:07:57'),('ead392e8-1ac5-11f1-ba17-2cf05d836a82','dfb74708-1ac5-11f1-ba17-2cf05d836a82','Floyd Warshall Algorithm','2026-03-08 08:07:57'),('ead393ea-1ac5-11f1-ba17-2cf05d836a82','dfb74708-1ac5-11f1-ba17-2cf05d836a82','Minimum Spanning Tree','2026-03-08 08:07:57'),('ead394f8-1ac5-11f1-ba17-2cf05d836a82','dfb74708-1ac5-11f1-ba17-2cf05d836a82','Disjoint Set Union','2026-03-08 08:07:57'),('ead3960e-1ac5-11f1-ba17-2cf05d836a82','dfb74708-1ac5-11f1-ba17-2cf05d836a82','Strongly Connected Components','2026-03-08 08:07:57'),('ead3972e-1ac5-11f1-ba17-2cf05d836a82','dfb74708-1ac5-11f1-ba17-2cf05d836a82','Bipartite Graph','2026-03-08 08:07:57'),('ead3981f-1ac5-11f1-ba17-2cf05d836a82','dfb74708-1ac5-11f1-ba17-2cf05d836a82','Network Flow Basics','2026-03-08 08:07:57'),('ead3993c-1ac5-11f1-ba17-2cf05d836a82','dfb747fc-1ac5-11f1-ba17-2cf05d836a82','Activity Selection','2026-03-08 08:07:57'),('ead39a29-1ac5-11f1-ba17-2cf05d836a82','dfb747fc-1ac5-11f1-ba17-2cf05d836a82','Fractional Knapsack','2026-03-08 08:07:57'),('ead39b1d-1ac5-11f1-ba17-2cf05d836a82','dfb747fc-1ac5-11f1-ba17-2cf05d836a82','Huffman Coding','2026-03-08 08:07:57'),('ead39c1b-1ac5-11f1-ba17-2cf05d836a82','dfb747fc-1ac5-11f1-ba17-2cf05d836a82','Job Scheduling','2026-03-08 08:07:57'),('ead39d16-1ac5-11f1-ba17-2cf05d836a82','dfb747fc-1ac5-11f1-ba17-2cf05d836a82','Greedy Interval Problems','2026-03-08 08:07:57'),('ead39e0d-1ac5-11f1-ba17-2cf05d836a82','dfb747fc-1ac5-11f1-ba17-2cf05d836a82','Gas Station Problem','2026-03-08 08:07:57'),('ead39f04-1ac5-11f1-ba17-2cf05d836a82','dfb747fc-1ac5-11f1-ba17-2cf05d836a82','Minimum Platforms Problem','2026-03-08 08:07:57'),('ead3a036-1ac5-11f1-ba17-2cf05d836a82','dfb748ec-1ac5-11f1-ba17-2cf05d836a82','Dynamic Programming Basics','2026-03-08 08:07:57'),('ead3a12f-1ac5-11f1-ba17-2cf05d836a82','dfb748ec-1ac5-11f1-ba17-2cf05d836a82','Memoization vs Tabulation','2026-03-08 08:07:57'),('ead3a23a-1ac5-11f1-ba17-2cf05d836a82','dfb748ec-1ac5-11f1-ba17-2cf05d836a82','Zero One Knapsack','2026-03-08 08:07:57'),('ead3a335-1ac5-11f1-ba17-2cf05d836a82','dfb748ec-1ac5-11f1-ba17-2cf05d836a82','Unbounded Knapsack','2026-03-08 08:07:57'),('ead3a430-1ac5-11f1-ba17-2cf05d836a82','dfb748ec-1ac5-11f1-ba17-2cf05d836a82','Longest Common Subsequence','2026-03-08 08:07:57'),('ead3a51e-1ac5-11f1-ba17-2cf05d836a82','dfb748ec-1ac5-11f1-ba17-2cf05d836a82','Longest Increasing Subsequence','2026-03-08 08:07:57'),('ead3a60e-1ac5-11f1-ba17-2cf05d836a82','dfb748ec-1ac5-11f1-ba17-2cf05d836a82','Matrix Chain Multiplication','2026-03-08 08:07:57'),('ead3a727-1ac5-11f1-ba17-2cf05d836a82','dfb748ec-1ac5-11f1-ba17-2cf05d836a82','Coin Change','2026-03-08 08:07:57'),('ead3a81c-1ac5-11f1-ba17-2cf05d836a82','dfb748ec-1ac5-11f1-ba17-2cf05d836a82','Subset Sum','2026-03-08 08:07:57'),('ead3a914-1ac5-11f1-ba17-2cf05d836a82','dfb748ec-1ac5-11f1-ba17-2cf05d836a82','Partition Equal Subset Sum','2026-03-08 08:07:57'),('ead3aa0d-1ac5-11f1-ba17-2cf05d836a82','dfb748ec-1ac5-11f1-ba17-2cf05d836a82','DP on Grids','2026-03-08 08:07:57'),('ead3aaff-1ac5-11f1-ba17-2cf05d836a82','dfb748ec-1ac5-11f1-ba17-2cf05d836a82','DP on Trees','2026-03-08 08:07:57'),('ead3abf7-1ac5-11f1-ba17-2cf05d836a82','dfb748ec-1ac5-11f1-ba17-2cf05d836a82','Bitmask DP','2026-03-08 08:07:57'),('ead3acea-1ac5-11f1-ba17-2cf05d836a82','dfb748ec-1ac5-11f1-ba17-2cf05d836a82','Digit DP Basics','2026-03-08 08:07:57'),('ead3ae45-1ac5-11f1-ba17-2cf05d836a82','dfb749ed-1ac5-11f1-ba17-2cf05d836a82','Binary Search','2026-03-08 08:07:57'),('ead3af36-1ac5-11f1-ba17-2cf05d836a82','dfb749ed-1ac5-11f1-ba17-2cf05d836a82','Binary Search Variants','2026-03-08 08:07:57'),('ead3b02e-1ac5-11f1-ba17-2cf05d836a82','dfb749ed-1ac5-11f1-ba17-2cf05d836a82','Merge Sort','2026-03-08 08:07:57'),('ead3b126-1ac5-11f1-ba17-2cf05d836a82','dfb749ed-1ac5-11f1-ba17-2cf05d836a82','Quick Sort','2026-03-08 08:07:57'),('ead3b225-1ac5-11f1-ba17-2cf05d836a82','dfb749ed-1ac5-11f1-ba17-2cf05d836a82','Counting Sort','2026-03-08 08:07:57'),('ead3b31b-1ac5-11f1-ba17-2cf05d836a82','dfb749ed-1ac5-11f1-ba17-2cf05d836a82','Radix Sort','2026-03-08 08:07:57'),('ead3b48f-1ac5-11f1-ba17-2cf05d836a82','dfb749ed-1ac5-11f1-ba17-2cf05d836a82','Bucket Sort','2026-03-08 08:07:57'),('ead3b707-1ac5-11f1-ba17-2cf05d836a82','dfb749ed-1ac5-11f1-ba17-2cf05d836a82','Order Statistics','2026-03-08 08:07:57'),('ead3b970-1ac5-11f1-ba17-2cf05d836a82','dfb749ed-1ac5-11f1-ba17-2cf05d836a82','Dutch National Flag Algorithm','2026-03-08 08:07:57'),('ead3bcd5-1ac5-11f1-ba17-2cf05d836a82','dfb74ae0-1ac5-11f1-ba17-2cf05d836a82','Bitwise Operators','2026-03-08 08:07:57'),('ead3be00-1ac5-11f1-ba17-2cf05d836a82','dfb74ae0-1ac5-11f1-ba17-2cf05d836a82','Odd Even Check','2026-03-08 08:07:57'),('ead3befb-1ac5-11f1-ba17-2cf05d836a82','dfb74ae0-1ac5-11f1-ba17-2cf05d836a82','Power of Two','2026-03-08 08:07:57'),('ead3bff3-1ac5-11f1-ba17-2cf05d836a82','dfb74ae0-1ac5-11f1-ba17-2cf05d836a82','Counting Set Bits','2026-03-08 08:07:57'),('ead3c0f0-1ac5-11f1-ba17-2cf05d836a82','dfb74ae0-1ac5-11f1-ba17-2cf05d836a82','XOR Tricks','2026-03-08 08:07:57'),('ead3c1fa-1ac5-11f1-ba17-2cf05d836a82','dfb74ae0-1ac5-11f1-ba17-2cf05d836a82','Subset Generation using Bits','2026-03-08 08:07:57'),('ead3c304-1ac5-11f1-ba17-2cf05d836a82','dfb74ae0-1ac5-11f1-ba17-2cf05d836a82','Bitmasking Techniques','2026-03-08 08:07:57'),('ead3c426-1ac5-11f1-ba17-2cf05d836a82','dfb74bd2-1ac5-11f1-ba17-2cf05d836a82','Trie','2026-03-08 08:07:57'),('ead3c513-1ac5-11f1-ba17-2cf05d836a82','dfb74bd2-1ac5-11f1-ba17-2cf05d836a82','Suffix Array Basics','2026-03-08 08:07:57'),('ead3c60c-1ac5-11f1-ba17-2cf05d836a82','dfb74bd2-1ac5-11f1-ba17-2cf05d836a82','Suffix Tree Basics','2026-03-08 08:07:57'),('ead3c707-1ac5-11f1-ba17-2cf05d836a82','dfb74bd2-1ac5-11f1-ba17-2cf05d836a82','B Tree and B Plus Tree','2026-03-08 08:07:57'),('ead3c814-1ac5-11f1-ba17-2cf05d836a82','dfb74bd2-1ac5-11f1-ba17-2cf05d836a82','Red Black Tree','2026-03-08 08:07:57'),('ead3c90b-1ac5-11f1-ba17-2cf05d836a82','dfb74bd2-1ac5-11f1-ba17-2cf05d836a82','Skip List','2026-03-08 08:07:57'),('ead3fa70-1ac5-11f1-ba17-2cf05d836a82','dfb74bd2-1ac5-11f1-ba17-2cf05d836a82','Sparse Table','2026-03-08 08:07:57'),('ead3fc79-1ac5-11f1-ba17-2cf05d836a82','dfb74bd2-1ac5-11f1-ba17-2cf05d836a82','Heavy Light Decomposition','2026-03-08 08:07:57'),('ead3fdd8-1ac5-11f1-ba17-2cf05d836a82','dfb74cc1-1ac5-11f1-ba17-2cf05d836a82','Divide and Conquer','2026-03-08 08:07:57'),('ead3ff03-1ac5-11f1-ba17-2cf05d836a82','dfb74cc1-1ac5-11f1-ba17-2cf05d836a82','Meet in the Middle','2026-03-08 08:07:57'),('ead40015-1ac5-11f1-ba17-2cf05d836a82','dfb74cc1-1ac5-11f1-ba17-2cf05d836a82','Randomized Algorithms','2026-03-08 08:07:57'),('ead40117-1ac5-11f1-ba17-2cf05d836a82','dfb74cc1-1ac5-11f1-ba17-2cf05d836a82','Advanced Sliding Window','2026-03-08 08:07:57'),('ead4021f-1ac5-11f1-ba17-2cf05d836a82','dfb74cc1-1ac5-11f1-ba17-2cf05d836a82','Advanced Two Pointers','2026-03-08 08:07:57'),('ead4033b-1ac5-11f1-ba17-2cf05d836a82','dfb74cc1-1ac5-11f1-ba17-2cf05d836a82','Monotonic Queue','2026-03-08 08:07:57'),('ead40445-1ac5-11f1-ba17-2cf05d836a82','dfb74cc1-1ac5-11f1-ba17-2cf05d836a82','Convex Hull','2026-03-08 08:07:57'),('ead40548-1ac5-11f1-ba17-2cf05d836a82','dfb74cc1-1ac5-11f1-ba17-2cf05d836a82','Line Sweep Algorithm','2026-03-08 08:07:57'),('ead40678-1ac5-11f1-ba17-2cf05d836a82','dfb74dac-1ac5-11f1-ba17-2cf05d836a82','LRU Cache','2026-03-08 08:07:57'),('ead4076c-1ac5-11f1-ba17-2cf05d836a82','dfb74dac-1ac5-11f1-ba17-2cf05d836a82','LFU Cache','2026-03-08 08:07:57'),('ead40868-1ac5-11f1-ba17-2cf05d836a82','dfb74dac-1ac5-11f1-ba17-2cf05d836a82','Design HashMap','2026-03-08 08:07:57'),('ead40ad1-1ac5-11f1-ba17-2cf05d836a82','dfb74dac-1ac5-11f1-ba17-2cf05d836a82','Design Stack with Min','2026-03-08 08:07:57'),('ead40c18-1ac5-11f1-ba17-2cf05d836a82','dfb74dac-1ac5-11f1-ba17-2cf05d836a82','Design Circular Queue','2026-03-08 08:07:57'),('ead40d15-1ac5-11f1-ba17-2cf05d836a82','dfb74dac-1ac5-11f1-ba17-2cf05d836a82','Rate Limiter','2026-03-08 08:07:57'),('ead40e1d-1ac5-11f1-ba17-2cf05d836a82','dfb74dac-1ac5-11f1-ba17-2cf05d836a82','Consistent Hashing','2026-03-08 08:07:57'),('ead40f14-1ac5-11f1-ba17-2cf05d836a82','dfb74dac-1ac5-11f1-ba17-2cf05d836a82','Design Autocomplete System','2026-03-08 08:07:57'),('f4af1b19-1ac5-11f1-ba17-2cf05d836a82','efbe6718-1ac5-11f1-ba17-2cf05d836a82','System Design Interview Overview','2026-03-08 08:08:14'),('f4af1eca-1ac5-11f1-ba17-2cf05d836a82','efbe6718-1ac5-11f1-ba17-2cf05d836a82','Preparation Strategies','2026-03-08 08:08:14'),('f4af2018-1ac5-11f1-ba17-2cf05d836a82','efbe6718-1ac5-11f1-ba17-2cf05d836a82','Fundamental Concepts','2026-03-08 08:08:14'),('f4af2126-1ac5-11f1-ba17-2cf05d836a82','efbe6718-1ac5-11f1-ba17-2cf05d836a82','Key Resources','2026-03-08 08:08:14'),('f4af2224-1ac5-11f1-ba17-2cf05d836a82','efbe6718-1ac5-11f1-ba17-2cf05d836a82','Performance Tips','2026-03-08 08:08:14'),('f4af236b-1ac5-11f1-ba17-2cf05d836a82','efbe6da1-1ac5-11f1-ba17-2cf05d836a82','Availability and Consistency','2026-03-08 08:08:14'),('f4af2466-1ac5-11f1-ba17-2cf05d836a82','efbe6da1-1ac5-11f1-ba17-2cf05d836a82','Back-of-the-envelope Calculations','2026-03-08 08:08:14'),('f4af2565-1ac5-11f1-ba17-2cf05d836a82','efbe6da1-1ac5-11f1-ba17-2cf05d836a82','System Design Building Blocks','2026-03-08 08:08:14'),('f4af2664-1ac5-11f1-ba17-2cf05d836a82','efbe6da1-1ac5-11f1-ba17-2cf05d836a82','Foundations of Distributed Storage Systems','2026-03-08 08:08:14'),('f4af278d-1ac5-11f1-ba17-2cf05d836a82','efbe6ed5-1ac5-11f1-ba17-2cf05d836a82','Database Types','2026-03-08 08:08:14'),('f4af28a6-1ac5-11f1-ba17-2cf05d836a82','efbe6ed5-1ac5-11f1-ba17-2cf05d836a82','Data Replication','2026-03-08 08:08:14'),('f4af29a6-1ac5-11f1-ba17-2cf05d836a82','efbe6ed5-1ac5-11f1-ba17-2cf05d836a82','Data Partitioning','2026-03-08 08:08:14'),('f4af2aa4-1ac5-11f1-ba17-2cf05d836a82','efbe6ed5-1ac5-11f1-ba17-2cf05d836a82','Database Trade-offs','2026-03-08 08:08:14'),('f4af2be3-1ac5-11f1-ba17-2cf05d836a82','efbe6fd4-1ac5-11f1-ba17-2cf05d836a82','Key-value Store Design','2026-03-08 08:08:14'),('f4af2cd9-1ac5-11f1-ba17-2cf05d836a82','efbe6fd4-1ac5-11f1-ba17-2cf05d836a82','Content Delivery Network (CDN)','2026-03-08 08:08:14'),('f4afc041-1ac5-11f1-ba17-2cf05d836a82','efbe6fd4-1ac5-11f1-ba17-2cf05d836a82','Distributed Cache Design','2026-03-08 08:08:14'),('f4afc26d-1ac5-11f1-ba17-2cf05d836a82','efbe6fd4-1ac5-11f1-ba17-2cf05d836a82','Distributed Messaging Queue','2026-03-08 08:08:14'),('f4afc387-1ac5-11f1-ba17-2cf05d836a82','efbe6fd4-1ac5-11f1-ba17-2cf05d836a82','Pub-Sub Systems','2026-03-08 08:08:14'),('f4afc4e3-1ac5-11f1-ba17-2cf05d836a82','efbe70f8-1ac5-11f1-ba17-2cf05d836a82','Rate Limiter Design','2026-03-08 08:08:14'),('f4afc5e4-1ac5-11f1-ba17-2cf05d836a82','efbe70f8-1ac5-11f1-ba17-2cf05d836a82','Blob Store Design','2026-03-08 08:08:14'),('f4afc723-1ac5-11f1-ba17-2cf05d836a82','efbe725d-1ac5-11f1-ba17-2cf05d836a82','Distributed Search Systems','2026-03-08 08:08:14'),('f4afc819-1ac5-11f1-ba17-2cf05d836a82','efbe725d-1ac5-11f1-ba17-2cf05d836a82','Distributed System Communication','2026-03-08 08:08:14'),('f4afc949-1ac5-11f1-ba17-2cf05d836a82','efbe7351-1ac5-11f1-ba17-2cf05d836a82','Design YouTube','2026-03-08 08:08:14'),('f4afca55-1ac5-11f1-ba17-2cf05d836a82','efbe7351-1ac5-11f1-ba17-2cf05d836a82','Design Google Maps','2026-03-08 08:08:14'),('f4afcb5f-1ac5-11f1-ba17-2cf05d836a82','efbe7351-1ac5-11f1-ba17-2cf05d836a82','Design Uber','2026-03-08 08:08:14'),('f4afcc60-1ac5-11f1-ba17-2cf05d836a82','efbe7351-1ac5-11f1-ba17-2cf05d836a82','Design Instagram','2026-03-08 08:08:14'),('f4afcd94-1ac5-11f1-ba17-2cf05d836a82','efbe7457-1ac5-11f1-ba17-2cf05d836a82','Concluding Building Blocks Discussion','2026-03-08 08:08:14'),('f4afce94-1ac5-11f1-ba17-2cf05d836a82','efbe7457-1ac5-11f1-ba17-2cf05d836a82','RESHADED Problem-Solving Approach','2026-03-08 08:08:14'),('f4afcfbc-1ac5-11f1-ba17-2cf05d836a82','efbe754a-1ac5-11f1-ba17-2cf05d836a82','Design News Feed System','2026-03-08 08:08:14'),('f4afd0ba-1ac5-11f1-ba17-2cf05d836a82','efbe754a-1ac5-11f1-ba17-2cf05d836a82','Design Web Crawler','2026-03-08 08:08:14'),('f4afd1bd-1ac5-11f1-ba17-2cf05d836a82','efbe754a-1ac5-11f1-ba17-2cf05d836a82','Design WhatsApp','2026-03-08 08:08:14'),('f4afd2c0-1ac5-11f1-ba17-2cf05d836a82','efbe754a-1ac5-11f1-ba17-2cf05d836a82','Design Typeahead Suggestion','2026-03-08 08:08:14'),('f4afd3c6-1ac5-11f1-ba17-2cf05d836a82','efbe754a-1ac5-11f1-ba17-2cf05d836a82','Design Collaborative Editing Service (Google Docs)','2026-03-08 08:08:14'),('f4afd4e8-1ac5-11f1-ba17-2cf05d836a82','efbe7630-1ac5-11f1-ba17-2cf05d836a82','Google File System (GFS)','2026-03-08 08:08:14'),('f4afd5e2-1ac5-11f1-ba17-2cf05d836a82','efbe7630-1ac5-11f1-ba17-2cf05d836a82','Google BigTable','2026-03-08 08:08:14'),('f4afd6e6-1ac5-11f1-ba17-2cf05d836a82','efbe7630-1ac5-11f1-ba17-2cf05d836a82','Many-core Key-value Store','2026-03-08 08:08:14'),('f4afd7e8-1ac5-11f1-ba17-2cf05d836a82','efbe7630-1ac5-11f1-ba17-2cf05d836a82','Scaling Memcache','2026-03-08 08:08:14'),('f4afd8e6-1ac5-11f1-ba17-2cf05d836a82','efbe7630-1ac5-11f1-ba17-2cf05d836a82','Amazon DynamoDB','2026-03-08 08:08:14'),('f4afda07-1ac5-11f1-ba17-2cf05d836a82','efbe7726-1ac5-11f1-ba17-2cf05d836a82','Two-phase Locking (2PL)','2026-03-08 08:08:14'),('f4afdafc-1ac5-11f1-ba17-2cf05d836a82','efbe7726-1ac5-11f1-ba17-2cf05d836a82','Google Chubby Locking Service','2026-03-08 08:08:14'),('f4afdc0a-1ac5-11f1-ba17-2cf05d836a82','efbe7726-1ac5-11f1-ba17-2cf05d836a82','ZooKeeper','2026-03-08 08:08:14'),('f4afdd36-1ac5-11f1-ba17-2cf05d836a82','efbe7812-1ac5-11f1-ba17-2cf05d836a82','MapReduce','2026-03-08 08:08:14'),('f4afde35-1ac5-11f1-ba17-2cf05d836a82','efbe7812-1ac5-11f1-ba17-2cf05d836a82','Apache Kafka','2026-03-08 08:08:14'),('f4afdf60-1ac5-11f1-ba17-2cf05d836a82','efbe78fb-1ac5-11f1-ba17-2cf05d836a82','Two-phase Commit (2PC)','2026-03-08 08:08:14'),('f4afe05d-1ac5-11f1-ba17-2cf05d836a82','efbe78fb-1ac5-11f1-ba17-2cf05d836a82','Paxos Consensus Algorithm','2026-03-08 08:08:14'),('f4afe161-1ac5-11f1-ba17-2cf05d836a82','efbe78fb-1ac5-11f1-ba17-2cf05d836a82','Raft Consensus Algorithm','2026-03-08 08:08:14'),('f4b000af-1ac5-11f1-ba17-2cf05d836a82','efbe79e2-1ac5-11f1-ba17-2cf05d836a82','Spectacular Failures Case Studies','2026-03-08 08:08:14'),('f4b002af-1ac5-11f1-ba17-2cf05d836a82','efbe79e2-1ac5-11f1-ba17-2cf05d836a82','Concluding Remarks','2026-03-08 08:08:14');
/*!40000 ALTER TABLE `prepkarta_subchapters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prepkarta_subjects`
--

DROP TABLE IF EXISTS `prepkarta_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prepkarta_subjects` (
  `id` char(36) NOT NULL,
  `name` varchar(80) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prepkarta_subjects`
--

LOCK TABLES `prepkarta_subjects` WRITE;
/*!40000 ALTER TABLE `prepkarta_subjects` DISABLE KEYS */;
INSERT INTO `prepkarta_subjects` VALUES ('2f9546e9-1aba-11f1-ba17-2cf05d836a82','DSA','2026-03-08 06:43:58'),('2f96375f-1aba-11f1-ba17-2cf05d836a82','System Design','2026-03-08 06:43:58'),('bc932b1d-1abe-11f1-ba17-2cf05d836a82','Low Level Design','2026-03-08 07:16:33'),('d2dbaf97-1abe-11f1-ba17-2cf05d836a82','API Design','2026-03-08 07:17:10');
/*!40000 ALTER TABLE `prepkarta_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prepkarta_user_answer_history`
--

DROP TABLE IF EXISTS `prepkarta_user_answer_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prepkarta_user_answer_history` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `concept_id` char(36) NOT NULL,
  `question_id` char(36) NOT NULL,
  `selected_options` json NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT '0',
  `repetition_level` int NOT NULL DEFAULT '0',
  `repeat_after_attempts` int NOT NULL DEFAULT '0',
  `time_spent_seconds` int NOT NULL DEFAULT '0',
  `attempted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_prepkarta_answer_user_concept` (`user_id`,`concept_id`,`attempted_at`),
  KEY `idx_prepkarta_answer_question` (`question_id`),
  KEY `fk_prepkarta_answer_concept` (`concept_id`),
  CONSTRAINT `fk_prepkarta_answer_concept` FOREIGN KEY (`concept_id`) REFERENCES `prepkarta_concepts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_prepkarta_answer_question` FOREIGN KEY (`question_id`) REFERENCES `prepkarta_questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_prepkarta_answer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prepkarta_user_answer_history`
--

LOCK TABLES `prepkarta_user_answer_history` WRITE;
/*!40000 ALTER TABLE `prepkarta_user_answer_history` DISABLE KEYS */;
INSERT INTO `prepkarta_user_answer_history` VALUES ('1696cbef-1abb-11f1-ba17-2cf05d836a82','8a32df72-1aa8-11f1-ba17-2cf05d836a82','2f99d0c7-1aba-11f1-ba17-2cf05d836a82','2f9c61ca-1aba-11f1-ba17-2cf05d836a82','[\"2f9f9688-1aba-11f1-ba17-2cf05d836a82\"]',1,0,0,40,'2026-03-08 06:50:26'),('5de20ca3-1abc-11f1-ba17-2cf05d836a82','8a32df72-1aa8-11f1-ba17-2cf05d836a82','2f99d0c7-1aba-11f1-ba17-2cf05d836a82','2f9d5e77-1aba-11f1-ba17-2cf05d836a82','[\"2f9f9f15-1aba-11f1-ba17-2cf05d836a82\", \"2f9fa06f-1aba-11f1-ba17-2cf05d836a82\"]',1,0,0,38,'2026-03-08 06:59:35');
/*!40000 ALTER TABLE `prepkarta_user_answer_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prepkarta_user_concept_progress`
--

DROP TABLE IF EXISTS `prepkarta_user_concept_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prepkarta_user_concept_progress` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `concept_id` char(36) NOT NULL,
  `last_question_index` int NOT NULL DEFAULT '0',
  `mastery_score` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `attempts_count` int NOT NULL DEFAULT '0',
  `correct_answers` int NOT NULL DEFAULT '0',
  `wrong_answers` int NOT NULL DEFAULT '0',
  `total_practice_seconds` int NOT NULL DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_prepkarta_user_concept_progress` (`user_id`,`concept_id`),
  KEY `idx_prepkarta_user_concept_progress_user` (`user_id`),
  KEY `fk_prepkarta_user_concept_progress_concept` (`concept_id`),
  CONSTRAINT `fk_prepkarta_user_concept_progress_concept` FOREIGN KEY (`concept_id`) REFERENCES `prepkarta_concepts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_prepkarta_user_concept_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prepkarta_user_concept_progress`
--

LOCK TABLES `prepkarta_user_concept_progress` WRITE;
/*!40000 ALTER TABLE `prepkarta_user_concept_progress` DISABLE KEYS */;
INSERT INTO `prepkarta_user_concept_progress` VALUES ('16997efd-1abb-11f1-ba17-2cf05d836a82','8a32df72-1aa8-11f1-ba17-2cf05d836a82','2f99d0c7-1aba-11f1-ba17-2cf05d836a82',2,1.0000,2,2,0,78,'2026-03-08 06:59:35');
/*!40000 ALTER TABLE `prepkarta_user_concept_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` char(36) NOT NULL,
  `role_id` char(36) NOT NULL,
  `permission_id` char(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_role_permission` (`role_id`,`permission_id`),
  KEY `fk_role_permissions_permission` (`permission_id`),
  CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES ('9f3d0ae0-1a08-11f1-ba17-2cf05d836a82','9f3aeed9-1a08-11f1-ba17-2cf05d836a82','9f3b72ae-1a08-11f1-ba17-2cf05d836a82'),('9f3d0cb1-1a08-11f1-ba17-2cf05d836a82','9f3aeed9-1a08-11f1-ba17-2cf05d836a82','9f3b7561-1a08-11f1-ba17-2cf05d836a82'),('9f3d0bc4-1a08-11f1-ba17-2cf05d836a82','9f3aeed9-1a08-11f1-ba17-2cf05d836a82','9f3b7628-1a08-11f1-ba17-2cf05d836a82'),('9f3d0d9c-1a08-11f1-ba17-2cf05d836a82','9f3aeed9-1a08-11f1-ba17-2cf05d836a82','9f3b769b-1a08-11f1-ba17-2cf05d836a82'),('9f3d070c-1a08-11f1-ba17-2cf05d836a82','9f3aeed9-1a08-11f1-ba17-2cf05d836a82','9f3b7710-1a08-11f1-ba17-2cf05d836a82'),('9f3d0805-1a08-11f1-ba17-2cf05d836a82','9f3aeed9-1a08-11f1-ba17-2cf05d836a82','9f3b7780-1a08-11f1-ba17-2cf05d836a82'),('9f3d09ea-1a08-11f1-ba17-2cf05d836a82','9f3aeed9-1a08-11f1-ba17-2cf05d836a82','9f3b7809-1a08-11f1-ba17-2cf05d836a82'),('9f3d08f3-1a08-11f1-ba17-2cf05d836a82','9f3aeed9-1a08-11f1-ba17-2cf05d836a82','9f3b788a-1a08-11f1-ba17-2cf05d836a82'),('9f3d05fb-1a08-11f1-ba17-2cf05d836a82','9f3aeed9-1a08-11f1-ba17-2cf05d836a82','9f3b78fd-1a08-11f1-ba17-2cf05d836a82'),('9f3d033e-1a08-11f1-ba17-2cf05d836a82','9f3aeed9-1a08-11f1-ba17-2cf05d836a82','9f3b7968-1a08-11f1-ba17-2cf05d836a82'),('9f3c1740-1a08-11f1-ba17-2cf05d836a82','9f3af151-1a08-11f1-ba17-2cf05d836a82','9f3b72ae-1a08-11f1-ba17-2cf05d836a82'),('9f3c1914-1a08-11f1-ba17-2cf05d836a82','9f3af151-1a08-11f1-ba17-2cf05d836a82','9f3b7561-1a08-11f1-ba17-2cf05d836a82'),('9f3c1822-1a08-11f1-ba17-2cf05d836a82','9f3af151-1a08-11f1-ba17-2cf05d836a82','9f3b7628-1a08-11f1-ba17-2cf05d836a82'),('9f3c1a07-1a08-11f1-ba17-2cf05d836a82','9f3af151-1a08-11f1-ba17-2cf05d836a82','9f3b769b-1a08-11f1-ba17-2cf05d836a82'),('9f3c1365-1a08-11f1-ba17-2cf05d836a82','9f3af151-1a08-11f1-ba17-2cf05d836a82','9f3b7710-1a08-11f1-ba17-2cf05d836a82'),('9f3c145d-1a08-11f1-ba17-2cf05d836a82','9f3af151-1a08-11f1-ba17-2cf05d836a82','9f3b7780-1a08-11f1-ba17-2cf05d836a82'),('9f3c164d-1a08-11f1-ba17-2cf05d836a82','9f3af151-1a08-11f1-ba17-2cf05d836a82','9f3b7809-1a08-11f1-ba17-2cf05d836a82'),('9f3c1553-1a08-11f1-ba17-2cf05d836a82','9f3af151-1a08-11f1-ba17-2cf05d836a82','9f3b788a-1a08-11f1-ba17-2cf05d836a82'),('9f3c1223-1a08-11f1-ba17-2cf05d836a82','9f3af151-1a08-11f1-ba17-2cf05d836a82','9f3b78fd-1a08-11f1-ba17-2cf05d836a82'),('9f3c0e73-1a08-11f1-ba17-2cf05d836a82','9f3af151-1a08-11f1-ba17-2cf05d836a82','9f3b7968-1a08-11f1-ba17-2cf05d836a82'),('9f3c9aeb-1a08-11f1-ba17-2cf05d836a82','9f3af20f-1a08-11f1-ba17-2cf05d836a82','9f3b769b-1a08-11f1-ba17-2cf05d836a82'),('9f3c99c2-1a08-11f1-ba17-2cf05d836a82','9f3af20f-1a08-11f1-ba17-2cf05d836a82','9f3b7809-1a08-11f1-ba17-2cf05d836a82'),('9f3c968d-1a08-11f1-ba17-2cf05d836a82','9f3af20f-1a08-11f1-ba17-2cf05d836a82','9f3b78fd-1a08-11f1-ba17-2cf05d836a82');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text,
  `is_system_role` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_roles_org` (`organization_id`),
  CONSTRAINT `fk_roles_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('9f3aeed9-1a08-11f1-ba17-2cf05d836a82',NULL,'Root','root','Global unrestricted root role',1,'2026-03-07 09:32:55','2026-03-07 09:32:55'),('9f3af151-1a08-11f1-ba17-2cf05d836a82',NULL,'Admin','admin','Organization administrator role',1,'2026-03-07 09:32:55','2026-03-07 09:32:55'),('9f3af20f-1a08-11f1-ba17-2cf05d836a82',NULL,'Member','member','Default organization member role',1,'2026-03-07 09:32:55','2026-03-07 09:32:55');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plans` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `description` text,
  `price_monthly` decimal(10,2) DEFAULT NULL,
  `price_yearly` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
INSERT INTO `subscription_plans` VALUES ('9f3eafc7-1a08-11f1-ba17-2cf05d836a82','todokarta-free','TodoKarta Free','Free access to TodoKarta',0.00,0.00,'USD',1,'2026-03-07 09:32:55'),('9f3eb253-1a08-11f1-ba17-2cf05d836a82','edukarta-module','EduKarta Module','Access to EduKarta only',9.99,99.00,'USD',1,'2026-03-07 09:32:55'),('9f3eb31d-1a08-11f1-ba17-2cf05d836a82','prepkarta-module','PrepKarta Module','Access to PrepKarta only',14.99,149.00,'USD',1,'2026-03-07 09:32:55');
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` char(36) NOT NULL,
  `raw_input` text NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` enum('Finance','Personal','Work','Contact','General') NOT NULL DEFAULT 'General',
  `tags` json NOT NULL,
  `task_time` time NOT NULL,
  `task_date` date NOT NULL,
  `recurring` enum('none','daily','weekly','monthly','yearly') NOT NULL DEFAULT 'none',
  `due_date` datetime NOT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('pending','done') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_task_date` (`task_date`),
  KEY `idx_due_date` (`due_date`),
  KEY `idx_recurring` (`recurring`),
  KEY `idx_featured` (`featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES ('583bdb79-d9b1-4313-97f8-6c27b5f3452a','dsfdsf','dsfdsf','General','[]','08:00:00','2024-07-26','none','2024-07-26 08:00:00',0,'pending','2026-03-10 03:32:40','2026-03-10 03:32:40');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_module_access`
--

DROP TABLE IF EXISTS `user_module_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_module_access` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `module_id` char(36) NOT NULL,
  `access_granted` tinyint(1) NOT NULL DEFAULT '1',
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_module_access` (`user_id`,`module_id`),
  KEY `fk_user_module_access_module` (`module_id`),
  CONSTRAINT `fk_user_module_access_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_module_access_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_module_access`
--

LOCK TABLES `user_module_access` WRITE;
/*!40000 ALTER TABLE `user_module_access` DISABLE KEYS */;
INSERT INTO `user_module_access` VALUES ('296181ae-1aa4-11f1-ba17-2cf05d836a82','d9063124-1aa3-11f1-ba17-2cf05d836a82','9f3e2570-1a08-11f1-ba17-2cf05d836a82',1,NULL,'2026-03-08 04:06:19'),('545fe95b-1a0d-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','9f3e2227-1a08-11f1-ba17-2cf05d836a82',1,NULL,'2026-03-07 10:06:37'),('7d5c9859-1a2a-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','9f3e2570-1a08-11f1-ba17-2cf05d836a82',1,NULL,'2026-03-07 13:35:21'),('eb265a7d-1aa8-11f1-ba17-2cf05d836a82','8a32df72-1aa8-11f1-ba17-2cf05d836a82','9f3e2665-1a08-11f1-ba17-2cf05d836a82',1,NULL,'2026-03-08 04:40:22'),('edeaa5d4-1aa8-11f1-ba17-2cf05d836a82','b578bfdf-1aa8-11f1-ba17-2cf05d836a82','9f3e2665-1a08-11f1-ba17-2cf05d836a82',1,NULL,'2026-03-08 04:40:27');
/*!40000 ALTER TABLE `user_module_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `role_id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_role` (`user_id`,`role_id`),
  KEY `idx_user_roles_user` (`user_id`),
  KEY `idx_user_roles_role` (`role_id`),
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES ('63a590b7-1aa8-11f1-ba17-2cf05d836a82','63a4cef7-1aa8-11f1-ba17-2cf05d836a82','9f3af151-1a08-11f1-ba17-2cf05d836a82','2026-03-08 04:36:35'),('8a3377a9-1aa8-11f1-ba17-2cf05d836a82','8a32df72-1aa8-11f1-ba17-2cf05d836a82','9f3af20f-1a08-11f1-ba17-2cf05d836a82','2026-03-08 04:37:40'),('9597c6e2-1aa3-11f1-ba17-2cf05d836a82','9596e196-1aa3-11f1-ba17-2cf05d836a82','9f3af151-1a08-11f1-ba17-2cf05d836a82','2026-03-08 04:02:11'),('9f3d8423-1a08-11f1-ba17-2cf05d836a82','9f3a050a-1a08-11f1-ba17-2cf05d836a82','9f3aeed9-1a08-11f1-ba17-2cf05d836a82','2026-03-07 09:32:55'),('b579afa0-1aa8-11f1-ba17-2cf05d836a82','b578bfdf-1aa8-11f1-ba17-2cf05d836a82','9f3af20f-1a08-11f1-ba17-2cf05d836a82','2026-03-08 04:38:52'),('bd9097ba-1a08-11f1-ba17-2cf05d836a82','bd907ae9-1a08-11f1-ba17-2cf05d836a82','9f3af151-1a08-11f1-ba17-2cf05d836a82','2026-03-07 09:33:46'),('d906a1b7-1aa3-11f1-ba17-2cf05d836a82','d9063124-1aa3-11f1-ba17-2cf05d836a82','9f3af20f-1a08-11f1-ba17-2cf05d836a82','2026-03-08 04:04:04'),('da9c579d-1a08-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','9f3af20f-1a08-11f1-ba17-2cf05d836a82','2026-03-07 09:34:35');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_subscriptions`
--

DROP TABLE IF EXISTS `user_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_subscriptions` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `plan_id` char(36) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `auto_renew` tinyint(1) NOT NULL DEFAULT '1',
  `payment_provider` varchar(50) DEFAULT NULL,
  `provider_subscription_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_plan` (`user_id`,`plan_id`),
  KEY `fk_user_subscriptions_plan` (`plan_id`),
  CONSTRAINT `fk_user_subscriptions_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`),
  CONSTRAINT `fk_user_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_subscriptions`
--

LOCK TABLES `user_subscriptions` WRITE;
/*!40000 ALTER TABLE `user_subscriptions` DISABLE KEYS */;
INSERT INTO `user_subscriptions` VALUES ('a2bc6300-1a08-11f1-ba17-2cf05d836a82','9f3a050a-1a08-11f1-ba17-2cf05d836a82','9f3eafc7-1a08-11f1-ba17-2cf05d836a82','active','2026-03-07 04:03:01',NULL,1,'system_default',NULL,'2026-03-07 09:33:01','2026-03-07 09:43:28'),('c5c74a1a-1a08-11f1-ba17-2cf05d836a82','bd907ae9-1a08-11f1-ba17-2cf05d836a82','9f3eafc7-1a08-11f1-ba17-2cf05d836a82','active','2026-03-07 04:04:00',NULL,1,'system_default',NULL,'2026-03-07 09:34:00','2026-03-07 09:45:04'),('defcdad9-1a08-11f1-ba17-2cf05d836a82','da9c3688-1a08-11f1-ba17-2cf05d836a82','9f3eafc7-1a08-11f1-ba17-2cf05d836a82','active','2026-03-07 04:04:42',NULL,1,'system_default',NULL,'2026-03-07 09:34:42','2026-03-07 09:34:42');
/*!40000 ALTER TABLE `user_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `email` varchar(191) NOT NULL,
  `full_name` varchar(120) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `password_hash` char(64) NOT NULL,
  `role` enum('root','superadmin','admin','member') NOT NULL DEFAULT 'member',
  `is_root` tinyint(1) NOT NULL DEFAULT '0',
  `organization_id` char(36) NOT NULL,
  `status` enum('active','invited','disabled') NOT NULL DEFAULT 'active',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_org` (`organization_id`),
  CONSTRAINT `fk_users_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('63a4cef7-1aa8-11f1-ba17-2cf05d836a82','admin@im.karta.ai.in',NULL,NULL,'240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9','admin',0,'524a35dc-1aa8-11f1-ba17-2cf05d836a82','active',1,'2026-03-08 04:36:35','2026-03-08 04:36:35'),('8a32df72-1aa8-11f1-ba17-2cf05d836a82','rkjha.it.in@gmail.com','Rajesh Kumar Jha','7022368966','5600376e863d2f57a053518f324ad3840b0bc2348b573af281a7b7cbe7a228c6','member',0,'524a35dc-1aa8-11f1-ba17-2cf05d836a82','active',1,'2026-03-08 04:37:40','2026-03-08 05:02:48'),('9596e196-1aa3-11f1-ba17-2cf05d836a82','srilata@chaitanya.karta.ai.in',NULL,NULL,'240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9','admin',0,'753cd715-1aa3-11f1-ba17-2cf05d836a82','active',1,'2026-03-08 04:02:11','2026-03-08 04:02:11'),('9f3a050a-1a08-11f1-ba17-2cf05d836a82','root@karta.ai.in',NULL,NULL,'ffeaab6b8ac737ab4cd68fb33c28cad1b9c7ea1417492b5da885767c4da04c5b','root',1,'9f38e409-1a08-11f1-ba17-2cf05d836a82','active',1,'2026-03-07 09:32:55','2026-03-07 09:32:55'),('b578bfdf-1aa8-11f1-ba17-2cf05d836a82','anoopjpr@gmail.com',NULL,NULL,'5600376e863d2f57a053518f324ad3840b0bc2348b573af281a7b7cbe7a228c6','member',0,'524a35dc-1aa8-11f1-ba17-2cf05d836a82','active',1,'2026-03-08 04:38:52','2026-03-08 04:38:52'),('bd907ae9-1a08-11f1-ba17-2cf05d836a82','admin@nps.karta.ai.in',NULL,NULL,'240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9','admin',0,'b1363e11-1a08-11f1-ba17-2cf05d836a82','active',1,'2026-03-07 09:33:46','2026-03-07 09:33:46'),('d9063124-1aa3-11f1-ba17-2cf05d836a82','trishajha@chaitanya.karta.ai.in',NULL,NULL,'5600376e863d2f57a053518f324ad3840b0bc2348b573af281a7b7cbe7a228c6','member',0,'753cd715-1aa3-11f1-ba17-2cf05d836a82','active',1,'2026-03-08 04:04:04','2026-03-08 04:04:04'),('da9c3688-1a08-11f1-ba17-2cf05d836a82','rishiraj@nps.karta.ai.in',NULL,NULL,'5600376e863d2f57a053518f324ad3840b0bc2348b573af281a7b7cbe7a228c6','member',0,'b1363e11-1a08-11f1-ba17-2cf05d836a82','active',1,'2026-03-07 09:34:35','2026-03-07 09:34:35');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-21 11:54:07
