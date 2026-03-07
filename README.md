# Karta AI Monorepo

Repository-wide structure (trimmed to source/docs and key config files):

```text
karta-ai/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── prompts/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config.ts
│   │   ├── db.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── sql/
│   │   ├── migrations/
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
│   ├── action/
│   ├── marketing/
│   │   ├── snapshots/
│   │   └── index.html
│   └── prompt/
├── mobile/
├── run-all.sh
└── package-lock.json
```

## Service Readmes
- Backend setup/API: `backend/README.md`
- UI setup: `ui/README.md`
