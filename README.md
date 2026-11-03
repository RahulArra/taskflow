# TaskFlow

TaskFlow is a small, responsive task-management app built with React and Express. It stores tasks in MongoDB and is organized into separate frontend and backend projects so the API can later be containerized independently.

## Features

- Create, list, view, edit, complete, and delete tasks
- Search tasks by title and filter by pending/completed status
- Task priorities, optional due dates, and creation/update timestamps
- Dashboard counts for all, pending, and completed tasks
- Input validation, clear API errors, and a database-aware health check
- Responsive layout and helpful loading, empty, success, and error states

## Technology

- Frontend: React, Vite, CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Configuration: dotenv and environment variables
- Tests: Node.js built-in test runner

## Project structure

```text
taskflow/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── .env.example
│   ├── app.js
│   ├── server.js
│   └── package.json
├── .gitignore
└── README.md
```

## Requirements

- Node.js 20.19+ and npm
- MongoDB Community Server running locally, or another reachable MongoDB instance

## Configuration

Copy the example files and update them for your environment. Do not commit `.env` files or real database credentials.

Backend, in `backend/.env`:

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskflow
FRONTEND_ORIGIN=http://localhost:5173
```

`FRONTEND_ORIGIN` is optional; when omitted, CORS permits requests from any origin, which is convenient for local development. Set it to the deployed frontend origin when needed.

Frontend, in `frontend/.env`:

```dotenv
VITE_API_URL=/api
VITE_BACKEND_URL=http://127.0.0.1:5000
```

The Vite development server proxies `/api` requests to `VITE_BACKEND_URL`. For a deployed frontend, set `VITE_API_URL` to the reachable API base URL (ending in `/api`). Vite environment variables are embedded at build time.

## Start the application

Start MongoDB first. For a local MongoDB installation, start the MongoDB service from Windows Services or run the installed `mongod` with a configured database path. No Docker setup is included in this phase.

In a terminal:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm start
```

In a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`). To run the backend with file watching, use `npm run dev` in `backend`.

## API

All task responses use JSON. Task IDs are MongoDB ObjectIds. List results are newest first.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Backend/database health (`200` when MongoDB is connected, otherwise `503`) |
| `GET` | `/version` | Application version |
| `GET` | `/api/tasks` | List tasks |
| `POST` | `/api/tasks` | Create a task |
| `GET` | `/api/tasks/:id` | Get one task |
| `PUT` | `/api/tasks/:id` | Update supplied task fields |
| `DELETE` | `/api/tasks/:id` | Delete a task |

`GET /api/tasks` accepts optional `status=all|pending|completed` and `search=<title text>` query parameters.

Task fields:

| Field | Type | Rules |
| --- | --- | --- |
| `title` | string | Required, 1–120 characters |
| `description` | string | Optional, up to 2,000 characters |
| `status` | string | `pending` or `completed`; defaults to `pending` |
| `priority` | string | `low`, `medium`, or `high`; defaults to `medium` |
| `dueDate` | date or `null` | Optional |
| `createdAt` | date | Set by the database |
| `updatedAt` | date | Set by the database |

### Example requests

Create a task:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:5000/api/tasks `
  -ContentType 'application/json' `
  -Body '{"title":"Prepare interview notes","description":"Review the project","priority":"high","dueDate":"2026-11-05"}'
```

List pending tasks matching a title:

```text
GET http://localhost:5000/api/tasks?status=pending&search=interview
```

Update a task (replace the ID with the `_id` from a response):

```powershell
Invoke-RestMethod -Method Put `
  -Uri http://localhost:5000/api/tasks/TASK_ID `
  -ContentType 'application/json' `
  -Body '{"status":"completed"}'
```

Delete a task:

```text
DELETE http://localhost:5000/api/tasks/TASK_ID
```

Errors return a JSON body with a human-readable `message`. Invalid input/IDs return `400`; missing tasks/routes return `404`.

## Tests and checks

Start MongoDB, then run:

```powershell
cd backend
npm test
```

The tests use the separate `taskflow_test` database by default and clear it before and after the test run. To use another test database, set `MONGO_URI` for the test process. Do not point it at a database containing data you need.

Frontend checks:

```powershell
cd frontend
npm run lint
npm run build
```
