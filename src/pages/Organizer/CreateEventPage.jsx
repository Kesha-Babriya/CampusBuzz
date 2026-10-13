import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2,
  Eye
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { eventCategories, mockEvents } from '../../data/mockEvents';
import { getClubById, mockClubs } from '../../data/mockClubs';
import { createEventRecord } from '../../services/eventService';

export default function CreateEventPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const assignedClubId = user?.clubId || 'vimarsh';
  const assignedClub = getClubById(assignedClubId);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Workshop',
    clubId: assignedClubId,
    date: '2026-10-25',
    dayOfWeek: 'Sunday',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: 'Computer Center Lab 2, FTE Campus',
    registrationDeadline: '2026-10-24T23:59:00',
    registrationUrl: 'https://forms.gle/demo-campusbuzz-reg',
    poster: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80',
    shortDescription: '',
    description: '',
    eligibility: 'Open to all MSU Baroda undergraduates.',
    contact: `${user?.name || 'Club Lead'} (${user?.email || 'events@msubaroda.ac.in'})`,
    officialUrl: ''
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Construct new event object
    const newEvent = {
      id: `evt-${Date.now()}`,
      slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      clubName: assignedClub?.name || 'VIMARSH',
      featured: false,
      status: 'published',
      views: 1,
      registrationClicks: 0,
      tags: [formData.category, "CampusBuzz", assignedClub?.shortName || "Club"],
      ...formData
    };

    try {
      await createEventRecord(newEvent, user?.id);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/organizer');
      }, 1200);
    } catch (err) {
      console.error('Error creating event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/organizer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 font-mono transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organizer Console</span>
        </Link>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 font-mono"
        >
          <Eye className="w-4 h-4" />
          <span>{showPreview ? 'Hide Live Preview' : 'Show Live Preview'}</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Immediate Publishing Pipeline
        </div>
        <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
          Create & Publish Event
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Publishing on behalf of <strong className="text-white">{assignedClub?.name}</strong>. Visible immediately to all students across CampusBuzz.
        </p>
      </div>

      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Event successfully created and published to the live campus feed! Redirecting...</span>
        </div>
      )}

      {/* Live Preview Box (if toggled) */}
      {showPreview && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-3 shadow-2xl">
          <p className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
            Live Preview Card
          </p>
          <div className="max-w-md mx-auto rounded-2xl border border-slate-800 bg-[#0a0e1a] overflow-hidden shadow-xl">
            <div className="h-44 bg-slate-800 overflow-hidden relative">
              <img src={formData.poster} alt={formData.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex gap-1.5">
                <Badge variant={formData.clubId} size="sm">{assignedClub?.name}</Badge>
                <Badge variant="cyan" size="sm">{formData.category}</Badge>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <h4 className="text-base font-bold text-white line-clamp-1">
                {formData.title || 'Untitled Event'}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2">
                {formData.shortDescription || 'Short description preview...'}
              </p>
              <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                <span>{formData.date} • {formData.startTime}</span>
                <span className="text-cyan-400">Register →</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-[#0a0e1a]/95 p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
            Event Title *
          </label>
          <input
            type="text"
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Next-Gen Web3 & Smart Contracts Bootcamp"
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Category & Club Scope */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs font-medium text-slate-200 focus:outline-none"
            >
              {eventCategories.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              Organizing Club (Assigned)
            </label>
            <input
              type="text"
              readOnly
              value={`${assignedClub?.name} (Locked to your organizer role)`}
              className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs font-mono text-cyan-400 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Date, Start Time, End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              Event Date *
            </label>
            <input
              type="date"
              required
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              Start Time *
            </label>
            <input
              type="text"
              required
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              placeholder="e.g. 10:00 AM"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              End Time *
            </label>
            <input
              type="text"
              required
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              placeholder="e.g. 02:00 PM"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Venue & Registration Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              Venue (Classroom / Lab / Hall) *
            </label>
            <input
              type="text"
              required
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g. CSE Seminar Hall, 2nd Floor, FTE"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              Registration Deadline *
            </label>
            <input
              type="text"
              name="registrationDeadline"
              value={formData.registrationDeadline}
              onChange={handleChange}
              placeholder="e.g. 2026-10-24T23:59:00"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* External Registration Link */}
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
            Official External Registration URL (Google Form / Unstop / Devfolio) *
          </label>
          <input
            type="url"
            required
            name="registrationUrl"
            value={formData.registrationUrl}
            onChange={handleChange}
            placeholder="https://forms.gle/..."
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-cyan-300 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Poster Image URL */}
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
            Poster Image URL (Unsplash or direct image link)
          </label>
          <input
            type="url"
            name="poster"
            value={formData.poster}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
            Short Hook / Summary (1-2 sentences for feed cards) *
          </label>
          <input
            type="text"
            required
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="e.g. Build and deploy dynamic smart contracts with Solidity and Hardhat."
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
          />
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
            Detailed Description & Syllabus
          </label>
          <textarea
            rows={4}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide speaker information, schedule breakdown, hardware/software requirements..."
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
          />
        </div>

        {/* Eligibility & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              Eligibility Criteria
            </label>
            <input
              type="text"
              name="eligibility"
              value={formData.eligibility}
              onChange={handleChange}
              placeholder="e.g. 2nd & 3rd Year CSE/IT students"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              Organizer Contact
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Publish Action Button */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <Link
            to="/organizer"
            className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            variant="cyan"
            size="lg"
            icon={CheckCircle2}
          >
            Publish Live to CampusBuzz
          </Button>
        </div>
      </form>
    </div>
  );
}
