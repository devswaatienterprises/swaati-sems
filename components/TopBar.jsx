'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCrm } from '@/context/CrmContext';
import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings as SettingsIcon,
  Clock,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';

export default function TopBar({ onOpenSidebar }) {
  const router = useRouter();
  const {
    currentRole,
    currentUser,
    setDemoRole,
    notifications,
    checkedIn,
    toggleCheckIn,
  } = useCrm();

  const [profileOpen, setProfileOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    setProfileOpen(false);
    router.push('/');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Menu Toggle & Page Context */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Demo Role Switcher Quick Pill (Great for prototype testing!) */}
        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <span className="text-slate-400 px-2 flex items-center gap-1 font-normal">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" /> Prototype Role:
          </span>
          <button
            onClick={() => setDemoRole('ADMIN')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              currentRole === 'ADMIN'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setDemoRole('MANAGER')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              currentRole === 'MANAGER'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Manager
          </button>
          <button
            onClick={() => setDemoRole('EMPLOYEE')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              currentRole === 'EMPLOYEE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Employee
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Daily Attendance Check-In Quick Toggle Button */}
        <button
          onClick={toggleCheckIn}
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            checkedIn
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{checkedIn ? 'Checked In (09:00 AM)' : 'Mark Check-In'}</span>
        </button>

        {/* Notifications Icon */}
        <Link
          href="/notifications"
          className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-semibold flex items-center justify-center text-xs shadow-xs">
              {currentUser.avatar}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {currentUser.designation}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 text-xs"
              onClick={() => setProfileOpen(false)}
            >
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="font-bold text-slate-800">{currentUser.name}</div>
                <div className="text-slate-500 text-[11px] truncate">{currentUser.email}</div>
                <div className="mt-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                  Role: {currentUser.role}
                </div>
              </div>

              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-medium"
              >
                <User className="w-4 h-4 text-slate-400" /> My Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-medium"
              >
                <SettingsIcon className="w-4 h-4 text-slate-400" /> System Settings
              </Link>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 font-semibold text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
