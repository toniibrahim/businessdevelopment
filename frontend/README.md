# Business Development Pipeline - Frontend

React 18 + TypeScript + Vite frontend application for the Business Development Pipeline system.

## Features

- **Authentication**: Login, Register, Password Reset with JWT tokens
- **Role-Based Access Control**: Sales, Manager, Admin roles
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Material-UI**: Modern, professional UI components
- **Type-Safe**: Full TypeScript coverage
- **State Management**: Zustand for global state
- **Form Validation**: Formik + Yup
- **API Integration**: Axios with auto token refresh

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router v6** - Routing
- **Zustand** - State management
- **Formik + Yup** - Form handling and validation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **MUI Data Grid** - Advanced tables
- **React Toastify** - Notifications

## Prerequisites

- Node.js 20+ and npm
- Backend API running on `http://localhost:8000`

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` if your backend API is on a different URL:

```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### 4. Login with Demo Accounts

The application comes with pre-seeded demo accounts:

- **Admin**: `admin@bdpipeline.com` / `Admin@123456`
- **Manager**: `manager@bdpipeline.com` / `Manager@123456`
- **Sales**: `sales@bdpipeline.com` / `Sales@123456`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler check |

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   └── layout/        # Layout components (Auth, Main)
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── opportunities/# Opportunity management
│   │   ├── clients/      # Client management
│   │   ├── teams/        # Team management
│   │   └── users/        # User management
│   ├── services/         # API service layer
│   ├── context/          # React context and stores
│   ├── types/            # TypeScript type definitions
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── assets/           # Static assets
│   ├── App.tsx           # Main app component with routing
│   └── main.tsx          # Application entry point
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Key Features

### Authentication

- JWT-based authentication with refresh tokens
- Automatic token refresh on 401 errors
- Persistent login state
- Password reset flow

### API Service

- Centralized API client (`src/services/api.ts`)
- All backend endpoints integrated
- Automatic authentication headers
- Error handling and toast notifications

### Routing

Protected routes with role-based access control:

- `/login`, `/register` - Authentication
- `/dashboard` - Individual dashboard (all roles)
- `/dashboard/team` - Team dashboard (managers, admins)
- `/dashboard/global` - Global dashboard (admins only)
- `/opportunities` - Opportunity management
- `/clients` - Client management
- `/teams` - Team management (managers, admins)
- `/users` - User management (managers, admins)

### State Management

Using Zustand for:
- Authentication state
- User profile
- Global app state

### Type Safety

Complete TypeScript types for:
- All backend entities
- API requests/responses
- Component props
- State management

## Development

### API Proxy

The development server proxies `/api` requests to the backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

### Environment Variables

Available environment variables:

- `VITE_API_URL` - Backend API base URL (default: `http://localhost:8000/api`)

All environment variables must be prefixed with `VITE_` to be exposed to the client.

## Building for Production

### Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview

Test the production build locally:

```bash
npm run preview
```

### Deploy

The `dist/` folder can be deployed to any static hosting service:

- Vercel
- Netlify
- AWS S3 + CloudFront
- Azure Static Web Apps
- GitHub Pages

Make sure to set the `VITE_API_URL` environment variable to your production backend API URL.

## Next Steps

Current status: **Foundation Complete**

The frontend foundation is ready with:
- ✅ Authentication flow
- ✅ Layout and navigation
- ✅ API integration
- ✅ Type definitions
- ✅ Routing with role-based access

Still to implement:
- Opportunity list with data grid and filters
- Opportunity create/edit forms
- Dashboard pages with charts
- Client management UI
- Team and user management
- Profile page
- Activity timeline
- Revenue distribution charts

## Troubleshooting

### Cannot connect to backend

Make sure:
1. Backend is running on `http://localhost:8000`
2. Database and Redis are running
3. CORS is configured correctly in backend

### Build errors

Run type check to find issues:

```bash
npm run type-check
```

### Port already in use

Change the port in `vite.config.ts`:

```typescript
server: {
  port: 3001, // Change to desired port
}
```

## License

MIT
