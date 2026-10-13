import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserSavedEvents, toggleSaveEventRecord } from '../services/savedEventService';

const SavedEventsContext = createContext();

export const SavedEventsProvider = ({ children }) => {
  const { user } = useAuth();
  const [savedEventIds, setSavedEventIds] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Load user saved events when auth state changes
  useEffect(() => {
    async function loadBookmarks() {
      const { data } = await fetchUserSavedEvents(user?.id);
      setSavedEventIds(data || []);
    }
    loadBookmarks();
  }, [user?.id]);

  const toggleSave = async (eventId, eventTitle = "Event") => {
    const isCurrentlySaved = savedEventIds.includes(eventId);

    // Optimistic UI update
    if (isCurrentlySaved) {
      setSavedEventIds(prev => prev.filter(id => id !== eventId));
      triggerToast(`Removed "${eventTitle}" from bookmarks`);
    } else {
      setSavedEventIds(prev => [...prev, eventId]);
      triggerToast(`Saved "${eventTitle}" to your bookmarks!`);
    }

    // Persist to Supabase / LocalStorage
    await toggleSaveEventRecord(user?.id, eventId, isCurrentlySaved);
  };

  const isSaved = (eventId) => savedEventIds.includes(eventId);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  return (
    <SavedEventsContext.Provider value={{
      savedEventIds,
      toggleSave,
      isSaved,
      toastMessage
    }}>
      {children}
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-campus-800 border border-cyan-500/30 text-white rounded-xl shadow-2xl shadow-cyan-500/10 animate-bounce duration-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </SavedEventsContext.Provider>
  );
};

export const useSavedEvents = () => useContext(SavedEventsContext);
