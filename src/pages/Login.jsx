import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, login, googleSignIn, resetPassword, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (currentUser) {
      navigate(redirectTo, { replace: true });
    }
  }, [currentUser, navigate, redirectTo]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearError();
    setMessage('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setMessage('');
    setSubmitting(true);

    try {
      await googleSignIn();
      navigate(redirectTo, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    clearError();
    setMessage('');

    try {
      await resetPassword(email);
      setMessage('Password reset email sent. Check your inbox for instructions.');
    } catch {
      // Error text is surfaced by the auth context.
    }
  };

  return (
    <section className="container-shell flex min-h-[calc(100vh-9rem)] items-center justify-center py-16">
      <div className="glass-card w-full max-w-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to access your CyberShield AI workspace.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-300">
            Email
            <input
              className="form-input mt-2"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="block text-sm font-medium text-slate-300">
            Password
            <input
              className="form-input mt-2"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="primary-button w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
          <button type="button" className="secondary-button w-full" onClick={handleGoogleSignIn} disabled={submitting}>
            Continue with Google
          </button>
          <button type="button" className="w-full text-sm font-semibold text-cyan-200 transition hover:text-cyan-100" onClick={handleResetPassword}>
            Forgot password?
          </button>
        </form>
        {(error || message) ? (
          <p className={`mt-5 rounded-xl border px-4 py-3 text-sm ${error ? 'border-rose-300/20 bg-rose-300/10 text-rose-100' : 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'}`}>
            {error || message}
          </p>
        ) : null}
        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account? <Link className="font-semibold text-cyan-200" to="/register">Register</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
