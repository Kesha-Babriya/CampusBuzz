import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  dotColor = 'bg-cyan-400'
}) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }[size] || 'text-xs px-2.5 py-1';

  const variantClasses = {
    default: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
    blue: 'bg-blue-950/60 text-blue-300 border border-blue-500/30',
    cyan: 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30',
    purple: 'bg-purple-950/60 text-purple-300 border border-purple-500/30',
    emerald: 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30',
    amber: 'bg-amber-950/60 text-amber-300 border border-amber-500/30',
    rose: 'bg-rose-950/60 text-rose-300 border border-rose-500/30',
    vimarsh: 'bg-blue-950/80 text-blue-300 border border-blue-500/40',
    'dev-infinity': 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40',
    'cultural-club': 'bg-pink-950/80 text-pink-300 border border-pink-500/40',
    'robotics-club': 'bg-purple-950/80 text-purple-300 border border-purple-500/40',
    'finance-entrepreneurship': 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
  }[variant] || 'bg-slate-800/80 text-slate-300 border border-slate-700/60';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClasses} ${variantClasses} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />}
      <span>{children}</span>
    </span>
  );
}
