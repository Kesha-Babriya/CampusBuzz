import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Layers,
  Users,
  Calendar,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Search,
  UserCheck,
  Building,
  RefreshCw,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  User
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { fetchEvents, deleteEventRecord, updateEventStatus } from '../../services/eventService';
import { fetchClubs, createClubRecord, toggleClubStatus } from '../../services/clubService';
import { fetchLoungePosts } from '../../services/loungeService';
import { fetchAllUsers, promoteToClubHead, revokeClubHead, assignClubHeadToClub } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'events' | 'clubs' | 'lounge'
  const [usersList, setUsersList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [clubsList, setClubsList] = useState([]);
  const [loungeList, setLoungeList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState('');

  // Selected club for assigning users
  const [selectedClubForUser, setSelectedClubForUser] = useState({});

  // Club creation modal state
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [newClubData, setNewClubData] = useState({
    name: '',
    slug: '',
    category: 'Technical',
    domain: 'Software / Engineering',
    description: '',
    statement: '',
    contactEmail: ''
  });
  const [isCreatingClub, setIsCreatingClub] = useState(false);

  async function loadAdminData() {
    setIsLoading(true);
    try {
      const [usrRes, evs, cls, lng] = await Promise.all([
        fetchAllUsers(),
        fetchEvents(),
        fetchClubs(true), // Include all clubs including inactive
        fetchLoungePosts()
      ]);
      setUsersList(usrRes?.data || []);
      setEventsList(evs?.data || evs || []);
      setClubsList(cls?.data || cls || []);
      setLoungeList(lng?.data || lng || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  // Summary Metrics
  const totalStudents = usersList.filter(u => u.role === 'student').length;
  const totalClubHeads = usersList.filter(u => u.role === 'organizer').length;
  const totalEvents = eventsList.length;
  const publishedEvents = eventsList.filter(e => e.status === 'published').length;
  const totalClubs = clubsList.length;

  // Promote handler
  const handlePromote = async (targetUser) => {
    // Default to the first club's dbId/id or fallback
    const clubId = selectedClubForUser[targetUser.id] || clubsList[0]?.dbId || clubsList[0]?.id || 'vimarsh';
    setActionLoadingId(targetUser.id);
    setActionFeedback('');

    const res = await promoteToClubHead(targetUser.id, clubId);
    setActionLoadingId(null);

    if (res.success) {
      setActionFeedback(`Promoted ${targetUser.name} to Club Head successfully.`);
      await loadAdminData();
      setTimeout(() => setActionFeedback(''), 4000);
    } else {
      alert(`Promotion failed: ${res.error}`);
    }
  };

  // Revoke handler
  const handleRevoke = async (targetUser) => {
    if (!window.confirm(`Revoke Club Head role for ${targetUser.name}? They will return to Student status.`)) {
      return;
    }

    setActionLoadingId(targetUser.id);
    setActionFeedback('');

    const res = await revokeClubHead(targetUser.id);
    setActionLoadingId(null);

    if (res.success) {
      setActionFeedback(`Revoked Club Head role for ${targetUser.name}.`);
      await loadAdminData();
      setTimeout(() => setActionFeedback(''), 4000);
    } else {
      alert(`Revoke failed: ${res.error}`);
    }
  };

  // Change assigned club for an existing Club Head
  const handleReassignClub = async (targetUser, newClubId) => {
    setActionLoadingId(targetUser.id);
    const res = await assignClubHeadToClub(targetUser.id, newClubId);
    setActionLoadingId(null);

    if (res.success) {
      setActionFeedback(`Reassigned ${targetUser.name} to new club.`);
      await loadAdminData();
      setTimeout(() => setActionFeedback(''), 4000);
    } else {
      alert(`Reassignment failed: ${res.error}`);
    }
  };

  // Event deletion handler
  const handleAdminDeleteEvent = async (id, title) => {
    if (window.confirm(`[ADMIN ACTION] Are you sure you want to remove the event "${title}" from the platform?`)) {
      setEventsList(prev => prev.filter(e => e.id !== id));
      await deleteEventRecord(id);
    }
  };

  // Event status toggle handler
  const handleAdminToggleStatus = async (eventId, currentStatus) => {
    const nextStatus = currentStatus === 'published' ? 'cancelled' : 'published';
    if (window.confirm(`Set status of this event to "${nextStatus}"?`)) {
      await updateEventStatus(eventId, nextStatus);
      setEventsList(prev => prev.map(e => e.id === eventId ? { ...e, status: nextStatus } : e));
    }
  };

  // Club creation handler
  const handleCreateClub = async (e) => {
    e.preventDefault();
    setIsCreatingClub(true);
    const res = await createClubRecord(newClubData);
    setIsCreatingClub(false);

    if (res.success) {
      setShowAddClubModal(false);
      setNewClubData({
        name: '',
        slug: '',
        category: 'Technical',
        domain: 'Software / Engineering',
        description: '',
        statement: '',
        contactEmail: ''
      });
      await loadAdminData();
      setActionFeedback(`New society "${newClubData.name}" added successfully.`);
      setTimeout(() => setActionFeedback(''), 4000);
    } else {
      alert(`Failed to create club: ${res.error}`);
    }
  };

  // Toggle club active status safely (preserves events/members)
  const handleToggleClubStatus = async (club) => {
    const nextStatus = !club.isActive;
    const actionWord = nextStatus ? 'activate' : 'archive/deactivate';
    if (window.confirm(`Are you sure you want to ${actionWord} "${club.name}"? Foreign key data (events, posts) will be safely preserved.`)) {
      const res = await toggleClubStatus(club.dbId || club.id, nextStatus);
      if (res.success) {
        await loadAdminData();
      } else {
        alert(`Status update failed: ${res.error}`);
      }
    }
  };

  // Filtered lists
  const filteredUsers = usersList.filter(u =>
    (u.name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (u.clubName || '').toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredEvents = eventsList.filter(e =>
    (e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.clubName || e.club?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-purple-500/20">
        <div>
          <div className="inline-flex items-center gap-2 text-purple-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            Platform Master Administration
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Main Admin Console
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Central governance view for MSU Baroda Faculty of Tech. Appoint Club Heads, manage user roles, oversee registered societies, and moderate campus events.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={isLoading}
          className="self-start md:self-end flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Live Records</span>
        </button>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Admin KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-1">
          <p className="text-xs font-mono text-blue-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Registered Students
          </p>
          <p className="text-3xl font-display font-extrabold text-white">{totalStudents}</p>
          <p className="text-[10px] text-slate-500 font-mono">Standard student accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-1">
          <p className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            Club Heads Appointed
          </p>
          <p className="text-3xl font-display font-extrabold text-white">{totalClubHeads}</p>
          <p className="text-[10px] text-slate-500 font-mono">Assigned organizers</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-1">
          <p className="text-xs font-mono text-purple-400 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            Department Clubs
          </p>
          <p className="text-3xl font-display font-extrabold text-white">{totalClubs}</p>
          <p className="text-[10px] text-slate-500 font-mono">Active campus societies</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-1">
          <p className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Campus Events
          </p>
          <p className="text-3xl font-display font-extrabold text-white">{totalEvents}</p>
          <p className="text-[10px] text-slate-500 font-mono">{publishedEvents} Published</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-purple-400 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User & Role Governance ({usersList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'events'
              ? 'border-purple-400 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Event Moderation ({eventsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('clubs')}
          className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'clubs'
              ? 'border-purple-400 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Clubs Management ({clubsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('lounge')}
          className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'lounge'
              ? 'border-purple-400 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Campus Lounge Media ({loungeList.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USER MANAGEMENT (PROMOTIONS & CLUB ASSIGNMENT)                     */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="rounded-3xl border border-slate-800 bg-[#0a0e1a]/95 p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                Registered Users & Role Management
              </h3>
              <p className="text-xs text-slate-400">
                Public signups are strictly Students. Promote student leads to Club Heads and link their assigned society in PostgreSQL.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 font-semibold">User Profile</th>
                  <th className="pb-3 font-semibold">Current Role</th>
                  <th className="pb-3 font-semibold">Assigned Club Society</th>
                  <th className="pb-3 font-semibold text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 font-mono">
                      No user accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((usr) => {
                    const isProcessing = actionLoadingId === usr.id;
                    const isSelf = user?.id === usr.id;

                    return (
                      <tr key={usr.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={usr.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
                              alt={usr.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-700 flex-shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-white">
                                {usr.name} {isSelf && <span className="text-[10px] text-purple-400 font-mono">(You)</span>}
                              </p>
                              <p className="text-[11px] font-mono text-slate-400">{usr.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 pr-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
                              usr.role === 'admin'
                                ? 'bg-purple-950/80 text-purple-300 border border-purple-800/50'
                                : usr.role === 'organizer'
                                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/50'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {usr.role === 'admin' ? 'Main Admin' : usr.role === 'organizer' ? 'Club Head' : 'Student'}
                          </span>
                        </td>

                        <td className="py-3.5 pr-4">
                          {usr.role === 'organizer' ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={usr.clubDbId || usr.clubId || ''}
                                onChange={(e) => handleReassignClub(usr, e.target.value)}
                                disabled={isProcessing}
                                className="px-2.5 py-1 bg-slate-900 border border-cyan-500/30 rounded-lg text-xs text-cyan-300 font-mono focus:outline-none"
                              >
                                <option value="" disabled>Select assigned club</option>
                                {clubsList.map((c) => (
                                  <option key={c.id} value={c.dbId || c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : usr.role === 'admin' ? (
                            <span className="text-slate-500 font-mono text-[11px]">All Societies (Universal)</span>
                          ) : (
                            <span className="text-slate-500 font-mono text-[11px]">None (Regular Member)</span>
                          )}
                        </td>

                        <td className="py-3.5 text-right whitespace-nowrap">
                          {usr.role === 'admin' ? (
                            <span className="text-slate-500 text-[11px] font-mono">Protected Admin</span>
                          ) : usr.role === 'organizer' ? (
                            <button
                              onClick={() => handleRevoke(usr)}
                              disabled={isProcessing}
                              className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-rose-400 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 transition-colors"
                            >
                              {isProcessing ? 'Revoking...' : 'Revoke to Student'}
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <select
                                value={selectedClubForUser[usr.id] || clubsList[0]?.dbId || clubsList[0]?.id || ''}
                                onChange={(e) =>
                                  setSelectedClubForUser(prev => ({ ...prev, [usr.id]: e.target.value }))
                                }
                                disabled={isProcessing}
                                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-slate-300 font-mono focus:outline-none"
                              >
                                {clubsList.map((c) => (
                                  <option key={c.id} value={c.dbId || c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handlePromote(usr)}
                                disabled={isProcessing}
                                className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-800/50 transition-colors"
                              >
                                {isProcessing ? 'Promoting...' : 'Promote to Club Head'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EVENT MODERATION                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="rounded-3xl border border-slate-800 bg-[#0a0e1a]/95 p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                All Campus Events
              </h3>
              <p className="text-xs text-slate-400">
                Review, audit status (published / cancelled / past), or remove inappropriate events across any club.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events or clubs..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Event</th>
                  <th className="pb-3 font-semibold">Club Society</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Scheduled Date</th>
                  <th className="pb-3 font-semibold">Registration URL</th>
                  <th className="pb-3 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredEvents.map((evt) => (
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
                      <Badge variant={evt.clubId} size="sm">
                        {evt.clubName}
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
                    <td className="py-3.5 pr-4">
                      <a
                        href={evt.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px] truncate max-w-[140px]"
                      >
                        <span>External Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdminToggleStatus(evt.id, evt.status)}
                          className="px-2 py-1 rounded-lg text-[11px] font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                          title="Toggle Status"
                        >
                          {evt.status === 'published' ? 'Cancel' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleAdminDeleteEvent(evt.id, evt.title)}
                          className="p-1 text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Remove Event (Admin Delete)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CLUBS MANAGEMENT                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'clubs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                Department Societies Governance
              </h3>
              <p className="text-xs text-slate-400">
                Inspect registered clubs, identify assigned Club Heads, create new societies, or safely deactivate clubs without breaking historical archives.
              </p>
            </div>
            <Button
              onClick={() => setShowAddClubModal(true)}
              variant="cyan"
              size="sm"
              icon={PlusCircle}
            >
              Add New Society
            </Button>
          </div>

          {/* Add Club Modal */}
          {showAddClubModal && (
            <div className="p-6 rounded-3xl bg-slate-900/95 border border-cyan-500/40 space-y-4 shadow-2xl">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <span>Register New Student Club / Society</span>
              </h4>
              <form onSubmit={handleCreateClub} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Club Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newClubData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        setNewClubData(prev => ({ ...prev, name, slug }));
                      }}
                      placeholder="e.g. AI & Data Science Guild"
                      className="w-full px-3.5 py-2 bg-slate-850 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Unique Slug Identifier *</label>
                    <input
                      type="text"
                      required
                      value={newClubData.slug}
                      onChange={(e) => setNewClubData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g. ai-guild"
                      className="w-full px-3.5 py-2 bg-slate-850 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={newClubData.category}
                      onChange={(e) => setNewClubData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g. Technical / Coding"
                      className="w-full px-3.5 py-2 bg-slate-850 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Specialization Domain</label>
                    <input
                      type="text"
                      value={newClubData.domain}
                      onChange={(e) => setNewClubData(prev => ({ ...prev, domain: e.target.value }))}
                      placeholder="e.g. Machine Learning / Computer Vision"
                      className="w-full px-3.5 py-2 bg-slate-850 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Tagline Statement</label>
                  <input
                    type="text"
                    value={newClubData.statement}
                    onChange={(e) => setNewClubData(prev => ({ ...prev, statement: e.target.value }))}
                    placeholder="Inspiring short motto for discovery"
                    className="w-full px-3.5 py-2 bg-slate-850 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Official Contact Email</label>
                  <input
                    type="email"
                    value={newClubData.contactEmail}
                    onChange={(e) => setNewClubData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="club@msubaroda.ac.in"
                    className="w-full px-3.5 py-2 bg-slate-850 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddClubModal(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    variant="cyan"
                    size="sm"
                    disabled={isCreatingClub}
                  >
                    {isCreatingClub ? 'Registering...' : 'Register Society'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubsList.map((club) => {
              // Find assigned Club Head from user list
              const assignedHead = usersList.find(u =>
                u.role === 'organizer' &&
                (u.clubDbId === club.dbId || u.clubId === club.slug || u.clubId === club.id)
              );

              return (
                <div
                  key={club.id}
                  className={`p-6 rounded-3xl bg-slate-900/80 border space-y-4 shadow-xl transition-all ${
                    club.isActive ? 'border-slate-800' : 'border-rose-900/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={club.logo}
                        alt={club.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="text-base font-bold text-white">{club.name}</h4>
                        <p className="text-xs text-cyan-400 font-mono">{club.domain || club.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleClubStatus(club)}
                      className="text-xs p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400"
                      title={club.isActive ? 'Deactivate/Archive Society' : 'Reactivate Society'}
                    >
                      {club.isActive ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-rose-400" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">Appointed Club Head:</span>
                      {assignedHead ? (
                        <span className="text-cyan-300 font-mono text-[11px] font-semibold">
                          {assignedHead.name}
                        </span>
                      ) : (
                        <span className="text-amber-400/80 font-mono text-[11px]">Unassigned</span>
                      )}
                    </div>
                    <p>
                      <strong className="text-white">Contact:</strong> {club.contactEmail || 'N/A'}
                    </p>
                    <p>
                      <strong className="text-white">Active Members:</strong> {club.memberCount || 50}+
                    </p>
                    <p>
                      <strong className="text-white">Status:</strong>{' '}
                      <span className={club.isActive ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                        {club.isActive ? 'Active Society' : 'Archived (Hidden)'}
                      </span>
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                    <Link
                      to={`/clubs/${club.slug || club.id}`}
                      className="text-cyan-400 font-semibold hover:underline"
                    >
                      View Public Profile →
                    </Link>
                    <span className="font-mono text-slate-500 text-[11px]">
                      Slug: {club.slug}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CAMPUS LOUNGE MEDIA                                               */}
      {/* ========================================================================= */}
      {activeTab === 'lounge' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loungeList.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg space-y-3 p-3"
            >
              <div className="h-44 rounded-xl overflow-hidden bg-slate-800">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                  {post.clubName}
                </span>
                <h4 className="text-sm font-semibold text-white mt-1">{post.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{post.caption}</p>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>{post.academicYear}</span>
                <span className="text-emerald-400">Approved</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
