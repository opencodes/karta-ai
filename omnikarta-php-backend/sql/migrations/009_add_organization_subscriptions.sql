CREATE TABLE IF NOT EXISTS organization_subscriptions (
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
