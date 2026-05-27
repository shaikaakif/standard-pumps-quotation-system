
# FILE: docs/deployment-guide.md

```md
# DEPLOYMENT GUIDE

# FRONTEND DEPLOYMENT

Platform:
Vercel

---

# BACKEND DEPLOYMENT

Platform:
Railway

---

# DATABASE

SQLite initially.

Future:
PostgreSQL.

---

# ENV VARIABLES

Frontend:
VITE_API_URL=

Backend:
DATABASE_URL=
SECRET_KEY=

---

# PWA REQUIREMENTS

- HTTPS
- manifest.json
- service worker

---

# DOMAIN STRUCTURE

Frontend:
app.standardpumps.com

Backend:
api.standardpumps.com

---

# IMPORTANT DEPLOYMENT NOTES

- never expose secrets
- enable CORS
- compress assets
- optimize images
- use lazy loading
```