import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Building,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();

  // Name editing state
  const [fullName, setFullName] = useState(user?.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameSuccessMsg, setNameSuccessMsg] = useState('');
  const [nameErrorMsg, setNameErrorMsg] = useState('');

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Sync state if user loads late
  React.useEffect(() => {
    if (user?.name && !fullName) {
      setFullName(user.name);
    }
  }, [user]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameSuccessMsg('');
    setNameErrorMsg('');

    const trimmed = fullName.trim();
    if (!trimmed) {
      setNameErrorMsg('Name cannot be empty.');
      return;
    }

    setIsUpdatingName(true);

    try {
      if (isSupabaseConfigured && supabase && user?.id) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: trimmed,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        // Refresh global session state
        if (refreshProfile) {
          await refreshProfile();
        }
      } else {
        // Local state / demo fallback
        const updated = { ...user, name: trimmed };
        localStorage.setItem('cb_user', JSON.stringify(updated));
      }

      setNameSuccessMsg('Profile name updated successfully!');
      setTimeout(() => setNameSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Update name error:', err);
      setNameErrorMsg(err.message || 'Failed to update name in database.');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    if (newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirmation do not match.');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) {
          throw error;
        }

        setPasswordSuccessMsg('Password updated successfully! You can now use your new password.');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccessMsg(''), 5000);
      } else {
        setPasswordSuccessMsg('Password updated (local demo simulation).');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Change password error:', err);
      setPasswordErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getRoleLabel = (role) => {
    if (role === 'admin') return 'Main Admin';
    if (role === 'organizer') return 'Club Head';
    return 'Student';
  };

  const getRoleBadgeVariant = (role) => {
    if (role === 'admin') return 'purple';
    if (role === 'organizer') return 'cyan';
    return 'blue';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
          <User className="w-3.5 h-3.5" />
          Account & Credentials
        </div>
        <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
          User Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your personal identity, verify club society affiliations, and secure your account credentials.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold font-mono shadow-lg ring-4 ring-slate-800">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CB'}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-700">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">{user?.name}</h2>
              <Badge variant={getRoleBadgeVariant(user?.role)}>
                {getRoleLabel(user?.role)}
              </Badge>
              {user?.role === 'organizer' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-xs font-mono font-medium text-cyan-300">
                  <Building className="w-3 h-3 text-cyan-400" />
                  {user?.clubName || user?.clubId || 'Assigned Club'}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-2 font-mono">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{user?.email}</span>
            </p>

            <div className="pt-2 text-xs text-slate-500 font-mono">
              Role & Society Permissions are securely managed via Faculty Governance.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Edit Profile Name */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              Personal Information
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Update how your name appears across events, certificates, and comments.
            </p>
          </div>

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kesha Babriya"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-400 mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-sm text-slate-500 cursor-not-allowed focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Your email is linked to your institutional MSU student identity.
              </p>
            </div>

            {nameSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{nameSuccessMsg}</span>
              </div>
            )}

            {nameErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{nameErrorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="cyan"
              size="sm"
              icon={Save}
              disabled={isUpdatingName}
            >
              {isUpdatingName ? 'Saving Changes...' : 'Save Name'}
            </Button>
          </form>
        </div>

        {/* Section 2: Change Password */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-400" />
              Security & Password
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Update your account password via Supabase Auth credentials.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-purple-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-purple-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>

            {passwordSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            {passwordErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="purple"
              size="sm"
              icon={Lock}
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? 'Updating Password...' : 'Change Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
