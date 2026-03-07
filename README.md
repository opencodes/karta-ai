# Karta AI Monorepo

Repository-wide structure (trimmed to source/docs and key config files):

```text
karta-ai/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── prompts/
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── moduleAccess.ts
│   │   ├── modules/
│   │   │   ├── config/
│   │   │   ├── core/
│   │   │   ├── edukarta/
│   │   │   ├── prepkarta/
│   │   │   ├── todokarta/
│   │   │   ├── runtime/
│   │   │   ├── loadModules.ts
│   │   │   └── types.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── billing.ts
│   │   │   └── tasks.ts
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config.ts
│   │   ├── db.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── sql/
│   │   ├── migrations/
│   │   │   ├── 001_add_task_metadata.sql
│   │   │   ├── 002_add_module_billing.sql
│   │   │   ├── 003_subscription_module_platform.sql
│   │   │   ├── 004_backfill_and_drop_legacy_billing.sql
│   │   │   └── 005_add_root_user_and_role_management.sql
│   │   ├── init.sql
│   │   └── schema.sql
│   ├── test/
│   ├── README.md
│   ├── api.md
│   ├── package.json
│   └── tsconfig.json
├── ui/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── context/
│   │   ├── data/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── auth/
│   │   ├── modules/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── README.md
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── pages/
│   │   │   └── LandingPage.tsx
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/
│   ├── architecture/
│   ├── action/
│   ├── marketing/
│   │   ├── snapshots/
│   │   └── index.html
│   ├── postman/
│   └── prompt/
├── mobile/
├── web/
├── run-all.sh
└── package-lock.json
```

## Service Readmes
- Backend setup/API: `backend/README.md`
- UI setup: `ui/README.md`

## Run The App (End-to-End)

### 1) Prerequisites
- Node.js 20+
- MySQL 8+

### 2) Setup Database
Run from repo root:

```bash
mysql -u <user> -p <database> < backend/sql/schema.sql
mysql -u <user> -p <database> < backend/sql/init.sql
```

This creates all tables and seeds:
- modules/plans
- protected root user

### 3) Configure Backend

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env`:
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `JWT_SECRET`

Default backend port is `8000`.

### 4) Install Dependencies

```bash
cd backend && npm install
cd ../ui && npm install
cd ../web && npm install
cd ..
```

### 5) Start Services

Backend:
```bash
cd backend
npm run dev
```

UI:
```bash
cd ui
npm run dev
```

Optional landing web app:
```bash
cd web
npm run dev
```

### 6) URLs
- Backend API: `http://localhost:8000`
- UI app: `http://localhost:3000`
- Web app (optional): `http://localhost:4000`

### 7) Default Users
- Root (non-deletable): `root@karta.ai.in / Root@123456`
- Member: `member@karta.ai.in / member123`

### 8) Notes
- `TodoKarta` is free and auto-assigned.
- `EduKarta` and `PrepKarta` require subscription purchase/upgrade.
