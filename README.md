# CloudNexus LMS

CloudNexus is a full-stack Learning Management System (LMS) built with the MERN stack. It provides separate experiences for learners, instructors, and administrators: learners can discover courses, study published lessons, attempt quizzes, track progress, earn certificates, and purchase premium courses; instructors can create and manage courses and media; administrators can approve content and manage the platform.

The project is structured as a Vite-powered React frontend and an Express/Mongoose backend connected to MongoDB Atlas. Authentication, role-based authorization, course approval, learner progress, certificates, Cloudinary media, and Razorpay Test Mode payments are implemented in the repository.

## Key features

- **Role-based accounts:** Student, instructor, and administrator roles with protected dashboard and API access.
- **Course catalogue:** Browse published courses, inspect course details, and distinguish free and premium access.
- **Course management:** Instructors create courses with descriptions, categories, levels, tags, thumbnails, pricing, and publication state.
- **Administrative approval:** Administrators review and approve or reject courses and lessons before publication.
- **Lessons and course content:** Published lessons support structured content, sections, examples, video URLs, Cloudinary media, and ordering.
- **Enrollment and progress:** Learners enroll in courses, mark lessons complete, view progress, and continue from their learning dashboard.
- **Quizzes and attempts:** Lessons can include multiple-choice quizzes with passing percentages, scoring, explanations, and recorded attempts.
- **Certificates:** Eligible learners can generate certificates, view certificate details, and verify certificates by certificate ID.
- **Admin dashboard:** Platform statistics, user management, instructor and student lists, course and lesson approval, enrollments, payment history, certificates, and platform settings.
- **Instructor dashboard:** Owned course management, course status visibility, media management, enrollment information, performance metrics, and profile settings.
- **Razorpay Test Mode:** Premium course orders are created through Razorpay and verified server-side using the Razorpay signature and captured-payment status.
- **Verified premium access:** A premium course becomes accessible only after the backend records a verified paid enrollment.
- **Cloudinary media:** Instructors and administrators can upload course images and lesson videos through the authenticated media workflow.
- **Recommendation support:** The learner dashboard uses course tags and learner interests for transparent rule-based recommendations, with a recent published-course fallback.

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Lucide React, responsive CSS |
| Backend | Node.js, Express 5, CommonJS |
| Database | MongoDB Atlas with Mongoose |
| Authentication | JWT bearer tokens, bcryptjs password hashing, role-based middleware |
| Payments | Razorpay Node SDK and Razorpay Test Mode |
| Media | Cloudinary Node SDK, Multer multipart uploads |
| Certificates | PDFKit certificate generation and certificate verification endpoints |

## User roles and permissions

| Role | Permissions |
| --- | --- |
| **Student** | Register and sign in, browse courses, enroll in free courses, purchase premium courses, access eligible lessons, complete lessons, attempt quizzes, track progress, and generate/view certificates. |
| **Instructor** | Create courses, view owned courses including pending, published, and unpublished courses, manage owned lesson/media content, view enrollments and performance, and update profile settings. |
| **Admin** | Access the admin dashboard, manage users, review courses and lessons, approve or reject content, inspect enrollments/payments/certificates, manage platform content, and update profile settings. |

The backend normalizes the legacy `learner` role to `student` for authorization. Admin routes require authentication and the `admin` role; instructor course and media operations require `instructor` or `admin` access.

## Project structure

```text
CloudNexus/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Certificate.js
│   │   ├── Course.js
│   │   ├── Enrollment.js
│   │   ├── Lesson.js
│   │   ├── Payment.js
│   │   ├── QuizAttempt.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── certificateRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── learningRoutes.js
│   │   ├── lessonRoutes.js
│   │   ├── mediaRoutes.js
│   │   └── paymentRoutes.js
│   ├── services/
│   │   └── cloudinary.js
│   ├── .env.example
│   ├── package.json
│   ├── seedLessons.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Local development on Windows PowerShell

### Prerequisites

- Node.js and npm
- A MongoDB Atlas cluster and database connection string
- Razorpay Test Mode keys if testing premium payments
- Cloudinary credentials if testing uploads

### 1. Clone and enter the repository

```powershell
git clone https://github.com/SagarGupta102/CloudNexus.git
Set-Location CloudNexus
```

### 2. Install backend dependencies

```powershell
Set-Location backend
npm install
```

### 3. Configure the backend

Copy the example file and edit the new file locally:

```powershell
Copy-Item .env.example .env
```

Use the exact variables listed below. Keep `.env` local and private.

### 4. Seed the available lesson/course data

```powershell
npm run seed
```

The seed script uses upserts and is intended to avoid deleting existing lesson records.

### 5. Start the backend

```powershell
npm start
```

The backend listens on `http://localhost:5000` by default, or on the port specified by `PORT`.

### 6. Install and start the frontend

Open a second PowerShell window:

```powershell
Set-Location C:\Users\SAGAR\Projects\CloudNexus\frontend
npm install
npm run dev
```

Vite prints the local frontend URL in the terminal. The frontend uses `http://localhost:5000/api` by default unless `VITE_API_URL` is set.

## Environment variables

### Backend: `backend/.env`

These are the exact backend variable names used by the application:

```dotenv
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
PORT=5000
JWT_SECRET=<long-random-jwt-secret>
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
RAZORPAY_KEY_ID=<razorpay-test-key-id>
RAZORPAY_KEY_SECRET=<razorpay-test-key-secret>
ADMIN_SETUP_SECRET=<long-random-admin-setup-secret>
```

`CLOUDINARY_API_SECRET`, `RAZORPAY_KEY_SECRET`, `JWT_SECRET`, and `ADMIN_SETUP_SECRET` are server-side secrets. Do not place them in frontend code or expose them through Vite.

### Frontend: `frontend/.env`

The frontend reads the following Vite variable:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

`VITE_API_URL` should point to the backend API base URL, including `/api`.

## MongoDB Atlas setup

1. Create a MongoDB Atlas project and cluster.
2. Create a database user with a strong password.
3. Add the development machine's IP address to the Atlas network access list, or use the appropriate restricted application network configuration.
4. Copy the Atlas connection string into `MONGODB_URI`.
5. Replace the placeholder username, password, cluster host, and database name.
6. Run `npm run seed` from `backend` if you want to initialize the repository's seed data.
7. Start the backend and confirm `GET /api/health` returns a successful response.

The application creates and uses collections for users, courses, lessons, enrollments, quiz attempts, payments, and certificates. Do not run destructive database commands against an existing project database.

## Razorpay Test Mode

Premium course payments use Razorpay's checkout flow:

1. The authenticated student requests a payment order from the backend.
2. The frontend opens Razorpay Checkout with the returned order details.
3. The frontend sends the checkout result to the backend.
4. The backend verifies the Razorpay signature, payment/order details, amount, currency, and captured-payment status.
5. Only after successful verification does the backend create or update the learner's paid enrollment.
6. Premium lesson access checks that paid enrollment before returning the lesson.

Use only Razorpay Test Mode credentials and test payment details during development. Never hardcode production credentials, bypass signature verification, or grant access from the frontend callback alone.

## API overview

All routes below are mounted under `/api`. Protected routes require a JWT bearer token unless otherwise noted.

### Health and authentication

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Backend health check |
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Authenticate a user |
| POST | `/auth/setup/admin` | Create/configure an admin using the server-side setup secret |
| GET | `/auth/me` | Return the authenticated profile |
| PATCH | `/auth/me` | Update the authenticated profile/password |

### Courses and lessons

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/courses` | List catalogue courses |
| GET | `/courses/:slug` | Get a course by slug |
| GET | `/courses/mine` | List instructor-owned courses |
| GET | `/courses/mine/enrollments` | Instructor enrollment data |
| GET | `/courses/mine/performance` | Instructor performance metrics |
| GET | `/courses/mine/media` | Instructor-owned media |
| DELETE | `/courses/mine/media/:targetType/:id` | Delete authorized owned media |
| POST | `/courses` | Create a course for an instructor/admin |
| POST | `/courses/:slug/enroll` | Enroll an authenticated student in a free course |
| GET | `/lessons` | List lessons |
| GET | `/lessons/:slug` | Get a published lesson, subject to premium access rules |
| POST | `/lessons` | Create lesson content for an instructor/admin |
| PATCH | `/lessons/:id/approval` | Update lesson approval for an instructor/admin workflow |

### Learning and certificates

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/learning/dashboard` | Learner dashboard data |
| POST | `/learning/lessons/:lessonId/complete` | Mark a lesson complete |
| POST | `/learning/lessons/:lessonId/quiz` | Submit a lesson quiz attempt |
| GET | `/certificates/mine` | List the authenticated learner's certificates |
| POST | `/certificates/generate/:slug` | Generate a certificate for an eligible course |
| POST | `/certificates/:slug` | Certificate generation endpoint |
| GET | `/certificates/verify/:certificateId` | Public certificate verification |

### Payments and media

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/payments/create-order` | Create a Razorpay order for a premium course |
| POST | `/payments/verify` | Verify a Razorpay payment and establish paid enrollment |
| POST | `/media/upload` | Upload an authorized course image or lesson video |

### Administration

All `/admin` routes require an authenticated admin:

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/admin/stats` | Platform statistics |
| GET | `/admin/users` | User listing |
| GET | `/admin/instructors` | Instructor listing |
| GET | `/admin/students` | Student listing |
| GET | `/admin/enrollments` | Enrollment listing |
| GET | `/admin/payments` | Payment history |
| GET | `/admin/certificates` | Certificate listing |
| GET | `/admin/courses` | Course management data |
| PATCH | `/admin/courses/:id/status` | Approve/reject or change course status |
| PATCH | `/admin/courses/:id/pricing` | Update course pricing |
| GET | `/admin/lessons` | Lesson management data |
| PATCH | `/admin/lessons/:id/approval` | Approve/reject a lesson |

## Testing and build commands

Run the backend syntax check:

```powershell
Set-Location C:\Users\SAGAR\Projects\CloudNexus\backend
npm test
```

Run the frontend production build:

```powershell
Set-Location C:\Users\SAGAR\Projects\CloudNexus\frontend
npm run build
```

Run the frontend linter:

```powershell
npm run lint
```

From the repository root, check for whitespace errors in the Git diff:

```powershell
Set-Location C:\Users\SAGAR\Projects\CloudNexus
git diff --check
```

## Security notes

- Never commit `.env` files, passwords, API keys, JWT secrets, setup secrets, or database credentials.
- Use strong, unique values for `JWT_SECRET` and `ADMIN_SETUP_SECRET`.
- Keep Cloudinary and Razorpay secret values on the backend only.
- Do not bypass backend Razorpay signature and payment verification.
- Keep authentication and role checks enabled for protected routes.
- Do not use real payment credentials or personal financial data for development testing.
- Restrict MongoDB Atlas network access and database-user permissions appropriately.

## Future improvements

The following are planned improvements, not claims about currently implemented functionality:

- Add automated unit, integration, and end-to-end test coverage.
- Add production deployment configuration and CI/CD workflows.
- Expand seeded lesson content across additional learning paths.
- Add richer instructor authoring tools for editing existing courses and lessons.
- Add more advanced analytics, reporting exports, and filtering.
- Add stronger operational monitoring, audit logs, and rate limiting.
- Add formal API documentation and versioning.

## Author

**Sagar Gupta**
[GitHub: SagarGupta102](https://github.com/SagarGupta102)

## License

No repository license has been specified.
