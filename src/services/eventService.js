import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { mockEvents } from '../data/mockEvents';

export async function fetchEvents(filters = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: mockEvents, isFallback: true };
  }

  try {
    let query = supabase
      .from('events')
      .select('*, clubs(id, name, slug, logo_url)')
      .order('event_date', { ascending: true });

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    } else {
      query = query.in('status', ['published', 'past']);
    }

    if (filters.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return { data: mockEvents, isFallback: true };
    }

    // Map DB snake_case to UI representation
    const mapped = data.map(evt => ({
      id: evt.id,
      slug: evt.slug,
      title: evt.title,
      clubId: evt.clubs?.slug || evt.club_id,
      clubDbId: evt.club_id,
      clubName: evt.clubs?.name || 'MSU Club',
      category: evt.category,
      date: evt.event_date,
      dayOfWeek: evt.day_of_week || new Date(evt.event_date).toLocaleDateString('en-US', { weekday: 'long' }),
      startTime: evt.start_time ? evt.start_time.slice(0, 5) : '10:00 AM',
      endTime: evt.end_time ? evt.end_time.slice(0, 5) : '01:00 PM',
      venue: evt.venue,
      registrationDeadline: evt.registration_deadline,
      registrationUrl: evt.registration_url,
      poster: evt.poster_url || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000',
      shortDescription: evt.short_description,
      description: evt.description,
      eligibility: evt.eligibility,
      contact: evt.contact_email,
      officialUrl: evt.official_url,
      featured: evt.featured || false,
      status: evt.status,
      views: evt.views || 0,
      registrationClicks: evt.registration_clicks || 0,
      tags: evt.tags || []
    }));

    return { data: mapped, isFallback: false };
  } catch (err) {
    console.warn('Supabase fetchEvents failed, falling back to mock:', err);
    return { data: mockEvents, isFallback: true };
  }
}

export async function fetchEventById(id) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: mockEvents.find(e => e.id === id) || null, isFallback: true };
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, clubs(id, name, slug, logo_url)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return { data: mockEvents.find(e => e.id === id) || null, isFallback: true };
    }

    const evt = {
      id: data.id,
      slug: data.slug,
      title: data.title,
      clubId: data.clubs?.slug || data.club_id,
      clubDbId: data.club_id,
      clubName: data.clubs?.name || 'MSU Club',
      category: data.category,
      date: data.event_date,
      dayOfWeek: data.day_of_week,
      startTime: data.start_time,
      endTime: data.end_time,
      venue: data.venue,
      registrationDeadline: data.registration_deadline,
      registrationUrl: data.registration_url,
      poster: data.poster_url,
      shortDescription: data.short_description,
      description: data.description,
      eligibility: data.eligibility,
      contact: data.contact_email,
      officialUrl: data.official_url,
      featured: data.featured,
      status: data.status,
      views: data.views,
      registrationClicks: data.registration_clicks,
      tags: data.tags || []
    };

    return { data: evt, isFallback: false };
  } catch {
    return { data: mockEvents.find(e => e.id === id) || null, isFallback: true };
  }
}

export async function createEventRecord(eventData, userId = null) {
  if (!isSupabaseConfigured || !supabase) {
    // In fallback mode, add to in-memory mockEvents
    mockEvents.unshift(eventData);
    return { data: eventData, error: null };
  }

  try {
    // Look up the club UUID if slug or ID was passed
    let clubUuid = eventData.clubDbId || eventData.clubId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clubUuid);
    if (clubUuid && !isUuid) {
      // It's a slug (e.g. 'dev-infinity' or 'vimarsh')
      const { data: clubRec } = await supabase.from('clubs').select('id').eq('slug', clubUuid).single();
      if (clubRec) clubUuid = clubRec.id;
    }

    const payload = {
      title: eventData.title,
      slug: eventData.slug || eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      club_id: clubUuid,
      created_by: userId || null,
      description: eventData.description,
      short_description: eventData.shortDescription || eventData.description?.slice(0, 150),
      category: eventData.category,
      event_date: eventData.date,
      day_of_week: eventData.dayOfWeek || 'TBD',
      start_time: eventData.startTime,
      end_time: eventData.endTime,
      venue: eventData.venue,
      eligibility: eventData.eligibility,
      registration_deadline: eventData.registrationDeadline,
      registration_url: eventData.registrationUrl,
      poster_url: eventData.poster || eventData.poster_url,
      contact_email: eventData.contact || eventData.contact_email,
      official_url: eventData.officialUrl || eventData.official_url,
      status: eventData.status === 'upcoming' ? 'published' : (eventData.status || 'published'),
      featured: Boolean(eventData.featured),
      tags: eventData.tags || [eventData.category]
    };

    const { data, error } = await supabase
      .from('events')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Database insert failed, falling back to local list:', error.message);
      mockEvents.unshift(eventData);
      return { data: eventData, error };
    }

    // Also update local mockEvents for immediate responsiveness
    mockEvents.unshift(eventData);
    return { data, error: null };
  } catch (err) {
    mockEvents.unshift(eventData);
    return { data: eventData, error: err };
  }
}

export async function deleteEventRecord(eventId) {
  if (!isSupabaseConfigured || !supabase) {
    const idx = mockEvents.findIndex(e => e.id === eventId);
    if (idx !== -1) mockEvents.splice(idx, 1);
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    return { success: !error, error };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function updateEventStatus(eventId, newStatus) {
  if (!isSupabaseConfigured || !supabase) {
    const ev = mockEvents.find(e => e.id === eventId);
    if (ev) ev.status = newStatus;
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('events')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', eventId);

    return { success: !error, error };
  } catch (err) {
    return { success: false, error: err };
  }
}

