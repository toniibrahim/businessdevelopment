# Business Development Pipeline - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Endpoints](#endpoints)

## Overview

The Business Development Pipeline API is a RESTful API built with Node.js, Express, and TypeScript. It provides comprehensive CRM and sales pipeline management capabilities for tracking opportunities, managing clients, analyzing performance, and forecasting revenue.

### Features
- **JWT Authentication** with refresh tokens
- **Role-Based Access Control** (sales, manager, admin)
- **Opportunity Management** with probability scoring
- **Revenue Distribution** tracking and forecasting
- **Dashboard Analytics** (individual, team, and global)
- **Activity Logging** for audit trails
- **Excel/CSV Export** capabilities
- **Client Company Management**
- **Team Organization** with managers

## Authentication

Most endpoints require authentication via JWT Bearer token.

### Getting a Token

**Register:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password": "securepass123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "role": "sales",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Using the Token

Include the access token in the Authorization header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Refreshing Tokens

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Base URL

- **Development:** `http://localhost:5000/api`
- **Production:** `https://your-domain.com/api`

## Response Format

### Success Response
```json
{
  "data": { ... }
}
```

### Paginated Response
```json
{
  "items": [ ... ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` (400) - Invalid request data
- `UNAUTHORIZED` (401) - Authentication required or failed
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource already exists
- `INTERNAL_ERROR` (500) - Server error

---

## Endpoints

### Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
```
- **Access:** Public
- **Body:** `{ email, username, password, first_name, last_name, phone? }`
- **Returns:** JWT tokens + user object

#### 2. Login
```http
POST /api/auth/login
```
- **Access:** Public
- **Body:** `{ username, password }`
- **Returns:** JWT tokens + user object

#### 3. Refresh Token
```http
POST /api/auth/refresh
```
- **Access:** Public
- **Body:** `{ refresh_token }`
- **Returns:** New access token

#### 4. Logout
```http
POST /api/auth/logout
```
- **Access:** Authenticated
- **Returns:** Success message

#### 5. Get Current User
```http
GET /api/auth/me
```
- **Access:** Authenticated
- **Returns:** Current user object with team

#### 6. Change Password
```http
POST /api/auth/me/change-password
```
- **Access:** Authenticated
- **Body:** `{ old_password, new_password }`
- **Returns:** Success message

#### 7. Forgot Password
```http
POST /api/auth/forgot-password
```
- **Access:** Public
- **Body:** `{ email }`
- **Returns:** Success message (sends email)

#### 8. Reset Password
```http
POST /api/auth/reset-password
```
- **Access:** Public
- **Body:** `{ token, new_password }`
- **Returns:** Success message

---

### User Endpoints

#### 1. List Users
```http
GET /api/users?page=1&limit=20&role=sales&team_id=uuid&search=john
```
- **Access:** Admin
- **Query Params:** `page, limit, role, team_id, search`
- **Returns:** Paginated list of users

#### 2. Get User by ID
```http
GET /api/users/:id
```
- **Access:** Authenticated (own profile) or Admin
- **Returns:** User object with team

#### 3. Create User
```http
POST /api/users
```
- **Access:** Admin
- **Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "sales",
  "team_id": "uuid",
  "phone": "+1234567890"
}
```
- **Returns:** Created user object

#### 4. Update User
```http
PUT /api/users/:id
```
- **Access:** Admin or self (limited fields)
- **Body:** Partial user object
- **Returns:** Updated user object

#### 5. Delete User
```http
DELETE /api/users/:id
```
- **Access:** Admin
- **Returns:** Success message

---

### Team Endpoints

#### 1. List Teams
```http
GET /api/teams?page=1&limit=20&search=sales
```
- **Access:** Authenticated
- **Query Params:** `page, limit, search`
- **Returns:** Paginated list of teams with members

#### 2. Get Team by ID
```http
GET /api/teams/:id
```
- **Access:** Authenticated
- **Returns:** Team object with manager and members

#### 3. Create Team
```http
POST /api/teams
```
- **Access:** Admin or Manager
- **Body:**
```json
{
  "name": "Sales Team A",
  "description": "Primary sales team",
  "manager_id": "uuid"
}
```
- **Returns:** Created team object

#### 4. Update Team
```http
PUT /api/teams/:id
```
- **Access:** Admin or Manager
- **Body:** Partial team object
- **Returns:** Updated team object

#### 5. Delete Team
```http
DELETE /api/teams/:id
```
- **Access:** Admin
- **Returns:** Success message

#### 6. Get Team Members
```http
GET /api/teams/:id/members
```
- **Access:** Authenticated
- **Returns:** List of team members

---

### Client Company Endpoints

#### 1. List Clients
```http
GET /api/clients?page=1&limit=20&relationship_tier=5&search=acme
```
- **Access:** Authenticated
- **Query Params:** `page, limit, relationship_tier, industry, search`
- **Returns:** Paginated list of clients

#### 2. Get Client by ID
```http
GET /api/clients/:id
```
- **Access:** Authenticated
- **Returns:** Client object with opportunities

#### 3. Create Client
```http
POST /api/clients
```
- **Access:** Sales, Manager, Admin
- **Body:**
```json
{
  "name": "Acme Corporation",
  "industry": "Technology",
  "relationship_tier": "5 - Excellent",
  "contact_person": "Jane Smith",
  "email": "jane@acme.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, State",
  "notes": "Key client notes..."
}
```
- **Returns:** Created client object

#### 4. Update Client
```http
PUT /api/clients/:id
```
- **Access:** Sales, Manager, Admin
- **Body:** Partial client object
- **Returns:** Updated client object

#### 5. Delete Client
```http
DELETE /api/clients/:id
```
- **Access:** Admin
- **Returns:** Success message

---

### Opportunity Endpoints

#### 1. List Opportunities
```http
GET /api/opportunities?page=1&limit=20&status=Active&stage=Proposal&owner_id=uuid
```
- **Access:** Authenticated
- **Query Params:**
  - `page, limit` - Pagination
  - `status` - Active, Won, Lost, On Hold, Cancelled
  - `stage` - Prospection, Qualification, Proposal, Negotiation, Closed
  - `owner_id` - Filter by owner
  - `team_id` - Filter by team
  - `service_type, sector_type` - Filter by type
  - `date_from, date_to` - Date range
  - `search` - Search in project name
- **Returns:** Paginated list of opportunities

#### 2. Get Opportunity by ID
```http
GET /api/opportunities/:id
```
- **Access:** Owner or Manager or Admin
- **Returns:** Full opportunity object with client, revenue distribution

**Example Response:**
```json
{
  "id": "uuid",
  "project_name": "ERP Implementation",
  "service_type": "Implementation",
  "sector_type": "Private",
  "original_amount": 500000,
  "project_maturity": "Advanced",
  "client_type": "Existing",
  "client_relationship": "Strong",
  "conservative_approach": true,
  "probability_score": 0.75,
  "weighted_amount": 375000,
  "starting_date": "2024-02-01",
  "closing_date": "2024-12-31",
  "status": "Active",
  "stage": "Proposal",
  "notes": "Important notes...",
  "owner": { "id": "uuid", "first_name": "John", "last_name": "Doe" },
  "client": { "id": "uuid", "name": "Acme Corporation" },
  "revenue_distribution": [
    {
      "year": 2024,
      "month": 6,
      "sales_amount": 50000,
      "gross_margin_amount": 15000
    }
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### 3. Create Opportunity
```http
POST /api/opportunities
```
- **Access:** Sales, Manager, Admin
- **Body:**
```json
{
  "project_name": "CRM Implementation",
  "service_type": "Implementation",
  "sector_type": "Private",
  "original_amount": 250000,
  "project_maturity": "Validated",
  "client_type": "Existing",
  "client_relationship": "Strong",
  "conservative_approach": false,
  "starting_date": "2024-03-01",
  "closing_date": "2024-09-30",
  "status": "Active",
  "stage": "Qualification",
  "client_id": "uuid",
  "notes": "Key opportunity notes"
}
```
- **Returns:** Created opportunity with calculated probability score

**Probability Calculation:**
The system automatically calculates `probability_score` and `weighted_amount` based on:
- Project maturity (Weight: 30%)
- Client type (Weight: 20%)
- Client relationship (Weight: 30%)
- Conservative approach (Weight: 20%)

#### 4. Update Opportunity
```http
PUT /api/opportunities/:id
```
- **Access:** Owner or Manager or Admin
- **Body:** Partial opportunity object
- **Returns:** Updated opportunity

#### 5. Delete Opportunity
```http
DELETE /api/opportunities/:id
```
- **Access:** Owner or Admin
- **Returns:** Success message

#### 6. Update Opportunity Status
```http
PATCH /api/opportunities/:id/status
```
- **Access:** Owner or Manager or Admin
- **Body:**
```json
{
  "status": "Won",
  "stage": "Closed"
}
```
- **Returns:** Updated opportunity

#### 7. Get Opportunity Activities
```http
GET /api/opportunities/:id/activities
```
- **Access:** Owner or Manager or Admin
- **Returns:** List of activity logs
```json
{
  "items": [
    {
      "id": "uuid",
      "activity_type": "status_change",
      "description": "Status changed from Active to Won",
      "old_value": { "status": "Active" },
      "new_value": { "status": "Won" },
      "user": { "first_name": "John", "last_name": "Doe" },
      "created_at": "2024-01-20T14:30:00Z"
    }
  ]
}
```

#### 8. Get Revenue Distribution
```http
GET /api/opportunities/:id/revenue-distribution
```
- **Access:** Owner or Manager or Admin
- **Returns:** Monthly revenue breakdown
```json
{
  "items": [
    {
      "id": "uuid",
      "year": 2024,
      "month": 6,
      "sales_amount": 50000,
      "gross_margin_amount": 15000
    }
  ]
}
```

#### 9. Update Revenue Distribution
```http
PUT /api/opportunities/:id/revenue-distribution
```
- **Access:** Owner or Manager or Admin
- **Body:**
```json
{
  "distributions": [
    {
      "year": 2024,
      "month": 6,
      "sales_amount": 50000,
      "gross_margin_amount": 15000
    },
    {
      "year": 2024,
      "month": 7,
      "sales_amount": 60000,
      "gross_margin_amount": 18000
    }
  ]
}
```
- **Returns:** Updated revenue distribution

---

### Dashboard Endpoints

#### 1. Individual Dashboard
```http
GET /api/dashboard/individual
```
- **Access:** Authenticated
- **Returns:** Personal performance metrics
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "team": "Sales Team A"
  },
  "metrics": {
    "total_opportunities": 25,
    "active_opportunities": 15,
    "won_opportunities": 8,
    "lost_opportunities": 2,
    "pipeline_value": 1250000,
    "weighted_pipeline_value": 937500,
    "won_value": 400000,
    "win_rate": 0.8,
    "average_deal_size": 50000
  },
  "opportunities_by_stage": [
    { "stage": "Prospection", "count": 5, "total_value": 250000 },
    { "stage": "Qualification", "count": 6, "total_value": 300000 }
  ],
  "opportunities_by_status": [
    { "status": "Active", "count": 15, "total_value": 750000 },
    { "status": "Won", "count": 8, "total_value": 400000 }
  ],
  "monthly_forecast": [
    {
      "year": 2024,
      "month": 6,
      "sales_amount": 125000,
      "gross_margin_amount": 37500
    }
  ],
  "recent_activities": [ ... ]
}
```

#### 2. Team Dashboard
```http
GET /api/dashboard/team/:teamId
```
- **Access:** Team Manager or Admin
- **Returns:** Team performance metrics
```json
{
  "team": {
    "id": "uuid",
    "name": "Sales Team A",
    "manager": "Jane Smith"
  },
  "metrics": {
    "total_members": 5,
    "total_opportunities": 125,
    "active_opportunities": 75,
    "won_opportunities": 40,
    "lost_opportunities": 10,
    "pipeline_value": 6250000,
    "weighted_pipeline_value": 4687500,
    "won_value": 2000000,
    "win_rate": 0.8,
    "average_deal_size": 50000
  },
  "members_performance": [
    {
      "user_id": "uuid",
      "name": "John Doe",
      "opportunities_count": 25,
      "pipeline_value": 1250000,
      "won_count": 8,
      "won_value": 400000
    }
  ],
  "opportunities_by_stage": [ ... ],
  "opportunities_by_status": [ ... ],
  "monthly_forecast": [ ... ]
}
```

#### 3. Global Dashboard
```http
GET /api/dashboard/global
```
- **Access:** Admin
- **Returns:** Company-wide metrics
```json
{
  "metrics": {
    "total_users": 25,
    "total_teams": 5,
    "total_opportunities": 625,
    "active_opportunities": 375,
    "won_opportunities": 200,
    "lost_opportunities": 50,
    "pipeline_value": 31250000,
    "weighted_pipeline_value": 23437500,
    "won_value": 10000000,
    "win_rate": 0.8,
    "average_deal_size": 50000
  },
  "teams_performance": [
    {
      "team_id": "uuid",
      "team_name": "Sales Team A",
      "members_count": 5,
      "opportunities_count": 125,
      "pipeline_value": 6250000,
      "won_count": 40,
      "won_value": 2000000
    }
  ],
  "opportunities_by_stage": [ ... ],
  "opportunities_by_status": [ ... ],
  "monthly_forecast": [ ... ],
  "recent_activities": [ ... ]
}
```

---

### Export Endpoints

#### 1. Export Opportunities to Excel
```http
GET /api/export/opportunities?status=Active&format=xlsx
```
- **Access:** Authenticated
- **Query Params:** Same as opportunity list filters + `format=xlsx`
- **Returns:** Excel file download

#### 2. Export Dashboard to Excel
```http
GET /api/export/dashboard/individual?format=xlsx
```
- **Access:** Authenticated
- **Returns:** Excel file with dashboard data

---

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **General endpoints:** 100 requests per 15 minutes per IP
- **Authentication endpoints:** 5 requests per 15 minutes per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1642345678
```

---

## Swagger UI

Interactive API documentation is available at:
```
http://localhost:5000/api/docs
```

The Swagger UI provides:
- Live API testing
- Request/response examples
- Schema definitions
- Authentication testing

---

## Best Practices

### 1. Always Use HTTPS in Production
Never send sensitive data over unencrypted connections.

### 2. Store Tokens Securely
- Use httpOnly cookies for refresh tokens
- Store access tokens in memory or secure storage
- Never store tokens in localStorage

### 3. Handle Token Expiration
Access tokens expire after 1 hour. Implement automatic token refresh:
```javascript
// Example token refresh logic
async function refreshAccessToken(refreshToken) {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  const { access_token } = await response.json();
  return access_token;
}
```

### 4. Implement Retry Logic
Handle network errors and rate limits with exponential backoff.

### 5. Validate Input
Always validate and sanitize user input before sending to the API.

---

## Support

For issues, questions, or feature requests:
- **Email:** support@example.com
- **GitHub:** https://github.com/yourorg/bd-pipeline
- **Slack:** #bd-pipeline-support
