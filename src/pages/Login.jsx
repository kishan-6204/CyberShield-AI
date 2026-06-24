import { Link } from 'react-router-dom';

function Login() {
  return (
    <section className="container-shell flex min-h-[calc(100vh-9rem)] items-center justify-center py-16">
      <div className="glass-card w-full max-w-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to access your CyberShield AI workspace.</p>
        <form className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-slate-300">Email<input className="form-input mt-2" type="email" placeholder="you@company.com" /></label>
          <label className="block text-sm font-medium text-slate-300">Password<input className="form-input mt-2" type="password" placeholder="••••••••" /></label>
          <button type="button" className="primary-button w-full">Login</button>
          <button type="button" className="secondary-button w-full">Continue with Google</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">Don't have an account? <Link className="font-semibold text-cyan-200" to="/register">Register</Link></p>
      </div>
    </section>
  );
}

export default Login;
