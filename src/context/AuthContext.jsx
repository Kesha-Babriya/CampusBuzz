import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext();

export const DEFAULT_USERS = {
  student: {
    id: "usr-student-01",
    name: "Aman Verma",
    email: "aman.v@msubaroda.ac.in",
    role: "student",
    department: "Computer Science & Engineering",
    batch: "2023-2027",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
  },
  organizer: {
    id: "usr-org-vimarsh",
    name: "Aarav Patel",
    email: "aarav.vimarsh@msubaroda.ac.in",
    role: "organizer",
    clubId: "vimarsh",
    clubName: "VIMARSH",
    department: "Computer Science & Engineering",
    batch: "2022-2026",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
  },
  admin: {
    id: "usr-admin-01",
    name: "Dr. K. S. Trivedi",
    email: "admin.campusbuzz@msubaroda.ac.in",
    role: "admin",
    department: "Faculty Coordinator, CSE Dept",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // In-flight profile load promise cache to avoid concurrent race conditions
  let inFlightUserId = null;
  let inFlightPromise = null;

  // Load user profile from Supabase profiles + club_members tables
  async function loadProfile(authUser) {
    if (!authUser) return null;

    if (inFlightUserId === authUser.id && inFlightPromise) {
      return await inFlightPromise;
    }

    inFlightUserId = authUser.id;
    inFlightPromise = (async () => {
      try {
        // Enforce 3.5s timeout on remote profile query to prevent login hang
        const fetchPromise = supabase
          .from('profiles')
          .select('*, club_members(club_id, role, clubs(id, name, slug))')
          .eq('id', authUser.id)
          .maybeSingle();

        const timeoutPromise = new Promise((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: 'Profile load timeout' } }), 3500)
        );

        const { data: profile, error } = await Promise.race([fetchPromise, timeoutPromise]);

        if (profile && !error) {
          let clubMember = profile.club_members?.[0];
          // If nested join was empty, directly query club_members for robustness
          if (!clubMember && profile.role === 'organizer') {
            const { data: directMember } = await supabase
              .from('club_members')
              .select('club_id, role, clubs(id, name, slug)')
              .eq('user_id', authUser.id)
              .maybeSingle();
            if (directMember) {
              clubMember = directMember;
            }
          }

          const loadedUser = {
            id: profile.id,
            name: profile.full_name || authUser.email?.split('@')[0] || 'Student',
            email: profile.email || authUser.email,
            role: profile.role || 'student', // Database is strict source of truth
            avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
            clubId: clubMember?.clubs?.slug || clubMember?.club_id || null,
            clubDbId: clubMember?.clubs?.id || clubMember?.club_id || null,
            clubName: clubMember?.clubs?.name || null
          };
          setUser(loadedUser);
          localStorage.setItem('cb_user', JSON.stringify(loadedUser));
          return loadedUser;
        } else {
          // Fallback if trigger was delayed or profile row not yet committed
          const fallbackUser = {
            id: authUser.id,
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Student',
            email: authUser.email,
            role: 'student', // Always default to student
            avatar: authUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
            clubId: null,
            clubName: null
          };
          setUser(fallbackUser);
          localStorage.setItem('cb_user', JSON.stringify(fallbackUser));
          return fallbackUser;
        }
      } catch (err) {
        console.warn('[AuthContext] Error loading profile from Supabase:', err);
        const fallbackUser = {
          id: authUser.id,
          name: authUser.email?.split('@')[0] || 'Student',
          email: authUser.email,
          role: 'student',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
          clubId: null,
          clubName: null
        };
        setUser(fallbackUser);
        return fallbackUser;
      } finally {
        inFlightUserId = null;
        inFlightPromise = null;
      }
    })();

    return await inFlightPromise;
  }

  // Refresh current profile from database (useful after role promotion)
  const refreshProfile = async () => {
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        return await loadProfile(session.user);
      }
    }
    return user;
  };

  // Initialize Auth state from Supabase on load/refresh
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session?.user && !error) {
            await loadProfile(session.user);
          } else {
            // Check if demo evaluation user was intentionally activated
            const demoUser = localStorage.getItem('cb_demo_user');
            if (demoUser) {
              setUser(JSON.parse(demoUser));
            } else {
              setUser(null);
            }
          }
        } catch (err) {
          console.error('[AuthContext] Session init error:', err);
          setUser(null);
        }
      } else {
        // Offline / Supabase unconfigured: allow demo testing if set
        const stored = localStorage.getItem('cb_demo_user');
        if (stored) setUser(JSON.parse(stored));
        else setUser(null);
      }

      if (mounted) setLoading(false);
    }

    initAuth();

    // Listen to real Supabase auth state transitions
    let authListener = null;
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await loadProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('cb_user');
          localStorage.removeItem('cb_demo_user');
        }
      });
      authListener = subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  // Real Supabase Login
  const login = async ({ email, password }) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    try {
      const signInPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: 'Authentication timed out. Please check your network connection.' } }), 8000)
      );

      const { data, error } = await Promise.race([signInPromise, timeoutPromise]);

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        localStorage.removeItem('cb_demo_user');
        const loaded = await loadProfile(data.user);
        return { success: true, user: loaded || data.user };
      }

      return { success: false, error: 'Login failed. Please verify credentials.' };
    } catch (err) {
      return { success: false, error: err.message || 'Network error during login.' };
    }
  };

  // Real Supabase Signup (Role is strictly determined by DB trigger handle_new_user -> 'student')
  const signup = async ({ name, email, password }) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // If user is created but session is not established (email verification enabled)
      if (data?.user && !data.session) {
        return { success: true, user: data.user, requiresEmailConfirmation: true };
      }

      if (data?.user) {
        localStorage.removeItem('cb_demo_user');
        const loaded = await loadProfile(data.user);
        return { success: true, user: loaded || data.user, requiresEmailConfirmation: false };
      }

      return { success: false, error: 'Signup failed.' };
    } catch (err) {
      return { success: false, error: err.message || 'Network error during signup.' };
    }
  };

  // Explicit demo role login (exclusively for viva evaluation)
  const loginAsDemo = (role = 'student') => {
    const demo = DEFAULT_USERS[role] || DEFAULT_USERS.student;
    setUser(demo);
    localStorage.setItem('cb_demo_user', JSON.stringify(demo));
    return { success: true, user: demo };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out warning:', err);
      }
    }
    setUser(null);
    localStorage.removeItem('cb_user');
    localStorage.removeItem('cb_demo_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      refreshProfile,
      loginAsDemo,
      isSupabaseActive: isSupabaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
