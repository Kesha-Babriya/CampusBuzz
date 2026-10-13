import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles, Heart, ShieldCheck, MapPin } from 'lucide-react';
import Logo from '../common/Logo';
import { mockClubs } from '../../data/mockClubs';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060911] text-slate-400 text-sm mt-24">
      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" showTagline={true} />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              A specialized discovery and engagement platform built for the student community of MSU Baroda. Empowering students to find workshops, hackathons, and clubs tailored to their ambitions.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Faculty of Technology & Engineering, MSU Baroda, Gujarat</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h5 className="text-xs uppercase font-mono tracking-wider text-slate-200 font-semibold mb-3">
              Explore
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/events" className="hover:text-cyan-300 transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="hover:text-cyan-300 transition-colors">
                  Campus Calendar
                </Link>
              </li>
              <li>
                <Link to="/clubs" className="hover:text-cyan-300 transition-colors">
                  Club Directory
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="hover:text-cyan-300 transition-colors">
                  Club Recommendation Quiz
                </Link>
              </li>
              <li>
                <Link to="/lounge" className="hover:text-cyan-300 transition-colors">
                  Campus Lounge (Photo Grid)
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-cyan-300 transition-colors">
                  Saved Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Active Clubs */}
          <div>
            <h5 className="text-xs uppercase font-mono tracking-wider text-slate-200 font-semibold mb-3">
              Active Clubs
            </h5>
            <ul className="space-y-2 text-xs">
              {mockClubs.map((club) => (
                <li key={club.id}>
                  <Link
                    to={`/clubs/${club.id}`}
                    className="hover:text-cyan-300 transition-colors flex items-center justify-between group"
                  >
                    <span>{club.name}</span>
                    <span className="text-[10px] text-slate-600 group-hover:text-cyan-400 font-mono">
                      {club.category.split(' ')[0]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals & Roles */}
          <div>
            <h5 className="text-xs uppercase font-mono tracking-wider text-slate-200 font-semibold mb-3">
              Portals & System
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/organizer" className="hover:text-cyan-300 transition-colors">
                  Club Organizer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-cyan-300 transition-colors">
                  Faculty / Admin Console
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-cyan-300 transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-cyan-300 transition-colors">
                  Create Student Profile
                </Link>
              </li>
              <li className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Phase 1: Frontend Prototype
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-slate-900 bg-[#04060c] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} CampusBuzz. Designed & Engineered for MSU Baroda CSE.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Built with React + Tailwind CSS</span>
            <span>•</span>
            <span className="text-cyan-400">Dark Premium Experience</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
