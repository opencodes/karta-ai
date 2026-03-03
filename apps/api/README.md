# Karta API (Node + Express + MySQL)

## Setup
1. Copy `.env.example` to `.env` and update DB/JWT values.
2. Install dependencies:
   `npm install`
3. Create schema:
   `mysql -u <user> -p <database> < sql/schema.sql`
4. Run API:
   `npm run dev`

## Demo Login
- `admin@karta.ai / admin123`
- `member@karta.ai / member123`

## Endpoints
- `GET /health`

### Auth
- `POST /api/auth/login`
  - body: `{ "email": "admin@karta.ai", "password": "admin123" }`
  - response: `{ token, user }`
- `GET /api/auth/me` (Bearer token required)

### Tasks (Bearer token required)
- `POST /api/tasks/parse-create`
  - body: `{ "rawInput": "Pay electricity bill tomorrow at 4 PM" }`
- `GET /api/tasks?bucket=all|now|later|featured`
- `PATCH /api/tasks/:id/feature`
  - body: `{ "featured": true }`
