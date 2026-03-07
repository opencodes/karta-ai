-- Karta backend seed data
-- Run after: sql/schema.sql

-- organizations
INSERT INTO organizations (id, name, slug, owner_user_id, plan, is_active)
VALUES
  (UUID(), 'Root Organization', 'root-org', NULL, 'enterprise', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  plan = VALUES(plan),
  is_active = VALUES(is_active),
  updated_at = CURRENT_TIMESTAMP;

-- protected root user (non-deletable)
-- default password: Root@123456
INSERT INTO users (id, email, password_hash, role, is_root, organization_id, status, is_active)
VALUES
  (UUID(), 'root@karta.ai.in', SHA2('Root@123456', 256), 'root', 1, (SELECT id FROM organizations WHERE slug = 'root-org' LIMIT 1), 'active', 1)
ON DUPLICATE KEY UPDATE
  role = VALUES(role),
  is_root = VALUES(is_root),
  organization_id = VALUES(organization_id),
  status = VALUES(status),
  is_active = VALUES(is_active),
  updated_at = CURRENT_TIMESTAMP;

UPDATE organizations o
INNER JOIN users u ON (
  (o.slug = 'root-org' AND u.email = 'root@karta.ai.in')
)
SET o.owner_user_id = u.id,
    o.updated_at = CURRENT_TIMESTAMP;

-- roles
INSERT INTO roles (id, organization_id, name, slug, description, is_system_role)
VALUES
  (UUID(), NULL, 'Root', 'root', 'Global unrestricted root role', 1),
  (UUID(), NULL, 'Admin', 'admin', 'Organization administrator role', 1),
  (UUID(), NULL, 'Member', 'member', 'Default organization member role', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  is_system_role = VALUES(is_system_role),
  updated_at = CURRENT_TIMESTAMP;

-- permissions
INSERT INTO permissions (id, name, slug, resource, action, description)
VALUES
  (UUID(), 'Create Users', 'users.create', 'users', 'create', 'Create users'),
  (UUID(), 'Update Users', 'users.update', 'users', 'update', 'Update users'),
  (UUID(), 'Delete Users', 'users.delete', 'users', 'delete', 'Delete users'),
  (UUID(), 'View Users', 'users.view', 'users', 'view', 'View users'),
  (UUID(), 'Create Roles', 'roles.create', 'roles', 'create', 'Create roles'),
  (UUID(), 'Update Roles', 'roles.update', 'roles', 'update', 'Update roles'),
  (UUID(), 'Create Tickets', 'tickets.create', 'tickets', 'create', 'Create tickets'),
  (UUID(), 'Assign Tickets', 'tickets.assign', 'tickets', 'assign', 'Assign tickets'),
  (UUID(), 'View Billing', 'billing.view', 'billing', 'view', 'View billing'),
  (UUID(), 'Update Billing', 'billing.update', 'billing', 'update', 'Update billing')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  resource = VALUES(resource),
  action = VALUES(action),
  description = VALUES(description);

-- role permissions
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT UUID(), r.id, p.id
FROM roles r
INNER JOIN permissions p
WHERE r.slug = 'admin'
  AND p.slug IN (
    'users.create', 'users.update', 'users.delete', 'users.view',
    'roles.create', 'roles.update',
    'tickets.create', 'tickets.assign',
    'billing.view', 'billing.update'
  )
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO role_permissions (id, role_id, permission_id)
SELECT UUID(), r.id, p.id
FROM roles r
INNER JOIN permissions p
WHERE r.slug = 'member'
  AND p.slug IN (
    'users.view',
    'tickets.create',
    'billing.view'
  )
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO role_permissions (id, role_id, permission_id)
SELECT UUID(), r.id, p.id
FROM roles r
INNER JOIN permissions p
WHERE r.slug = 'root'
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- user role mappings (backward compatible with users.role)
INSERT INTO user_roles (id, user_id, role_id)
SELECT UUID(), u.id, r.id
FROM users u
INNER JOIN roles r ON r.slug = u.role AND r.is_system_role = 1
ON DUPLICATE KEY UPDATE role_id = role_id;

-- seed modules
INSERT INTO modules (id, name, slug, display_name, description, route_prefix, version, is_core, is_active)
VALUES
  (UUID(), 'todokarta', 'todokarta', 'TodoKarta', 'Core personal task management module', '/api/todokarta', '1.0.0', 1, 1),
  (UUID(), 'edukarta', 'edukarta', 'EduKarta', 'Education module', '/api/edukarta', '1.0.0', 0, 1),
  (UUID(), 'prepkarta', 'prepkarta', 'PrepKarta', 'Exam prep module', '/api/prepkarta', '1.0.0', 0, 1),
  (UUID(), 'crm', 'crm', 'CRM', 'Customer relationship management module', '/api/crm', '1.0.0', 0, 1),
  (UUID(), 'helpdesk', 'helpdesk', 'Helpdesk', 'Support and ticketing module', '/api/helpdesk', '1.0.0', 0, 1),
  (UUID(), 'analytics', 'analytics', 'Analytics', 'Business analytics module', '/api/analytics', '1.0.0', 0, 1),
  (UUID(), 'billing-core', 'billing', 'Billing', 'Billing and subscription module', '/api/billing', '1.0.0', 1, 1),
  (UUID(), 'hr', 'hr', 'HR', 'Human resources module', '/api/hr', '1.0.0', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  display_name = VALUES(display_name),
  description = VALUES(description),
  route_prefix = VALUES(route_prefix),
  version = VALUES(version),
  is_core = VALUES(is_core),
  is_active = VALUES(is_active),
  updated_at = CURRENT_TIMESTAMP;

-- permission -> module binding
INSERT INTO module_permissions (id, module_id, permission_id)
SELECT UUID(), m.id, p.id
FROM modules m
INNER JOIN permissions p ON (
  (m.slug = 'crm' AND p.slug IN ('users.create', 'users.update', 'users.delete', 'users.view', 'roles.create', 'roles.update')) OR
  (m.slug = 'helpdesk' AND p.slug IN ('tickets.create', 'tickets.assign')) OR
  (m.slug = 'billing' AND p.slug IN ('billing.view', 'billing.update'))
)
ON DUPLICATE KEY UPDATE module_id = VALUES(module_id);

-- seed plans
INSERT INTO subscription_plans (id, name, display_name, description, price_monthly, price_yearly, currency, is_active)
VALUES
  (UUID(), 'todokarta-free', 'TodoKarta Free', 'Free access to TodoKarta', 0.00, 0.00, 'USD', 1),
  (UUID(), 'edukarta-module', 'EduKarta Module', 'Access to EduKarta only', 9.99, 99.00, 'USD', 1),
  (UUID(), 'prepkarta-module', 'PrepKarta Module', 'Access to PrepKarta only', 14.99, 149.00, 'USD', 1),
  (UUID(), 'edu-prep-bundle', 'Edu + Prep Bundle', 'Discounted access to EduKarta and PrepKarta', 19.99, 199.00, 'USD', 1)
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  description = VALUES(description),
  price_monthly = VALUES(price_monthly),
  price_yearly = VALUES(price_yearly),
  currency = VALUES(currency),
  is_active = VALUES(is_active);

-- plan -> module mappings
INSERT INTO plan_modules (id, plan_id, module_id, is_enabled, usage_limit, api_rate_limit)
SELECT UUID(), sp.id, m.id, 1, NULL, NULL
FROM subscription_plans sp
INNER JOIN modules m ON (
  (sp.name = 'todokarta-free' AND m.slug = 'todokarta') OR
  (sp.name = 'edukarta-module' AND m.slug = 'edukarta') OR
  (sp.name = 'prepkarta-module' AND m.slug = 'prepkarta') OR
  (sp.name = 'edu-prep-bundle' AND m.slug IN ('edukarta', 'prepkarta'))
)
ON DUPLICATE KEY UPDATE
  is_enabled = VALUES(is_enabled),
  usage_limit = VALUES(usage_limit),
  api_rate_limit = VALUES(api_rate_limit);

-- organization module subscriptions
INSERT INTO organization_modules (id, organization_id, module_id, status, starts_at, expires_at)
SELECT UUID(), o.id, m.id,
       'active',
       UTC_TIMESTAMP(),
       NULL
FROM organizations o
INNER JOIN modules m ON (
  (o.slug = 'root-org')
)
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  starts_at = VALUES(starts_at),
  expires_at = VALUES(expires_at);
