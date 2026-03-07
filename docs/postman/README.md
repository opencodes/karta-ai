# Postman

Import collection:
- `docs/postman/Karta-Backend-Modules.postman_collection.json`

Run order:
1. Auth > Login
2. Billing > Buy Module (EduKarta - paid) or Billing > Buy Package (Edu+Prep)
3. Billing > My Access
4. Billing > My Subscriptions
5. Billing > Upgrade Options / Upgrade Plan
6. TodoKarta requests (free plan is auto-assigned)
7. PrepKarta > Exams

Notes:
- Bundle purchase request uses `{ "planName": "edu-prep-bundle" }`.
