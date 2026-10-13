import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Fetch all registered user profiles with their assigned club details.
 * Strictly accessible by authenticated administrators under RLS.
 */
export async function fetchAllUsers() {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], isFallback: true };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, club_members(id, club_id, role, clubs(id, name, slug))')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[adminService] Error fetching users:', error);
      return { data: [], error: error.message };
    }

    const formatted = (data || []).map(p => {
      const cm = p.club_members?.[0];
      return {
        id: p.id,
        name: p.full_name,
        email: p.email,
        role: p.role,
        avatar: p.avatar_url,
        createdAt: p.created_at,
        clubId: cm?.clubs?.slug || cm?.club_id || null,
        clubDbId: cm?.clubs?.id || cm?.club_id || null,
        clubName: cm?.clubs?.name || null,
        clubMemberId: cm?.id || null
      };
    });

    return { data: formatted, isFallback: false };
  } catch (err) {
    console.error('[adminService] Unexpected error:', err);
    return { data: [], error: err.message };
  }
}

/**
 * Resolve a club slug or UUID to a valid club UUID in PostgreSQL.
 */
async function resolveClubUuid(clubIdOrSlug) {
  if (!clubIdOrSlug) return null;
  if (UUID_REGEX.test(clubIdOrSlug)) {
    return clubIdOrSlug;
  }

  // Look up by slug without using .or() with UUID column
  const { data: foundClub, error } = await supabase
    .from('clubs')
    .select('id')
    .eq('slug', clubIdOrSlug)
    .maybeSingle();

  if (error || !foundClub) {
    console.warn('[adminService] Failed to resolve club UUID for slug:', clubIdOrSlug, error);
    return null;
  }
  return foundClub.id;
}

/**
 * Promote a Student to Club Head (role = 'organizer') and assign to a club.
 */
export async function promoteToClubHead(userId, clubId) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Database is not connected.' };
  }

  try {
    // 1. Resolve target club UUID safely
    const targetClubUuid = await resolveClubUuid(clubId);
    if (!targetClubUuid) {
      return { success: false, error: `Could not find club with ID or slug "${clubId}".` };
    }

    // 2. Update profile role to 'organizer'
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ role: 'organizer', updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (profileErr) {
      return { success: false, error: profileErr.message };
    }

    // 3. Clean any existing club_members rows for this user
    await supabase.from('club_members').delete().eq('user_id', userId);

    // 4. Insert assignment into club_members
    const { error: memberErr } = await supabase
      .from('club_members')
      .insert({
        user_id: userId,
        club_id: targetClubUuid,
        role: 'organizer'
      });

    if (memberErr) {
      console.error('[adminService] club_members insertion failed:', memberErr);
      return { success: false, error: `Role updated, but club assignment failed: ${memberErr.message}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Revoke Club Head privileges back to Student (role = 'student')
 */
export async function revokeClubHead(userId) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Database is not connected.' };
  }

  try {
    // 1. Update profile role to 'student'
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ role: 'student', updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (profileErr) {
      return { success: false, error: profileErr.message };
    }

    // 2. Remove club membership row
    const { error: memberErr } = await supabase
      .from('club_members')
      .delete()
      .eq('user_id', userId);

    if (memberErr) {
      console.warn('[adminService] Error deleting club_members on revoke:', memberErr);
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Assign or reassign an existing Club Head to a specific club
 */
export async function assignClubHeadToClub(userId, clubId) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Database is not connected.' };
  }

  try {
    const targetClubUuid = await resolveClubUuid(clubId);
    if (!targetClubUuid) {
      return { success: false, error: `Could not find club with ID or slug "${clubId}".` };
    }

    // Delete previous assignments
    await supabase.from('club_members').delete().eq('user_id', userId);

    // Insert new assignment
    const { error } = await supabase
      .from('club_members')
      .insert({
        user_id: userId,
        club_id: targetClubUuid,
        role: 'organizer'
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
