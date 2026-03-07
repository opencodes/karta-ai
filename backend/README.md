# Karta API (Node + Express + MySQL)

## Folder Tree
```text
backend/
├── src/
│   ├── config/
│   │   └── prompts/
│   ├── middleware/
│   │   └── auth.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   └── tasks.ts
│   ├── services/
│   │   └── huggingFaceClient.ts
│   ├── utils/
│   │   ├── taskMapper.ts
│   │   ├── taskParser.ts
│   │   └── token.ts
│   ├── config.ts
│   ├── db.ts
│   ├── server.ts
│   └── types.ts
├── sql/
│   ├── migrations/
│   │   └── 001_add_task_metadata.sql
│   └── schema.sql
├── test/
│   └── taskParser.test.ts
├── .env.example
├── api.md
├── package.json
└── tsconfig.json
```

1. On the PC (MySQL server), edit MySQL config:
- `bind-address = 0.0.0.0` (or server LAN IP)
- Usually in `my.cnf` / `mysqld.cnf`

2. Create a LAN-access user (not `root`):
```sql
CREATE USER 'appuser'@'192.168.1.%' IDENTIFIED BY 'StrongPassword!';
GRANT ALL PRIVILEGES ON your_db.* TO 'appuser'@'192.168.1.%';
FLUSH PRIVILEGES;
```

3. Open firewall on PC for port `3306` (TCP).

4. Restart MySQL service on PC.

5. From laptop, test:
```bash
mysql -h 192.168.1.10 -P 3306 -u appuser -p
```
(Replace with your PC LAN IP.)

6. If it fails, verify:
- PC and laptop are on same subnet
- `ping 192.168.1.10` works
- Port reachable: `nc -vz 192.168.1.10 3306`

Security:
- Restrict user host (avoid `%` if possible)
- Use strong password
- Prefer VPN/SSH tunnel outside local network.

## Setup
1. Copy `.env.example` to `.env` and update DB/JWT values.
   - Optional AI parsing: set `HF_TOKEN` (and optionally `HF_MODEL`, `HF_MAX_TOKENS`).
2. Install dependencies:
   `npm install`
3. Create schema (single executable reset script):
mysql -h 192.168.1.17 -P 3306 -u root -p

   `mysql -u <user> -p <database> < sql/schema.sql`
   `mysql -u <user> -p <database> < sql/init.sql`
   - This script drops existing backend tables before recreating them.
   - `init.sql` inserts seed modules/plans and plan mappings.
   - Use migrations only for incremental changes in existing environments.
4. Run API:
   `npm run dev`

## Demo Login
- `admin@karta.ai / admin123`
- `member@karta.ai.in / member123`
- `root@karta.ai.in / Root@123456` (protected root user)

## Postman Collection
- Import: `docs/postman/Karta-Backend-Modules.postman_collection.json`
- Suggested run order:
  1. `Auth > Login` (stores `token`)
  2. `Billing > Buy Module (EduKarta - paid)` or `Billing > Buy Package (Edu+Prep)`
  3. `Billing > My Access`
  4. `EduKarta` / `PrepKarta` requests

## Endpoints
- `GET /health`

### Auth
- `POST /api/auth/signup`
  - body: `{ "email": "new@karta.ai", "password": "secret123" }`
  - response: `{ token, user }`
- `POST /api/auth/login`
  - body: `{ "email": "admin@karta.ai", "password": "admin123" }`
  - response: `{ token, user }`
- `GET /api/auth/me` (Bearer token required)
- `GET /api/auth/users` (Root only)
- `PATCH /api/auth/users/:id/role` (Root only)
  - body: `{ "role": "admin" }`, `{ "role": "superadmin" }` or `{ "role": "member" }`

### TodoKarta (Bearer token required, free for all users)
- `POST /api/todokarta/tasks/parse-create`
  - body: `{ "rawInput": "Pay electricity bill tomorrow at 4 PM" }`
  - Uses Hugging Face command parsing when `HF_TOKEN` is set, else falls back to rule-based parsing.
- `GET /api/todokarta/tasks?bucket=all|now|later|featured`
- `PATCH /api/todokarta/tasks/:id/feature`
  - body: `{ "featured": true }`

### PrepKarta (Bearer token required, purchase required for member users)
- `GET /api/prepkarta/exams`

### Billing / Access
- `GET /api/billing/catalog/modules`
- `GET /api/billing/catalog/packages`
- `GET /api/billing/my-access` (Bearer token required)
- `GET /api/billing/my-subscriptions` (Bearer token required)
- `GET /api/billing/upgrade-options` (Bearer token required)
- `POST /api/billing/buy-module` (Bearer token required)
  - body: `{ "moduleName": "edukarta" }`
- `POST /api/billing/buy-package` (Bearer token required)
  - body: `{ "planName": "edu-prep-bundle" }`
- `POST /api/billing/upgrade` (Bearer token required)
  - body: `{ "toPlanName": "edu-prep-bundle", "deactivateCurrent": true }`

Access model:
- `todokarta` is free and auto-assigned to every authenticated user.
- `edukarta` and `prepkarta` require paid module/package plans.

Migration note:
- `004_backfill_and_drop_legacy_billing.sql` migrates data from legacy billing tables into `user_subscriptions` and then drops legacy tables.
- Run `003` first, verify data, then run `004`.
