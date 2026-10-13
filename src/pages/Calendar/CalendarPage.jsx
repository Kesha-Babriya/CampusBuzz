import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ExternalLink,
  Filter,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import { eventCategories } from '../../data/mockEvents';
import { fetchEvents } from '../../services/eventService';
import { fetchClubs } from '../../services/clubService';

export default function CalendarPage() {
  // Calendar base state: October 2026 (matching demo event data)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026
  const [selectedDay, setSelectedDay] = useState(9); // Default select Oct 9 (day of CodeForge)
  const [selectedClub, setSelectedClub] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'agenda'
  const [eventsList, setEventsList] = useState([]);
  const [clubsList, setClubsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [evs, cls] = await Promise.all([fetchEvents(), fetchClubs()]);
        const loadedEvents = evs?.data || (Array.isArray(evs) ? evs : []);
        const loadedClubs = cls?.data || (Array.isArray(cls) ? cls : []);
        setEventsList(loadedEvents);
        setClubsList(loadedClubs);
      } catch (err) {
        console.error('Failed to load calendar data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered events based on club and category
  const activeEvents = useMemo(() => {
    return eventsList.filter((event) => {
      const matchesClub =
        selectedClub === 'All' ||
        event.clubId === selectedClub ||
        event.clubDbId === selectedClub;
      const matchesCategory =
        selectedCategory === 'All' || event.category === selectedCategory;
      return matchesClub && matchesCategory;
    });
  }, [eventsList, selectedClub, selectedCategory]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper for calendar grid days
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  const handleResetToSeason = () => {
    setCurrentDate(new Date(2026, 9, 1));
    setSelectedDay(9);
  };

  // Find events for each day in this month (normalized by slicing YYYY-MM-DD)
  const getEventsForDay = (day) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return activeEvents.filter(e => {
      if (!e.date) return false;
      const dateStr = typeof e.date === 'string' ? e.date.slice(0, 10) : '';
      return dateStr === dayStr;
    });
  };

  // Events on currently selected day
  const selectedDayEvents = getEventsForDay(selectedDay);

  // Month grid slots (leading empties + days)
  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ type: 'empty', key: `empty-${i}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      type: 'day',
      day: d,
      events: getEventsForDay(d),
      key: `day-${d}`
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Synchronized Schedule
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Campus Event Calendar
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Interactive monthly timeline across all student societies and technical departments.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                calendarView === 'month' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setCalendarView('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                calendarView === 'agenda' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Agenda List
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-display font-bold text-lg text-white min-w-[160px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none"
          >
            <option value="All">All Clubs</option>
            {clubsList.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none"
          >
            {eventCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid View */}
      {calendarView === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Month Calendar Grid (8 cols) */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-800 bg-[#0a0e1a]/95 p-6 shadow-2xl">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 mb-3 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-xs font-mono font-bold text-slate-500 uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((item) => {
                if (item.type === 'empty') {
                  return <div key={item.key} className="h-20 sm:h-24 rounded-2xl bg-slate-900/20" />;
                }

                const isSelected = item.day === selectedDay;
                const hasEvents = item.events.length > 0;

                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedDay(item.day)}
                    className={`h-20 sm:h-24 p-2 rounded-2xl text-left border flex flex-col justify-between transition-all duration-200 relative group ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-glow-cyan'
                        : hasEvents
                        ? 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-850'
                        : 'border-slate-850/60 bg-slate-900/30 text-slate-500 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-mono font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                          isSelected
                            ? 'bg-cyan-400 text-slate-950 font-bold'
                            : hasEvents
                            ? 'text-white'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.day}
                      </span>

                      {hasEvents && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      )}
                    </div>

                    {/* Small Event Pills inside Day Cell */}
                    <div className="space-y-1 w-full overflow-hidden">
                      {item.events.slice(0, 1).map((ev) => (
                        <div
                          key={ev.id}
                          className="text-[9px] font-medium truncate px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-200 border border-blue-800/40"
                        >
                          {ev.title}
                        </div>
                      ))}
                      {item.events.length > 1 && (
                        <div className="text-[9px] font-mono text-cyan-400 pl-1">
                          +{item.events.length - 1} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Agenda Drawer (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <p className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
                  Day Schedule
                </p>
                <h3 className="text-lg font-display font-bold text-white">
                  {monthNames[month]} {selectedDay}, {year}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded-full bg-slate-800">
                {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* List of events on selected day */}
            {selectedDayEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-slate-850/90 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant={ev.clubId} size="sm">
                        {ev.clubName}
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-400">
                        {ev.startTime}
                      </span>
                    </div>

                    <Link to={`/events/${ev.id}`}>
                      <h4 className="text-sm font-semibold text-white hover:text-cyan-300 transition-colors">
                        {ev.title}
                      </h4>
                    </Link>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {ev.shortDescription}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <span className="flex items-center gap-1 text-slate-400 text-[11px] truncate max-w-[150px]">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        {ev.venue.split(',')[0]}
                      </span>
                      <Link
                        to={`/events/${ev.id}`}
                        className="text-cyan-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-medium text-slate-300">No events scheduled on this day</p>
                <p className="text-xs text-slate-500">
                  Select another day with a colored badge to inspect sessions.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Agenda List View for Mobile & Compact Screens */
        <div className="space-y-4">
          {activeEvents.map((event) => (
            <div
              key={event.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-blue-950/60 border border-blue-500/30 flex flex-col items-center justify-center flex-shrink-0 text-center">
                  <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-lg font-display font-extrabold text-white">
                    {new Date(event.date).getDate()}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={event.clubId} size="sm">
                      {event.clubName}
                    </Badge>
                    <Badge variant="cyan" size="sm">
                      {event.category}
                    </Badge>
                  </div>
                  <Link to={`/events/${event.id}`}>
                    <h4 className="text-base font-semibold text-white hover:text-cyan-300">
                      {event.title}
                    </h4>
                  </Link>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {event.startTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.venue}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Link
                  to={`/events/${event.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                >
                  View Details
                </Link>
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5"
                >
                  <span>Register</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
