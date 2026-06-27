import { useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

const publicLinks = [{ label: 'Home', path: '/' }];
const privateLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'URL Scanner', path: '/url-scanner' },
  { label: 'Password Checker', path: '/password-checker' },
];
const guestLinks = [
  { label: 'Login', path: '/login' },
  { label: 'Register', path: '/register' },
];

function getAvatarLabel(user) {
  const source = user?.displayName || user?.email || 'U';
  return source
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const navLinks = useMemo(() => [...publicLinks, ...(currentUser ? privateLinks : guestLinks)], [currentUser]);

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-cyan-400/10 text-cyan-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`;

  const handleLogout = async () => {
    setIsOpen(false);

    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

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
          {currentUser ? (
            <>
              <Link
                to="/dashboard"
                className="ml-2 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/[0.06]"
              >
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-cyan-300/15 text-sm font-bold text-cyan-100 ring-1 ring-cyan-300/25">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Profile avatar'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getAvatarLabel(currentUser)
                  )}
                </span>
                <span className="hidden xl:block">{currentUser.displayName || currentUser.email}</span>
              </Link>
              <button type="button" className="secondary-button ml-2" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : null}
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
            {currentUser ? (
              <button
                type="button"
                className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 px-3 py-3 text-left text-sm font-medium text-slate-100 transition hover:bg-white/[0.04]"
                onClick={handleLogout}
              >
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-cyan-300/15 text-sm font-bold text-cyan-100 ring-1 ring-cyan-300/25">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Profile avatar'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getAvatarLabel(currentUser)
                  )}
                </span>
                <span>{currentUser.displayName || currentUser.email}</span>
              </button>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
