# Task Management Application

A full-stack, production-grade task management application built with Node.js, Express, Prisma, PostgreSQL, and Next.js (App Router).

## Features

- **Authentication:** Secure JWT-based authentication with bcrypt password hashing, access + refresh token rotation, and logout.
- **Task Management:** Create, read, update, and delete tasks with full ownership enforcement.
- **Filtering & Pagination:** Filter tasks by status, priority, and search title. Built-in limit/offset pagination.
- **Search & Sort:** Search tasks by title (case-insensitive). Sort by due date, priority, or created date.
- **Admin Dashboard:** User management (list, search, view, update role, delete), global stats, activity log, and auth log viewer.
- **Task Attachments:** Upload files (images, PDFs, docs) to tasks via drag-and-drop or file picker.
- **Real-time Updates:** Server-Sent Events (SSE) push task changes (create, update, delete) live to clients.
- **Optimistic UI:** UI updates immediately before server confirmation, with automatic rollback on failure.
- **Security:** Helmet headers, rate limiting (auth: 20/15min, API: 200/15min), request body size limit (1 MB), CORS.
- **Activity Logging:** Tracks creation and updates to tasks automatically with field-level change tracking.
- **Input Validation:** All inputs validated via Joi schemas on the backend and Zod on the frontend.
- **Modern UI:** Responsive design built with Tailwind CSS (mobile + desktop), dark mode with persisted preference.
- **CI/CD:** GitHub Actions workflow for automated testing, type checking, and building.
- **Docker:** Docker Compose setup for one-command local development.

## Tech Stack

### Backend
- Node.js & Express
- TypeScript
- Prisma ORM (PostgreSQL)
- Joi (Validation)
- JSON Web Tokens (JWT) & bcrypt
- Helmet, express-rate-limit, morgan

### Frontend
- Next.js (App Router)
- React & TypeScript
- Tailwind CSS
- Axios
- Zod & React Hook Form
- Lucide React (Icons)

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+

### 1. Clone & Setup
Clone the repository and install dependencies for both backend and frontend.

```bash
# Backend Setup
cd backend
npm install

# Frontend Setup
cd frontend
npm install
```

### 2. Environment Variables

Create `.env` files from the provided examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

**Backend (`backend/.env`):**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/task_management
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Database Setup (Prisma)
Ensure PostgreSQL is running and `DATABASE_URL` is correct.

```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

### 4. Running the Application

Run the backend and frontend in separate terminals:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

## Docker Setup

Run the entire application (PostgreSQL + backend + frontend) with a single command:

```bash
docker compose up --build
```

This starts:
- **PostgreSQL 16** on port `5432`
- **Backend** on port `5000` (auto-runs migrations and seeds admin user)
- **Frontend** on port `3000`

The backend will automatically create default users on first startup:
- **Admin:** `admin@mail.com` / `Test@1234`
- **User (Student):** `testuser@mail.com` / `Test@1234`

To stop: `docker compose down`

## Testing

```bash
cd backend
npm test           # Run all tests (sequential)
npm run test:watch # Watch mode
npm run test:coverage # With coverage
```

All 71 integration and unit tests pass.

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Create a new account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (invalidate refresh token) |

### Tasks (requires Bearer token)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks` | Get tasks (supports `?status=TODO&priority=HIGH&search=term&page=1&limit=10`) |
| GET | `/api/tasks/:id` | Get single task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/:id/activity` | Get task activity log |
| GET | `/api/tasks/events` | SSE stream for real-time task updates (pass `?token=` or `Authorization` header) |
| POST | `/api/attachments/:taskId` | Upload file attachment to task |
| GET | `/api/attachments/:taskId` | List task attachments |
| DELETE | `/api/attachments/:attachmentId` | Delete attachment |

### Admin (requires admin role + Bearer token)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/stats` | Global task statistics |
| GET | `/api/admin/users` | List/search users (`?search=term`) |
| GET | `/api/admin/users/:id` | Get user details |
| GET | `/api/admin/users/:id/tasks` | Get user's tasks |
| PATCH | `/api/admin/users/:id` | Update user role |
| DELETE | `/api/admin/users/:id` | Delete user |
| POST | `/api/admin/users` | Create a user |
| POST | `/api/admin/users/batch` | Batch create users (skips duplicates) |
| GET | `/api/admin/activity` | Activity log |
| GET | `/api/admin/auth-logs` | Authentication logs |

## Error Handling
All API errors follow a standardized format:
```json
{ "error": "message", "status": 400, "timestamp": "2024-01-01T00:00:00.000Z", "details": {} }
```

## CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on every push and pull request to `main`/`master`:

- **Backend:** installs dependencies, runs TypeScript check, runs all tests with a PostgreSQL service container, builds
- **Frontend:** installs dependencies, runs lint, runs TypeScript check, builds

## Assumptions, Implementation Decisions, & Trade-offs

### Assumptions
- **User Roles:** The system assumes two primary roles: `USER` and `ADMIN`. Admins have global access to manage all users and view global statistics, while regular users can only manage their own tasks.
- **Environment:** It is assumed that the application will be run in a containerized environment (Docker) or a standard Node.js environment with access to a PostgreSQL database.
- **Real-time Updates:** Assumes clients support Server-Sent Events (SSE) for real-time task updates.

### Implementation Decisions
- **Next.js App Router:** Chosen for the frontend to leverage Server Components and modern routing paradigms, improving performance and developer experience.
- **Prisma ORM:** Used for database interactions to ensure type safety and simplify schema migrations with PostgreSQL.
- **JWT & Refresh Tokens:** Implemented a dual-token system for authentication to balance security (short-lived access tokens) and user experience (long-lived refresh tokens).
- **Zod & Joi Validation:** Zod is used on the frontend for form validation, while Joi is used on the backend for API request validation, ensuring robust data integrity across the stack.

### Trade-offs
- **SSE vs WebSockets:** Server-Sent Events (SSE) were chosen over WebSockets for real-time task updates because the communication is primarily unidirectional (server to client). This simplifies the architecture and avoids the overhead of managing bidirectional WebSocket connections, though it limits real-time client-to-server communication if needed in the future.
- **Optimistic UI:** Implementing Optimistic UI provides a snappy user experience but introduces complexity in state management and rollback logic if the server request fails.
- **Relational DB (PostgreSQL) vs NoSQL:** A relational database was chosen to enforce strict data integrity and relationships (e.g., users and tasks).