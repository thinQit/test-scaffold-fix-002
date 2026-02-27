# test-scaffold-fix-002

A simple todo application with user authentication, personal task management (CRUD), and a dashboard to view and filter tasks.

## Features
- User registration, login, and logout with JWT
- Personal task CRUD with ownership checks
- Dashboard with pagination, search, and filters (status, priority, due date)
- Task detail view with edit/delete
- Profile management (display name, email)
- Accessible, mobile-first UI

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM (SQLite)
- Tailwind CSS
- Jest + Testing Library
- Playwright

## Prerequisites
- Node.js 18+
- npm

## Quick Start

### macOS/Linux
```bash
./install.sh
npm run dev
```

### Windows (PowerShell)
```powershell
./install.ps1
npm run dev
```

## Environment Variables
Create a `.env` file from `.env.example`:
- `DATABASE_URL` - SQLite connection string
- `JWT_SECRET` - JWT signing secret
- `NEXT_PUBLIC_API_URL` - Base URL for API requests

## Project Structure
```
src/
  app/                # Next.js App Router routes
  components/         # Reusable UI and layout components
  lib/                # Utilities and API helpers
  providers/          # Context providers
  types/              # Shared TypeScript types
prisma/               # Prisma schema and migrations
```

## API Endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Generate Prisma client and build
- `npm run start` - Start production server
- `npm run lint` - Run lint checks
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run Playwright tests

## Testing
- Unit tests: Jest + Testing Library
- Integration tests: Jest
- E2E tests: Playwright

```bash
npm run test
npm run test:e2e
```
