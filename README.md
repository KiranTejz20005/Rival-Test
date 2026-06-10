# Task Management Application

A full-stack, production-grade task management application built with Node.js, Express, Prisma, PostgreSQL, and Next.js (App Router).

## Features

- **Authentication:** Secure JWT-based authentication with bcrypt password hashing.
- **Task Management:** Create, read, update, and delete tasks.
- **Filtering & Pagination:** Filter tasks by status, priority, and search title. Built-in pagination.
- **Activity Logging:** Tracks creation and updates to tasks automatically.
- **Modern UI:** Responsive design built with Tailwind CSS, React Hook Form, and Zod validation.

## Tech Stack

### Backend
- Node.js & Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Joi (Validation)
- JSON Web Tokens (JWT) & bcrypt

### Frontend
- Next.js (App Router)
- React & TypeScript
- Tailwind CSS
- Axios
- Zod & React Hook Form
- Lucide React (Icons)

## Quick Start

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

Create `.env` files in both directories.

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
Ensure you have PostgreSQL running and the `DATABASE_URL` is correct.

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

## API Endpoints

### Auth
- `POST /api/auth/signup`: Create a new account
- `POST /api/auth/login`: Login
- `POST /api/auth/refresh`: Refresh access token

### Tasks (Requires Bearer Token)
- `POST /api/tasks`: Create a task
- `GET /api/tasks`: Get all tasks (supports `?page=1&status=TODO`)
- `GET /api/tasks/:id`: Get single task
- `PATCH /api/tasks/:id`: Update task
- `DELETE /api/tasks/:id`: Delete task

## Error Handling
The application uses unified error handling formats to provide clear debugging information. All responses follow a standardized `{ error, status, timestamp, details }` structure for failed requests.
