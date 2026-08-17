'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Shell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
