---
title: Atomic Habits API
emoji: 🎯
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# Atomic Habits API - Phase 2

FastAPI backend for the Atomic Habits task management system.

## Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health check
- `GET /docs` - Interactive API documentation (Swagger UI)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/{user_id}/tasks` - List tasks (with filters, search, sort)
- `POST /api/{user_id}/tasks` - Create task
- `GET /api/{user_id}/tasks/tags` - Get unique tags
- `GET /api/{user_id}/tasks/{task_id}` - Get task detail
- `PATCH /api/{user_id}/tasks/{task_id}` - Update task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Mark task complete
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task

## Environment Variables (set as HF Spaces Secrets)

- `DATABASE_URL` - PostgreSQL connection string (Neon recommended)
- `BETTER_AUTH_SECRET` - JWT signing secret
- `ALLOWED_ORIGINS` - Comma-separated CORS origins
