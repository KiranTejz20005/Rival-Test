# Task Management Application

A full-stack, production-grade task management application built with Node.js, Express, Prisma, PostgreSQL, and Next.js (App Router).

## Features

- **Authentication:** Secure JWT-based authentication with bcrypt password hashing, access + refresh token rotation, and logout.
- **Task Management:** Create, read, update, and delete tasks with full ownership enforcement.
- **Filtering & Pagination:** Filter tasks by status, priority, and search title. Built-in cursor-based pagination with limit/offset.
- **Admin Dashboard:** User management (list, search, view, update role, delete), global stats, and activity log.
- **Security:** Helmet headers, rate limiting (auth: 20/15min, API: 200/15min), request body size limit (1 MB), CORS.
- **Activity Logging:** Tracks creation and updates to tasks automatically.
- **Input Validation:** All inputs validated via Joi schemas on the backend and Zod on the frontend.
- **Modern UI:** Responsive design built with Tailwind CSS, React Hook Form, and Zod validation.
- **CI/CD:** GitHub Actions workflow for automated testing, type checking, and building.

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

## Testing

```bash
cd backend
npm test           # Run all tests (sequential)
npm run test:watch # Watch mode
npm run test:coverage # With coverage
```

All 47 integration and unit tests pass.

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

### Admin (requires admin role + Bearer token)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/stats` | Global task statistics |
| GET | `/api/admin/users` | List/search users (`?search=term`) |
| GET | `/api/admin/users/:id` | Get user details |
| GET | `/api/admin/users/:id/tasks` | Get user's tasks |
| PATCH | `/api/admin/users/:id` | Update user role |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/activity` | Activity log |

## Error Handling
All API errors follow a standardized format:
```json
{ "error": "message", "status": 400, "timestamp": "2024-01-01T00:00:00.000Z", "details": {} }
```

## CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on every push and pull request to `main`/`master`:

- **Backend:** installs dependencies, runs TypeScript check, runs all tests with a PostgreSQL service container, builds
- **Frontend:** installs dependencies, runs lint, runs TypeScript check, builds
