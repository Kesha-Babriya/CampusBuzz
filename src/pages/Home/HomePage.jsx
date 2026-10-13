import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Calendar,
  ArrowRight,
  Code2,
  Cpu,
  Layers,
  Music,
  Briefcase,
  ExternalLink,
  ChevronRight,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Filter
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EventCard from '../../components/events/EventCard';
import ClubCard from '../../components/clubs/ClubCard';
import { mockEvents, eventCategories } from '../../data/mockEvents';
import { mockClubs } from '../../data/mockClubs';
import { mockLoungePosts } from '../../data/mockLounge';
import { fetchEvents } from '../../services/eventService';
import { fetchClubs } from '../../services/clubService';
import { fetchLoungePosts } from '../../services/loungeService';

export default function HomePage() {
  const [eventsList, setEventsList] = useState(mockEvents);
  const [clubsList, setClubsList] = useState(mockClubs);
  const [loungeList, setLoungeList] = useState(mockLoungePosts);

  useEffect(() => {
    async function loadLiveHomeData() {
      try {
        const [evs, cls, lng] = await Promise.all([
          fetchEvents(),
          fetchClubs(),
          fetchLoungePosts()
        ]);
        if (evs?.data && evs.data.length > 0) setEventsList(evs.data);
        if (cls?.data && cls.data.length > 0) setClubsList(cls.data);
        if (lng?.data && lng.data.length > 0) setLoungeList(lng.data);
      } catch (err) {
        console.warn('HomePage live fetch error:', err);
      }
    }
    loadLiveHomeData();
  }, []);

  const upcomingEvents = eventsList.filter(e => e.status === 'published' || e.status === 'upcoming').slice(0, 6);
  const thisWeekEvents = eventsList.filter(e => e.status === 'published' || e.status === 'upcoming').slice(0, 4);
  const loungePreview = loungeList.slice(0, 4);

  const categoryIcons = {
    "Hackathon": Code2,
    "Workshop": Layers,
    "Coding Contest": Code2,
    "Seminar": TrendingUp,
    "Tech Talk": Cpu,
    "Competition": Sparkles,
    "Cultural": Music,
    "Entrepreneurship": Briefcase,
    "All": Compass
  };

  return (
    <div className="space-y-24 sm:space-y-32 pb-16">
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 pb-16 overflow-hidden">
        {/* Ambient atmospheric gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/15 via-cyan-500/15 to-purple-600/10 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Subtle Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium mb-8 shadow-inner shadow-cyan-950">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>MSU Baroda — Faculty of Technology & Engineering</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">Fall 2026 Season Active</span>
          </div>

          {/* Primary Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Every CSE Event. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
              One Campus.
            </span>
          </h1>

          {/* Supporting Headline Text */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Discover workshops, competitions, hackathons, talks and activities happening across your campus — all in one place.
          </p>

          {/* Primary Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              to="/events"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              className="w-full sm:w-auto"
            >
              Explore Events
            </Button>
            <Button
              to="/quiz"
              variant="outline"
              size="lg"
              icon={Sparkles}
              iconPosition="left"
              className="w-full sm:w-auto border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/30"
            >
              Find Your Club
            </Button>
          </div>

          {/* Key Metric Strip */}
          <div className="mt-16 pt-8 border-t border-slate-800/80 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
            <div className="space-y-1">
              <p className="text-2xl font-display font-bold text-white">5</p>
              <p className="text-xs text-slate-400 font-mono">Official CSE Clubs</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-display font-bold text-cyan-400">16+</p>
              <p className="text-xs text-slate-400 font-mono">Curated Events</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-display font-bold text-blue-400">1,200+</p>
              <p className="text-xs text-slate-400 font-mono">Student Peers</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-display font-bold text-purple-400">100%</p>
              <p className="text-xs text-slate-400 font-mono">Direct Club Reg.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 1: UPCOMING EVENTS ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" />
              Live & Scheduled
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Upcoming Events
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Hand-picked workshops, hackathons, and sessions happening on campus.
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 font-mono group"
          >
            <span>View All Events ({eventsList.length})</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* ===================== SECTION 2: THIS WEEK TIMELINE STRIP ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-b from-[#0e162a]/90 to-[#090d18]/90 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-mono uppercase text-cyan-400 bg-cyan-950/70 px-3 py-1 rounded-full border border-cyan-500/30">
                Timeline Digest
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white mt-2">
                This Week on Campus
              </h3>
            </div>
            <Link
              to="/calendar"
              className="text-xs font-semibold text-slate-300 hover:text-cyan-300 flex items-center gap-1 font-mono"
            >
              <span>Full Calendar View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {thisWeekEvents.map((item, index) => (
              <Link
                key={item.id}
                to={`/events/${item.id}`}
                className="group relative p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400/50 hover:bg-slate-850 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-cyan-400">
                      {item.dayOfWeek}
                    </span>
                    <Badge variant={item.clubId} size="sm">
                      {item.clubName}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {item.startTime}
                  </span>
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center">
                    Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SECTION 3: EXPLORE CLUBS ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5" />
              Ecosystem
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Explore Campus Clubs
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Active engineering, algorithmic, creative, and venture societies in our department.
            </p>
          </div>
          <Link
            to="/clubs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 font-mono group"
          >
            <span>View All Clubs ({mockClubs.length})</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockClubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      </section>

      {/* ===================== SECTION 4: FIND YOUR CLUB (QUIZ CTA) ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0c1830] via-[#091122] to-[#120e26] p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
          {/* Subtle Glow Spheres */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              RECOMMENDATION SYSTEM
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
              Not sure where you belong?
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Answer 7 quick questions and discover the campus clubs that match your technical preferences, work style, and career ambitions.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                to="/quiz"
                variant="cyan"
                size="lg"
                icon={ArrowRight}
              >
                Take the Quiz
              </Button>
              <span className="text-xs text-slate-400 font-mono ml-2">
                Takes ~2 minutes • Transparent weighted matching
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 5: EVENT CATEGORIES ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Discover by Category
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Filter activities by the exact format of engineering or creative engagement you seek.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {eventCategories.filter(c => c !== "All").map((category) => {
            const Icon = categoryIcons[category] || Compass;
            const count = eventsList.filter(e => e.category === category).length;
            return (
              <Link
                key={category}
                to={`/events?category=${encodeURIComponent(category)}`}
                className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-850 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/10 group-hover:scale-110 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {category}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {count} event{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===================== SECTION 6: CAMPUS LOUNGE PREVIEW ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Moments
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Campus, in Motion.
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Snapshots from midnight hackathons, lab tests, open mics, and stage galas.
            </p>
          </div>
          <Link
            to="/lounge"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 font-mono group"
          >
            <span>Explore Campus Lounge</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loungePreview.map((post) => (
            <Link
              key={post.id}
              to="/lounge"
              className="group relative h-64 rounded-2xl overflow-hidden border border-slate-800 block shadow-lg"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 space-y-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  {post.category}
                </span>
                <h4 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-cyan-200 transition-colors">
                  {post.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono truncate">
                  {post.clubName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 7: CALENDAR CTA ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-[#090d18] p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-mono">
              <Calendar className="w-3.5 h-3.5" />
              CENTRAL CALENDAR
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Never miss what's happening.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Coordinate your semester schedules. Filter by clubs or event types and view interactive day schedules without juggling multiple WhatsApp announcements.
            </p>
          </div>
          <Button
            to="/calendar"
            variant="primary"
            size="lg"
            icon={Calendar}
            iconPosition="left"
            className="whitespace-nowrap"
          >
            Open Event Calendar
          </Button>
        </div>
      </section>

      {/* ===================== SECTION 8: HOW CAMPUSBUZZ WORKS ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            How CampusBuzz Works
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            A frictionless discovery layer that keeps student clubs autonomous while keeping students informed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-display font-bold text-base">
              01
            </div>
            <h3 className="text-base font-semibold text-white">Discover</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore every upcoming workshop, hackathon, and contest across all CSE clubs in one unified feed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-display font-bold text-base">
              02
            </div>
            <h3 className="text-base font-semibold text-white">Explore</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review event syllabi, speaker bios, prerequisites, venues, and club statements.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-display font-bold text-base">
              03
            </div>
            <h3 className="text-base font-semibold text-white">Save</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bookmark events you want to attend to your private profile so you never miss registration deadlines.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-display font-bold text-base">
              04
            </div>
            <h3 className="text-base font-semibold text-white">Register</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              One-click jump to the official club registration form (Google Forms, Unstop, Devfolio).
            </p>
          </div>
        </div>

        {/* Clear Notice on Registration Philosophy */}
        <div className="mt-8 p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 text-center text-xs text-slate-300 max-w-2xl mx-auto">
          <span className="font-semibold text-cyan-300 font-mono mr-1">NOTE:</span>
          CampusBuzz centralizes discovery. Official registration takes place through each club's existing registration system.
        </div>
      </section>

      {/* Centralized Discovery Architecture Banner (Exclusively on Home) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900/80 to-cyan-950/30 border border-blue-500/20 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono mb-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              CENTRALIZED DISCOVERY ARCHITECTURE
            </div>
            <h4 className="text-white text-lg font-semibold font-display">
              Every CSE event and activity. Streamlined in one modern hub.
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              CampusBuzz centralizes discovery without replacing official club systems. All registrations link directly to respective club portals and organizers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/quiz"
              className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all whitespace-nowrap"
            >
              Take Club Match Quiz
            </Link>
            <Link
              to="/events"
              className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all whitespace-nowrap"
            >
              Explore Events
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 9: FINAL CTA ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-blue-950/80 via-[#0a0f1d] to-purple-950/60 p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              Your campus is always buzzing.
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Join thousands of engineering students discovering their next team, hackathon, and club.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                to="/events"
                variant="primary"
                size="lg"
                icon={ArrowRight}
                className="w-full sm:w-auto"
              >
                Explore Events
              </Button>
              <Button
                to="/quiz"
                variant="outline"
                size="lg"
                icon={Sparkles}
                iconPosition="left"
                className="w-full sm:w-auto text-cyan-300 border-cyan-500/30"
              >
                Find Your Club
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
