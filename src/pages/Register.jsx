import { Link } from 'react-router-dom';

function Register() {
  return (
    <section className="container-shell flex min-h-[calc(100vh-9rem)] items-center justify-center py-16">
      <div className="glass-card w-full max-w-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white">Create your account</h1>
        <p className="mt-2 text-sm text-slate-400">Set up your CyberShield AI security workspace.</p>
        <form className="mt-8 grid gap-5">
          <label className="block text-sm font-medium text-slate-300">Full Name<input className="form-input mt-2" type="text" placeholder="Alex Morgan" /></label>
          <label className="block text-sm font-medium text-slate-300">Email<input className="form-input mt-2" type="email" placeholder="you@company.com" /></label>
          <label className="block text-sm font-medium text-slate-300">Password<input className="form-input mt-2" type="password" placeholder="Create a strong password" /></label>
          <label className="block text-sm font-medium text-slate-300">Confirm Password<input className="form-input mt-2" type="password" placeholder="Confirm your password" /></label>
          <button type="button" className="primary-button w-full">Create Account</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">Already have an account? <Link className="font-semibold text-cyan-200" to="/login">Login</Link></p>
      </div>
    </section>
  );
}

export default Register;
