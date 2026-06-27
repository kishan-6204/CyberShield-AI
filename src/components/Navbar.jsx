import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

const publicLinks = [
  { label: 'Home', path: '/' },
];

const protectedLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Email Analyzer', path: '/email-analyzer' },
  { label: 'URL Scanner', path: '/url-scanner' },
  { label: 'Password Checker', path: '/password-checker' },
];

const guestLinks = [
  { label: 'Login', path: '/login' },
  { label: 'Register', path: '/register' },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();

  const navLinks = [...publicLinks, ...(currentUser ? protectedLinks : guestLinks)];

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-cyan-400/10 text-cyan-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/85 backdrop-blur-xl">
      <nav className="container-shell flex h-16 items-center justify-between" aria-label="Main navigation">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/40 bg-cyan-300/10 text-cyan-200">
            ⛨
          </span>
          <span className="text-lg font-bold tracking-tight text-white">CyberShield AI</span>
        </NavLink>

        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-white/10 p-2 text-slate-200 md:hidden"
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="sr-only">Toggle navigation</span>
          {isOpen ? '✕' : '☰'}
        </button>
      </nav>

      {isOpen && (
        <div id="mobile-menu" className="border-t border-white/10 bg-navy/95 md:hidden">
          <div className="container-shell flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={linkClass} onClick={() => setIsOpen(false)}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
