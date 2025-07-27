import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { Grades } from '../pages/Grades';
import { EmailVerifyPage } from '../components/auth/EmailVerifyPage';
import { Settings } from '../pages/Settings';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/grades" element={<Grades />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/verify-email" element={<EmailVerifyPage />} />
    </Routes>
  );
}