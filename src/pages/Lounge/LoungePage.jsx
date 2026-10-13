import React, { useState, useEffect, useMemo } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Heart,
  Filter,
  X,
  MapPin,
  Calendar,
  Layers,
  Info
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import { loungeCategories, academicYears } from '../../data/mockLounge';
import { fetchLoungePosts } from '../../services/loungeService';
import { fetchClubs } from '../../services/clubService';

export default function LoungePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClub, setSelectedClub] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [activeModalPost, setActiveModalPost] = useState(null);
  const [likesMap, setLikesMap] = useState({});
  const [postsList, setPostsList] = useState([]);
  const [clubsList, setClubsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [posts, clubs] = await Promise.all([fetchLoungePosts(), fetchClubs()]);
        setPostsList(posts.data || []);
        setClubsList(clubs.data || []);
      } catch (err) {
        console.error('Failed to load lounge posts', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredPosts = useMemo(() => {
    return postsList.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (post.category || '').toLowerCase().trim() === selectedCategory.toLowerCase().trim();

      const matchesClub =
        selectedClub === 'All' ||
        post.clubId === selectedClub ||
        post.clubDbId === selectedClub;

      const matchesYear =
        selectedYear === 'All' ||
        (post.academicYear || '') === selectedYear;

      return matchesCategory && matchesClub && matchesYear;
    });
  }, [postsList, selectedCategory, selectedClub, selectedYear]);

  const handleLike = (id, e) => {
    e.stopPropagation();
    setLikesMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            Visual Campus Archive
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Campus Lounge
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            A photo-driven collective capturing hackathon sprints, hardware builds, and open mic evenings at MSU Baroda.
          </p>
        </div>

        {/* Phase Note Banner */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>Curated Club Gallery • Student Submissions in Phase 2</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {loungeCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none"
          >
            <option value="All">All Clubs</option>
            {clubsList.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none"
          >
            <option value="All">All Years</option>
            {academicYears.filter(y => y !== 'All').map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery Masonry-style Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 animate-pulse h-80">
              <div className="w-full h-48 bg-slate-800/80 rounded-xl" />
              <div className="w-2/3 h-4 bg-slate-800/80 rounded" />
              <div className="w-full h-3 bg-slate-800/50 rounded" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const isLiked = likesMap[post.id];
            const currentLikes = post.likes + (isLiked ? 1 : 0);

            return (
              <div
                key={post.id}
                onClick={() => setActiveModalPost(post)}
                className="group cursor-pointer relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0a0e1a] shadow-lg hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-64 overflow-hidden bg-slate-900">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <Badge variant={post.clubId} size="sm">
                      {post.clubName}
                    </Badge>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-slate-300 border border-white/10">
                      {post.academicYear}
                    </span>
                  </div>

                  {/* Category Floating */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 font-semibold">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Caption & Location footer */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {post.caption}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      {post.location}
                    </span>
                    <button
                      onClick={(e) => handleLike(post.id, e)}
                      className={`flex items-center gap-1 transition-colors ${
                        isLiked ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-rose-400'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400' : ''}`} />
                      <span>{currentLikes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-semibold text-base">No lounge posts found</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Try resetting your category or club filter to see all moments.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedClub('All');
              setSelectedYear('All');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeModalPost && (
        <div
          onClick={() => setActiveModalPost(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full rounded-3xl bg-[#0a0e1c] border border-slate-800 overflow-hidden shadow-2xl relative"
          >
            <button
              onClick={() => setActiveModalPost(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-black/70 text-slate-300 hover:text-white border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-96 w-full bg-black">
              <img
                src={activeModalPost.image}
                alt={activeModalPost.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={activeModalPost.clubId} size="md">
                  {activeModalPost.clubName}
                </Badge>
                <Badge variant="cyan" size="md">
                  {activeModalPost.category}
                </Badge>
                <span className="text-xs font-mono text-slate-400 ml-auto">
                  {activeModalPost.academicYear}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-display font-bold text-white">
                  {activeModalPost.title}
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {activeModalPost.caption}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {activeModalPost.location}
                </span>
                <span>Date: {activeModalPost.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
