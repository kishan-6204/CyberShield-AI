import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, register, googleSignIn, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate(redirectTo, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setSubmitting(true);

    try {
      await googleSignIn();
      navigate(redirectTo, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-shell flex min-h-[calc(100vh-9rem)] items-center justify-center py-16">
      <div className="glass-card w-full max-w-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white">Create your account</h1>
        <p className="mt-2 text-sm text-slate-400">Set up your CyberShield AI security workspace.</p>
        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-300">
            Name
            <input
              className="form-input mt-2"
              type="text"
              placeholder="Alex Morgan"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </label>
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
              placeholder="Create a strong password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" className="primary-button w-full" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
          <button type="button" className="secondary-button w-full" onClick={handleGoogleSignIn} disabled={submitting}>
            Continue with Google
          </button>
        </form>
        {error ? (
          <p className="mt-5 rounded-xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">{error}</p>
        ) : null}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link className="font-semibold text-cyan-200" to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
