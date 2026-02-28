# Deployment Guide

This project is now tuned for production hosting on platforms like Render, Railway, Heroku, AWS, DigitalOcean, or any VPS. Follow these steps to deploy safely.

## 1. Prepare Environment

1. **Clone repository** to your server or CI environment.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Create `.env` file** using `.env.example` as a template and fill in real values (database URL, SMTP creds, session secret, etc.).

## 2. Database Setup

- **Development** uses simple JSON files in `data/` folder.
- **Production** should use a real database (PostgreSQL recommended).
  - Create database and user.
  - Set `DATABASE_URL` in `.env`.
  - Implement or migrate using a migration tool (read `migrations/run.js` for JSON migrations).
  - Add SQL migrations to create `assignments` table with `cutoff_percentage INTEGER`.

Example PostgreSQL DDL:

```sql
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  sub_type TEXT,
  due_date TIMESTAMP,
  max_marks INTEGER,
  cutoff_percentage INTEGER DEFAULT 50,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  class_id TEXT,
  status TEXT DEFAULT 'active'
);
```

## 3. Security Configuration

- Ensure `NODE_ENV=production`.
- Use strong `SESSION_SECRET` & `JWT_SECRET`.
- HTTPS must be enabled (platforms provide automatically or use a reverse proxy).
- TLS/SSL termination is required for secure cookies.
- Review `helmet()` headers and adjust as necessary.
- Validate all inputs on server side and limit file upload types/sizes.

## 4. Starting the App

Use the production script defined in `package.json`:

```bash
npm run start
```

Alternatively, you can use a process manager (`pm2`, `forever`) or platform-specific commands.

Render / Heroku / Railway will pick up the `Procfile` which runs `node server.js`.

## 5. Static & Media Files

- Build a proper static host or configure express to serve `public/` or equivalent.
- Uploaded files are stored under the `UPLOAD_DIR` (`./data/uploads` by default). In production mount a persistent volume or use object storage (S3, DigitalOcean Spaces) and update `upload` logic accordingly.

## 6. Roles & Access Control

The system supports `teacher`, `hod`, `newsletter`, `admin` roles. Protect routes using `requireRole()` middleware in `server.js`.

```js
app.post('/api/local/assignments', requireRole('teacher'), ...);
```

Add additional checks as needed.

## 7. Additional Services

- **SMTP**: configure for email invitations/notifications.
- **Google Classroom API**: set up service account JSON in environment if integrating.

## 8. Continuous Deployment

Connect your GitHub repo to the hosting platform; configure build commands (`npm install && npm run build` if applicable), and set environment variables on the service dashboard.

## 9. Monitoring & Logging

- Use `console.log`/`console.error` or integrate with a logging service (Loggly, Papertrail, etc.).
- Add monitoring scripts or endpoints (see `monitoring-script.js`) for health checks.

## 10. Final Checks

- Disable debug on front-end (`NODE_ENV` guards are also present).
- Run the migration script if using JSON storage:
  ```bash
  npm run migrate
  ```
- Test all user flows: login, create assignment with cutoff, classification preview, file upload, etc.

## 11. Updating Documentation

Update any remaining CIA references in markdown files, guides and quick reference documents to reflect the generic "Assessment" terminology.

---

Congratulations! Your system is now ready for public‑domain hosting with improved security, modular configuration, and assignment cutoff control.