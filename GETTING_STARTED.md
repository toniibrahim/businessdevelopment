# Getting Started - Business Development Pipeline

This guide will help you get the BD Pipeline application up and running using Docker.

## Prerequisites

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Node.js** (version 18 or higher) - only for local development without Docker

## Quick Start with Docker (Recommended)

### 1. Clone and Navigate to Project

```bash
cd businessdevelopment
```

### 2. Build and Start All Services

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** database on port 5432
- **Redis** cache on port 6379
- **Backend API** on port 8000

### 3. Check Services Status

```bash
docker-compose ps
```

All services should show status "Up (healthy)".

### 4. Run Database Migrations (First Time Only)

The TypeORM synchronize option is enabled in development, so tables will be created automatically. However, for production, you should use migrations:

```bash
# Generate a migration
docker-compose exec backend npm run migration:generate -- -n InitialSetup

# Run migrations
docker-compose exec backend npm run migration:run
```

### 5. Seed the Database with Initial Data

```bash
docker-compose exec backend npm run seed
```

This will create:
- **Probability coefficients** (for opportunity scoring)
- **Admin user**: `admin@bdpipeline.com` / `Admin@123456`
- **Manager user**: `manager@bdpipeline.com` / `Manager@123456`
- **Sales user**: `sales@bdpipeline.com` / `Sales@123456`
- **Sample team**: Enterprise Sales

### 6. Test the API

**Health Check:**
```bash
curl http://localhost:8000/api/health
```

**Login as Admin:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@bdpipeline.com",
    "password": "Admin@123456"
  }'
```

You should receive an access token and user information.

### 7. Access API Documentation

Once the backend is running, you can explore all available endpoints:

- **Base URL**: `http://localhost:8000/api`
- **Health Check**: `http://localhost:8000/api/health`

---

## Environment Variables

The application uses the `.env` file for configuration. Key variables:

```bash
# Server
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT (change these in production!)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Email (optional - for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## Available Services

### PostgreSQL Database
- **Port**: 5432
- **Database**: bd_pipeline
- **User**: postgres
- **Password**: postgres

**Connect with psql:**
```bash
docker-compose exec postgres psql -U postgres -d bd_pipeline
```

### Redis Cache
- **Port**: 6379

**Connect with redis-cli:**
```bash
docker-compose exec redis redis-cli
```

### Backend API
- **Port**: 8000
- **Health**: `http://localhost:8000/api/health`

**View logs:**
```bash
docker-compose logs -f backend
```

---

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Restart a Specific Service
```bash
docker-compose restart backend
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build backend
```

### Execute Commands in Container
```bash
# Run seed script
docker-compose exec backend npm run seed

# Run migrations
docker-compose exec backend npm run migration:run

# Access backend shell
docker-compose exec backend sh
```

### Clean Everything (Database + Volumes)
```bash
docker-compose down -v
```

---

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Opportunities
- `GET /api/opportunities` - List opportunities (with filters)
- `POST /api/opportunities` - Create opportunity
- `GET /api/opportunities/:id` - Get opportunity by ID
- `PUT /api/opportunities/:id` - Update opportunity
- `DELETE /api/opportunities/:id` - Delete opportunity
- `POST /api/opportunities/:id/duplicate` - Duplicate opportunity
- `PUT /api/opportunities/:id/status` - Update status
- `GET /api/opportunities/:id/activities` - Get activities
- `POST /api/opportunities/:id/activities` - Add activity
- `GET /api/opportunities/:id/revenue-distribution` - Get revenue forecast
- `POST /api/opportunities/bulk-update` - Bulk update (managers only)

---

## Sample API Requests

### Register a New User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@company.com",
    "username": "johndoe",
    "password": "SecureP@ss123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Create an Opportunity

First, login and get the token:

```bash
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"sales@bdpipeline.com","password":"Sales@123456"}' \
  | jq -r '.access_token')
```

Then create an opportunity:

```bash
curl -X POST http://localhost:8000/api/opportunities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "project_name": "Data Center Expansion Project",
    "service_type": "IFM",
    "sector_type": "Data Center",
    "original_amount": 5000000,
    "gross_margin_percentage": 0.13,
    "project_type": "Integrated services to Business",
    "project_maturity": "RFI",
    "client_type": "Existing",
    "client_relationship": "3 - Good",
    "conservative_approach": false,
    "starting_date": "2026-01-01",
    "closing_date": "2028-12-31",
    "status": "Active"
  }'
```

### List Opportunities with Filters

```bash
curl -X GET "http://localhost:8000/api/opportunities?status=Active&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Development Workflow

### 1. Make Code Changes
Edit files in `backend/src/`

### 2. Rebuild and Restart
```bash
docker-compose up -d --build backend
```

### 3. Check Logs
```bash
docker-compose logs -f backend
```

### 4. Test Changes
Use curl or Postman to test your endpoints

---

## Troubleshooting

### Services Won't Start

Check logs:
```bash
docker-compose logs
```

### Database Connection Errors

Ensure PostgreSQL is healthy:
```bash
docker-compose ps postgres
docker-compose logs postgres
```

### Port Already in Use

If port 8000, 5432, or 6379 is already in use, you can change ports in `docker-compose.yml`:

```yaml
ports:
  - "8001:8000"  # Use port 8001 instead of 8000
```

### Clear All Data and Start Fresh

```bash
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run seed
```

---

## Next Steps

1. ✅ **Backend is running** - You now have a complete API
2. 🔜 **Build the frontend** - React application with TypeScript
3. 🔜 **Add more features** - User management, dashboards, reports
4. 🔜 **Deploy to production** - Follow deployment guide

---

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Review the API specification: `api_specification.md`
3. Check the implementation roadmap: `implementation_roadmap.md`

---

**Congratulations! Your Business Development Pipeline backend is now running! 🎉**
