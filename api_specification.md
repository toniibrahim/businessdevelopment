# API Specification & Examples

## Base URL
```
Development: http://localhost:8000/api
Production: https://your-domain.com/api
```

## Authentication
All endpoints except auth endpoints require JWT authentication:
```
Headers:
  Authorization: Bearer <access_token>
  Content-Type: application/json
```

---

## 1. Authentication Endpoints

### 1.1 Register User
```http
POST /api/auth/register

Request:
{
  "email": "john.doe@company.com",
  "username": "johndoe",
  "password": "SecureP@ss123",
  "first_name": "John",
  "last_name": "Doe",
  "team_id": "uuid-team-id" // optional
}

Response: 201 Created
{
  "id": "uuid",
  "email": "john.doe@company.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "role": "sales",
  "team_id": "uuid-team-id",
  "is_active": true,
  "created_at": "2025-11-13T10:00:00Z"
}

Errors:
400 Bad Request - Invalid input
409 Conflict - Email/username already exists
```

### 1.2 Login
```http
POST /api/auth/login

Request:
{
  "username": "johndoe",  // or email
  "password": "SecureP@ss123"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900,  // 15 minutes in seconds
  "user": {
    "id": "uuid",
    "email": "john.doe@company.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "role": "sales",
    "team_id": "uuid-team-id",
    "profile_picture_url": null
  }
}

Errors:
401 Unauthorized - Invalid credentials
403 Forbidden - Account inactive
```

### 1.3 Refresh Token
```http
POST /api/auth/refresh

Request:
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}

Errors:
401 Unauthorized - Invalid or expired refresh token
```

### 1.4 Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>

Response: 200 OK
{
  "message": "Successfully logged out"
}
```

### 1.5 Forgot Password
```http
POST /api/auth/forgot-password

Request:
{
  "email": "john.doe@company.com"
}

Response: 200 OK
{
  "message": "Password reset email sent"
}
```

### 1.6 Reset Password
```http
POST /api/auth/reset-password

Request:
{
  "token": "reset-token-from-email",
  "new_password": "NewSecureP@ss123"
}

Response: 200 OK
{
  "message": "Password successfully reset"
}

Errors:
400 Bad Request - Invalid or expired token
```

---

## 2. User Endpoints

### 2.1 Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>

Response: 200 OK
{
  "id": "uuid",
  "email": "john.doe@company.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "role": "sales",
  "team_id": "uuid-team-id",
  "team": {
    "id": "uuid-team-id",
    "name": "Enterprise Sales",
    "manager_id": "uuid-manager-id"
  },
  "is_active": true,
  "created_at": "2025-11-13T10:00:00Z",
  "last_login": "2025-11-13T15:30:00Z"
}
```

### 2.2 Update Current User
```http
PUT /api/users/me
Authorization: Bearer <access_token>

Request:
{
  "first_name": "John",
  "last_name": "Smith",
  "profile_picture_url": "https://cdn.example.com/profile.jpg"
}

Response: 200 OK
{
  "id": "uuid",
  "email": "john.doe@company.com",
  "first_name": "John",
  "last_name": "Smith",
  "profile_picture_url": "https://cdn.example.com/profile.jpg",
  "updated_at": "2025-11-13T16:00:00Z"
}
```

### 2.3 Change Password
```http
POST /api/users/me/change-password
Authorization: Bearer <access_token>

Request:
{
  "current_password": "OldPassword123",
  "new_password": "NewSecureP@ss123"
}

Response: 200 OK
{
  "message": "Password successfully changed"
}

Errors:
400 Bad Request - Current password incorrect
```

### 2.4 List Users (Admin/Manager only)
```http
GET /api/users?page=1&limit=20&role=sales&team_id=uuid&search=john
Authorization: Bearer <access_token>

Response: 200 OK
{
  "items": [
    {
      "id": "uuid",
      "email": "john.doe@company.com",
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "role": "sales",
      "team_id": "uuid-team-id",
      "team_name": "Enterprise Sales",
      "is_active": true,
      "created_at": "2025-11-13T10:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

### 2.5 Get User by ID (Admin/Manager only)
```http
GET /api/users/{user_id}
Authorization: Bearer <access_token>

Response: 200 OK
{
  "id": "uuid",
  "email": "john.doe@company.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "role": "sales",
  "team_id": "uuid-team-id",
  "team": {
    "id": "uuid-team-id",
    "name": "Enterprise Sales"
  },
  "is_active": true,
  "created_at": "2025-11-13T10:00:00Z"
}
```

---

## 3. Team Endpoints

### 3.1 List Teams
```http
GET /api/teams
Authorization: Bearer <access_token>

Response: 200 OK
{
  "items": [
    {
      "id": "uuid-1",
      "name": "Enterprise Sales",
      "manager_id": "uuid-manager-1",
      "manager_name": "Sarah Johnson",
      "member_count": 8,
      "description": "Large enterprise accounts",
      "created_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": "uuid-2",
      "name": "SMB Sales",
      "manager_id": "uuid-manager-2",
      "manager_name": "Mike Chen",
      "member_count": 5,
      "description": "Small to medium businesses",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 2
}
```

### 3.2 Get Team by ID
```http
GET /api/teams/{team_id}
Authorization: Bearer <access_token>

Response: 200 OK
{
  "id": "uuid",
  "name": "Enterprise Sales",
  "manager_id": "uuid-manager-id",
  "manager": {
    "id": "uuid-manager-id",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.j@company.com"
  },
  "description": "Large enterprise accounts",
  "members": [
    {
      "id": "uuid-1",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@company.com",
      "role": "sales"
    }
  ],
  "member_count": 8,
  "created_at": "2025-01-01T00:00:00Z"
}
```

### 3.3 Create Team (Admin only)
```http
POST /api/teams
Authorization: Bearer <access_token>

Request:
{
  "name": "Special Projects",
  "manager_id": "uuid-manager-id",
  "description": "Special project opportunities"
}

Response: 201 Created
{
  "id": "uuid-new-team",
  "name": "Special Projects",
  "manager_id": "uuid-manager-id",
  "description": "Special project opportunities",
  "created_at": "2025-11-13T16:00:00Z"
}
```

---

## 4. Opportunity Endpoints

### 4.1 List Opportunities
```http
GET /api/opportunities?page=1&limit=20&status=active&stage=negotiation&owner_id=uuid&team_id=uuid&min_amount=100000&max_amount=5000000&search=data+center
Authorization: Bearer <access_token>

Response: 200 OK
{
  "items": [
    {
      "id": "uuid-opp-1",
      "project_name": "Dawaiyat Data Center",
      "owner_id": "uuid-owner",
      "owner_name": "John Doe",
      "team_id": "uuid-team",
      "team_name": "Enterprise Sales",
      "service_type": "IFM",
      "sector_type": "Data Center",
      "original_amount": 17000000,
      "gross_margin_percentage": 0.13,
      "project_type": "Integrated services to Business",
      "project_maturity": "RFI",
      "client_type": "Existing",
      "client_relationship": "3 - Good",
      "conservative_approach": false,
      "probability_score": 0.25,
      "weighted_amount": 4250000,
      "gross_margin_amount": 552500,
      "starting_date": "2026-01-01",
      "closing_date": "2028-12-31",
      "duration_months": 36,
      "status": "Active",
      "stage": "RFI",
      "created_at": "2025-11-10T10:00:00Z",
      "updated_at": "2025-11-13T14:30:00Z"
    }
  ],
  "total": 156,
  "page": 1,
  "limit": 20,
  "pages": 8
}

Query Parameters:
- page: integer (default: 1)
- limit: integer (default: 20, max: 100)
- status: string (Active, Won, Lost, On Hold, Cancelled)
- stage: string (Prospection, Qualification, Proposal, Negotiation, Closed)
- owner_id: uuid
- team_id: uuid
- service_type: string
- sector_type: string
- min_amount: number
- max_amount: number
- min_probability: number (0-1)
- max_probability: number (0-1)
- start_date_from: date
- start_date_to: date
- close_date_from: date
- close_date_to: date
- search: string (full-text search)
- sort_by: string (project_name, original_amount, probability_score, starting_date, etc.)
- sort_order: string (asc, desc)
```

### 4.2 Get Opportunity by ID
```http
GET /api/opportunities/{opportunity_id}
Authorization: Bearer <access_token>

Response: 200 OK
{
  "id": "uuid-opp-1",
  "project_name": "Dawaiyat Data Center",
  "update_notes": "Initial RFI received, meeting scheduled",
  "owner_id": "uuid-owner",
  "owner": {
    "id": "uuid-owner",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@company.com"
  },
  "team_id": "uuid-team",
  "team": {
    "id": "uuid-team",
    "name": "Enterprise Sales"
  },
  "client_id": "uuid-client",
  "client": {
    "id": "uuid-client",
    "name": "Dawaiyat Company",
    "industry": "Technology",
    "relationship_tier": "3 - Good"
  },
  "service_type": "IFM",
  "sector_type": "Data Center",
  "original_amount": 17000000,
  "gross_margin_percentage": 0.13,
  "project_type": "Integrated services to Business",
  "project_maturity": "RFI",
  "client_type": "Existing",
  "client_relationship": "3 - Good",
  "conservative_approach": false,
  "probability_score": 0.25,
  "probability_breakdown": {
    "base": 1.0,
    "project_type_coef": 0.9,
    "maturity_coef": 0.25,
    "client_type_coef": 1.05,
    "relationship_coef": 1.0,
    "conservative_coef": 1.0,
    "final": 0.236
  },
  "weighted_amount": 4250000,
  "gross_margin_amount": 552500,
  "starting_date": "2026-01-01",
  "closing_date": "2028-12-31",
  "duration_months": 36,
  "status": "Active",
  "stage": "RFI",
  "win_probability_override": null,
  "revenue_distribution": [
    {
      "year": 2026,
      "month": 1,
      "sales_amount": 118055.56,
      "gross_margin_amount": 15347.22
    }
    // ... more months
  ],
  "created_at": "2025-11-10T10:00:00Z",
  "updated_at": "2025-11-13T14:30:00Z",
  "created_by_id": "uuid-creator",
  "last_modified_by_id": "uuid-modifier"
}
```

### 4.3 Create Opportunity
```http
POST /api/opportunities
Authorization: Bearer <access_token>

Request:
{
  "project_name": "New Data Center Project",
  "update_notes": "Initial contact from client",
  "client_id": "uuid-client", // optional
  "service_type": "IFM",
  "sector_type": "Data Center",
  "original_amount": 5000000,
  "gross_margin_percentage": 0.13,
  "project_type": "Integrated services to Business",
  "project_maturity": "Prospection",
  "client_type": "New",
  "client_relationship": "2 - Medium",
  "conservative_approach": true,
  "starting_date": "2026-03-01",
  "closing_date": "2028-03-01",
  "status": "Active",
  "stage": "Prospection"
}

Response: 201 Created
{
  "id": "uuid-new-opp",
  "project_name": "New Data Center Project",
  // ... full opportunity object with calculated fields
  "probability_score": 0.15,
  "weighted_amount": 750000,
  "gross_margin_amount": 97500,
  "duration_months": 24,
  "created_at": "2025-11-13T16:00:00Z"
}

Errors:
400 Bad Request - Validation errors
403 Forbidden - Insufficient permissions
```

### 4.4 Update Opportunity
```http
PUT /api/opportunities/{opportunity_id}
Authorization: Bearer <access_token>

Request:
{
  "project_name": "Updated Project Name",
  "project_maturity": "RFQ",
  "client_relationship": "4 - High",
  "update_notes": "Moved to RFQ stage after successful meeting"
}

Response: 200 OK
{
  "id": "uuid-opp-1",
  // ... full updated opportunity object
  "probability_score": 0.45, // recalculated
  "weighted_amount": 2250000,
  "updated_at": "2025-11-13T16:30:00Z"
}
```

### 4.5 Delete Opportunity
```http
DELETE /api/opportunities/{opportunity_id}
Authorization: Bearer <access_token>

Response: 204 No Content

Errors:
403 Forbidden - Cannot delete opportunities you don't own
404 Not Found - Opportunity not found
```

### 4.6 Duplicate Opportunity
```http
POST /api/opportunities/{opportunity_id}/duplicate
Authorization: Bearer <access_token>

Request:
{
  "project_name": "Copy of Original Project"
}

Response: 201 Created
{
  "id": "uuid-new-opp",
  // ... full duplicated opportunity object with new ID
}
```

### 4.7 Update Opportunity Status
```http
PUT /api/opportunities/{opportunity_id}/status
Authorization: Bearer <access_token>

Request:
{
  "status": "Won",
  "stage": "Closed",
  "notes": "Contract signed on 2025-11-13"
}

Response: 200 OK
{
  "id": "uuid-opp-1",
  "status": "Won",
  "stage": "Closed",
  "updated_at": "2025-11-13T16:45:00Z"
}
```

### 4.8 Bulk Update Opportunities
```http
POST /api/opportunities/bulk-update
Authorization: Bearer <access_token>

Request:
{
  "opportunity_ids": ["uuid-1", "uuid-2", "uuid-3"],
  "updates": {
    "stage": "Negotiation",
    "owner_id": "uuid-new-owner"
  }
}

Response: 200 OK
{
  "updated_count": 3,
  "failed": []
}
```

### 4.9 Export Opportunities
```http
GET /api/opportunities/export?format=excel&status=active&team_id=uuid
Authorization: Bearer <access_token>

Response: 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="opportunities_2025-11-13.xlsx"

[Binary Excel file matching your original pipeline structure]

Query Parameters:
- format: excel or csv
- All same filters as list endpoint
```

---

## 5. Opportunity Activity Endpoints

### 5.1 Get Opportunity Activities
```http
GET /api/opportunities/{opportunity_id}/activities?page=1&limit=20
Authorization: Bearer <access_token>

Response: 200 OK
{
  "items": [
    {
      "id": "uuid-activity-1",
      "opportunity_id": "uuid-opp-1",
      "user_id": "uuid-user",
      "user_name": "John Doe",
      "activity_type": "status_changed",
      "description": "Status changed from Active to Won",
      "old_value": {"status": "Active"},
      "new_value": {"status": "Won"},
      "created_at": "2025-11-13T16:45:00Z"
    },
    {
      "id": "uuid-activity-2",
      "opportunity_id": "uuid-opp-1",
      "user_id": "uuid-user",
      "user_name": "John Doe",
      "activity_type": "meeting_scheduled",
      "description": "Meeting scheduled with client for contract signing",
      "created_at": "2025-11-12T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}

Activity Types:
- created
- updated
- status_changed
- stage_changed
- note_added
- meeting_scheduled
- call_made
- email_sent
- proposal_sent
- document_uploaded
```

### 5.2 Add Activity
```http
POST /api/opportunities/{opportunity_id}/activities
Authorization: Bearer <access_token>

Request:
{
  "activity_type": "call_made",
  "description": "Called client to discuss proposal. They requested revised pricing."
}

Response: 201 Created
{
  "id": "uuid-activity-new",
  "opportunity_id": "uuid-opp-1",
  "user_id": "uuid-user",
  "user_name": "John Doe",
  "activity_type": "call_made",
  "description": "Called client to discuss proposal. They requested revised pricing.",
  "created_at": "2025-11-13T17:00:00Z"
}
```

---

## 6. Revenue Distribution Endpoints

### 6.1 Get Revenue Distribution
```http
GET /api/opportunities/{opportunity_id}/revenue-distribution
Authorization: Bearer <access_token>

Response: 200 OK
{
  "opportunity_id": "uuid-opp-1",
  "total_weighted_amount": 4250000,
  "total_gross_margin": 552500,
  "duration_months": 36,
  "monthly_distribution": [
    {
      "year": 2026,
      "month": 1,
      "sales_amount": 118055.56,
      "gross_margin_amount": 15347.22,
      "is_forecast": true
    }
    // ... all months from start to close
  ],
  "yearly_summary": [
    {
      "year": 2026,
      "sales_amount": 1416667,
      "gross_margin_amount": 184167,
      "months": 12
    },
    {
      "year": 2027,
      "sales_amount": 1416667,
      "gross_margin_amount": 184167,
      "months": 12
    },
    {
      "year": 2028,
      "sales_amount": 1416667,
      "gross_margin_amount": 184167,
      "months": 12
    }
  ]
}
```

---

## 7. Dashboard Endpoints

### 7.1 My Dashboard (Individual Sales)
```http
GET /api/dashboard/my-dashboard
Authorization: Bearer <access_token>

Response: 200 OK
{
  "metrics": {
    "total_pipeline_value": 45600000,
    "weighted_pipeline_value": 11400000,
    "active_opportunities_count": 23,
    "expected_revenue_this_month": 850000,
    "expected_revenue_this_quarter": 2750000,
    "expected_revenue_this_year": 8500000,
    "win_rate": 0.35,
    "average_deal_size": 1982608,
    "average_days_in_pipeline": 87,
    "opportunities_closing_this_month": 5
  },
  "pipeline_by_stage": [
    {
      "stage": "Prospection",
      "count": 8,
      "total_value": 12000000,
      "weighted_value": 2400000
    },
    {
      "stage": "RFI",
      "count": 7,
      "total_value": 15000000,
      "weighted_value": 3750000
    },
    {
      "stage": "RFQ",
      "count": 4,
      "total_value": 9000000,
      "weighted_value": 3600000
    },
    {
      "stage": "Negotiation",
      "count": 3,
      "total_value": 7500000,
      "weighted_value": 5625000
    },
    {
      "stage": "Closed",
      "count": 1,
      "total_value": 2100000,
      "weighted_value": 2100000
    }
  ],
  "revenue_forecast_by_month": [
    {
      "year": 2025,
      "month": 11,
      "sales_amount": 850000,
      "gross_margin_amount": 110500
    },
    {
      "year": 2025,
      "month": 12,
      "sales_amount": 920000,
      "gross_margin_amount": 119600
    }
    // ... next 12 months
  ],
  "opportunities_by_sector": [
    {
      "sector": "Data Center",
      "count": 9,
      "total_value": 28000000,
      "percentage": 61.4
    },
    {
      "sector": "Commercial",
      "count": 7,
      "total_value": 10600000,
      "percentage": 23.2
    },
    {
      "sector": "Industrial",
      "count": 5,
      "total_value": 5000000,
      "percentage": 11.0
    },
    {
      "sector": "Special project",
      "count": 2,
      "total_value": 2000000,
      "percentage": 4.4
    }
  ],
  "top_opportunities": [
    {
      "id": "uuid-opp-1",
      "project_name": "Dawaiyat Data Center",
      "weighted_amount": 4250000,
      "probability_score": 0.25,
      "stage": "RFI",
      "closing_date": "2028-12-31"
    }
    // ... top 10
  ],
  "closing_this_month": [
    // ... opportunities with closing date in current month
  ],
  "overdue_followups": [
    // ... opportunities needing attention
  ],
  "win_loss_trend": [
    {
      "period": "2025-10",
      "won": 2,
      "lost": 1,
      "win_rate": 0.67
    }
    // ... last 12 months
  ]
}
```

### 7.2 Team Dashboard (Manager)
```http
GET /api/dashboard/team/{team_id}
Authorization: Bearer <access_token>

Response: 200 OK
{
  "team": {
    "id": "uuid-team",
    "name": "Enterprise Sales",
    "manager_id": "uuid-manager",
    "member_count": 8
  },
  "metrics": {
    "total_pipeline_value": 156000000,
    "weighted_pipeline_value": 39000000,
    "active_opportunities_count": 87,
    "expected_revenue_this_quarter": 9500000,
    "team_win_rate": 0.42,
    "average_deal_size": 1793103
  },
  "member_performance": [
    {
      "user_id": "uuid-user-1",
      "name": "John Doe",
      "active_opportunities": 12,
      "pipeline_value": 23000000,
      "weighted_value": 5750000,
      "win_rate": 0.45,
      "deals_won": 5,
      "deals_lost": 3
    }
    // ... all team members
  ],
  "pipeline_by_stage": [
    // ... aggregated team pipeline
  ],
  "opportunities_by_owner": [
    {
      "user_id": "uuid-user-1",
      "name": "John Doe",
      "count": 12,
      "weighted_value": 5750000
    }
    // ... all team members
  ],
  "conversion_rates": {
    "prospection_to_rfi": 0.65,
    "rfi_to_rfq": 0.48,
    "rfq_to_negotiation": 0.72,
    "negotiation_to_closed": 0.58
  },
  "average_time_in_stage": {
    "prospection": 15,
    "rfi": 22,
    "rfq": 18,
    "negotiation": 12
  },
  "revenue_forecast_by_month": [
    // ... team revenue forecast
  ]
}
```

### 7.3 Global Dashboard (Admin)
```http
GET /api/dashboard/global
Authorization: Bearer <access_token>

Response: 200 OK
{
  "metrics": {
    "total_pipeline_value": 450000000,
    "weighted_pipeline_value": 112500000,
    "total_users": 45,
    "total_teams": 3,
    "active_opportunities": 256,
    "expected_revenue_this_year": 35000000
  },
  "teams_performance": [
    {
      "team_id": "uuid-team-1",
      "team_name": "Enterprise Sales",
      "weighted_value": 39000000,
      "win_rate": 0.42,
      "active_opportunities": 87
    }
    // ... all teams
  ],
  "top_performers": [
    {
      "user_id": "uuid-user",
      "name": "John Doe",
      "team": "Enterprise Sales",
      "weighted_value": 5750000,
      "win_rate": 0.45
    }
    // ... top 10 performers
  ],
  "revenue_by_sector": [
    // ... company-wide sector breakdown
  ],
  "monthly_trend": [
    {
      "month": "2025-10",
      "new_opportunities": 25,
      "won_deals": 12,
      "lost_deals": 5,
      "total_value_won": 15000000
    }
    // ... last 12 months
  ]
}
```

---

## 8. Probability Coefficients Endpoints

### 8.1 List Coefficients
```http
GET /api/coefficients
Authorization: Bearer <access_token>

Response: 200 OK
{
  "items": [
    {
      "id": "uuid-coef-1",
      "factor_type": "project_type",
      "factor_value": "Integrated services to Business",
      "coefficient": 0.9,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": "uuid-coef-2",
      "factor_type": "project_maturity",
      "factor_value": "RFI",
      "coefficient": 0.25,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
    // ... all coefficients
  ],
  "grouped": {
    "project_type": [
      {"factor_value": "Integrated services to Business", "coefficient": 0.9},
      {"factor_value": "One-time service", "coefficient": 1.0}
    ],
    "project_maturity": [
      {"factor_value": "Prospection", "coefficient": 0.15},
      {"factor_value": "RFI", "coefficient": 0.25},
      {"factor_value": "RFQ", "coefficient": 0.45},
      {"factor_value": "Negotiation", "coefficient": 0.75},
      {"factor_value": "Contract Signed", "coefficient": 1.0}
    ],
    "client_type": [
      {"factor_value": "New", "coefficient": 0.9},
      {"factor_value": "Existing", "coefficient": 1.05}
    ],
    "client_relationship": [
      {"factor_value": "1 - Low", "coefficient": 0.85},
      {"factor_value": "2 - Medium", "coefficient": 0.9},
      {"factor_value": "3 - Good", "coefficient": 1.0},
      {"factor_value": "4 - High", "coefficient": 1.05},
      {"factor_value": "5 - Excellent", "coefficient": 1.10}
    ],
    "conservative_approach": [
      {"factor_value": "Yes", "coefficient": 0.9},
      {"factor_value": "No", "coefficient": 1.0}
    ]
  }
}
```

### 8.2 Create Coefficient (Admin only)
```http
POST /api/coefficients
Authorization: Bearer <access_token>

Request:
{
  "factor_type": "project_maturity",
  "factor_value": "Pre-Qualification",
  "coefficient": 0.10
}

Response: 201 Created
{
  "id": "uuid-new-coef",
  "factor_type": "project_maturity",
  "factor_value": "Pre-Qualification",
  "coefficient": 0.10,
  "is_active": true,
  "created_at": "2025-11-13T17:00:00Z"
}
```

### 8.3 Update Coefficient (Admin only)
```http
PUT /api/coefficients/{coefficient_id}
Authorization: Bearer <access_token>

Request:
{
  "coefficient": 0.12,
  "is_active": true
}

Response: 200 OK
{
  "id": "uuid-coef",
  "factor_type": "project_maturity",
  "factor_value": "Pre-Qualification",
  "coefficient": 0.12,
  "is_active": true,
  "updated_at": "2025-11-13T17:05:00Z"
}
```

---

## 9. Client Endpoints

### 9.1 List Clients
```http
GET /api/clients?page=1&limit=20&search=company
Authorization: Bearer <access_token>

Response: 200 OK
{
  "items": [
    {
      "id": "uuid-client-1",
      "name": "Dawaiyat Company",
      "industry": "Technology",
      "relationship_tier": "3 - Good",
      "contact_person": "Ahmed Al-Mansour",
      "email": "ahmed@dawaiyat.com",
      "phone": "+966 11 234 5678",
      "opportunity_count": 3,
      "total_value": 25000000,
      "created_at": "2025-01-15T00:00:00Z"
    }
    // ... more clients
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

### 9.2 Create Client
```http
POST /api/clients
Authorization: Bearer <access_token>

Request:
{
  "name": "New Client Company",
  "industry": "Real Estate",
  "relationship_tier": "2 - Medium",
  "contact_person": "Jane Smith",
  "email": "jane@newclient.com",
  "phone": "+966 12 345 6789",
  "address": "123 Business St, Riyadh",
  "notes": "Met at industry conference"
}

Response: 201 Created
{
  "id": "uuid-new-client",
  "name": "New Client Company",
  // ... full client object
  "created_at": "2025-11-13T17:10:00Z"
}
```

---

## 10. Report Endpoints

### 10.1 Generate Pipeline Report
```http
GET /api/reports/pipeline?team_id=uuid&start_date=2025-01-01&end_date=2025-12-31
Authorization: Bearer <access_token>

Response: 200 OK
{
  "report_id": "uuid-report",
  "report_type": "pipeline",
  "generated_at": "2025-11-13T17:15:00Z",
  "parameters": {
    "team_id": "uuid-team",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31"
  },
  "data": {
    "summary": {
      "total_opportunities": 87,
      "total_value": 156000000,
      "weighted_value": 39000000,
      "won_deals": 12,
      "lost_deals": 5
    },
    "by_stage": [
      // ... pipeline breakdown
    ],
    "by_sector": [
      // ... sector breakdown
    ],
    "forecast": [
      // ... revenue forecast
    ]
  },
  "download_url": "/api/reports/uuid-report/download"
}
```

### 10.2 Download Report
```http
GET /api/reports/{report_id}/download?format=excel
Authorization: Bearer <access_token>

Response: 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="pipeline_report_2025-11-13.xlsx"

[Binary file]
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "original_amount",
        "message": "Must be a positive number"
      },
      {
        "field": "closing_date",
        "message": "Must be after starting date"
      }
    ]
  },
  "timestamp": "2025-11-13T17:20:00Z",
  "path": "/api/opportunities",
  "request_id": "uuid-request"
}
```

### Error Codes
- `VALIDATION_ERROR`: Input validation failed (400)
- `UNAUTHORIZED`: Authentication required (401)
- `FORBIDDEN`: Insufficient permissions (403)
- `NOT_FOUND`: Resource not found (404)
- `CONFLICT`: Resource already exists (409)
- `INTERNAL_ERROR`: Server error (500)
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable (503)

---

## Rate Limiting

```
Rate Limits (per user):
- Authentication endpoints: 10 requests/minute
- Read endpoints (GET): 100 requests/minute
- Write endpoints (POST/PUT/DELETE): 30 requests/minute

Response Headers:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699888800

When rate limit exceeded:
Status: 429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
```

---

## Pagination

All list endpoints support pagination:

```
Query Parameters:
- page: integer (default: 1)
- limit: integer (default: 20, max: 100)

Response:
{
  "items": [...],
  "total": 156,
  "page": 1,
  "limit": 20,
  "pages": 8,
  "has_next": true,
  "has_prev": false
}
```

---

This API specification provides Claude Code with clear examples of all endpoints needed to build the complete business development pipeline application.
