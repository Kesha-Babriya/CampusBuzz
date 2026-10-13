import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Bookmark,
  Menu,
  X,
  Shield,
  Layers,
  LogOut,
  ChevronDown,
  User
} from 'lucide-react';
import Logo from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useSavedEvents } from '../../context/SavedEventsContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { savedEventIds } = useSavedEvents();
  const location = useLocation();

  // Helper for human-readable role presentation
  const getRoleBadgeLabel = (role, clubName) => {
    if (role === 'admin') return 'Main Admin';
    if (role === 'organizer') return clubName ? `Club Head • ${clubName}` : 'Club Head';
    return 'Student';
  };

  // Close mobile menu upon navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Calendar', path: '/calendar' },
    { name: 'Clubs', path: '/clubs' },
    { name: 'Find Your Club', path: '/quiz', highlight: true },
    { name: 'Campus Lounge', path: '/lounge' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'glass-nav py-3.5 shadow-2xl shadow-black/40'
          : 'bg-[#070a12]/80 backdrop-blur-md py-4 border-b border-white/[0.04]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-full border border-slate-800/80 shadow-inner">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `
                  relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200
                  ${isActive 
                    ? 'text-white bg-blue-600/90 shadow-sm shadow-blue-500/30' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }
                  ${item.highlight && !isActive ? 'text-cyan-300 font-semibold' : ''}
                `}
              >
                {item.name}
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Icons: Saved & Auth */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Saved Events Bookmark Button */}
            <Link
              to="/saved"
              className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors"
              title="Saved Events"
            >
              <Bookmark className="w-4 h-4" />
              {savedEventIds.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-500 text-slate-950">
                  {savedEventIds.length}
                </span>
              )}
            </Link>

            {/* Authenticated User Menu */}
            <div className="relative">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-all text-xs text-left"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-purple-600 flex items-center justify-center text-white text-[10px] font-mono font-bold shadow-sm ring-1 ring-cyan-400/50">
                      {user.name ? user.name.slice(0, 1).toUpperCase() : <User className="w-3 h-3 text-cyan-300" />}
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="font-semibold text-slate-200 truncate max-w-[110px]">
                        {user.name ? (user.name.split(' ')[0] || user.name) : 'Student'}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        {user.role === 'admin' ? 'Admin' : user.role === 'organizer' ? 'Club Head' : 'Student'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-3 border-b border-slate-800/80">
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800/50 text-[11px] text-cyan-300 font-mono">
                          <span>{getRoleBadgeLabel(user.role, user.clubName)}</span>
                        </div>
                      </div>

                      {/* Navigation Shortcuts */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl"
                        >
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          <span>My Profile</span>
                        </Link>
                        {user.role === 'organizer' && (
                          <Link
                            to="/organizer"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl"
                          >
                            <Layers className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Club Head Dashboard</span>
                          </Link>
                        )}
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl"
                          >
                            <Shield className="w-3.5 h-3.5 text-purple-400" />
                            <span>Admin Console</span>
                          </Link>
                        )}
                        <Link
                          to="/saved"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                          <span>Saved Events ({savedEventIds.length})</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-800/80">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs font-semibold px-3.5 py-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link
              to="/saved"
              className="p-2 rounded-xl bg-slate-900/80 text-slate-300 border border-slate-800"
            >
              <Bookmark className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#070a12]/98 backdrop-blur-2xl px-5 pt-4 pb-6 mt-3 space-y-3 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `
                  px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between
                  ${isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-900'}
                `}
              >
                <span>{item.name}</span>
                {item.highlight && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300">
                    Quiz Matcher
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Auth & Dashboards */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-mono font-bold shadow-sm ring-1 ring-cyan-400/50">
                      {user.name ? user.name.slice(0, 1).toUpperCase() : <User className="w-4 h-4 text-cyan-300" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{user.name || 'Student'}</p>
                      <p className="text-[10px] text-cyan-400 font-mono">
                        {getRoleBadgeLabel(user.role, user.clubName)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="text-xs text-rose-400 px-2 py-1 rounded bg-rose-950/40"
                  >
                    Logout
                  </button>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center text-xs font-medium py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
                >
                  My Profile & Account
                </Link>

                {user.role === 'organizer' && (
                  <Link
                    to="/organizer"
                    className="block text-center text-xs font-medium py-2 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-800/40"
                  >
                    Open Club Head Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block text-center text-xs font-medium py-2 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800/40"
                  >
                    Open Admin Console
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="text-center text-xs font-semibold py-2.5 rounded-xl bg-slate-800 text-slate-200"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-center text-xs font-semibold py-2.5 rounded-xl bg-blue-600 text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
