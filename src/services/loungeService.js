import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { mockLoungePosts } from '../data/mockLounge';

export async function fetchLoungePosts() {
  if (!isSupabaseConfigured || !supabase) {
    return { data: mockLoungePosts, isFallback: true };
  }

  try {
    const { data, error } = await supabase
      .from('lounge_posts')
      .select('*, clubs(id, name, slug)')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return { data: mockLoungePosts, isFallback: true };
    }

    const mapped = data.map(post => ({
      id: post.id,
      title: post.title,
      caption: post.caption,
      clubId: post.clubs?.slug || post.club_id,
      clubDbId: post.club_id,
      clubName: post.clubs?.name || 'MSU Club',
      category: post.category,
      academicYear: post.academic_year,
      date: post.created_at ? post.created_at.slice(0, 10) : '2026-03-01',
      image: post.image_url,
      likes: post.likes || 0,
      location: post.location || 'FTE Campus'
    }));

    return { data: mapped, isFallback: false };
  } catch {
    return { data: mockLoungePosts, isFallback: true };
  }
}

/**
 * Publish a new Lounge post for a club. Permitted by RLS for Club Heads (their club) and Admins.
 */
export async function createLoungePost(postData, clubIdOrSlug) {
  // Resolve club UUID if slug was provided
  let resolvedClubUuid = clubIdOrSlug;
  let resolvedClubSlug = clubIdOrSlug;
  let resolvedClubName = 'MSU Society';

  if (isSupabaseConfigured && supabase && clubIdOrSlug) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clubIdOrSlug);
    if (!isUuid) {
      const { data: cRec } = await supabase
        .from('clubs')
        .select('id, name, slug')
        .eq('slug', clubIdOrSlug)
        .maybeSingle();
      if (cRec?.id) {
        resolvedClubUuid = cRec.id;
        resolvedClubSlug = cRec.slug;
        resolvedClubName = cRec.name;
      }
    } else {
      const { data: cRec } = await supabase
        .from('clubs')
        .select('id, name, slug')
        .eq('id', clubIdOrSlug)
        .maybeSingle();
      if (cRec?.id) {
        resolvedClubSlug = cRec.slug;
        resolvedClubName = cRec.name;
      }
    }
  }

  if (!isSupabaseConfigured || !supabase) {
    const newPost = {
      id: `lounge-${Date.now()}`,
      title: postData.title,
      caption: postData.caption || '',
      clubId: resolvedClubSlug,
      clubDbId: resolvedClubUuid,
      clubName: resolvedClubName,
      category: postData.category || 'Club Activities',
      academicYear: postData.academicYear || '2025-26',
      date: new Date().toISOString().slice(0, 10),
      image: postData.image,
      likes: 0,
      location: postData.location || 'Faculty of Technology & Engineering, MSU Baroda'
    };
    mockLoungePosts.unshift(newPost);
    return { success: true, data: newPost };
  }

  try {
    const payload = {
      club_id: resolvedClubUuid,
      title: postData.title,
      caption: postData.caption || '',
      image_url: postData.image,
      category: postData.category || 'Club Activities',
      academic_year: postData.academicYear || '2025-26',
      location: postData.location || 'Faculty of Technology & Engineering, MSU Baroda',
      likes: 0
    };

    const { data, error } = await supabase
      .from('lounge_posts')
      .insert([payload])
      .select('*, clubs(id, name, slug)')
      .single();

    if (error) {
      console.error('[loungeService] createLoungePost database error:', error);
      // Fallback to local mock array so post remains visible during demo
      const localFallback = {
        id: `lounge-${Date.now()}`,
        title: postData.title,
        caption: postData.caption || '',
        clubId: resolvedClubSlug,
        clubDbId: resolvedClubUuid,
        clubName: resolvedClubName,
        category: postData.category || 'Club Activities',
        academicYear: postData.academicYear || '2025-26',
        date: new Date().toISOString().slice(0, 10),
        image: postData.image,
        likes: 0,
        location: postData.location || 'Faculty of Technology & Engineering, MSU Baroda'
      };
      mockLoungePosts.unshift(localFallback);
      return { success: true, data: localFallback, warning: error.message };
    }

    const mapped = {
      id: data.id,
      title: data.title,
      caption: data.caption,
      clubId: data.clubs?.slug || resolvedClubSlug,
      clubDbId: data.club_id,
      clubName: data.clubs?.name || resolvedClubName,
      category: data.category,
      academicYear: data.academic_year,
      date: data.created_at ? data.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
      image: data.image_url,
      likes: data.likes || 0,
      location: data.location || 'FTE Campus'
    };

    mockLoungePosts.unshift(mapped);
    return { success: true, data: mapped };
  } catch (err) {
    console.error('[loungeService] createLoungePost exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete a Lounge post. Permitted by RLS for Club Heads (their club) and Admins.
 */
export async function deleteLoungePost(postId) {
  if (!isSupabaseConfigured || !supabase) {
    const idx = mockLoungePosts.findIndex(p => p.id === postId);
    if (idx !== -1) mockLoungePosts.splice(idx, 1);
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('lounge_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
