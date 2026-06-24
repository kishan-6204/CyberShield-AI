import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="container-shell flex min-h-[calc(100vh-9rem)] items-center justify-center py-16 text-center">
      <div className="max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">404</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Page not found</h1>
        <p className="mt-4 text-slate-400">The security route you requested does not exist or has been moved.</p>
        <Link to="/" className="primary-button mt-8">Return Home</Link>
      </div>
    </section>
  );
}

export default NotFound;
