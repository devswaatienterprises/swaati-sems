'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCrm } from '@/context/CrmContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CheckSquare,
  TrendingUp,
  Building2,
  CalendarCheck,
  Package,
  BarChart3,
  Bell,
  Settings,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { currentRole } = useCrm();

  const allNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Employees', href: '/employees', icon: Users, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Attendance', href: '/attendance', icon: Clock, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Tasks', href: '/tasks', icon: CheckSquare, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Leads & Enquiries', href: '/leads', icon: TrendingUp, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Customers', href: '/customers', icon: Building2, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Follow-ups', href: '/follow-ups', icon: CalendarCheck, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Products', href: '/products', icon: Package, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Reports', href: '/reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Notifications', href: '/notifications', icon: Bell, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  ];

  const filteredNavItems = allNavItems.filter((item) => item.roles.includes(currentRole));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
              SE
            </div>
            <div>
              <div className="font-bold text-white tracking-wide text-sm">SWAATI ENTERPRISES</div>
              <div className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">CRM Operating System</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Active Mode:</span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
            currentRole === 'ADMIN'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : currentRole === 'MANAGER'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {currentRole}
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Swaati Enterprises v1.0 • 2026
        </div>
      </aside>
    </>
  );
}
