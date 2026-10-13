import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Shield, Sparkles, ChevronDown } from 'lucide-react';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoOptions, setShowDemoOptions] = useState(false);

  const fromPath = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await login({ email, password });

      if (!res?.success) {
        setError(res?.error || 'Invalid credentials. Please verify your email and password.');
        return;
      }

      // Role-based routing upon successful authentication
      if (fromPath) {
        navigate(fromPath, { replace: true });
      } else if (res.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (res.user?.role === 'organizer') {
        navigate('/organizer', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err?.message || 'Network error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoRole = (selectedRole) => {
    loginAsDemo(selectedRole);
    if (selectedRole === 'organizer') navigate('/organizer');
    else if (selectedRole === 'admin') navigate('/admin');
    else navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" className="justify-center" />
          <h2 className="text-2xl font-display font-extrabold text-white pt-2">
            Sign In to CampusBuzz
          </h2>
          <p className="text-xs text-slate-400">
            One common login portal for Students, Club Heads, and Faculty Administrators.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Primary Real Authentication Form */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a0e1a]/95 p-6 sm:p-8 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@msubaroda.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-medium text-slate-300">
                  Password
                </label>
                <a href="#forgot" className="text-[11px] text-cyan-400 hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              icon={ArrowRight}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-cyan-400 font-semibold hover:underline">
              Create student account
            </Link>
          </div>
        </div>

        {/* Explicit Testing / Viva Evaluation Switcher (Collapsible, cleanly separated) */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
          <button
            type="button"
            onClick={() => setShowDemoOptions(!showDemoOptions)}
            className="w-full flex items-center justify-between text-left text-xs font-mono text-slate-400 hover:text-slate-200"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Offline Viva Evaluation Accounts</span>
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDemoOptions ? 'rotate-180' : ''}`} />
          </button>

          {showDemoOptions && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
              <p className="text-[11px] text-slate-500">
                Click any persona below to quickly test role permissions in local evaluation mode:
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemoRole('student')}
                  className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-300 hover:bg-blue-600 hover:text-white transition-all text-center"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoRole('organizer')}
                  className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-300 hover:bg-cyan-600 hover:text-white transition-all text-center"
                >
                  Club Head
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoRole('admin')}
                  className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-300 hover:bg-purple-600 hover:text-white transition-all text-center"
                >
                  Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
