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
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-gray-800 shadow-corporate">
        <div className="h-1 w-full bg-primary-600 dark:bg-primary-500" aria-hidden />
        <div className="container-wide">
          <div className="flex justify-between items-center h-16 md:h-[4.25rem]">
            <Link to="/" className="flex items-center shrink-0 gap-2">
              {siteLogo ? (
                <img src={getLogoUrl(siteLogo)} alt="VisaLink Africa" className="h-8 md:h-10 w-auto object-contain" />
              ) : (
                <span className="text-lg md:text-xl font-bold tracking-tight text-primary-600 dark:text-primary-400">VisaLink Africa</span>
              )}
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map(({ to, end, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'text-slate-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-gray-800'}`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" />
                  {label}
                </NavLink>
              ))}
              <div className="ml-3 flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-gray-700">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors"
                >
                  Create account
                </Link>
                <Link
                  to="/register-agent"
                  className="btn-primary text-sm py-2.5 px-4 rounded-lg flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Become an agent
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </div>
            </nav>

            <div className="flex items-center gap-2 lg:hidden">
              <Link to="/register" className="btn-outline text-sm py-2 px-3 rounded-lg hidden sm:inline-flex">
                Create account
              </Link>
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
                className="p-2.5 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-200 dark:border-gray-800">
              <div className="flex flex-col gap-0.5">
                {navLinks.map(({ to, end, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-gray-300 transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' : 'hover:bg-slate-50 dark:hover:bg-gray-800'}`
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0 opacity-80" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>

      <footer className="bg-slate-900 dark:bg-black text-slate-300 dark:text-gray-400 mt-auto">
        <div className="container-wide py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="inline-block mb-4">
                {siteLogo ? (
                  <img src={getLogoUrl(siteLogo)} alt="VisaLink Africa" className="h-9 w-auto object-contain brightness-0 invert opacity-95" />
                ) : (
                  <span className="text-xl font-bold text-white">VisaLink Africa</span>
                )}
              </Link>
              <p className="text-sm text-slate-400 dark:text-gray-500 max-w-sm leading-relaxed">
                Visa applications, passport services, and document assistance across Africa. Trusted by individuals and businesses.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-500 mb-4">Company</h4>
              <nav className="flex flex-col gap-3">
                <Link to="/about" className="text-sm hover:text-white dark:hover:text-white transition-colors flex items-center gap-2">
                  <Info className="h-4 w-4 opacity-70" /> About
                </Link>
                <Link to="/services" className="text-sm hover:text-white dark:hover:text-white transition-colors flex items-center gap-2">
                  <Briefcase className="h-4 w-4 opacity-70" /> Services
                </Link>
                <Link to="/blog" className="text-sm hover:text-white dark:hover:text-white transition-colors flex items-center gap-2">
                  <BookOpen className="h-4 w-4 opacity-70" /> Blog
                </Link>
                <Link to="/careers" className="text-sm hover:text-white dark:hover:text-white transition-colors flex items-center gap-2">
                  <Users className="h-4 w-4 opacity-70" /> Careers
                </Link>
                <Link to="/contact" className="text-sm hover:text-white dark:hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="h-4 w-4 opacity-70" /> Contact
                </Link>
              </nav>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-500 mb-4">Account</h4>
              <nav className="flex flex-col gap-3">
                <Link to="/register" className="text-sm hover:text-white dark:hover:text-white transition-colors">Create account</Link>
                <Link to="/register-agent" className="text-sm hover:text-white dark:hover:text-white transition-colors">Become an agent</Link>
                <Link to="/login" className="text-sm hover:text-white dark:hover:text-white transition-colors flex items-center gap-2">
                  <LogIn className="h-4 w-4 opacity-70" /> CRM Login
                </Link>
              </nav>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-700 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-gray-500">
              © {new Date().getFullYear()} VisaLink Africa. All rights reserved.
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-500">
              Visa & document services across Africa
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
