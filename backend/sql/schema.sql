CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash CHAR(64) NOT NULL,
  role ENUM('admin', 'member') NOT NULL DEFAULT 'member',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id CHAR(36) PRIMARY KEY,
  raw_input TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  category ENUM('Finance', 'Personal', 'Work', 'Contact', 'General') NOT NULL DEFAULT 'General',
  tags JSON NOT NULL,
  task_time TIME NOT NULL,
  task_date DATE NOT NULL,
  recurring ENUM('none', 'daily', 'weekly', 'monthly', 'yearly') NOT NULL DEFAULT 'none',
  due_date DATETIME NOT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('pending', 'done') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_task_date (task_date),
  INDEX idx_due_date (due_date),
  INDEX idx_recurring (recurring),
  INDEX idx_featured (featured)
);
 
