# OmniKarta PHP Backend

Plain PHP port of the TypeScript backend under `backend/`.

Run locally with:

```bash
cd omnikarta-php-backend
php -S 127.0.0.1:8080 -t public
```

The app reads environment variables from `omnikarta-php-backend/.env`.

Notes:

- The main platform routes, auth, billing, org-admin, RBAC, TodoKarta, EduKarta, and PrepKarta APIs are ported to PHP.
- Knowledge upload/ask endpoints are wired, but the PDF/vector-store implementation is intentionally left as a `501` until a PHP PDF text extractor and vector adapter are added.
