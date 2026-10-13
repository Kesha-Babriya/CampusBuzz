import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Mail,
  Calendar,
  Users,
  Award,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EventCard from '../../components/events/EventCard';
import { fetchClubById } from '../../services/clubService';
import { fetchEvents } from '../../services/eventService';
import { fetchLoungePosts } from '../../services/loungeService';

export default function ClubDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'about' | 'gallery'

  const [club, setClub] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [clubGallery, setClubGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [clubRes, eventsRes, loungeRes] = await Promise.all([
        fetchClubById(id),
        fetchEvents(),
        fetchLoungePosts()
      ]);

      if (clubRes.data) {
        setClub(clubRes.data);
        const clubData = clubRes.data;
        const filteredEvts = (eventsRes.data || []).filter(e => 
          e.clubId === clubData.id || 
          e.clubId === clubData.slug || 
          e.clubDbId === clubData.dbId || 
          e.clubDbId === clubData.id
        );
        setClubEvents(filteredEvts);
        const filteredLounge = (loungeRes.data || []).filter(p => 
          p.clubId === clubData.id || 
          p.clubId === clubData.slug || 
          p.clubDbId === clubData.dbId || 
          p.clubDbId === clubData.id
        );
        setClubGallery(filteredLounge);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400 font-mono">Loading club hub...</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Club Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">
          The requested student club does not exist in our directory.
        </p>
        <Button to="/clubs" variant="primary">
          Back to Club Directory
        </Button>
      </div>
    );
  }

  const upcomingEvents = clubEvents.filter(e => e.status === 'published' || e.status === 'upcoming');
  const pastEvents = clubEvents.filter(e => e.status === 'past' || e.status === 'archived');

  return (
    <div className="space-y-10 pb-16">
      {/* ===================== HERO COVER & BANNER ===================== */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-64 sm:h-80 w-full overflow-hidden bg-slate-900 relative">
          <img
            src={club.coverImage}
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-[#070a12]/50 to-transparent" />
        </div>

        {/* Back Link Overlay */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute top-6 left-0 right-0 z-20">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-xs font-semibold text-slate-200 hover:text-white border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Club Profile Info Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Logo Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-[#070a12] shadow-2xl bg-slate-900 ring-1 ring-cyan-500/30 flex-shrink-0">
                <img
                  src={club.logo}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Statement */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white">
                    {club.name}
                  </h1>
                  <Badge variant={club.id} size="md">
                    {club.category}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-cyan-300 font-mono">
                  "{club.statement}"
                </p>
                <p className="text-xs text-slate-400">
                  Faculty of Technology & Engineering • Est. {club.established}
                </p>
              </div>
            </div>

            {/* Social Links & Connect */}
            <div className="flex items-center gap-2.5">
              {club.website && (
                <a
                  href={club.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800"
                  title="Official Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {club.instagram && (
                <a
                  href={club.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-pink-400 border border-slate-800"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {club.github && (
                <a
                  href={club.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                  title="GitHub Organization"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              )}
              <a
                href={`mailto:${club.contactEmail}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Club</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'upcoming'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Upcoming Events ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'about'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            About & Leadership
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'gallery'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Lounge Gallery ({clubGallery.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'past'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Past Events Archive ({pastEvents.length})
          </button>
        </div>

        {/* Tab 1: Upcoming Events */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
                <p className="text-white font-semibold text-base">No live upcoming events right now</p>
                <p className="text-xs text-slate-400 mt-1">
                  Follow {club.name}'s official handles or check back next week for fresh schedule announcements.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: About & Leadership */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-lg font-display font-bold text-white">Overview & Mission</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {club.description}
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-lg font-display font-bold text-white">Core Activity Pillars</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(club.whatWeDo || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <h4 className="text-xs font-mono uppercase text-slate-400 font-bold">
                  Club Leadership
                </h4>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{club.lead}</p>
                  <p className="text-xs text-cyan-400 font-mono">Student Lead / Convener</p>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{club.contactEmail}</span>
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <h4 className="text-xs font-mono uppercase text-slate-400 font-bold">
                  Impact Metrics
                </h4>
                <div className="space-y-3">
                  {Object.entries(club.stats || {}).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-mono font-bold text-white">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Gallery */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            {clubGallery.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubGallery.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/80 shadow-lg"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 space-y-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-semibold text-white pt-1">{item.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{item.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
                <p className="text-white font-semibold text-base">No gallery photos for this club yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Photos from recent events are curated on the Campus Lounge.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Past Events */}
        {activeTab === 'past' && (
          <div className="space-y-6">
            {pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
                <p className="text-white font-semibold text-base">No archived past events recorded</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
