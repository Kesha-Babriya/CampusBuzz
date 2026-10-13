import React from 'react';
import { CalendarX, SearchX, Sparkles } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = SearchX,
  title = "No results found",
  description = "Try adjusting your search criteria, club filter, or reset your current filters.",
  actionLabel = null,
  onAction = null,
  actionTo = null
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 max-w-xl mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon className="w-8 h-8 text-cyan-400/80" />
      </div>
      <h3 className="text-xl font-display font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLabel && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          to={actionTo}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
