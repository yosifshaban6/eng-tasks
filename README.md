# Eng Tasks - Task Management System

A production-ready REST API and web application for managing engineering tasks with real-time updates, activity logging, and comprehensive task management features.

## Features

### Backend

- **REST API** with Express.js and TypeScript
- **PostgreSQL database** with Prisma ORM
- **Real-time WebSocket updates** using Socket.io
- **Activity logging** for all task changes
- **caching** for improved performance
- **Rate limiting** for API protection
- **Swagger documentation** at `/api-docs`
- **Input validation** with Zod
- **Layered architecture** (Controller → Service → Repository)

### Frontend

- **Responsive dashboard** with task cards
- **Filtering** by status, priority, assignee, and search
- **Pagination** for large task lists
- **Task detail view** with inline editing
- **Activity timeline** showing all changes
- **Comment system** with real-time updates
- **Archive/Restore** functionality
- **WebSocket live updates** for collaborative work


## Production API

The Eng Tasks API is deployed and available for production use at:

### Base URL

https://eng-tasks-api.yourdomain.com/api/v1



## API Endpoints

| Method | Endpoint                     | Description                               |
| ------ | ---------------------------- | ----------------------------------------- |
| GET    | `/api/v1/tasks`              | List tasks with pagination & filtering    |
| GET    | `/api/v1/tasks/:id`          | Get task details with comments & activity |
| POST   | `/api/v1/tasks`              | Create a new task                         |
| PATCH  | `/api/v1/tasks/:id`          | Update task                               |
| DELETE | `/api/v1/tasks/:id`          | Delete task                               |
| PATCH  | `/api/v1/tasks/:id/archive`  | Archive task                              |
| PATCH  | `/api/v1/tasks/:id/restore`  | Restore archived task                     |
| POST   | `/api/v1/tasks/:id/comments` | Add comment                               |
| GET    | `/api/v1/users`              | List users                                |
| GET    | `/health`                    | Health check                              |

### Query Parameters for GET /tasks

| Parameter    | Type    | Description                                            |
| ------------ | ------- | ------------------------------------------------------ |
| `page`       | number  | Page number (default: 1)                               |
| `limit`      | number  | Items per page (default: 10, max: 100)                 |
| `status`     | string  | Filter by status (BACKLOG, IN_PROGRESS, BLOCKED, DONE) |
| `priority`   | string  | Filter by priority (LOW, MEDIUM, HIGH, URGENT)         |
| `assigneeId` | number  | Filter by assignee ID                                  |
| `search`     | string  | Search in title/description                            |
| `sortBy`     | string  | Sort field (createdAt, dueDate, priority)              |
| `sortOrder`  | string  | Sort order (asc, desc)                                 |
| `archived`   | boolean | Show archived tasks (true/false)                       |

## Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **WebSocket**: Socket.io
- **Caching**: In Memory Chaching
- **Validation**: Zod
- **Documentation**: Swagger

### Frontend

- **Templating**: EJS
- **Styling**: CSS (responsive)
- **Real-time**: Socket.io client
- **HTTP Client**: Fetch API

## Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (optional, falls back to in-memory cache)
- Docker (optional, for containerized setup)

### Setup Instructions

1. **Clone the repository**

```bash
  git clone https://github.com/YOUR_USERNAME/eng-tasks.git
  cd eng-tasks
```

2. **Install dependencies**

```bash
  npm install
```

3. **Configure environment variables**

```bash
  cp .env.example .env
```

Edit .env with your database credentials:

```plaintext
  NODE_ENV=development
  PORT=3000
  API_VERSION=v1
  API_PREFIX=/api
  DATABASE_URL="postgresql://<USER>:<PASSWORD>@localhost:<PORT>/DB_NAME"
```

4. **Set up PostgreSQL**
   Using Docker (recommended):

```bash
  docker run --name postgres-eng \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=eng_tasks \
  -p 5432:5432 \
  -d postgres:16-alpine
```

or using local PostgreSQL:

```bash
  createdb -U postgres eng_tasks
```

6. Run database migrations

```bash
  npx prisma migrate dev --name init
  npx prisma generate
```

7. Seed the database

```bash
  npm run seed
```

8. Start the application

Development mode:

```bash
  npm run dev
```

Production mode:

```bash
  npm run build
  npm start
```

9. Access the application

- Web UI: [http://localhost:3000](http://localhost:3000)
- API Docs: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- Health Check: (http://localhost:3000/health)[http://localhost:3000/health]

## Architecture

### Project Structure

```plaintext
  eng-tasks/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Database operations
│   ├── routes/          # API endpoints
│   ├── middlewares/     # Validation, caching, rate limiting
│   ├── config/          # Configuration
│   ├── utils/           # Utilities
│   ├── sockets/         # WebSocket handlers
│   └── validators/      # Zod schemas
├── views/               # EJS templates
│   ├── layouts/         # Main layout
│   ├── pages/           # Page templates
│   ├── partials/        # Reusable components
│   └── modals/          # Modal dialogs
├── public/              # Static assets (CSS, JS)
├── prisma/              # Database schema
└── dist/                # Compiled output
```

- Routes: Define API endpoints and HTTP methods
- Controllers: Handle HTTP requests/responses
- Services: Implement business logic and change tracking
- Repositories: Execute database operations
- Validators: Validate input at the boundary

## WebSocket Events

| Event            | Trigger            | Payload                                      |
| ---------------- | ------------------ | -------------------------------------------- |
| status-changed   | Task status update | `{taskId, oldStatus, newStatus, userId}`     |
| priority-changed | Priority update    | `{taskId, oldPriority, newPriority, userId}` |
| assignee-changed | Assignee change    | `{taskId, oldAssignee, newAssignee, userId}` |
| comment-added    | New comment        | `{taskId, comment}`                          |
| task-archived    | Task archived      | `{taskId, userId}`                           |
| task-restored    | Task restored      | `{taskId, userId}`                           |

## Performance Features

- Caching: Redis/in-memory cache for frequently accessed endpoints
- Rate Limiting: 100 requests per 15 minutes for API endpoints
- Pagination: Efficient database queries with limit/offset
- Indexing: Database indexes on frequently queried fields
- Query Optimization: No N+1 queries (uses Prisma includes)

## Security

- Input validation with Zod
- Rate limiting to prevent abuse
- No sensitive data exposure in errors
- SQL injection protection (via Prisma)
- XSS protection (escapeHtml in templates)
