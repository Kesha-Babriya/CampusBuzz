import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import Badge from '../common/Badge';

export default function ClubCard({ club }) {
  return (
    <div className="group relative rounded-2xl border border-slate-800 bg-[#0a0e1a]/90 hover:border-cyan-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-card-dark">
      <div>
        {/* Cover Banner */}
        <div className="relative h-32 w-full overflow-hidden bg-slate-900">
          <img
            src={club.coverImage}
            alt={club.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/50 to-transparent" />
          
          {/* Category Chip */}
          <div className="absolute top-3 right-3">
            <Badge variant={club.id} size="sm">
              {club.category}
            </Badge>
          </div>
        </div>

        {/* Content with Avatar floating */}
        <div className="p-5 pt-0 relative space-y-3">
          {/* Club Logo Avatar */}
          <div className="-mt-8 mb-2 flex items-center justify-between">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#0a0e1a] shadow-xl bg-slate-900 ring-1 ring-white/10">
              <img
                src={club.logo}
                alt={club.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-850">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{club.memberCount}+ peers</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-display font-bold text-white group-hover:text-cyan-300 transition-colors">
              {club.name}
            </h3>
            <p className="text-xs text-cyan-400/90 font-mono font-medium mt-0.5">
              {club.domain}
            </p>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {club.description}
          </p>

          {/* Quick Highlight Points */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1">
            {(club.whatWeDo || []).slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-mono">
          Est. {club.established || '2020'}
        </span>
        <Link
          to={`/clubs/${club.slug || club.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 transition-all group-hover:border-cyan-500"
        >
          <span>Explore Club</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
