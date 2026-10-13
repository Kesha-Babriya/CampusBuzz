import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', showTagline = false, className = '' }) {
  const sizeClasses = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', badge: 'text-[9px] px-1.5' },
    md: { icon: 'w-9 h-9', text: 'text-xl', badge: 'text-[10px] px-2' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', badge: 'text-xs px-2.5' }
  }[size] || { icon: 'w-9 h-9', text: 'text-xl', badge: 'text-[10px] px-2' };

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group transition-all duration-200 ${className}`}>
      <div className={`relative ${sizeClasses.icon} flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0c162d] to-[#070b16] border border-blue-500/20 group-hover:border-cyan-400/50 shadow-md shadow-blue-900/20 transition-all duration-300 group-hover:shadow-glow-cyan`}>
        {/* Abstract Campus Beacon SVG */}
        <svg viewBox="0 0 40 40" className="w-5/6 h-5/6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logo-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path d="M20 6L32 13V27L20 34L8 27V13L20 6Z" stroke="url(#logo-grad)" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="20" cy="20" r="3.5" fill="url(#logo-grad)" />
          <path d="M20 11V14M20 26V29M12 16L14.5 17.5M25.5 22.5L28 24M28 16L25.5 17.5M14.5 22.5L12 24" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-display font-extrabold tracking-tight text-white group-hover:text-cyan-200 transition-colors ${sizeClasses.text}`}>
            Campus<span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">Buzz</span>
          </span>
          <span className={`font-mono font-medium rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/20 py-0.5 ${sizeClasses.badge}`}>
            MSU
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-slate-400 tracking-wide font-normal -mt-0.5">
            Faculty of Technology & Engineering
          </span>
        )}
      </div>
    </Link>
  );
}
