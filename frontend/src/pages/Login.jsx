import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedInUser = await login(email, password);

      // If user is admin, redirect to admin dashboard, else redirect to intended page
      if (loggedInUser.role === 'admin' && redirectPath === '/') {
        navigate('/admin');
      } else {
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick helper to fill demo accounts for testing
  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <LogIn className="w-5 h-5 text-amber-400 shrink-0" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          </div>
          <p className="text-sm text-slate-400">Sign in to manage your dining reservations</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Fast-Fill helper */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Test accounts — tap to fill:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemo('alice@example.com', 'password123')}
              className="py-2 px-3 rounded-lg border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-left"
            >
              <span className="font-semibold block text-amber-400">Customer</span>
              alice@example.com
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@restaurant.com', 'admin123')}
              className="py-2 px-3 rounded-lg border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-left"
            >
              <span className="font-semibold block text-amber-400">Admin</span>
              admin@restaurant.com
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
