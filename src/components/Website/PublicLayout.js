import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import apiService from '../../services/api';

const getLogoUrl = (siteLogo) => {
  if (!siteLogo) return '';
  if (siteLogo.startsWith('http')) return siteLogo;
  const apiUrl = process.env.REACT_APP_API_URL || '';
  const origin = apiUrl ? (() => { try { return new URL(apiUrl).origin; } catch { return ''; } })() : (typeof window !== 'undefined' ? window.location.origin : '');
  return origin ? `${origin}${siteLogo}` : siteLogo;
};

const PublicLayout = () => {
  const [siteLogo, setSiteLogo] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    apiService.getPublicSettings().then((data) => setSiteLogo(data.siteLogo || '')).catch(() => setSiteLogo(''));
  }, []);

  const navLinks = [
    { to: '/', end: true, label: 'Home' },
    { to: '/about', end: false, label: 'About' },
    { to: '/services', end: false, label: 'Services' },
    { to: '/contact', end: false, label: 'Contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-18">
            <Link to="/" className="flex items-center shrink-0">
              {siteLogo ? (
                <img src={getLogoUrl(siteLogo)} alt="VisaLink Africa" className="h-10 md:h-12 w-auto object-contain" />
              ) : (
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">VisaLink Africa</span>
              )}
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(({ to, end, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <Link
                to="/register-agent"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                Register to become an agent
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Login
              </Link>
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <Link to="/register-agent" className="btn-primary text-sm py-2 px-3">Become an agent</Link>
              <Link to="/login" className="btn-outline text-sm py-2 px-3">Login</Link>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-2">
                {navLinks.map(({ to, end, label }) => (
                  <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} VisaLink Africa. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">About</Link>
              <Link to="/services" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Services</Link>
              <Link to="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Contact</Link>
              <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">CRM Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
