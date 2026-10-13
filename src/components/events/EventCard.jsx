import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Bookmark, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import Badge from '../common/Badge';
import { useSavedEvents } from '../../context/SavedEventsContext';

export default function EventCard({ event, viewMode = 'grid', highlight = false }) {
  const { toggleSave, isSaved } = useSavedEvents();
  const saved = isSaved(event.id);

  // Format date nicely
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });

  if (viewMode === 'list') {
    return (
      <div className="group relative rounded-2xl border border-slate-800 bg-[#0a0e1a]/90 hover:border-cyan-500/30 hover:bg-[#0d1424] transition-all duration-300 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg">
        <div className="flex items-start sm:items-center gap-4 w-full md:w-auto">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border border-slate-700/60">
            <img
              src={event.poster}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {event.featured && (
              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-600 text-white">
                TOP PICK
              </span>
            )}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={event.clubId} size="sm">
                {event.clubName}
              </Badge>
              <Badge variant="cyan" size="sm">
                {event.category}
              </Badge>
            </div>

            <Link to={`/events/${event.id}`}>
              <h4 className="text-base font-display font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                {event.title}
              </h4>
            </Link>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300 font-medium">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {event.startTime}
              </span>
              <span className="flex items-center gap-1 line-clamp-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {event.venue ? event.venue.split(',')[0] : 'Campus Venue'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
          <button
            onClick={() => toggleSave(event.id, event.title)}
            className={`p-2.5 rounded-xl border transition-all ${
              saved
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
            title={saved ? 'Remove Bookmark' : 'Save Event'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-cyan-400' : ''}`} />
          </button>

          <Link
            to={`/events/${event.id}`}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            Details
          </Link>

          <a
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Register</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Default Grid View
  return (
    <div
      className={`group relative rounded-2xl border bg-[#0a0e1a]/95 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
        highlight
          ? 'border-cyan-500/40 shadow-glow-cyan'
          : 'border-slate-800/90 hover:border-cyan-500/40 shadow-card-dark hover:shadow-glow-blue'
      }`}
    >
      {/* Top Media Section */}
      <div>
        <div className="relative h-48 w-full overflow-hidden bg-slate-900">
          <img
            src={event.poster}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/40 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
            <Badge variant={event.clubId} size="sm">
              {event.clubName}
            </Badge>
            <Badge variant="cyan" size="sm">
              {event.category}
            </Badge>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => toggleSave(event.id, event.title)}
            className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all z-10 ${
              saved
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/50'
                : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80 border border-white/10'
            }`}
            title={saved ? 'Bookmarked' : 'Save Event'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>

          {/* Date Tag Floating on Image */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="px-2 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{event.startTime}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <Link to={`/events/${event.id}`}>
            <h3 className="text-base font-display font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 leading-snug">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.shortDescription}
          </p>

          <div className="pt-1 flex items-center gap-1 text-xs text-slate-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <Link
          to={`/events/${event.id}`}
          className="text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1 group/btn"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>

        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/90 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all"
        >
          <span>Register</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
