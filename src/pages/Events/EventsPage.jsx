import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import EventCard from '../../components/events/EventCard';
import EmptyState from '../../components/common/EmptyState';
import { EventCardSkeleton } from '../../components/common/LoadingSkeleton';
import { fetchEvents } from '../../services/eventService';
import { fetchClubs } from '../../services/clubService';
import { eventCategories } from '../../data/mockEvents';

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialClub = searchParams.get('club') || 'All';

  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedClub, setSelectedClub] = useState(initialClub);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [sortBy, setSortBy] = useState('date-asc'); // 'date-asc', 'date-desc', 'deadline'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'All');
    setSelectedClub(searchParams.get('club') || 'All');
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [eventsRes, clubsRes] = await Promise.all([
          fetchEvents(),
          fetchClubs()
        ]);
        const loadedEvents = eventsRes?.data || (Array.isArray(eventsRes) ? eventsRes : []);
        const loadedClubs = clubsRes?.data || (Array.isArray(clubsRes) ? clubsRes : []);
        setEvents(loadedEvents);
        setClubs(loadedClubs);
      } catch (err) {
        console.error('Error loading events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter & Sort logic
  const filteredEvents = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();

    return events.filter((event) => {
      // Defensive Search
      const title = (event.title || '').toLowerCase();
      const shortDesc = (event.shortDescription || event.description || '').toLowerCase();
      const clubName = (event.clubName || '').toLowerCase();
      const tags = Array.isArray(event.tags) ? event.tags : [];

      const matchesSearch =
        !q ||
        title.includes(q) ||
        shortDesc.includes(q) ||
        clubName.includes(q) ||
        tags.some(t => t && String(t).toLowerCase().includes(q));

      // Category
      const matchesCategory =
        selectedCategory === 'All' || event.category === selectedCategory;

      // Club (matching by slug or UUID)
      const matchesClub =
        selectedClub === 'All' ||
        event.clubId === selectedClub ||
        event.clubDbId === selectedClub;

      // Time / Status
      let matchesTime = true;
      if (timeFilter === 'upcoming') {
        matchesTime = event.status === 'published' || event.status === 'upcoming';
      } else if (timeFilter === 'past') {
        matchesTime = event.status === 'past' || event.status === 'archived';
      }

      return matchesSearch && matchesCategory && matchesClub && matchesTime;
    }).sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.date || 0) - new Date(b.date || 0);
      }
      if (sortBy === 'date-desc') {
        return new Date(b.date || 0) - new Date(a.date || 0);
      }
      if (sortBy === 'deadline') {
        const da = a.registrationDeadline ? new Date(a.registrationDeadline).getTime() : Infinity;
        const db = b.registrationDeadline ? new Date(b.registrationDeadline).getTime() : Infinity;
        return da - db;
      }
      return 0;
    });
  }, [events, searchQuery, selectedCategory, selectedClub, timeFilter, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedClub('All');
    setTimeFilter('all');
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(searchQuery || selectedCategory !== 'All' || selectedClub !== 'All' || timeFilter !== 'all');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Central Campus Feed
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Events Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Filter upcoming competitions, bootcamps, and technical talks across all MSU CSE student clubs.
          </p>
        </div>

        {/* View mode & Calendar toggle */}
        <div className="flex items-center gap-3">
          <Link
            to="/calendar"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Calendar View</span>
          </Link>

          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Control Filters Bar */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event title, tech stack, keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Club Dropdown Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs font-medium text-slate-200 focus:outline-none"
            >
              <option value="All">All Clubs</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Timeline Filter */}
          <div className="md:col-span-2">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs font-medium text-slate-200 focus:outline-none"
            >
              <option value="all">All Dates / Status</option>
              <option value="upcoming">Upcoming Events</option>
              <option value="past">Archived / Past</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs font-medium text-slate-200 focus:outline-none"
            >
              <option value="date-asc">Soonest First</option>
              <option value="date-desc">Latest Date</option>
              <option value="deadline">Registration Deadline</option>
            </select>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {eventCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-900/40 flex items-center gap-1 whitespace-nowrap ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Events Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>
          Showing <strong className="text-white">{filteredEvents.length}</strong> event{filteredEvents.length !== 1 ? 's' : ''}
        </span>
        {hasActiveFilters && (
          <span className="text-cyan-400">Filters applied</span>
        )}
      </div>

      {/* Events Loading Skeleton or Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <EventCardSkeleton key={n} />
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No events match your criteria"
          description="Try broadening your search keywords, switching the category filter to 'All', or resetting your timeline filter."
          actionLabel="Clear all filters"
          onAction={resetFilters}
        />
      )}
    </div>
  );
}
