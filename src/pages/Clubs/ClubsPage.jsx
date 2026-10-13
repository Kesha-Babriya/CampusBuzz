import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Users, ArrowRight } from 'lucide-react';
import ClubCard from '../../components/clubs/ClubCard';
import { ClubCardSkeleton } from '../../components/common/LoadingSkeleton';
import { fetchClubs } from '../../services/clubService';

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ["All", "Coding & DSA", "Web & Software Dev", "Hardware & Robotics", "Arts & Culture", "Business & Startups"];

  useEffect(() => {
    async function loadClubs() {
      setLoading(true);
      const res = await fetchClubs();
      setClubs(res.data || []);
      setLoading(false);
    }
    loadClubs();
  }, []);

  const filteredClubs = clubs.filter((club) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (club.name || '').toLowerCase().includes(q) ||
      (club.domain && club.domain.toLowerCase().includes(q)) ||
      (club.description && club.description.toLowerCase().includes(q)) ||
      (club.statement && club.statement.toLowerCase().includes(q));

    const matchesCategory =
      selectedCategory === 'All' || 
      (club.category || '').toLowerCase().trim() === selectedCategory.toLowerCase().trim() ||
      (club.category || '').toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Official Student Organizations
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Club Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Explore active technical societies, hardware laboratories, and cultural collectives shaping MSU Baroda.
          </p>
        </div>

        {/* Quick Quiz Callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-cyan-950/40 border border-cyan-500/20 flex items-center gap-4">
          <div className="text-xs">
            <p className="font-semibold text-white">Uncertain where to start?</p>
            <p className="text-slate-400 text-[11px]">Match your skills in 2 mins</p>
          </div>
          <a
            href="/quiz"
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs whitespace-nowrap"
          >
            Club Quiz →
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clubs by name, domain, or focus area..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <ClubCardSkeleton key={n} />
          ))}
        </div>
      ) : filteredClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <p className="text-white font-semibold text-base">No clubs match your filters</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Try adjusting your search query or category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
