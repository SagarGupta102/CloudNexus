# CloudNexus LMS

CloudNexus is a MERN learning management system prototype with the existing Cloud Computing learning path preserved and an additive LMS foundation for authentication, enrolment, progress, quizzes, recommendations, and certificates.

## Stack and structure

- `frontend/`: React 19, Vite, React Router, responsive CSS.
- `backend/`: Node.js, Express, Mongoose, JWT authentication, bcrypt password hashing, and PDFKit certificates.
- MongoDB Atlas: lessons, users, courses, enrolments, quiz attempts, and certificates.

## Run locally

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `MONGODB_URI` and `JWT_SECRET`. Keep these values private.
3. Install and start the backend:

   ```powershell
   cd backend
   npm install
   npm run seed
   npm start
   ```

4. Start the frontend in a second terminal:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

Set `VITE_API_URL` in the frontend environment when the API is not at `http://localhost:5000/api`.

## Current API surface

- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/courses`, `GET /api/courses/:slug`
- `POST /api/courses` (instructor/admin)
- `POST /api/courses/:slug/enroll` (authenticated learner)
- `GET /api/lessons`, `GET /api/lessons/:slug`
- `GET /api/learning/dashboard`
- `POST /api/learning/lessons/:lessonId/complete`
- `POST /api/learning/lessons/:lessonId/quiz`
- `POST /api/certificates/:slug`, `GET /api/certificates/verify/:certificateId`
- `POST /api/media/upload` (multipart upload, instructor/admin only; fields: `targetType`, `targetId`, `file`)

## Configuration and integrations

`backend/.env.example` contains placeholders for MongoDB Atlas, JWT, Cloudinary, and Razorpay test credentials. Cloudinary uploads use the official Node SDK and server-side credentials only. Configure the three Cloudinary variables before uploading. Course images accept JPG, PNG, and WebP up to 250 MB; lesson videos accept MP4, WebM, and QuickTime video up to 250 MB. The browser never receives the API secret. Razorpay order/signature verification is not enabled until its provider credentials are configured; the application does not simulate successful payments or expose provider secrets.

The recommendation endpoint is implemented as part of the learner dashboard. It first matches learner interests and course tags, then falls back to recently created published courses. It is intentionally transparent rule-based ranking, not machine learning.

## Verification

- Backend syntax: `node --check backend/server.js` and route checks.
- Frontend production build: `cd frontend; npm run build`.
- Frontend lint: `cd frontend; npm run lint`.
- Seed is repeatable and uses upserts; it does not drop collections or delete existing lesson records.

## Known limitations

The current repository had only the Cloud Computing lesson data. Course metadata for the seven requested learning paths is seeded, but additional subject lesson content and full instructor CRUD UI remain follow-up work. Cloudinary uploads require account configuration and an instructor/admin account before they can be verified end to end.
