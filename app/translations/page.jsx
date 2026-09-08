'use client';

import React from 'react';
import Shell from '@/components/Shell';
import TranslationGrid from '@/components/TranslationGrid';
import { useCrm } from '@/context/CrmContext';
import { Languages, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function TranslationsPage() {
  const { currentRole, t } = useCrm();

  if (currentRole !== 'ADMIN') {
    return (
      <Shell>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center shadow-xs max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
            Admin Access Required
          </h2>
          <p className="text-sm text-slate-600 font-medium mb-6">
            Translation Management is restricted to System Administrators only.
          </p>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-2"
          >
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Languages className="w-6 h-6" />
            </div>
            <span>Translations Management</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Centralized translation management. Edit English, Marathi, and Hindi copy side-by-side with instant persistence to the database.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <TranslationGrid />
      </div>
    </Shell>
  );
}
