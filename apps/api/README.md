# Karta API (Node + Express + MySQL)
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
2. Install dependencies:
   `npm install`
3. Create schema:
mysql -h 192.168.1.17 -P 3306 -u root -p

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
