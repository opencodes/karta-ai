-- Karta backend full reset schema
-- WARNING: This script drops existing tables before recreating them.

SET FOREIGN_KEY_CHECKS = 0;

DROP TRIGGER IF EXISTS trg_users_prevent_root_delete;

DROP TABLE IF EXISTS feature_usage_logs;
DROP TABLE IF EXISTS module_usage;
DROP TABLE IF EXISTS user_module_access;
DROP TABLE IF EXISTS edukarta_chapter_qa;
DROP TABLE IF EXISTS edukarta_subject_chapters;
DROP TABLE IF EXISTS edukarta_student_profiles;
DROP TABLE IF EXISTS user_subscriptions;
DROP TABLE IF EXISTS organization_subscriptions;
DROP TABLE IF EXISTS plan_module_features;
DROP TABLE IF EXISTS plan_modules;
DROP TABLE IF EXISTS module_permissions;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS organization_api_keys;
DROP TABLE IF EXISTS module_access_requests;
DROP TABLE IF EXISTS organization_modules;
DROP TABLE IF EXISTS module_features;
DROP TABLE IF EXISTS module_dependencies;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS subscription_plans;
DROP TABLE IF EXISTS modules;

-- legacy billing tables
DROP TABLE IF EXISTS user_package_purchases;
DROP TABLE IF EXISTS user_module_purchases;
DROP TABLE IF EXISTS package_modules;
DROP TABLE IF EXISTS module_packages;
DROP TABLE IF EXISTS module_catalog;

-- core tables
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE organizations (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(191) NOT NULL UNIQUE,
  owner_user_id CHAR(36) NULL,
  plan VARCHAR(100) NOT NULL DEFAULT 'starter',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash CHAR(64) NOT NULL,
  role ENUM('root', 'superadmin', 'admin', 'member') NOT NULL DEFAULT 'member',
  is_root TINYINT(1) NOT NULL DEFAULT 0,
  organization_id CHAR(36) NOT NULL,
  status ENUM('active', 'invited', 'disabled') NOT NULL DEFAULT 'active',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_org (organization_id),
  CONSTRAINT fk_users_organization
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT
);

CREATE TABLE edukarta_student_profiles (
  user_id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NULL,
  name VARCHAR(120) NOT NULL,
  board VARCHAR(80) NOT NULL,
  class_level VARCHAR(20) NOT NULL,
  subjects JSON NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_edukarta_student_profiles_org (organization_id),
  CONSTRAINT fk_edukarta_student_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_edukarta_student_profiles_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

CREATE TABLE edukarta_subject_chapters (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  organization_id CHAR(36) NULL,
  subject VARCHAR(80) NOT NULL,
  chapter_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_edukarta_user_subject_chapter (user_id, subject, chapter_name),
  INDEX idx_edukarta_subject_chapters_user_subject (user_id, subject),
  CONSTRAINT fk_edukarta_subject_chapters_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_edukarta_subject_chapters_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

CREATE TABLE edukarta_chapter_qa (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  organization_id CHAR(36) NULL,
  subject VARCHAR(80) NOT NULL,
  chapter VARCHAR(200) NOT NULL,
  question VARCHAR(400) NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_edukarta_chapter_qa_user_subject_chapter (user_id, subject, chapter),
  CONSTRAINT fk_edukarta_chapter_qa_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_edukarta_chapter_qa_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

ALTER TABLE organizations
  ADD CONSTRAINT fk_organizations_owner
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS trg_users_prevent_root_delete;
DELIMITER //
CREATE TRIGGER trg_users_prevent_root_delete
BEFORE DELETE ON users
FOR EACH ROW
BEGIN
  IF OLD.is_root = 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Root user cannot be deleted';
  END IF;
END//
DELIMITER ;

CREATE TABLE tasks (
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

CREATE TABLE modules (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(191) NOT NULL UNIQUE,
  display_name VARCHAR(255) NULL,
  description TEXT NULL,
  is_core TINYINT(1) NOT NULL DEFAULT 0,
  icon VARCHAR(255) NULL,
  route_prefix VARCHAR(100) NULL,
  version VARCHAR(50) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE module_features (
  id CHAR(36) PRIMARY KEY,
  module_id CHAR(36) NOT NULL,
  feature_key VARCHAR(100) NOT NULL,
  feature_name VARCHAR(255) NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_module_feature (module_id, feature_key),
  CONSTRAINT fk_module_features_module
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE subscription_plans (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NULL,
  description TEXT NULL,
  price_monthly DECIMAL(10,2) NULL,
  price_yearly DECIMAL(10,2) NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plan_modules (
  id CHAR(36) PRIMARY KEY,
  plan_id CHAR(36) NOT NULL,
  module_id CHAR(36) NOT NULL,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  usage_limit INT NULL,
  api_rate_limit INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_plan_module (plan_id, module_id),
  INDEX idx_plan_modules_plan (plan_id),
  CONSTRAINT fk_plan_modules_plan
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
  CONSTRAINT fk_plan_modules_module
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE plan_module_features (
  id CHAR(36) PRIMARY KEY,
  plan_module_id CHAR(36) NOT NULL,
  feature_id CHAR(36) NOT NULL,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  usage_limit INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_plan_module_feature (plan_module_id, feature_id),
  CONSTRAINT fk_plan_module_features_plan_module
    FOREIGN KEY (plan_module_id) REFERENCES plan_modules(id) ON DELETE CASCADE,
  CONSTRAINT fk_plan_module_features_feature
    FOREIGN KEY (feature_id) REFERENCES module_features(id) ON DELETE CASCADE
);

CREATE TABLE user_subscriptions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  plan_id CHAR(36) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  start_date TIMESTAMP NULL,
  end_date TIMESTAMP NULL,
  auto_renew TINYINT(1) NOT NULL DEFAULT 1,
  payment_provider VARCHAR(50) NULL,
  provider_subscription_id VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_plan (user_id, plan_id),
  CONSTRAINT fk_user_subscriptions_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_subscriptions_plan
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

CREATE TABLE organization_subscriptions (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  plan_id CHAR(36) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  start_date TIMESTAMP NULL,
  end_date TIMESTAMP NULL,
  auto_renew TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_org_plan (organization_id, plan_id),
  CONSTRAINT fk_org_subscriptions_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_org_subscriptions_plan
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

CREATE TABLE user_module_access (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  module_id CHAR(36) NOT NULL,
  access_granted TINYINT(1) NOT NULL DEFAULT 1,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_module_access (user_id, module_id),
  CONSTRAINT fk_user_module_access_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_module_access_module
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE module_usage (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  module_id CHAR(36) NOT NULL,
  feature_key VARCHAR(100) NULL,
  usage_count INT NOT NULL DEFAULT 0,
  usage_period VARCHAR(50) NOT NULL DEFAULT 'monthly',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_module_usage_user (user_id),
  INDEX idx_module_usage_module (module_id),
  CONSTRAINT fk_module_usage_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_module_usage_module
    FOREIGN KEY (module_id) REFERENCES modules(id)
);

CREATE TABLE feature_usage_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  module_id CHAR(36) NOT NULL,
  feature_id CHAR(36) NULL,
  request_payload JSON NULL,
  response_payload JSON NULL,
  tokens_used INT NULL,
  execution_time_ms INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_feature_logs_user (user_id),
  CONSTRAINT fk_feature_usage_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_feature_usage_logs_module
    FOREIGN KEY (module_id) REFERENCES modules(id),
  CONSTRAINT fk_feature_usage_logs_feature
    FOREIGN KEY (feature_id) REFERENCES module_features(id)
);

CREATE TABLE module_dependencies (
  id CHAR(36) PRIMARY KEY,
  module_id CHAR(36) NOT NULL,
  depends_on_module_id CHAR(36) NOT NULL,
  UNIQUE KEY uniq_module_dependency (module_id, depends_on_module_id),
  CONSTRAINT fk_module_dependencies_module
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  CONSTRAINT fk_module_dependencies_depends_on
    FOREIGN KEY (depends_on_module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE roles (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT NULL,
  is_system_role TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_roles_org (organization_id),
  CONSTRAINT fk_roles_organization
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE user_roles (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  role_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_role (user_id, role_id),
  INDEX idx_user_roles_user (user_id),
  INDEX idx_user_roles_role (role_id),
  CONSTRAINT fk_user_roles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE permissions (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(191) NOT NULL UNIQUE,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  description TEXT NULL
);

CREATE TABLE role_permissions (
  id CHAR(36) PRIMARY KEY,
  role_id CHAR(36) NOT NULL,
  permission_id CHAR(36) NOT NULL,
  UNIQUE KEY uniq_role_permission (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE organization_modules (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  module_id CHAR(36) NOT NULL,
  status ENUM('active', 'trial', 'expired', 'suspended') NOT NULL DEFAULT 'trial',
  starts_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_org_module (organization_id, module_id),
  INDEX idx_org_modules_org (organization_id),
  INDEX idx_org_modules_status (status),
  CONSTRAINT fk_org_modules_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_org_modules_module
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE module_permissions (
  id CHAR(36) PRIMARY KEY,
  module_id CHAR(36) NOT NULL,
  permission_id CHAR(36) NOT NULL,
  UNIQUE KEY uniq_module_permission (module_id, permission_id),
  CONSTRAINT fk_module_permissions_module
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  CONSTRAINT fk_module_permissions_permission
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE organization_api_keys (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  name VARCHAR(191) NOT NULL,
  key_hash CHAR(64) NOT NULL UNIQUE,
  key_prefix VARCHAR(32) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_used_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_org_api_keys_org (organization_id),
  CONSTRAINT fk_org_api_keys_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE module_access_requests (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  module_id CHAR(36) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reason TEXT NULL,
  review_note TEXT NULL,
  reviewed_by CHAR(36) NULL,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_module_requests_org (organization_id),
  INDEX idx_module_requests_user (user_id),
  INDEX idx_module_requests_status (status),
  CONSTRAINT fk_module_requests_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_module_requests_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_module_requests_module
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  CONSTRAINT fk_module_requests_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);
