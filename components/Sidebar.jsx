'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCrm } from '@/context/CrmContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck2,
  CheckSquare,
  TrendingUp,
  FileSpreadsheet,
  BarChart3,
  MessageSquare,
  Settings,
  X,
  LogOut,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentRole, currentUser, hasPermission, t } = useCrm();

  const allNavItems = [
    {
      key: 'dashboard',
      label: t('nav_dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      key: 'employees',
      label: t('nav_employees'),
      href: '/employees',
      icon: Users,
      adminOnly: true, // Only Admin can manage employees
    },
    {
      key: 'attendance',
      label: t('nav_attendance'),
      href: '/attendance',
      icon: Clock,
      adminOnly: false,
    },
    {
      key: 'leave',
      label: t('nav_leave'),
      href: '/leave',
      icon: CalendarCheck2,
      adminOnly: false,
    },
    {
      key: 'tasks',
      label: t('nav_tasks'),
      href: '/tasks',
      icon: CheckSquare,
      adminOnly: false,
    },
    {
      key: 'leads',
      label: t('nav_leads'),
      href: '/leads',
      icon: TrendingUp,
      adminOnly: false,
    },
    {
      key: 'products',
      label: t('nav_products'),
      href: '/products',
      icon: FileSpreadsheet,
      adminOnly: false,
    },
    {
      key: 'reports',
      label: t('nav_reports'),
      href: '/reports',
      icon: BarChart3,
      adminOnly: false,
    },
    {
      key: 'messaging',
      label: t('nav_messages'),
      href: '/messages',
      icon: MessageSquare,
      adminOnly: false,
    },
    {
      key: 'settings',
      label: t('nav_settings'),
      href: '/settings',
      icon: Settings,
      adminOnly: false,
    },
  ];

  // Filter items based on actual permissions
  const filteredNavItems = allNavItems.filter((item) => {
    if (currentRole === 'ADMIN') return true;
    if (item.adminOnly) return false;
    return hasPermission(item.key);
  });

  const handleLogout = () => {
    if (onClose) onClose();
    router.push('/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 flex flex-col shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 shrink-0 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-sm shadow-black/20 shrink-0">
              <img
                src="/images/se-logo.webp"
                alt="Swaati Enterprises Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-bold text-white tracking-wide text-sm leading-tight flex items-center gap-1.5">
                <span>SEMS</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.2 rounded border border-blue-500/30">
                  {t('nav.portal_badge', 'PORTAL')}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                Swaati Enterprises
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User / Mode Banner */}
        <div className="shrink-0 px-5 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center justify-center">
              {currentUser?.avatar || 'SE'}
            </div>
            <span className="text-xs font-semibold text-slate-200 truncate">
              {currentUser?.name || 'Staff User'}
            </span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              currentRole === 'ADMIN'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {currentRole === 'ADMIN' ? (t('role_admin') || 'ADMIN') : (t('role_employee') || 'STAFF')}
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Action (Separated after Settings) */}
        <div className="shrink-0 px-3.5 pt-2 pb-1 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>{t('logout', 'Logout')}</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="shrink-0 p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center font-medium">
          {t('nav.footer_info', 'SEMS v2.0 • Swaati Enterprises © 2026')}
        </div>
      </aside>
    </>
  );
}
