import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export async function fetchUserSavedEvents(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) {
    const local = localStorage.getItem('cb_saved_events');
    return { data: local ? JSON.parse(local) : ["evt-01", "evt-02"] };
  }

  try {
    const { data, error } = await supabase
      .from('saved_events')
      .select('event_id')
      .eq('user_id', userId);

    if (error || !data) {
      const local = localStorage.getItem('cb_saved_events');
      return { data: local ? JSON.parse(local) : [] };
    }

    const eventIds = data.map(item => item.event_id);
    return { data: eventIds };
  } catch {
    const local = localStorage.getItem('cb_saved_events');
    return { data: local ? JSON.parse(local) : [] };
  }
}

export async function toggleSaveEventRecord(userId, eventId, isCurrentlySaved) {
  // Update local storage backup
  try {
    const local = localStorage.getItem('cb_saved_events');
    let list = local ? JSON.parse(local) : [];
    if (isCurrentlySaved) {
      list = list.filter(id => id !== eventId);
    } else {
      list.push(eventId);
    }
    localStorage.setItem('cb_saved_events', JSON.stringify(list));
  } catch {}

  if (!isSupabaseConfigured || !supabase || !userId) {
    return { success: true };
  }

  try {
    if (isCurrentlySaved) {
      const { error } = await supabase
        .from('saved_events')
        .delete()
        .eq('user_id', userId)
        .eq('event_id', eventId);
      return { success: !error };
    } else {
      const { error } = await supabase
        .from('saved_events')
        .insert([{ user_id: userId, event_id: eventId }]);
      return { success: !error };
    }
  } catch {
    return { success: true };
  }
}
