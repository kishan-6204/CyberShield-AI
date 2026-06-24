import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Login', path: '/login' },
  { label: 'Register', path: '/register' },
];

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/70">
      <div className="container-shell grid gap-8 py-10 md:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="text-xl font-bold text-white">CyberShield AI</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Helping teams and individuals recognize digital threats early, strengthen everyday security habits,
            and make safer decisions online.
          </p>
          <p className="mt-5 text-sm text-slate-500">© {new Date().getFullYear()} CyberShield AI. All rights reserved.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Quick links</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-400">
            {quickLinks.map((link) => (
              <Link key={link.path} to={link.path} className="transition hover:text-cyan-200">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
