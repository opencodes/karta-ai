import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminHome } from './pages/admin/Home';
import { TodoPage } from './pages/admin/Todo';
import { AdminDashboard } from './pages/admin/Dashboard';
import { Wallet } from './pages/admin/Wallet';
import { Settings } from './pages/admin/Settings';
import { Contacts } from './pages/admin/Contacts';
import { Calendar } from './pages/admin/Calendar';
import { Family } from './pages/admin/Family';
import { Notifications } from './pages/admin/Notifications';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { useAuth } from './context/AuthContext';
import { BillingPage } from './pages/admin/Billing';
import { EduKartaPage } from './pages/admin/EduKarta';
import { PrepKartaPage } from './pages/admin/PrepKarta';
import { ProfilePage } from './pages/admin/Profile';
import { Card } from './components/ui/Card';
import { RootDashboardPage } from './pages/admin/RootDashboard';
import { RootOrganizationsPage } from './pages/admin/RootOrganizations';
import { RootUsersPage } from './pages/admin/RootUsers';
import { RootOrganizationViewPage } from './pages/admin/RootOrganizationView';
import { OrgAdminConsolePage } from './pages/admin/OrgAdminConsole';
import { OrgAdminUsersPage } from './pages/admin/OrgAdminUsers';
import { RootBillingPage } from './pages/admin/RootBilling';

function LockedAccess({ message }: { message: string }) {
  return (
    <Card className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center space-y-3 max-w-md">
        <div className="mx-auto w-12 h-12 rounded-full border border-teal/40 bg-teal/10 flex items-center justify-center">
          <Lock className="w-5 h-5 text-teal" />
        </div>
        <p className="text-lg font-semibold text-heading">Access Restricted</p>
        <p className="text-sm text-slate-400">{message}</p>
      </div>
    </Card>
  );
}

const App = () => {
  const { isAuthenticated, hasPermission, user } = useAuth();
  const isOrgAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? '/admin' : '/login'} replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/admin" replace /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/admin" replace /> : <SignupPage />} />
      <Route
        path="/admin/*"
        element={isAuthenticated ? (
          <AdminLayout>
            <Routes>
              <Route
                path="/"
                element={user?.isRoot
                  ? <Navigate to="/admin/root" replace />
                  : isOrgAdmin
                    ? <Navigate to="/admin/org-console" replace />
                    : <AdminHome />}
              />
              <Route path="/root" element={user?.isRoot ? <RootDashboardPage /> : <LockedAccess message="Root access required." />} />
              <Route path="/root/organizations" element={user?.isRoot ? <RootOrganizationsPage /> : <LockedAccess message="Root access required." />} />
              <Route path="/root/organizations/:orgId" element={user?.isRoot ? <RootOrganizationViewPage /> : <LockedAccess message="Root access required." />} />
              <Route path="/root/users" element={user?.isRoot ? <RootUsersPage /> : <LockedAccess message="Root access required." />} />
              <Route path="/root/modules" element={user?.isRoot ? <RootBillingPage /> : <LockedAccess message="Root access required." />} />
              <Route path="/org-console" element={isOrgAdmin || user?.isRoot ? <OrgAdminConsolePage /> : <LockedAccess message="Organization admin access required." />} />
              <Route path="/org-users" element={isOrgAdmin || user?.isRoot ? <OrgAdminUsersPage /> : <LockedAccess message="Organization admin access required." />} />
              <Route path="/todo" element={<TodoPage />} />
              <Route path="/todokarta" element={<TodoPage />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route
                path="/subscription"
                element={hasPermission('billing.view') ? <BillingPage /> : <LockedAccess message="Your role does not include billing access." />}
              />
              <Route path="/billing" element={<Navigate to="/admin/subscription" replace />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/account" element={<Navigate to="/admin/profile" replace />} />
              <Route path="/edukarta/*" element={<EduKartaPage />} />
              <Route path="/prepkarta" element={<PrepKartaPage />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/family" element={<Family />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </AdminLayout>
        ) : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/admin' : '/login'} replace />} />
    </Routes>
  );
};

export default App;
