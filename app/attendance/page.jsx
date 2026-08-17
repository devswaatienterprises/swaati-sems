'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  UserCheck,
} from 'lucide-react';

export default function AttendancePage() {
  const { currentRole, currentUser, attendance, checkedIn, toggleCheckIn } = useCrm();

  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredAttendance = attendance.filter(
    (item) => statusFilter === 'ALL' || item.status === statusFilter
  );

  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const lateCount = attendance.filter((a) => a.status === 'Late').length;
  const leaveCount = attendance.filter((a) => a.status === 'On Leave').length;

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-600" />
            <span>Attendance & Shift Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time employee check-in logs, daily working hours, and leave records.
          </p>
        </div>

        {/* My Daily Check-in Button */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="text-xs text-right hidden sm:block">
            <div className="font-bold text-slate-800">{currentUser.name}</div>
            <div className="text-slate-500 text-[10px]">Today: {new Date().toLocaleDateString()}</div>
          </div>
          <button
            onClick={toggleCheckIn}
            className={`px-4 py-2 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-2 ${
              checkedIn
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{checkedIn ? 'Mark Check-Out' : 'Mark Check-In'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Present Today</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{presentCount}</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Late Arrivals</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{lateCount}</div>
          </div>
          <Clock className="w-8 h-8 text-amber-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">On Leave</div>
            <div className="text-2xl font-extrabold text-slate-700 mt-1">{leaveCount}</div>
          </div>
          <Calendar className="w-8 h-8 text-blue-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Avg Shift Hours</div>
            <div className="text-2xl font-extrabold text-purple-600 mt-1">9.1 hrs</div>
          </div>
          <AlertCircle className="w-8 h-8 text-purple-500 opacity-80" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Date: Today ({new Date().toISOString().split('T')[0]})</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Check-In</th>
                <th className="py-3.5 px-4">Check-Out</th>
                <th className="py-3.5 px-4">Working Hours</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {filteredAttendance.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">{row.date}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{row.employeeName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{row.employeeId}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{row.checkIn}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{row.checkOut}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{row.workingHours}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      row.status === 'Present'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : row.status === 'Late'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
