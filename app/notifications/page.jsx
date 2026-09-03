'use client';

import React from 'react';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  CheckSquare,
  CalendarCheck2,
  Globe2,
} from 'lucide-react';

export default function NotificationsPage() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    t,
  } = useCrm();

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <span>Notification & Alert Center</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            System alerts, lead assignments, leave approvals, task deadlines, and attendance notices.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors self-start md:self-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs font-medium space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-300">
              <Bell className="w-6 h-6" />
            </div>
            <div className="font-bold text-slate-600 text-sm">You're all caught up.</div>
            <p className="text-slate-400">No unread notifications at this time.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                n.unread ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {n.type === 'lead' && <TrendingUp className="w-4 h-4 text-purple-600" />}
                  {n.type === 'task' && <CheckSquare className="w-4 h-4 text-amber-600" />}
                  {n.type === 'attendance' && <Clock className="w-4 h-4 text-emerald-600" />}
                  {n.type === 'leave' && <CalendarCheck2 className="w-4 h-4 text-blue-600" />}
                  {n.type === 'system' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                    {n.unread && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{n.message}</p>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1.5">{n.time}</div>
                </div>
              </div>

              {n.unread && (
                <button
                  onClick={() => markNotificationRead(n.id)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1 shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark Read</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </Shell>
  );
}
