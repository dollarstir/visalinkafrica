import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Home, Info, Briefcase, BookOpen, Users, Mail, LogIn, UserPlus, Menu, X } from 'lucide-react';
import apiService from '../../services/api';

const getLogoUrl = (siteLogo) => {
  if (!siteLogo) return '';
  if (siteLogo.startsWith('http')) return siteLogo;
  const apiUrl = process.env.REACT_APP_API_URL || '';
  const origin = apiUrl ? (() => { try { return new URL(apiUrl).origin; } catch { return ''; } })() : (typeof window !== 'undefined' ? window.location.origin : '');
  return origin ? `${origin}${siteLogo}` : siteLogo;
};

const navLinks = [
  { to: '/', end: true, label: 'Home', icon: Home },
  { to: '/about', end: false, label: 'About', icon: Info },
  { to: '/services', end: false, label: 'Services', icon: Briefcase },
  { to: '/blog', end: false, label: 'Blog', icon: BookOpen },
  { to: '/careers', end: false, label: 'Careers', icon: Users },
  { to: '/contact', end: false, label: 'Contact', icon: Mail },
];

const PublicLayout = () => {
  const [siteLogo, setSiteLogo] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    apiService.getPublicSettings().then((data) => setSiteLogo(data.siteLogo || '')).catch(() => setSiteLogo(''));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16 md:h-18">
            <Link to="/" className="flex items-center shrink-0 gap-2">
              {siteLogo ? (
                <img src={getLogoUrl(siteLogo)} alt="VisaLink Africa" className="h-9 md:h-11 w-auto object-contain" />
              ) : (
                <span className="text-xl font-bold tracking-tight text-primary-600 dark:text-primary-400">VisaLink Africa</span>
              )}
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, end, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </NavLink>
              ))}
              <div className="ml-2 flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                <Link
                  to="/register-agent"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-soft hover:shadow-card transition-all duration-200"
                >
                  <UserPlus className="h-4 w-4" />
                  Become an agent
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </div>
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <Link to="/register-agent" className="btn-primary text-sm py-2 px-3 rounded-lg flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Become an agent
              </Link>
              <Link to="/login" className="btn-outline text-sm py-2 px-3 rounded-lg flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-col gap-1">
                {navLinks.map(({ to, end, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
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

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-10 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              © {new Date().getFullYear()} VisaLink Africa. All rights reserved.
            </p>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link to="/about" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Info className="h-4 w-4" /> About
              </Link>
              <Link to="/services" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Briefcase className="h-4 w-4" /> Services
              </Link>
              <Link to="/blog" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <BookOpen className="h-4 w-4" /> Blog
              </Link>
              <Link to="/careers" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Users className="h-4 w-4" /> Careers
              </Link>
              <Link to="/contact" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Mail className="h-4 w-4" /> Contact
              </Link>
              <Link to="/login" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <LogIn className="h-4 w-4" /> CRM Login
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
