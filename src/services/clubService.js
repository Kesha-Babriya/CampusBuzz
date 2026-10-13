import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { mockClubs } from '../data/mockClubs';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function fetchClubs(includeInactive = false) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: mockClubs, isFallback: true };
  }

  try {
    let query = supabase
      .from('clubs')
      .select('*, club_members(user_id, role, profiles(id, full_name, email))')
      .order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return { data: mockClubs, isFallback: true };
    }

    // Map DB snake_case to frontend camelCase
    const mapped = data.map(club => {
      const leadMember = club.club_members?.[0]?.profiles;
      return {
        id: club.slug || club.id,
        dbId: club.id,
        name: club.name,
        slug: club.slug,
        shortName: club.name.split(' ')[0],
        tagline: club.statement || club.description,
        category: club.category,
        domain: club.domain,
        description: club.description,
        statement: club.statement,
        established: club.established || '2020',
        memberCount: club.member_count || 100,
        logo: club.logo_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150',
        coverImage: club.cover_image_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
        lead: leadMember?.full_name || club.lead_name || 'Club Executive',
        leadEmail: leadMember?.email || null,
        contactEmail: club.contact_email,
        website: club.website_url,
        instagram: club.instagram_url,
        github: club.github_url,
        whatWeDo: club.what_we_do || [],
        isActive: club.is_active,
        stats: {
          activeMembers: club.member_count || 100,
          eventsOrganized: 12
        }
      };
    });

    return { data: mapped, isFallback: false };
  } catch (err) {
    console.warn('Supabase fetchClubs failed, falling back to mock:', err);
    return { data: mockClubs, isFallback: true };
  }
}

export async function fetchClubById(idOrSlug) {
  if (!idOrSlug) return { data: null, isFallback: false };

  if (!isSupabaseConfigured || !supabase) {
    return { data: mockClubs.find(c => c.id === idOrSlug || c.slug === idOrSlug) || null, isFallback: true };
  }

  try {
    const isUuid = UUID_REGEX.test(idOrSlug);
    let query = supabase.from('clubs').select('*, club_members(user_id, role, profiles(id, full_name, email))');

    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return { data: mockClubs.find(c => c.id === idOrSlug || c.slug === idOrSlug) || null, isFallback: true };
    }

    const leadMember = data.club_members?.[0]?.profiles;

    const club = {
      id: data.slug || data.id,
      dbId: data.id,
      name: data.name,
      slug: data.slug,
      shortName: data.name.split(' ')[0],
      tagline: data.statement || data.description,
      category: data.category,
      domain: data.domain,
      description: data.description,
      statement: data.statement,
      established: data.established || '2020',
      memberCount: data.member_count || 100,
      logo: data.logo_url,
      coverImage: data.cover_image_url,
      lead: leadMember?.full_name || data.lead_name || 'Club Lead',
      leadEmail: leadMember?.email || null,
      contactEmail: data.contact_email,
      website: data.website_url,
      instagram: data.instagram_url,
      github: data.github_url,
      whatWeDo: data.what_we_do || [],
      isActive: data.is_active,
      stats: {
        activeMembers: data.member_count || 100,
        eventsOrganized: 15
      }
    };

    return { data: club, isFallback: false };
  } catch {
    return { data: mockClubs.find(c => c.id === idOrSlug || c.slug === idOrSlug) || null, isFallback: true };
  }
}

/**
 * Update details for an assigned club. Permitted by RLS for Club Heads and Admins.
 */
export async function updateClubRecord(clubDbId, clubData) {
  if (!isSupabaseConfigured || !supabase) {
    const found = mockClubs.find(c => c.dbId === clubDbId || c.slug === clubDbId || c.id === clubDbId);
    if (found) Object.assign(found, clubData);
    return { success: true };
  }

  try {
    const payload = {
      updated_at: new Date().toISOString()
    };

    if (clubData.description !== undefined) payload.description = clubData.description;
    if (clubData.statement !== undefined) payload.statement = clubData.statement;
    if (clubData.category !== undefined) payload.category = clubData.category;
    if (clubData.domain !== undefined) payload.domain = clubData.domain;
    if (clubData.logo !== undefined) payload.logo_url = clubData.logo;
    if (clubData.coverImage !== undefined) payload.cover_image_url = clubData.coverImage;
    if (clubData.contactEmail !== undefined) payload.contact_email = clubData.contactEmail;
    if (clubData.website !== undefined) payload.website_url = clubData.website;
    if (clubData.instagram !== undefined) payload.instagram_url = clubData.instagram;
    if (clubData.github !== undefined) payload.github_url = clubData.github;
    if (clubData.whatWeDo !== undefined) payload.what_we_do = clubData.whatWeDo;
    if (clubData.memberCount !== undefined) payload.member_count = parseInt(clubData.memberCount, 10) || 0;

    const { error } = await supabase
      .from('clubs')
      .update(payload)
      .eq('id', clubDbId);

    if (error) {
      console.error('[clubService] updateClubRecord error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Create a new club (Admin privilege).
 */
export async function createClubRecord(clubData) {
  if (!isSupabaseConfigured || !supabase) {
    const newClub = { id: clubData.slug, dbId: `c-${Date.now()}`, ...clubData };
    mockClubs.push(newClub);
    return { success: true, data: newClub };
  }

  try {
    const payload = {
      name: clubData.name,
      slug: clubData.slug || clubData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: clubData.category || 'Technical',
      domain: clubData.domain || 'Software',
      description: clubData.description || '',
      statement: clubData.statement || '',
      contact_email: clubData.contactEmail || '',
      logo_url: clubData.logo || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150',
      cover_image_url: clubData.coverImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
      website_url: clubData.website || '',
      instagram_url: clubData.instagram || '',
      github_url: clubData.github || '',
      what_we_do: clubData.whatWeDo || [],
      is_active: true
    };

    const { data, error } = await supabase
      .from('clubs')
      .insert([payload])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Toggle active status of a club (Admin privilege, safe alternative to hard-deleting).
 */
export async function toggleClubStatus(clubDbId, isActive) {
  if (!isSupabaseConfigured || !supabase) {
    const found = mockClubs.find(c => c.dbId === clubDbId || c.id === clubDbId);
    if (found) found.isActive = isActive;
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('clubs')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', clubDbId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
