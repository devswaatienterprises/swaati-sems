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
} from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useCrm();

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <span>Notification & Alert Center</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System alerts, lead assignments, task deadlines, and attendance reminders.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">
            You are all caught up! No notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                n.unread ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n.type === 'lead' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                  {n.type === 'task' && <CheckSquare className="w-5 h-5 text-amber-600" />}
                  {n.type === 'attendance' && <Clock className="w-5 h-5 text-emerald-600" />}
                  {n.type === 'followup' && <AlertCircle className="w-5 h-5 text-blue-600" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                    {n.unread && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  <div className="text-[11px] text-slate-400 font-medium mt-2">{n.time}</div>
                </div>
              </div>

              {n.unread && (
                <button
                  onClick={() => markNotificationRead(n.id)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 shrink-0"
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
