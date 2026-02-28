CIA Classroom Proxy - Server README

Overview

This small Express server proxies a few Google Classroom operations for the CIA dashboard:
- POST /api/create-course       -> create a course in Google Classroom
- POST /api/enroll-students     -> enroll students (by email) into a course
- POST /api/create-coursework   -> create coursework/assignment in a course
- GET  /api/courses             -> list locally persisted created courses

Why use the proxy?
- Avoid exposing server-side service account credentials directly in front-end code.
- Let the server persist created course metadata centrally for quick-open links.
- Allow organizations to use a service account with domain-wide delegation (recommended for automated teacher impersonation).

Quick start

1) Install dependencies

  cd "c:\\clgstuff\\internshipp\\New folder"
  npm install

2) Run the server

  npm start

The server listens on port 3000 by default. Set `PORT` in a `.env` file to change it.

Authentication modes

Mode A: Client-supplied access token (simple)
- The front-end can sign in a teacher using Google's client library (gapi) and then send the obtained access token to the server in the `Authorization: Bearer <token>` header.
- The server will forward the token to Google Classroom endpoints and act on behalf of the signed-in teacher.
- Pros: Simple, does not require server credentials. Cons: relies on the front-end to obtain tokens.

Mode B: Service account with domain-wide delegation (recommended for automation)
- Create a Google Cloud service account and enable domain-wide delegation for the service account.
- Grant the service account Classroom scopes and configure an admin account email to impersonate via `GOOGLE_IMPERSONATE_USER`.
- Provide the service account JSON (stringified) in environment variable `GOOGLE_SERVICE_ACCOUNT_JSON`.
- The server will use the service account to obtain access tokens and perform Classroom operations as the impersonated user.
- NOTE: Domain-wide delegation requires G Suite / Google Workspace admin configuration.

Environment variables

- PORT: optional, server port (default 3000)
- GOOGLE_SERVICE_ACCOUNT_JSON: optional, stringified service account JSON (if using service account flow)
- GOOGLE_IMPERSONATE_USER: required if using service-account flow; the email to impersonate (e.g., teacher@example.edu)

SMTP / Email (Local Classroom)

- To enable real email invites from the local-classroom feature, set the following env vars (SMTP credentials):
  - `SMTP_HOST` (e.g., smtp.gmail.com or smtp.sendgrid.net)
  - `SMTP_PORT` (e.g., 587 or 465)
  - `SMTP_USER` (SMTP username)
  - `SMTP_PASS` (SMTP password)
  - `SMTP_FROM` (optional, from address; defaults to `SMTP_USER`)

Example `.env` (not for source control):

```
PORT=3000
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_API_KEY
SMTP_FROM=school@example.edu
```

Local Classroom endpoints (new)
- `POST /api/local/create-class`  -> body: `{ name, description, owner }` returns created local class
- `POST /api/local/invite`        -> body: `{ classId, email, message }` creates invite and sends email with join link (if SMTP configured)
- `GET  /api/local/invite?token=` -> returns invite and class info for token
- `POST /api/local/upload`        -> multipart form-data: `token`, `name`, `email`, `file` — student upload
- `GET  /api/local/submissions?classId=` -> list submissions for a class
- `GET  /uploads/...`             -> static files for downloaded uploads

Data storage
- Simple JSON files under `data/`: `localClasses.json`, `invites.json`, `submissions.json`, and files under `data/uploads/`.

Security & notes
- This prototype uses filesystem JSON storage and is intended for testing and small pilots. For production, replace with a proper database and secure file storage.
- Invitations are token-based links — students do not need to sign up. They must provide the same email the invite was sent to for verification (basic check).

Running and testing
- Install deps and start the server:

```powershell
cd 'C:\clgstuff\internshipp\New folder'
npm install
npm start
```

- Create a class via the dashboard (teacher) or via POST to `/api/local/create-class`.
- Invite a student via the dashboard UI (teacher view > Invite Student) or via POST `/api/local/invite`.
- The invite email contains a link to `/invite.html?token=...` where the student can upload their assignment.


Examples

Create a course (curl, token-based mode):

curl -X POST http://localhost:3000/api/create-course \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "name":"Mathematics - Proactive - BCA2025","section":"Proactive learners","descriptionHeading":"CIA course","ownerId":"me" }'

Enroll students:

curl -X POST http://localhost:3000/api/enroll-students \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "courseId":"<COURSE_ID>", "students":["stu1@example.edu","stu2@example.edu"] }'

Create coursework:

curl -X POST http://localhost:3000/api/create-coursework \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "courseId":"<COURSE_ID>", "coursework": { "title":"CIA1 Assignment","description":"Submit","workType":"ASSIGNMENT","state":"PUBLISHED" } }'

Notes and security

- If using the client-supplied token flow, ensure TLS (https) is used in production.
- If using service accounts, never commit service account JSON to source control. Use secure environment injection.
- The server persists a simple `data/createdCourses.json` file with created course metadata. For production use, replace with a real DB.

Next steps for integration with dashboard front-end

- When "Use Server Proxy" is enabled in the dashboard UI, call these endpoints instead of direct gapi client operations.
- After creating a course via `POST /api/create-course`, the server returns the created course object; the front-end should store and display it in the `created-courses-list` area and optionally call GET `/api/courses` to sync.

