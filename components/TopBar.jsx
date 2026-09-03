'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCrm } from '@/context/CrmContext';
import {
  Menu,
  Bell,
  Clock,
  Languages,
  UserCheck,
} from 'lucide-react';

export default function TopBar({ onOpenSidebar }) {
  const {
    checkedIn,
    toggleCheckIn,
    notifications,
    locale,
    setLocale,
    availableLanguages = [],
    t,
  } = useCrm();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Check-In Action, Notifications, Language */}
      <div className="flex items-center gap-3">
        {/* Daily Attendance Button */}
        <button
          onClick={toggleCheckIn}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition-all ${
            checkedIn
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
          }`}
        >
          {checkedIn ? <UserCheck className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          <span>{checkedIn ? t('checked_in') + ' (09:45 AM)' : t('mark_check_in')}</span>
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 text-xs font-semibold"
          >
            <Languages className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">
              {availableLanguages.find((l) => l.code === locale)?.name || (locale === 'mr' ? 'मराठी' : locale === 'hi' ? 'हिंदी' : 'English')}
            </span>
          </button>

          {langMenuOpen && (
            <div
              className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 text-xs font-medium"
              onClick={() => setLangMenuOpen(false)}
            >
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 ${
                    locale === lang.code ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  {lang.name} {lang.code === 'en' ? '(Default)' : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <Link
          href="/notifications"
          className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
