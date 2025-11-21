import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import { AdminDashboard } from '@/pages/admin/dashboard';
import { UserDashboard } from '@/pages/user/dashboard';
import { UserTasks } from '@/pages/user/tasks';
import UserProjectsPage from '@/pages/user/projects';
import ProjectDetailPage from '@/pages/user/projects/detail';
import ProjectSettingsPage from '@/pages/user/projects/settings';
import UsersPage from '@/pages/admin/users';
import CreateUserPage from '@/pages/admin/users/create';
import ViewUserPage from '@/pages/admin/users/view';
import EditUserPage from '@/pages/admin/users/edit';
import ProjectsPage from '@/pages/admin/projects';
import TasksPage from '@/pages/admin/tasks';
import ReportsPage from '@/pages/admin/reports';
import AuditTrailPage from '@/pages/admin/audit_trail';
import AppLayout from './layouts/app-layout';

// Protected Route Component with Role-Based Access
function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'user')[];
}) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check role-based access
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard if user doesn't have access
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
    return <Navigate to={redirectPath} />;
  }

  return <AppLayout>{children}</AppLayout>;
}

// Get default dashboard path based on user role
function getDefaultDashboard(role?: 'admin' | 'user'): string {
  if (role === 'admin') return '/admin/dashboard';
  return '/user/dashboard';
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  const defaultDashboard = user?.role ? getDefaultDashboard(user.role) : '/user/dashboard';

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={defaultDashboard} /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={defaultDashboard} /> : <Register />}
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/create"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CreateUserPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:userId"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ViewUserPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:userId/edit"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EditUserPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-trail"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AuditTrailPage />
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/tasks"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserTasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/projects"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/projects/:projectId"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <ProjectDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/projects/:projectId/settings"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <ProjectSettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Default Redirects */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? defaultDashboard : "/login"} />}
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? defaultDashboard : "/login"} />}
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position='top-center'
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App

