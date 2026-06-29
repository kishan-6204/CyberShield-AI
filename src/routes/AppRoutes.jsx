import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import EmailAnalyzer from '../pages/EmailAnalyzer.jsx';
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import NotFound from '../pages/NotFound.jsx';
import Reports from '../pages/Reports.jsx';
import PasswordChecker from '../pages/PasswordChecker.jsx';
import Register from '../pages/Register.jsx';
import UrlScanner from '../pages/UrlScanner.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/email-analyzer"
          element={
            <ProtectedRoute>
              <EmailAnalyzer />
            </ProtectedRoute>
          }
        />
        <Route path="/password-checker" element={<PasswordChecker />} />
        <Route path="/url-scanner" element={<UrlScanner />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
