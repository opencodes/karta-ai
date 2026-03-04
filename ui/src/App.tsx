import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
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

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/admin" replace /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/admin" replace /> : <SignupPage />} />
      <Route
        path="/admin/*"
        element={isAuthenticated ? (
          <AdminLayout>
            <Routes>
              <Route path="/" element={<AdminHome />} />
              <Route path="/todo" element={<TodoPage />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
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
