'use client';

import React from 'react';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import Link from 'next/link';
import {
  Users,
  Clock,
  CheckSquare,
  TrendingUp,
  CalendarCheck,
  ArrowUpRight,
  ChevronRight,
  Building2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentRole, currentUser, employees, leads, tasks, attendance, followUps } = useCrm();

  // Metric Computations
  const totalEmployees = employees.length;
  const presentToday = attendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const pendingTasks = tasks.filter((t) => t.status === 'To Do' || t.status === 'In Progress').length;
  const openLeads = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length;
  const todayFollowUps = followUps.filter((f) => f.status === 'Pending').length;

  return (
    <Shell>
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Welcome back, {currentUser.name} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {currentRole === 'ADMIN' && 'Company Overview & Operational Intelligence'}
            {currentRole === 'MANAGER' && 'Team Operations & Sales Pipeline Performance'}
            {currentRole === 'EMPLOYEE' && 'My Daily Workspace & Operational Assignments'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tasks"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>View My Tasks ({pendingTasks})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {currentRole === 'EMPLOYEE' ? 'My Role' : 'Total Employees'}
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {currentRole === 'EMPLOYEE' ? currentUser.designation : totalEmployees}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            {currentRole === 'EMPLOYEE' ? 'Active Staff' : '100% Active Staff'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Present Today
            </span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{presentToday} / {totalEmployees}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {attendance.filter((a) => a.status === 'Late').length} Late check-ins
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Tasks
            </span>
            <CheckSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{pendingTasks}</div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">
            {tasks.filter((t) => t.status === 'Overdue').length} Overdue Task
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Leads
            </span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{openLeads}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">
            Rs 15.3 Cr Pipeline
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Follow-ups Today
            </span>
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{todayFollowUps}</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">
            Action Required
          </div>
        </div>
      </div>

      {/* Main Grid: Pipeline + Tasks + Activity */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column: Lead Pipeline & Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Lead Pipeline Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Lead Pipeline Summary</h3>
                <p className="text-xs text-slate-500">Active project enquiries by stage</p>
              </div>
              <Link href="/leads" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All Pipeline <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { stage: 'New', count: leads.filter((l) => l.status === 'New').length, color: 'bg-slate-100 text-slate-700' },
                { stage: 'Contacted', count: leads.filter((l) => l.status === 'Contacted').length, color: 'bg-blue-50 text-blue-700' },
                { stage: 'Follow-up', count: leads.filter((l) => l.status === 'Follow-up').length, color: 'bg-amber-50 text-amber-700' },
                { stage: 'Quotation Sent', count: leads.filter((l) => l.status === 'Quotation Sent').length, color: 'bg-purple-50 text-purple-700' },
                { stage: 'Won', count: leads.filter((l) => l.status === 'Won').length, color: 'bg-emerald-50 text-emerald-700' },
              ].map((item) => (
                <div key={item.stage} className={`${item.color} p-3.5 rounded-lg border border-slate-200/60 text-center`}>
                  <div className="text-xs font-bold uppercase tracking-wider">{item.stage}</div>
                  <div className="text-xl font-extrabold mt-1">{item.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Tasks Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-base">High Priority Tasks</h3>
                <p className="text-xs text-slate-500">Tasks requiring immediate site or technical action</p>
              </div>
              <Link href="/tasks" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Task Board <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        task.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : task.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{task.id}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-800">{task.title}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Assigned: <strong className="text-slate-700">{task.assignedTo}</strong></span>
                      <span>Due: <strong className="text-slate-700">{task.dueDate}</strong></span>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg text-center ${
                    task.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : task.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : task.status === 'Overdue'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Summary & Recent Activity */}
        <div className="space-y-8">
          {/* Today's Attendance Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">Attendance Breakdown</h3>
              <Link href="/attendance" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Log <ChevronRight className="w-3 h-3 inline" />
              </Link>
            </div>

            <div className="space-y-3 text-xs font-medium">
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg text-emerald-800">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Present On Time
                </span>
                <span className="font-bold text-sm">3</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg text-amber-800">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" /> Late Check-in
                </span>
                <span className="font-bold text-sm">1</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-lg text-slate-700">
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-500" /> Approved Leave
                </span>
                <span className="font-bold text-sm">1</span>
              </div>
            </div>
          </div>

          {/* Today's Follow-ups */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">Today's Key Follow-ups</h3>
              <Link href="/follow-ups" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Schedule <ChevronRight className="w-3 h-3 inline" />
              </Link>
            </div>

            <div className="space-y-3">
              {followUps.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                    <span className="truncate">{item.customer}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      item.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.status === 'Pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-slate-600 font-medium">{item.product}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Assigned: {item.assignedTo}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
