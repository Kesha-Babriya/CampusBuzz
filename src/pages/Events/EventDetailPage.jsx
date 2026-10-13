import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Bookmark,
  ExternalLink,
  ArrowLeft,
  Mail,
  Share2,
  AlertCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EventCard from '../../components/events/EventCard';
import { fetchEventById, fetchEvents } from '../../services/eventService';
import { fetchClubById } from '../../services/clubService';
import { useSavedEvents } from '../../context/SavedEventsContext';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleSave, isSaved } = useSavedEvents();

  const [event, setEvent] = useState(null);
  const [club, setClub] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEventData() {
      setLoading(true);
      const eventRes = await fetchEventById(id);
      if (eventRes.data) {
        setEvent(eventRes.data);
        const [clubRes, allEventsRes] = await Promise.all([
          fetchClubById(eventRes.data.clubId),
          fetchEvents()
        ]);
        setClub(clubRes.data);
        const related = (allEventsRes.data || [])
          .filter(e => e.id !== eventRes.data.id && (e.clubId === eventRes.data.clubId || e.category === eventRes.data.category))
          .slice(0, 3);
        setRelatedEvents(related);
      }
      setLoading(false);
    }
    loadEventData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400 font-mono">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Event Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">
          The event you're looking for does not exist or has been removed from the platform.
        </p>
        <Button to="/events" variant="primary">
          Back to Events Feed
        </Button>
      </div>
    );
  }

  const saved = isSaved(event.id);

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const deadlineFormatted = event.registrationDeadline 
    ? new Date(event.registrationDeadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Before event start';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.shortDescription,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 font-mono transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </button>

      {/* Main Grid: Details Left, Sidebar Actions Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Poster + Deep Info) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Visual Poster Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="relative h-72 sm:h-96 w-full">
              <img
                src={event.poster}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-[#070a12]/40 to-transparent" />
            </div>

            {/* Badges & Save Floating */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={event.clubId} size="md">
                  {event.clubName}
                </Badge>
                <Badge variant="cyan" size="md">
                  {event.category}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-slate-300 hover:text-white border border-white/10"
                  title="Share Event"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleSave(event.id, event.title)}
                  className={`p-2.5 rounded-xl backdrop-blur-md transition-all ${
                    saved
                      ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                      : 'bg-black/60 text-slate-300 hover:text-white border border-white/10'
                  }`}
                  title={saved ? 'Remove Bookmark' : 'Save Event'}
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Bottom Title Header */}
            <div className="p-6 sm:p-8 pt-0 relative z-10 -mt-16 space-y-3">
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
                {event.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                {event.shortDescription}
              </p>
            </div>
          </div>

          {/* Key Logistics Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Date</p>
                <p className="text-xs font-semibold text-white mt-0.5">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Timing</p>
                <p className="text-xs font-semibold text-white mt-0.5">
                  {event.startTime} – {event.endTime}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Venue</p>
                <p className="text-xs font-semibold text-white mt-0.5">{event.venue}</p>
              </div>
            </div>
          </div>

          {/* Full Event Description Section */}
          <div className="space-y-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 p-6 sm:p-8">
            <h2 className="text-xl font-display font-bold text-white">About the Event</h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            {/* Tags Strip */}
            {event.tags && event.tags.length > 0 && (
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-slate-500">Tags:</span>
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Eligibility & Guidelines */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
            <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Eligibility & Guidelines
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {event.eligibility}
            </p>
          </div>
        </div>

        {/* Right Sidebar (Registration Box + Club Profile) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-[#0a0e1b] border border-blue-500/20 shadow-2xl space-y-6 sticky top-24">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Registration Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold uppercase">
                  OPEN
                </span>
              </div>
              <div className="text-xs text-amber-300/90 bg-amber-950/40 p-3 rounded-xl border border-amber-800/40 space-y-1">
                <p className="font-semibold flex items-center gap-1.5 font-mono text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Registration Deadline
                </p>
                <p className="text-[11px]">{deadlineFormatted}</p>
              </div>
            </div>

            {/* Primary External Registration Action */}
            <div className="space-y-2.5">
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all text-center"
              >
                <span>Register on Club Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => toggleSave(event.id, event.title)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                  saved
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                    : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
                <span>{saved ? 'Saved to Bookmarks' : 'Save Event for Later'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center leading-normal">
              Official registration is completed on the club's external form or portal.
            </p>

            {/* Organizing Club Card */}
            {club && (
              <div className="pt-5 border-t border-slate-800 space-y-3">
                <p className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                  Organized By
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={club.logo}
                    alt={club.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate">{club.name}</h4>
                    <p className="text-[11px] text-cyan-400 font-mono truncate">{club.domain}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1 pt-1">
                  <p className="flex items-center gap-1.5 text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{event.contact || club.contactEmail}</span>
                  </p>
                </div>

                <Link
                  to={`/clubs/${club.id}`}
                  className="block w-full text-center py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/60 transition-colors"
                >
                  Visit Club Hub →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Events Section */}
      {relatedEvents.length > 0 && (
        <div className="pt-12 border-t border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-white">
              More Events You Might Like
            </h3>
            <Link
              to="/events"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 font-mono"
            >
              Browse All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedEvents.map((item) => (
              <EventCard key={item.id} event={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
