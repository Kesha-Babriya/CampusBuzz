import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from './Button';

/**
 * Route protection guard for authenticated and role-restricted routes.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected component to render
 * @param {string[]} [props.allowedRoles] - Roles permitted ('admin', 'organizer', 'student')
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show a dark loading indicator while session/profile initializes to avoid flashes
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400">Verifying security credentials...</p>
      </div>
    );
  }

  // If not logged in at all, redirect to login page with return destination
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role requirement is specified and user's role is not permitted
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-[#0a0e1a]/95 p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-display font-extrabold text-white">
              Access Restricted
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              You do not have permission to access this portal. This area is strictly reserved for{' '}
              <span className="font-semibold text-rose-300 font-mono">
                {allowedRoles.map(r => (r === 'organizer' ? 'Club Head' : r)).join(' / ')}
              </span>.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              to="/"
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              iconPosition="left"
            >
              Return to Home
            </Button>
            {user.role === 'organizer' && (
              <Button
                to="/organizer"
                variant="cyan"
                size="sm"
              >
                Go to Club Head Portal
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children;
}
