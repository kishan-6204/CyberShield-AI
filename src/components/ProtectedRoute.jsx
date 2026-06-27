import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

function AuthLoadingScreen() {
  return (
    <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center px-4 py-16">
      <div className="glass-card flex w-full max-w-md flex-col items-center rounded-3xl px-8 py-10 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-300/25 border-t-cyan-200" />
        <h2 className="mt-6 text-2xl font-bold text-white">Checking authentication</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">Verifying your session and restoring your account state.</p>
      </div>
    </section>
  );
}

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;

