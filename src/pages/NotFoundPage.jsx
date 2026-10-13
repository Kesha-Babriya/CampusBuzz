import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-cyan-400 mb-6">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-display font-extrabold text-white mb-2">
        404 — Page Not Found
      </h1>
      <p className="text-sm text-slate-400 max-w-md mb-8">
        The campus page, event, or route you requested doesn't exist or has migrated to another corner of CampusBuzz.
      </p>
      <Button to="/" variant="primary" icon={ArrowLeft} iconPosition="left">
        Return to Campus Feed
      </Button>
    </div>
  );
}
