import React from 'react';

export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 animate-pulse flex flex-col justify-between">
      <div>
        <div className="w-full h-44 rounded-xl bg-slate-800 mb-4" />
        <div className="flex items-center gap-2 mb-3">
          <div className="w-20 h-5 rounded-full bg-slate-800" />
          <div className="w-24 h-5 rounded-full bg-slate-800" />
        </div>
        <div className="w-3/4 h-6 rounded bg-slate-800 mb-2" />
        <div className="w-full h-4 rounded bg-slate-800/60 mb-2" />
        <div className="w-2/3 h-4 rounded bg-slate-800/60 mb-4" />
      </div>
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <div className="w-32 h-4 rounded bg-slate-800" />
        <div className="w-20 h-8 rounded-lg bg-slate-800" />
      </div>
    </div>
  );
}

export function ClubCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 animate-pulse">
      <div className="w-full h-32 rounded-xl bg-slate-800 mb-4" />
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800" />
        <div className="space-y-2">
          <div className="w-32 h-5 rounded bg-slate-800" />
          <div className="w-24 h-4 rounded bg-slate-800/60" />
        </div>
      </div>
      <div className="w-full h-4 rounded bg-slate-800/60 mb-2" />
      <div className="w-4/5 h-4 rounded bg-slate-800/60" />
    </div>
  );
}
