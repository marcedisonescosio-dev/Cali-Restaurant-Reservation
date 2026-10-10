import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Calendar, BookOpen, LogIn, Menu, X, ShieldAlert, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import LogoutConfirmModal from './LogoutConfirmModal';

// Desktop nav link with active background state
const NavLink = ({ to, children, icon, adminStyle }) => {
  const { pathname } = useLocation();
  const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);

  if (adminStyle) {
    return (
      <Link
        to={to}
        className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors border ${
          isActive
            ? 'text-amber-300 bg-amber-500/15 border-amber-500/40'
            : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border-amber-500/20'
        }`}
      >
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'text-white bg-slate-800/80'
          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
};

// Mobile nav link with single active indicator (left border)
const MobileNavLink = ({ to, children, onClick, adminStyle }) => {
  const { pathname } = useLocation();
  const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-base font-medium transition-colors border-l-2 ${
        isActive
          ? adminStyle
            ? 'text-amber-300 bg-amber-500/10 border-amber-400'
            : 'text-white bg-slate-800 border-amber-400'
          : adminStyle
          ? 'text-amber-400 hover:bg-amber-500/10 border-transparent'
          : 'text-slate-300 hover:text-white hover:bg-slate-800 border-transparent'
      }`}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              <UtensilsCrossed className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                SaloTable
              </span>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Fine Dining & Reservations</p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/menu" icon={<BookOpen className="w-4 h-4 text-amber-500" />}>Menu</NavLink>
            <NavLink to="/reserve" icon={<Calendar className="w-4 h-4 text-amber-500" />}>Book Table</NavLink>
            {isAdmin && (
              <NavLink to="/admin" icon={<ShieldAlert className="w-4 h-4" />} adminStyle>Admin Panel</NavLink>
            )}
          </nav>

          {/* Desktop Right Side / Auth actions */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 text-xs font-bold transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white py-1.5 px-3 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>{user?.name || 'Account'}</span>
                </Link>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 py-1.5 px-3 rounded-lg hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-slate-900 bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 focus:outline-none transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          <MobileNavLink to="/" onClick={() => setIsOpen(false)}>Home</MobileNavLink>
          <MobileNavLink to="/menu" onClick={() => setIsOpen(false)}>Menu</MobileNavLink>
          <MobileNavLink to="/reserve" onClick={() => setIsOpen(false)}>Book Table</MobileNavLink>
          {isAdmin && (
            <MobileNavLink to="/admin" onClick={() => setIsOpen(false)} adminStyle>Admin Panel</MobileNavLink>
          )}
          <div className="pt-4 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-2">
                <MobileNavLink to="/profile" onClick={() => setIsOpen(false)}>
                  My Profile ({user?.name})
                </MobileNavLink>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-400 hover:bg-rose-500/10"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 px-3 rounded-lg border border-slate-700 text-sm font-medium text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 px-3 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
