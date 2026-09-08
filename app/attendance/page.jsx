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
  UserX,
  Edit2,
  ShieldCheck,
  Info,
  CalendarDays,
} from 'lucide-react';

export default function AttendancePage() {
  const {
    currentRole,
    currentUser,
    attendance,
    checkedIn,
    toggleCheckIn,
    correctAttendance,
    systemSettings,
    hasPermission,
    t,
  } = useCrm();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [correctionStatus, setCorrectionStatus] = useState('Present');
  const [correctionReason, setCorrectionReason] = useState('');

  const canCheckIn = hasPermission('attendance.checkin');
  const canApprove = hasPermission('attendance.approve');
  const canViewTeam = hasPermission('attendance.view_team');

  const visibleAttendance = attendance.filter((item) => {
    if (currentRole === 'ADMIN' || canViewTeam) return true;
    return item.employeeId === currentUser?.id || item.employeeId === currentUser?.realId;
  });

  const filteredAttendance = visibleAttendance.filter(
    (item) => statusFilter === 'ALL' || item.status === statusFilter
  );

  const presentCount = visibleAttendance.filter((a) => a.status === 'Present').length;
  const lateCount = visibleAttendance.filter((a) => a.status === 'Late' || a.isLate).length;
  const leaveCount = visibleAttendance.filter((a) => a.status === 'On Leave').length;
  const absentCount = visibleAttendance.filter((a) => a.status === 'Absent').length;

  const handleCorrectSubmit = (e) => {
    e.preventDefault();
    if (selectedRecord) {
      correctAttendance(selectedRecord.id, correctionStatus, correctionReason);
      setSelectedRecord(null);
      setCorrectionReason('');
    }
  };

  return (
    <Shell>
      {/* Attendance Correction Modal (Admin Only) */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Correct Attendance Record</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {selectedRecord.employeeName} ({selectedRecord.date})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCorrectSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Adjusted Status *</label>
                <select
                  value={correctionStatus}
                  onChange={(e) => setCorrectionStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Weekly Off">Weekly Off</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Correction (Audit Log) *</label>
                <textarea
                  rows={3}
                  required
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Team member was on external client site demo during morning hours..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm shadow-blue-600/20"
                >
                  Save Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-600" />
            <span>Daily Attendance & Shift Logs</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time check-in records, shift duration, late arrival tracking, and attendance audit trail.
          </p>
        </div>

        {/* Office Shift Timing Info Badge */}
        <div className="px-3.5 py-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Configured Office Start: <strong className="text-blue-700 font-bold">{systemSettings.officeStartTime}</strong></span>
        </div>
      </div>

      {/* Prominent Check In / Check Out Action Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              My Attendance Session ({new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })})
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full ${checkedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              <span>{checkedIn ? 'Checked In • Working Session Active' : 'Not Checked In Yet'}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Check in promptly upon arrival. Check-ins after {systemSettings.officeStartTime} are automatically marked as Late.
            </p>
          </div>

          <button
            onClick={toggleCheckIn}
            className={`px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 ${
              checkedIn
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
            }`}
          >
            {checkedIn ? <UserCheck className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            <span>{checkedIn ? 'Mark Check-Out' : 'Check In Now'}</span>
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
          <CheckCircle2 className="w-7 h-7 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Late Arrivals</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{lateCount}</div>
          </div>
          <Clock className="w-7 h-7 text-amber-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">On Leave</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">{leaveCount}</div>
          </div>
          <CalendarDays className="w-7 h-7 text-blue-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Absent</div>
            <div className="text-2xl font-extrabold text-slate-400 mt-1">{absentCount}</div>
          </div>
          <UserX className="w-7 h-7 text-slate-400 opacity-80" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Showing Attendance for: Today ({new Date().toISOString().split('T')[0]})</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses ({attendance.length})</option>
            <option value="Present">Present ({presentCount})</option>
            <option value="Late">Late ({lateCount})</option>
            <option value="On Leave">On Leave ({leaveCount})</option>
            <option value="Absent">Absent ({absentCount})</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Team Member</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Check-In Time</th>
                <th className="py-3.5 px-4">Check-Out Time</th>
                <th className="py-3.5 px-4">Working Duration</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action / Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {filteredAttendance.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.employeeName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.employeeId}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 font-medium">{item.date}</td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.checkIn}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-600">{item.checkOut}</td>

                  <td className="py-3.5 px-4 font-bold text-slate-800">{item.workingHours}</td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'Late' || item.isLate
                        ? 'bg-amber-100 text-amber-800'
                        : item.status === 'On Leave'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.status}
                      {item.isLate && item.lateMinutes ? ` (${item.lateMinutes}m Late)` : ''}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {(currentRole === 'ADMIN' || canApprove) && (
                      <button
                        onClick={() => setSelectedRecord(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Correct</span>
                      </button>
                    )}
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
