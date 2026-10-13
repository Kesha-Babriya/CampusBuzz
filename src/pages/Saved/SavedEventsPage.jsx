import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import EventCard from '../../components/events/EventCard';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { mockEvents } from '../../data/mockEvents';
import { fetchEvents } from '../../services/eventService';
import { useSavedEvents } from '../../context/SavedEventsContext';

export default function SavedEventsPage() {
  const { savedEventIds } = useSavedEvents();
  const [allEvents, setAllEvents] = useState(mockEvents);

  useEffect(() => {
    async function load() {
      const res = await fetchEvents();
      if (res?.data && res.data.length > 0) {
        setAllEvents(res.data);
      }
    }
    load();
  }, []);

  const savedEvents = allEvents.filter(e => savedEventIds.includes(e.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <Bookmark className="w-3.5 h-3.5" />
            Personal Bookmarks
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Saved Events
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Keep track of registration deadlines and dates for sessions you plan to attend.
          </p>
        </div>

        <Link
          to="/events"
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
        >
          <span>Browse More Events</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Content */}
      {savedEvents.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              You have <strong className="text-white">{savedEvents.length}</strong> saved event{savedEvents.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="You haven't saved any events yet"
          description="Explore upcoming workshops, contests, and hackathons, and tap the bookmark icon to keep them organized here."
          actionLabel="Explore Events"
          actionTo="/events"
        />
      )}
    </div>
  );
}
