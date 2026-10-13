import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Eye,
  MousePointerClick,
  Layers,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Building,
  AlertCircle,
  Save,
  Image as ImageIcon,
  Calendar,
  Globe,
  Share2,
  Code2,
  Mail,
  RefreshCw
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { fetchEvents, deleteEventRecord } from '../../services/eventService';
import { fetchClubById, updateClubRecord } from '../../services/clubService';
import { fetchLoungePosts, createLoungePost, deleteLoungePost } from '../../services/loungeService';

export default function OrganizerDashboardPage() {
  const { user } = useAuth();

  // Support both slug and UUID for assigned club
  const assignedClubId = user?.clubId || (user?.role === 'admin' ? 'vimarsh' : null);
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'club' | 'lounge'
  const [club, setClub] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [clubLoungePosts, setClubLoungePosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Club details editing state
  const [clubFormData, setClubFormData] = useState({
    description: '',
    statement: '',
    category: '',
    domain: '',
    contactEmail: '',
    website: '',
    instagram: '',
    github: '',
    memberCount: 0,
    logo: '',
    coverImage: ''
  });
  const [isSavingClub, setIsSavingClub] = useState(false);
  const [clubSaveFeedback, setClubSaveFeedback] = useState('');

  // Lounge post creation state
  const [showNewLoungeModal, setShowNewLoungeModal] = useState(false);
  const [newLoungeData, setNewLoungeData] = useState({
    title: '',
    caption: '',
    image: '',
    category: 'Club Activities',
    academicYear: '2025-26'
  });
  const [isCreatingLounge, setIsCreatingLounge] = useState(false);

  async function loadOrganizerData() {
    if (!assignedClubId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [cRes, allEvents, allLounge] = await Promise.all([
        fetchClubById(assignedClubId),
        fetchEvents(),
        fetchLoungePosts()
      ]);

      const loadedClub = cRes?.data || cRes;
      setClub(loadedClub);

      if (loadedClub) {
        setClubFormData({
          description: loadedClub.description || '',
          statement: loadedClub.statement || '',
          category: loadedClub.category || '',
          domain: loadedClub.domain || '',
          contactEmail: loadedClub.contactEmail || '',
          website: loadedClub.website || '',
          instagram: loadedClub.instagram || '',
          github: loadedClub.github || '',
          memberCount: loadedClub.memberCount || 0,
          logo: loadedClub.logo || '',
          coverImage: loadedClub.coverImage || ''
        });
      }

      const evts = allEvents?.data || allEvents || [];
      const matchedEvents = evts.filter(e =>
        e.clubId === assignedClubId ||
        e.club?.slug === assignedClubId ||
        e.club?.id === assignedClubId ||
        (loadedClub?.dbId && (e.clubDbId === loadedClub.dbId || e.club_id === loadedClub.dbId))
      );
      setClubEvents(matchedEvents);

      const posts = allLounge?.data || allLounge || [];
      const matchedPosts = posts.filter(p =>
        p.clubId === assignedClubId ||
        p.clubId === loadedClub?.slug ||
        p.clubDbId === loadedClub?.dbId ||
        p.clubDbId === user?.clubDbId ||
        (loadedClub?.name && p.clubName === loadedClub.name)
      );
      setClubLoungePosts(matchedPosts);
    } catch (err) {
      console.error('Failed to load organizer dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrganizerData();
  }, [assignedClubId]);

  const totalEvents = clubEvents.length;
  const upcomingEvents = clubEvents.filter(e => e.status === 'published' || e.status === 'upcoming').length;
  const pastEvents = clubEvents.filter(e => e.status === 'past').length;
  const totalViews = clubEvents.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalClicks = clubEvents.reduce((acc, curr) => acc + (curr.registrationClicks || 0), 0);

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (window.confirm(`Are you sure you want to remove "${eventTitle}"? This will be immediate.`)) {
      setClubEvents(prev => prev.filter(e => e.id !== eventId));
      await deleteEventRecord(eventId);
    }
  };

  const handleSaveClubDetails = async (e) => {
    e.preventDefault();
    if (!club?.dbId) return;

    setIsSavingClub(true);
    setClubSaveFeedback('');

    const res = await updateClubRecord(club.dbId, clubFormData);
    setIsSavingClub(false);

    if (res.success) {
      setClubSaveFeedback('Club profile updated successfully!');
      await loadOrganizerData();
      setTimeout(() => setClubSaveFeedback(''), 4000);
    } else {
      alert(`Failed to update club: ${res.error}`);
    }
  };

  const handleCreateLoungePost = async (e) => {
    e.preventDefault();
    const targetClub = club?.dbId || user?.clubDbId || user?.clubId || assignedClubId;
    if (!targetClub) {
      alert('Unable to identify assigned club. Please refresh or contact Admin.');
      return;
    }

    if (!newLoungeData.image) {
      alert('Please provide an image URL or choose a local photo file.');
      return;
    }

    setIsCreatingLounge(true);
    const res = await createLoungePost(newLoungeData, targetClub);
    setIsCreatingLounge(false);

    if (res.success) {
      setShowNewLoungeModal(false);
      setNewLoungeData({
        title: '',
        caption: '',
        image: '',
        category: 'Club Activities',
        academicYear: '2025-26'
      });
      await loadOrganizerData();
    } else {
      alert(`Failed to publish memory: ${res.error}`);
    }
  };

  const handleDeleteLoungePost = async (postId) => {
    if (window.confirm('Delete this lounge photo post?')) {
      await deleteLoungePost(postId);
      setClubLoungePosts(prev => prev.filter(p => p.id !== postId));
    }
  };

  // If user is promoted to organizer but admin hasn't linked them to a club yet
  if (!assignedClubId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-extrabold text-white">
            Club Assignment Pending
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You hold the <strong className="text-cyan-300">Club Head</strong> role, but the Main Admin has not yet linked your account to a specific club society in the database.
          </p>
        </div>
        <div className="p-4 max-w-md mx-auto rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono text-left">
          <p className="font-semibold text-slate-300 mb-1">How to complete setup:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Contact the Faculty Main Admin.</li>
            <li>Request them to open <strong>Admin Console → User Governance</strong>.</li>
            <li>Select your email (<span className="text-cyan-400">{user?.email}</span>) and assign your club society.</li>
          </ol>
        </div>
        <Button to="/" variant="outline" size="md">
          Return to Campus Discovery
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            Club Head Management Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Club Head Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Managing events, profiles, and lounge media for <strong className="text-cyan-300 font-semibold">{club?.name || user?.clubName || 'Assigned Society'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/clubs/${club?.slug || assignedClubId}`}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 flex items-center gap-1.5"
          >
            <Building className="w-4 h-4 text-slate-400" />
            <span>Public Hub</span>
          </Link>
          <Button
            to="/organizer/events/create"
            variant="cyan"
            size="md"
            icon={PlusCircle}
            iconPosition="left"
          >
            Publish New Event
          </Button>
        </div>
      </div>

      {/* Permissions Notice Pill */}
      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            <strong>Direct Publishing Enabled:</strong> Content published here for {club?.name || 'your club'} goes live immediately.
          </span>
        </div>
        <span className="font-mono text-cyan-400 text-[11px] bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
          Club: {club?.name || assignedClubId}
        </span>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0a0e1a]/90 border border-slate-800 space-y-1">
          <p className="text-xs font-mono text-slate-400">Total Hosted Events</p>
          <p className="text-3xl font-display font-extrabold text-white">{totalEvents}</p>
          <p className="text-[10px] text-cyan-400 font-mono">
            {upcomingEvents} Active / {pastEvents} Past
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a0e1a]/90 border border-slate-800 space-y-1">
          <p className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            Student Views
          </p>
          <p className="text-3xl font-display font-extrabold text-white">{totalViews}</p>
          <p className="text-[10px] text-slate-500 font-mono">Event impressions</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a0e1a]/90 border border-slate-800 space-y-1">
          <p className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
            Registration Clicks
          </p>
          <p className="text-3xl font-display font-extrabold text-white">{totalClicks}</p>
          <p className="text-[10px] text-slate-500 font-mono">Form redirects</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a0e1a]/90 border border-slate-800 space-y-1">
          <p className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            Lounge Media
          </p>
          <p className="text-3xl font-display font-extrabold text-white">{clubLoungePosts.length}</p>
          <p className="text-[10px] text-emerald-400 font-mono">Club event photos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'events'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Events Management ({clubEvents.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('club')}
          className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'club'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>My Club Details</span>
        </button>
        <button
          onClick={() => setActiveTab('lounge')}
          className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'lounge'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Lounge Gallery ({clubLoungePosts.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EVENTS MANAGEMENT                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="rounded-3xl border border-slate-800 bg-[#0a0e1a]/95 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                Society Events Management
              </h3>
              <p className="text-xs text-slate-400">
                Only events hosted by {club?.name || 'your assigned society'} are displayed and editable.
              </p>
            </div>
            <Button to="/organizer/events/create" variant="cyan" size="sm" icon={PlusCircle}>
              New Event
            </Button>
          </div>

          {clubEvents.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm text-slate-400 font-mono">No events published yet for {club?.name}.</p>
              <Button to="/organizer/events/create" variant="cyan" size="sm" icon={PlusCircle}>
                Publish First Event
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                    <th className="pb-3 font-semibold">Event Details</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Scheduled Date</th>
                    <th className="pb-3 font-semibold text-center">Impressions</th>
                    <th className="pb-3 font-semibold text-center">Clicks</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {clubEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.poster}
                            alt={evt.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                          />
                          <div>
                            <Link
                              to={`/events/${evt.id}`}
                              className="font-semibold text-white hover:text-cyan-300 transition-colors line-clamp-1"
                            >
                              {evt.title}
                            </Link>
                            <span className="text-[11px] font-mono text-slate-400">
                              {evt.venue}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 pr-4">
                        <Badge variant="cyan" size="sm">
                          {evt.category}
                        </Badge>
                      </td>

                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            evt.status === 'published'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                              : evt.status === 'past'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-rose-950 text-rose-300 border border-rose-800/40'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>

                      <td className="py-3.5 pr-4 text-slate-300 font-mono">
                        {evt.date}
                      </td>

                      <td className="py-3.5 text-center text-slate-300 font-mono">
                        {evt.views || 0}
                      </td>

                      <td className="py-3.5 text-center text-cyan-300 font-mono font-semibold">
                        {evt.registrationClicks || 0}
                      </td>

                      <td className="py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <a
                            href={evt.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-cyan-300 transition-colors"
                            title="Open Outbound Registration Form"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <Link
                            to={`/organizer/events/${evt.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-white transition-colors"
                            title="Edit Event"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteEvent(evt.id, evt.title)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY CLUB DETAILS (EDIT ASSIGNED CLUB PROFILE)                       */}
      {/* ========================================================================= */}
      {activeTab === 'club' && (
        <div className="rounded-3xl border border-slate-800 bg-[#0a0e1a]/95 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                {club?.name} — Official Profile
              </h3>
              <p className="text-xs text-slate-400">
                Update your society statement, contact info, member size, and branding details visible to all MSU students.
              </p>
            </div>
            {clubSaveFeedback && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {clubSaveFeedback}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveClubDetails} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                  Club Society Name
                </label>
                <input
                  type="text"
                  readOnly
                  value={club?.name || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                  Domain / Specialization
                </label>
                <input
                  type="text"
                  value={clubFormData.domain}
                  onChange={(e) => setClubFormData(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="e.g. Full-Stack Web / Mobile / Cloud"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                Tagline / Statement
              </label>
              <input
                type="text"
                value={clubFormData.statement}
                onChange={(e) => setClubFormData(prev => ({ ...prev, statement: e.target.value }))}
                placeholder="Short inspiring club tagline"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                Detailed Description
              </label>
              <textarea
                rows={4}
                value={clubFormData.description}
                onChange={(e) => setClubFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell students about your club, history, activities, and vision..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Official Contact Email
                </label>
                <input
                  type="email"
                  value={clubFormData.contactEmail}
                  onChange={(e) => setClubFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="club@msubaroda.ac.in"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Website URL
                </label>
                <input
                  type="url"
                  value={clubFormData.website}
                  onChange={(e) => setClubFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourclub.edu"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                  Member Count
                </label>
                <input
                  type="number"
                  value={clubFormData.memberCount}
                  onChange={(e) => setClubFormData(prev => ({ ...prev, memberCount: e.target.value }))}
                  placeholder="e.g. 250"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 text-rose-400 font-bold inline-flex items-center justify-center">IG</span>
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={clubFormData.instagram}
                  onChange={(e) => setClubFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="https://instagram.com/club"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-slate-400" />
                  GitHub Organization URL
                </label>
                <input
                  type="url"
                  value={clubFormData.github}
                  onChange={(e) => setClubFormData(prev => ({ ...prev, github: e.target.value }))}
                  placeholder="https://github.com/club"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                  Logo Image URL
                </label>
                <input
                  type="url"
                  value={clubFormData.logo}
                  onChange={(e) => setClubFormData(prev => ({ ...prev, logo: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                  Cover Banner URL
                </label>
                <input
                  type="url"
                  value={clubFormData.coverImage}
                  onChange={(e) => setClubFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button
                type="submit"
                variant="cyan"
                size="md"
                icon={Save}
                disabled={isSavingClub}
              >
                {isSavingClub ? 'Saving Changes...' : 'Save Club Profile'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CAMPUS LOUNGE MEDIA                                               */}
      {/* ========================================================================= */}
      {activeTab === 'lounge' && (
        <div className="rounded-3xl border border-slate-800 bg-[#0a0e1a]/95 p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                {club?.name} — Lounge Memories
              </h3>
              <p className="text-xs text-slate-400">
                Publish high-resolution photo highlights from your hackathons, workshops, and team moments to the Campus Lounge.
              </p>
            </div>
            <Button
              onClick={() => setShowNewLoungeModal(true)}
              variant="cyan"
              size="sm"
              icon={PlusCircle}
            >
              Post New Memory
            </Button>
          </div>

          {/* Modal / Form for posting new Lounge picture */}
          {showNewLoungeModal && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Publish Photo to Campus Lounge</span>
              </h4>
              <form onSubmit={handleCreateLoungePost} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Highlight Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newLoungeData.title}
                      onChange={(e) => setNewLoungeData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. HackMSU 2026 Finals Night"
                      className="w-full px-3.5 py-2 bg-slate-850 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newLoungeData.category}
                      onChange={(e) => setNewLoungeData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-slate-850 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="Club Activities">Club Activities</option>
                      <option value="Competitions">Competitions</option>
                      <option value="Workshops">Workshops</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Image Source (URL or Local File) *
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={newLoungeData.image}
                      onChange={(e) => setNewLoungeData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://images.unsplash.com/... or choose local image below"
                      className="w-full px-3.5 py-2 bg-slate-850 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-[11px] text-slate-300 flex items-center gap-1.5 transition-colors">
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Choose Local Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewLoungeData(prev => ({ ...prev, image: reader.result }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {newLoungeData.image && (
                        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Image attached
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Caption / Memory Description
                  </label>
                  <textarea
                    rows={2}
                    value={newLoungeData.caption}
                    onChange={(e) => setNewLoungeData(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Describe the moment and who was involved..."
                    className="w-full px-3.5 py-2 bg-slate-850 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewLoungeModal(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    variant="cyan"
                    size="sm"
                    disabled={isCreatingLounge}
                  >
                    {isCreatingLounge ? 'Uploading...' : 'Publish to Lounge'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {clubLoungePosts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm text-slate-400 font-mono">No campus memories posted yet for {club?.name}.</p>
              <Button onClick={() => setShowNewLoungeModal(true)} variant="cyan" size="sm" icon={PlusCircle}>
                Post First Memory
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubLoungePosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg space-y-3 p-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-44 rounded-xl overflow-hidden bg-slate-800">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                        {post.category}
                      </span>
                      <h4 className="text-sm font-semibold text-white mt-1">{post.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{post.caption}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>{post.academicYear}</span>
                    <button
                      onClick={() => handleDeleteLoungePost(post.id)}
                      className="p-1 text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
