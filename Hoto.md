# How To Use RBAC

## 1. Initialize database
Run these in order:

```bash
mysql -u <user> -p <db_name> < backend/sql/schema.sql
mysql -u <user> -p <db_name> < backend/sql/init.sql
```

## 2. Start services

```bash
cd backend && npm run dev
cd ui && npm run dev
```

Backend default: `http://localhost:8000`
UI default: `http://localhost:3000`

## 3. Login test users

- `root@karta.ai.in / Root@123456`
- `admin@karta.ai.in / Admin@123456`
- `member@karta.ai.in / Member@123456`

## 4. Verify RBAC APIs
Use login token in `Authorization: Bearer <token>`.

- `GET /api/rbac/me`
  - Returns organization context, assigned roles, effective permissions, enabled modules.
- `GET /api/rbac/can/users.create`
- `GET /api/rbac/can/billing.view`

Protected test routes:

- `POST /api/rbac/test/users/create`
- `POST /api/rbac/test/tickets/assign`
- `GET /api/rbac/test/billing/view`

## 5. Authorization behavior

- `root` bypasses organization/module/permission checks.
- non-root users must satisfy all:
  - authenticated and active user
  - active organization
  - permission assigned through role mapping
  - required module enabled for organization (via `module_permissions` + `organization_modules`)

## 6. UI behavior

- Profile page shows:
  - organization
  - roles
  - effective permissions
  - enabled modules
- Subscription page requires `billing.view`.
- Buy/upgrade actions require `billing.update`.
- EduKarta and PrepKarta pages lock if module access is missing.

## 7. Main RBAC tables

- `organizations`
- `roles`
- `user_roles`
- `permissions`
- `role_permissions`
- `modules`
- `organization_modules`
- `module_permissions`
