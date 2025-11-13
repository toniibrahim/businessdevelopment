# Claude Code Prompt: Business Development & Opportunity Tracking System

## Project Overview
Create a comprehensive, production-ready web application for business development and sales opportunity tracking with multi-user support, role-based access control, and advanced analytics dashboards. The system should support individual sales team members tracking their opportunities while providing managers with consolidated views and team performance analytics.

---

## Core Requirements

### 1. Technology Stack
**Backend:**
- Node.js with Express and TypeScript
- PostgreSQL database with proper indexing
- TypeORM or Prisma ORM with migrations
- JWT-based authentication with refresh tokens
- Redis for caching and session management

**Frontend:**
- React 18+ with TypeScript
- Modern UI framework: Material-UI (MUI) or Ant Design
- State management: Redux Toolkit or Zustand
- Data visualization: Recharts or Chart.js
- Data grid: AG-Grid or TanStack Table
- Date handling: date-fns or dayjs
- **Mobile-first responsive design** for mobile web browsers (iOS Safari, Chrome, Android browsers)

**Infrastructure:**
- Docker containerization with docker-compose
- Environment-based configuration (.env files)
- Nginx reverse proxy configuration
- Database backup scripts

---

## 2. Data Model

### Users & Authentication
```typescript
// User Entity
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password_hash: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ type: 'enum', enum: ['sales', 'manager', 'admin'] })
  role: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ type: 'uuid', nullable: true })
  team_id: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ nullable: true })
  profile_picture_url: string;
}
```

```typescript
// Team Entity
@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @Column({ type: 'uuid' })
  manager_id: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

### Opportunities/Projects
Based on the uploaded Excel pipeline, implement:

```typescript
// Opportunity Entity
@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  project_name: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'uuid' })
  @Index()
  owner_id: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ type: 'uuid' })
  @Index()
  team_id: string;

  // Basic Information
  @Column({ type: 'text', nullable: true })
  update_notes: string;

  @Column({ type: 'enum', enum: ['IFM', 'IFM Hard', 'Civil Fitout works', 'special projects'] })
  service_type: string;

  @Column({ type: 'enum', enum: ['Data Center', 'Industrial', 'Commercial', 'Special project'] })
  sector_type: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  original_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.13 })
  gross_margin_percentage: number;

  // Probability Scoring Factors
  @Column({ nullable: true })
  project_type: string;

  @Column({ 
    type: 'enum', 
    enum: ['Prospection', 'RFI', 'RFQ', 'Negotiation', 'Contract Signed']
  })
  project_maturity: string;

  @Column({ type: 'enum', enum: ['New', 'Existing'] })
  client_type: string;

  @Column({ 
    type: 'enum', 
    enum: ['1 - Low', '2 - Medium', '3 - Good', '4 - High', '5 - Excellent']
  })
  client_relationship: string;

  @Column({ type: 'boolean', default: false })
  conservative_approach: boolean;

  // Calculated Fields
  @Column({ type: 'decimal', precision: 5, scale: 4 })
  probability_score: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  weighted_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  gross_margin_amount: number;

  // Timeline
  @Column({ type: 'date' })
  @Index()
  starting_date: Date;

  @Column({ type: 'date' })
  @Index()
  closing_date: Date;

  @Column({ type: 'integer' })
  duration_months: number;

  // Status & Tracking
  @Column({ 
    type: 'enum', 
    enum: ['Active', 'Won', 'Lost', 'On Hold', 'Cancelled'],
    default: 'Active'
  })
  @Index()
  status: string;

  @Column({ 
    type: 'enum', 
    enum: ['Prospection', 'Qualification', 'Proposal', 'Negotiation', 'Closed']
  })
  @Index()
  stage: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  win_probability_override: number;

  // Metadata
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @Column({ type: 'uuid' })
  created_by_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'last_modified_by_id' })
  last_modified_by: User;

  @Column({ type: 'uuid' })
  last_modified_by_id: string;

  // Relations
  @OneToMany(() => RevenueDistribution, (rd) => rd.opportunity)
  revenue_distribution: RevenueDistribution[];

  @OneToMany(() => ActivityLog, (al) => al.opportunity)
  activities: ActivityLog[];
}
```

```typescript
// ProbabilityCoefficients Entity
@Entity('probability_coefficients')
export class ProbabilityCoefficient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    type: 'enum', 
    enum: ['project_type', 'project_maturity', 'client_type', 'client_relationship', 'conservative_approach']
  })
  factor_type: string;

  @Column()
  factor_value: string;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  coefficient: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

```typescript
// RevenueDistribution Entity
@Entity('revenue_distribution')
export class RevenueDistribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Opportunity, (opp) => opp.revenue_distribution)
  @JoinColumn({ name: 'opportunity_id' })
  opportunity: Opportunity;

  @Column({ type: 'uuid' })
  @Index()
  opportunity_id: string;

  @Column({ type: 'integer' })
  year: number;

  @Column({ type: 'integer' })
  month: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  sales_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  gross_margin_amount: number;

  @Column({ type: 'boolean', default: true })
  is_forecast: boolean;
}
```

```typescript
// ActivityLog Entity
@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Opportunity, (opp) => opp.activities)
  @JoinColumn({ name: 'opportunity_id' })
  opportunity: Opportunity;

  @Column({ type: 'uuid' })
  @Index()
  opportunity_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ 
    type: 'enum', 
    enum: ['created', 'updated', 'status_changed', 'note_added', 'meeting_scheduled', 'call_made', 'email_sent', 'proposal_sent']
  })
  activity_type: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  old_value: any;

  @Column({ type: 'jsonb', nullable: true })
  new_value: any;

  @CreateDateColumn()
  @Index()
  created_at: Date;
}
```

```typescript
// ClientCompany Entity
@Entity('client_companies')
export class ClientCompany {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  name: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ 
    type: 'enum', 
    enum: ['1 - Low', '2 - Medium', '3 - Good', '4 - High', '5 - Excellent']
  })
  relationship_tier: string;

  @Column({ nullable: true })
  contact_person: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

---

## 3. Core Features

### A. Authentication & Authorization
1. **User Registration & Login**
   - Email/username + password authentication
   - JWT access token (15 min) + refresh token (7 days)
   - Password strength validation (min 8 chars, uppercase, lowercase, number, special char)
   - Password reset via email (with token expiry)
   - Two-factor authentication (TOTP) - optional enhancement

2. **Role-Based Access Control (RBAC)**
   - **Sales Role**: Can create/edit/delete own opportunities, view own dashboard
   - **Manager Role**: Can view all opportunities in their team, edit team opportunities, access team dashboards
   - **Admin Role**: Full system access, user management, global settings
   - Implement decorator/middleware for route protection based on roles

3. **User Profile Management**
   - Update personal information
   - Change password
   - Upload profile picture
   - View activity history

### B. Opportunity Management

1. **CRUD Operations**
   - Create new opportunity with form validation
   - Edit opportunity details
   - Delete opportunity (soft delete preferred)
   - Duplicate opportunity (for template/similar deals)
   - Bulk operations: status update, assign owner, delete

2. **Advanced Features**
   - Auto-save drafts every 30 seconds
   - Probability calculation engine based on coefficient matrix
   - Manual probability override option
   - Revenue distribution calculator (spread amount across months/years)
   - Attachment support (proposals, contracts, documents) - store in cloud storage
   - Commenting/notes system with @mentions
   - Email notifications on status changes

3. **Smart Probability Scoring**
   - Implement coefficient-based calculation:
     ```
     Probability = base_coefficient 
                   × project_type_coef 
                   × maturity_coef 
                   × client_type_coef 
                   × relationship_coef 
                   × (conservative_approach_coef if applicable)
     ```
   - Allow admin to configure coefficient values
   - Display coefficient breakdown in UI
   - Historical probability accuracy tracking

4. **Search & Filtering**
   - Full-text search across project names, notes, client names
   - Advanced filters:
     - Date ranges (created, starting, closing dates)
     - Amount ranges (min/max)
     - Status, stage, service type, sector
     - Owner, team
     - Probability ranges
   - Saved filter presets
   - Export filtered results to Excel/CSV

5. **List Views**
   - Grid view with sortable columns
   - Kanban board view (by stage)
   - Calendar view (by timeline)
   - Compact list view
   - Customizable column visibility and order

### C. Dashboards & Analytics

#### Individual Sales Dashboard
1. **Key Metrics Cards**
   - Total pipeline value (weighted)
   - Number of active opportunities
   - Expected revenue this month/quarter/year
   - Win rate (%)
   - Average deal size
   - Days in pipeline (average)

2. **Visual Charts**
   - Pipeline by stage (funnel chart)
   - Revenue forecast by month/quarter (bar chart)
   - Opportunities by sector (pie chart)
   - Probability distribution (histogram)
   - Win/loss trend (line chart over time)
   - Activities performed (bar chart: calls, meetings, emails)

3. **Lists & Tables**
   - Top 10 opportunities by value
   - Opportunities closing this month
   - Overdue follow-ups
   - Recently updated opportunities

#### Manager Team Dashboard
1. **Team Performance Overview**
   - Aggregated team metrics (sum of all team members)
   - Team vs individual performance comparison
   - Top performers leaderboard
   - Team activity summary

2. **Consolidated Views**
   - All team opportunities in single grid
   - Team pipeline by stage (stacked funnel)
   - Team revenue forecast (stacked area chart)
   - Individual contribution breakdown (stacked bar)

3. **Team Analytics**
   - Conversion rates by stage
   - Average time in each stage
   - Win/loss analysis by sales person
   - Sector/service type distribution
   - Client relationship quality distribution

4. **Comparative Reports**
   - Month-over-month growth
   - Quarter-over-quarter comparison
   - Year-over-year trends
   - Budget vs actual tracking

#### Admin Global Dashboard
1. **System-Wide Metrics**
   - Company-wide pipeline value
   - All teams performance comparison
   - User activity statistics
   - System health indicators

2. **Reports**
   - Downloadable Excel/PDF reports
   - Scheduled email reports (daily/weekly/monthly)
   - Custom report builder

### D. Revenue Forecasting

1. **Time-Based Distribution**
   - Automatically distribute opportunity value across duration
   - Monthly breakdown from start to closing date
   - Yearly aggregation (2025, 2026, 2027, 2028, 2029, 2030+)
   - Weighted forecasting (amount × probability)

2. **Forecast Views**
   - Table view with year columns (like Excel pipeline)
   - Waterfall chart showing revenue buildup
   - Cumulative forecast line chart
   - Comparison: forecast vs actual (for closed deals)

3. **Scenarios**
   - Best case (high probability deals)
   - Most likely (weighted by probability)
   - Worst case (only high-confidence deals)
   - Toggle between scenarios in dashboard

### E. Activity Tracking

1. **Activity Logging**
   - Automatic logging of all opportunity changes
   - Manual activity entry (calls, meetings, emails, notes)
   - Activity timeline view per opportunity
   - Activity calendar view

2. **Task Management**
   - Create follow-up tasks
   - Set reminders
   - Task assignments
   - Task completion tracking

3. **Meeting Scheduler**
   - Schedule client meetings
   - Link meetings to opportunities
   - Meeting notes capture
   - Integration placeholder for calendar sync (Google/Outlook)

---

## 4. Technical Implementation Details

### Backend API Endpoints

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me

Users:
GET    /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
DELETE /api/users/{id}
GET    /api/users/me
PUT    /api/users/me
POST   /api/users/me/change-password

Teams:
GET    /api/teams
GET    /api/teams/{id}
POST   /api/teams
PUT    /api/teams/{id}
DELETE /api/teams/{id}
GET    /api/teams/{id}/members
GET    /api/teams/{id}/opportunities

Opportunities:
GET    /api/opportunities                    # List with filters
GET    /api/opportunities/{id}
POST   /api/opportunities
PUT    /api/opportunities/{id}
DELETE /api/opportunities/{id}
POST   /api/opportunities/{id}/duplicate
GET    /api/opportunities/{id}/activities
POST   /api/opportunities/{id}/activities
GET    /api/opportunities/{id}/attachments
POST   /api/opportunities/{id}/attachments
DELETE /api/opportunities/{id}/attachments/{attachment_id}
GET    /api/opportunities/{id}/revenue-distribution
PUT    /api/opportunities/{id}/status
POST   /api/opportunities/bulk-update
POST   /api/opportunities/export              # Export to Excel/CSV

Coefficients:
GET    /api/coefficients
GET    /api/coefficients/{id}
POST   /api/coefficients                      # Admin only
PUT    /api/coefficients/{id}                 # Admin only
DELETE /api/coefficients/{id}                 # Admin only

Dashboards:
GET    /api/dashboard/my-dashboard            # Individual
GET    /api/dashboard/team/{team_id}          # Team manager
GET    /api/dashboard/global                  # Admin
GET    /api/dashboard/metrics                 # Query params for filters
GET    /api/dashboard/charts/{chart_type}     # Specific chart data

Reports:
GET    /api/reports/pipeline                  # Pipeline report
GET    /api/reports/forecast                  # Forecast report
GET    /api/reports/performance               # Performance report
POST   /api/reports/custom                    # Custom report generation
GET    /api/reports/{id}/download             # Download report

Clients:
GET    /api/clients
GET    /api/clients/{id}
POST   /api/clients
PUT    /api/clients/{id}
DELETE /api/clients/{id}
```

### Database Optimization

1. **Indexes**
   - Create indexes on: user email, opportunity owner_id, team_id, status, stage, starting_date, closing_date
   - Composite indexes for common filter combinations
   - Full-text search indexes on project_name, notes

2. **Query Optimization**
   - Use eager loading for relationships (avoid N+1 queries)
   - Implement pagination (limit/offset or cursor-based)
   - Use database views for complex aggregations
   - Cache frequently accessed data in Redis

3. **Data Archiving**
   - Archive old opportunities (e.g., closed > 2 years ago)
   - Maintain separate archive table for reporting

### Security

1. **API Security**
   - Rate limiting (e.g., 100 requests/min per user)
   - CORS configuration
   - Input validation and sanitization
   - SQL injection prevention (parameterized queries)
   - XSS protection

2. **Data Security**
   - Encrypt sensitive data at rest
   - Use HTTPS for all communications
   - Secure file upload validation
   - Implement audit logging

3. **Authentication**
   - Secure password hashing (bcrypt/argon2)
   - Token expiry and rotation
   - Failed login attempt tracking
   - Session management

### Frontend Implementation

1. **State Management**
   - Global state: user authentication, app settings
   - Feature state: opportunities list, filters, dashboards
   - Server state: React Query for API data caching and synchronization

2. **Routing**
   ```
   /login
   /register
   /forgot-password
   /dashboard                 # Role-based redirect
   /opportunities
   /opportunities/new
   /opportunities/{id}
   /opportunities/{id}/edit
   /team-dashboard           # Manager only
   /admin-dashboard          # Admin only
   /reports
   /clients
   /settings
   /profile
   ```

3. **Key Components**
   - OpportunityForm: Multi-step form with validation
   - OpportunityList: Grid with advanced filtering
   - KanbanBoard: Drag-and-drop stage management
   - DashboardCharts: Reusable chart components
   - FilterPanel: Advanced search UI
   - ActivityTimeline: Activity history display
   - RevenueTable: Year/month distribution grid

4. **Responsive Design**
   - Mobile-first approach
   - Tablet and desktop layouts
   - Touch-friendly interactions
   - Responsive data tables (collapse on mobile)

### Data Validation

1. **Backend Validation**
   - Use class-validator decorators for DTO validation
   - Joi or Yup for complex validation rules
   - Business logic validation (e.g., closing date > starting date)
   - Amount validations (positive numbers)
   - Probability range (0-1 or 0-100%)

2. **Frontend Validation**
   - Real-time form validation
   - Required field indicators
   - Format validation (email, phone, dates)
   - Custom validation rules
   - Error message display

```typescript
// Example DTO with validation
import { IsString, IsNumber, IsDate, IsEnum, Min, Max } from 'class-validator';

export class CreateOpportunityDto {
  @IsString()
  project_name: string;

  @IsNumber()
  @Min(0)
  original_amount: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  gross_margin_percentage: number;

  @IsEnum(['IFM', 'IFM Hard', 'Civil Fitout works', 'special projects'])
  service_type: string;

  @IsDate()
  starting_date: Date;

  @IsDate()
  closing_date: Date;
}
```

---

## 5. Advanced Features (Phase 2)

1. **Email Integration**
   - Connect to email providers (Gmail, Outlook)
   - Track email communications linked to opportunities
   - Email templates for common scenarios

2. **Document Generation**
   - Generate proposals from templates
   - Contract generation with merge fields
   - PDF export of opportunities

3. **Advanced Analytics**
   - Predictive analytics (deal closing likelihood using ML)
   - Churn risk analysis
   - Recommendation engine for next best actions

4. **Collaboration**
   - Real-time updates (WebSocket)
   - Team chat per opportunity
   - @mentions and notifications
   - Shared notes and documents

5. **Integration APIs**
   - Webhook support for external systems
   - REST API for third-party integrations
   - Zapier/Make.com integration

6. **Mobile Web Browser Optimization**
   - Progressive Web App (PWA) features
   - Offline capability with service workers
   - Touch-optimized UI components
   - Mobile-specific layouts and navigation
   - Optimized performance for mobile networks
   - Add to home screen functionality

---

## 6. Deliverables

### Code Structure
```
project-root/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── opportunities.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── teams.routes.ts
│   │   │   ├── dashboards.routes.ts
│   │   │   └── reports.routes.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── opportunities.controller.ts
│   │   │   ├── users.controller.ts
│   │   │   └── teams.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── env.ts
│   │   │   └── redis.ts
│   │   ├── entities/
│   │   │   ├── User.entity.ts
│   │   │   ├── Opportunity.entity.ts
│   │   │   ├── Team.entity.ts
│   │   │   └── index.ts
│   │   ├── dto/
│   │   │   ├── user.dto.ts
│   │   │   ├── opportunity.dto.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── opportunity.service.ts
│   │   │   ├── probability.service.ts
│   │   │   └── revenue.service.ts
│   │   ├── utils/
│   │   │   ├── email.util.ts
│   │   │   ├── excel.util.ts
│   │   │   └── validators.util.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── migrations/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── opportunities/
│   │   │   ├── dashboards/
│   │   │   ├── auth/
│   │   │   └── layout/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Opportunities.tsx
│   │   │   ├── OpportunityDetail.tsx
│   │   │   └── Login.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   └── store.ts
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── README.md
```

### Documentation
1. **README.md**
   - Project overview
   - Setup instructions
   - Environment variables
   - Running the application

2. **API_DOCUMENTATION.md**
   - All endpoints with examples
   - Request/response schemas
   - Authentication flow
   - Error codes

3. **USER_GUIDE.md**
   - User roles and permissions
   - How to create opportunities
   - Dashboard navigation
   - Common workflows

4. **DEPLOYMENT.md**
   - Production deployment guide
   - Environment setup
   - Database migrations
   - Backup procedures

---

## 7. Sample Data & Testing

1. **Seed Data Script**
   - Create 3 teams with managers
   - Create 10-15 sales users
   - Create 50+ sample opportunities across various stages
   - Create probability coefficients based on the Excel structure
   - Create sample activities and notes

2. **Test Coverage**
   - Unit tests for business logic
   - Integration tests for API endpoints
   - End-to-end tests for critical workflows
   - Performance tests for dashboard queries

---

## 8. UI/UX Guidelines

1. **Design Principles**
   - Clean, modern interface
   - Consistent color scheme (primary, secondary, success, warning, error colors)
   - Proper spacing and typography
   - Intuitive navigation
   - Loading states and skeletons
   - Empty states with helpful messages

2. **Key Screens**
   - Login page with company branding
   - Dashboard with metric cards and charts
   - Opportunity list with filters sidebar
   - Opportunity detail page with tabs (Details, Activities, Documents, Revenue)
   - Kanban board with drag-and-drop
   - Team dashboard with team switcher

3. **Interactions**
   - Toast notifications for success/error messages
   - Confirmation modals for destructive actions
   - Inline editing where appropriate
   - Bulk selection with checkboxes
   - Export button with format options

---

## 9. Performance Requirements

- Dashboard should load in < 2 seconds
- Opportunity list should support 10,000+ records with smooth scrolling
- Search results should return in < 500ms
- API endpoints should respond in < 200ms (excluding DB-heavy operations)
- Support 100+ concurrent users

---

## 10. Deployment Considerations

1. **Environment Variables**
   ```
   DATABASE_URL=postgresql://user:pass@localhost/dbname
   REDIS_URL=redis://localhost:6379
   SECRET_KEY=your-secret-key
   JWT_SECRET=your-jwt-secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email
   SMTP_PASSWORD=your-password
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:8000
   ```

2. **Docker Setup**
   - Multi-stage builds for smaller images
   - Health checks for containers
   - Volume mounts for data persistence
   - Network configuration for inter-container communication

3. **Production Checklist**
   - Enable HTTPS
   - Set up database backups
   - Configure logging (structured JSON logs)
   - Set up monitoring (CPU, memory, response times)
   - Error tracking (Sentry or similar)
   - CDN for static assets

---

## Success Criteria

The application is considered complete when:
1. ✅ All CRUD operations work correctly with proper validation
2. ✅ Role-based access control is properly enforced
3. ✅ Probability calculation matches the Excel formula logic
4. ✅ Revenue distribution calculates correctly across time periods
5. ✅ Individual dashboard displays accurate metrics and charts
6. ✅ Team dashboard aggregates data correctly for managers
7. ✅ Search and filtering work efficiently with large datasets
8. ✅ Export to Excel produces files matching the original structure
9. ✅ Application is fully responsive and works on mobile/tablet/desktop
10. ✅ All API endpoints have proper error handling and return appropriate status codes
11. ✅ Documentation is complete and accurate
12. ✅ Sample data demonstrates all features
13. ✅ Application can be deployed with Docker Compose in < 5 minutes

---

## Notes for Claude Code

- Start with the database schema and TypeORM entities
- Implement authentication and authorization middleware first
- Build the opportunity CRUD operations next
- Then implement the probability calculation service
- Focus on the individual dashboard before the team dashboard
- Use proper error handling and validation throughout
- Write clean, well-documented TypeScript code
- Follow REST API best practices
- Implement proper logging for debugging
- Create migration scripts for database schema using TypeORM migrations
- Include comprehensive comments explaining business logic
- Follow the project structure outlined above
- Test each feature as you build it
- Use Express middleware for cross-cutting concerns
- Implement request validation using class-validator
- Use dependency injection pattern for services
- Handle async/await errors properly with try-catch
- Use TypeScript strict mode for better type safety

This system should feel like a professional SaaS application with attention to detail, performance, and user experience. The goal is to replace the Excel-based pipeline with a robust, scalable web application that multiple team members can use simultaneously.
