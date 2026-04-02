# Attendance System Base

Monorepo base structure for an attendance system with:

- Frontend: React (JSX) + Vite + Tailwind CSS + Ant Design
- Backend: Node.js (TypeScript) + Fastify + MySQL (`mysql2`)

## Project Structure

```text
attendance-system/
  apps/
    frontend/
      public/
      src/
      dist/
    backend/
      src/
        modules/
        config/
        db/migrations/
      dist/
```

## Quick Start

1. Install dependencies from the root:

```bash
npm install
```

2. Run frontend:

```bash
npm run dev:frontend
```

3. Run backend:

```bash
npm run dev:backend
```

## Build

```bash
npm run build
```

Backend build entry is generated at `apps/backend/dist/server.js`.

## Environment

Copy `apps/backend/.env.example` to `apps/backend/.env` and update values for your local MySQL setup.
