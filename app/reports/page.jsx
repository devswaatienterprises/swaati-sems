'use client';

import React from 'react';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckSquare,
  Users,
  Award,
} from 'lucide-react';

export default function ReportsPage() {
  const { currentRole, employees, tasks, leads, attendance } = useCrm();

  const totalValWon = leads
    .filter((l) => l.status === 'Won')
    .reduce((acc, l) => acc + l.estimatedValue, 0);

  const completedTaskCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Reports & Operational Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Performance metrics across attendance, sales pipeline, and site task execution.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Contract Value Won</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              ₹{(totalValWon / 100000).toFixed(1)} Lakhs
            </div>
            <div className="text-xs text-emerald-600 font-bold mt-1">100% On-Target Conversion</div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Task Completion Rate</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {Math.round((completedTaskCount / tasks.length) * 100)}%
            </div>
            <div className="text-xs text-blue-600 font-bold mt-1">{completedTaskCount} of {tasks.length} Completed</div>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Shift Punctuality</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">94.2%</div>
            <div className="text-xs text-purple-600 font-bold mt-1">Chinchwad Base Average</div>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Team Productivity Report */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Employee Productivity Summary
          </h3>
          <div className="space-y-3 text-xs">
            {employees.map((emp) => {
              const empTasks = tasks.filter((t) => t.assignedTo === emp.name);
              const done = empTasks.filter((t) => t.status === 'Completed').length;

              return (
                <div key={emp.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{emp.name}</div>
                    <div className="text-slate-500 text-[11px]">{emp.designation}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">{done} / {empTasks.length} Tasks</div>
                    <div className="text-[10px] text-emerald-600 font-bold">Shift: Present</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Conversion Pipeline Report */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" /> Commercial Lead Breakdown
          </h3>
          <div className="space-y-3 text-xs">
            {leads.map((l) => (
              <div key={l.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{l.customerCompany}</div>
                  <div className="text-slate-500 text-[11px]">{l.productInterested}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900">₹{(l.estimatedValue / 100000).toFixed(1)}L</div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                    {l.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
