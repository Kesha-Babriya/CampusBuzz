import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-slate-100 selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* Background Subtle Gradient Grid */}
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-hero-glow pointer-events-none z-0 opacity-60" />

      {/* Main Global Navbar */}
      <Navbar />

      {/* Content Area */}
      <main className="flex-1 relative z-10 pt-20">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
