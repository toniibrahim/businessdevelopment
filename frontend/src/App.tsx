import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from './context/AuthContext';

// Layout components
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard pages
import IndividualDashboard from './pages/dashboard/IndividualDashboard';
import TeamDashboard from './pages/dashboard/TeamDashboard';
import GlobalDashboard from './pages/dashboard/GlobalDashboard';

// Opportunity pages
import OpportunityList from './pages/opportunities/OpportunityList';
import OpportunityCreate from './pages/opportunities/OpportunityCreate';
import OpportunityEdit from './pages/opportunities/OpportunityEdit';
import OpportunityDetail from './pages/opportunities/OpportunityDetail';

// Client pages
import ClientList from './pages/clients/ClientList';
import ClientDetail from './pages/clients/ClientDetail';

// Team pages
import TeamList from './pages/teams/TeamList';
import TeamDetail from './pages/teams/TeamDetail';

// User pages
import UserList from './pages/users/UserList';
import UserProfile from './pages/users/UserProfile';

// Protected route wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string[];
}

function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user && !requireRole.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { isAuthenticated, refreshUser } = useAuthStore();

  useEffect(() => {
    // Refresh user data on app load if token exists
    const token = localStorage.getItem('access_token');
    if (token && !isAuthenticated) {
      refreshUser();
    }
  }, []);

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<IndividualDashboard />} />
        <Route
          path="/dashboard/team"
          element={
            <ProtectedRoute requireRole={['manager', 'admin']}>
              <TeamDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/global"
          element={
            <ProtectedRoute requireRole={['admin']}>
              <GlobalDashboard />
            </ProtectedRoute>
          }
        />

        {/* Opportunities */}
        <Route path="/opportunities" element={<OpportunityList />} />
        <Route path="/opportunities/create" element={<OpportunityCreate />} />
        <Route path="/opportunities/:id" element={<OpportunityDetail />} />
        <Route path="/opportunities/:id/edit" element={<OpportunityEdit />} />

        {/* Clients */}
        <Route path="/clients" element={<ClientList />} />
        <Route path="/clients/:id" element={<ClientDetail />} />

        {/* Teams */}
        <Route
          path="/teams"
          element={
            <ProtectedRoute requireRole={['manager', 'admin']}>
              <TeamList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:id"
          element={
            <ProtectedRoute requireRole={['manager', 'admin']}>
              <TeamDetail />
            </ProtectedRoute>
          }
        />

        {/* Users */}
        <Route
          path="/users"
          element={
            <ProtectedRoute requireRole={['manager', 'admin']}>
              <UserList />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
