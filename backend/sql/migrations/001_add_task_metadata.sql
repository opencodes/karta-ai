ALTER TABLE tasks
  ADD COLUMN tags JSON NOT NULL AFTER category,
  ADD COLUMN task_time TIME NOT NULL AFTER tags,
  ADD COLUMN task_date DATE NOT NULL AFTER task_time,
  ADD COLUMN recurring ENUM('none', 'daily', 'weekly', 'monthly', 'yearly') NOT NULL DEFAULT 'none' AFTER task_date,
  ADD INDEX idx_task_date (task_date),
  ADD INDEX idx_recurring (recurring);
