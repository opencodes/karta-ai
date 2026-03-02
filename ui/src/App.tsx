import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/Dashboard';
import { Wallet } from './pages/admin/Wallet';
import { Settings } from './pages/admin/Settings';
import { Contacts } from './pages/admin/Contacts';
import { Calendar } from './pages/admin/Calendar';
import { Family } from './pages/admin/Family';
import { Notifications } from './pages/admin/Notifications';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/admin/*"
        element={
          <AdminLayout>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/family" element={<Family />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </AdminLayout>
        }
      />
    </Routes>
  );
};

export default App;
