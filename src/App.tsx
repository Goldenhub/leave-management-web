import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts
import { AuthLayout, DashboardLayout } from './layouts';

// Route Guards
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

// Auth Pages
import { LoginPage, RegisterPage } from './pages/auth';

// Dashboard
import { DashboardPage } from './pages/dashboard';

// Leave Pages
import { LeaveApplyPage, LeaveHistoryPage, LeaveApprovalsPage, AllLeavesPage } from './pages/leaves';

// Admin/HR Pages
import { EmployeesPage } from './pages/employees';
import { DepartmentsPage } from './pages/departments';
import { DesignationsPage } from './pages/designations';
import { RolesPage } from './pages/roles';
import { LeaveTypesPage } from './pages/leave-types';

// UI Components
import { ToastContainer } from './components/ui';

// Types
import { Permissions } from './types';
import MyLeaves from './pages/leave-types/LeaveType';
import MyLeavesType from './pages/leave-types/LeaveType';
import LeaveTypesTable from './pages/leave-types/LeaveType';
import CreateLeaveType from './pages/leave-types/CreateLeaveType';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Leave Management */}
              <Route path="/leaves" element={<LeaveHistoryPage />} />
              <Route path="/leaves/apply" element={<LeaveApplyPage />} />
              
              <Route
                path="/all-leaves"
                element={
                  <ProtectedRoute requiredPermissions={[Permissions.LEAVE_VIEW]}>
                    <AllLeavesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-leaves"
                element={
                  <ProtectedRoute>
                    <MyLeaves/>
                  </ProtectedRoute>
                }
              />
               <Route
                path="/leave-types/create"
                element={
                  <ProtectedRoute>
                   <CreateLeaveType/>
                  </ProtectedRoute>
                }
              />

                <Route
                path="/approvals"
                element={
                  <ProtectedRoute>
                      <LeaveApprovalsPage />
                  </ProtectedRoute>
                }
              />

                <Route
                path="/leave-types"
                element={
                  <ProtectedRoute>
                    <MyLeavesType/>
                  </ProtectedRoute>
                }
              />

                <Route
                path="/employees"
                element={
                  <ProtectedRoute>
                  <EmployeesPage/>
                  </ProtectedRoute>
                }
              />  <Route
                path="/departments"
                element={
                  <ProtectedRoute>
                    <DepartmentsPage/>
                  </ProtectedRoute>
                }
              />
                <Route
                path="/roles-permissions"
                element={
                  <ProtectedRoute>
                      <RolesPage/>
                  </ProtectedRoute>
                }
              /> 

               <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <MyLeaves/>
                  </ProtectedRoute>
                }
              />

          

              {/* Manager Routes */}
           

              {/* Admin/HR Routes */}
              <Route
                path="/employees"
                element={
                  <ProtectedRoute requiredPermissions={[Permissions.EMPLOYEE_READ]}>
                    <EmployeesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/departments"
                element={
                  <ProtectedRoute requiredPermissions={[Permissions.DEPARTMENT_READ]}>
                    <DepartmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/designations"
                element={
                  <ProtectedRoute requiredPermissions={[Permissions.LEAVE_TYPE_READ]}>
                    <DesignationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roles"
                element={
                  <ProtectedRoute requiredPermissions={[Permissions.ROLE_READ]}>
                    <RolesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leave-types"
                element={
                  <ProtectedRoute requiredPermissions={[Permissions.LEAVE_TYPE_READ]}>
                    <LeaveTypesPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </QueryClientProvider>
  );
}

export default App;
