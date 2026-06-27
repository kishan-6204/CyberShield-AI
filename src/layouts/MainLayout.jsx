import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';
import useAuth from '../hooks/useAuth.js';

function AuthLoadingScreen() {
  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="glass-card flex w-full max-w-md flex-col items-center rounded-3xl px-8 py-10 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-300/25 border-t-cyan-200" />
        <h2 className="mt-6 text-2xl font-bold text-white">Loading secure workspace</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">Restoring your authentication state and user session.</p>
      </div>
    </section>
  );
}

function MainLayout() {
  const { loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
