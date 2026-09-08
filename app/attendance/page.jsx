'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ExternalLink,
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
            <span>{t('attendance.page.title', 'Daily Attendance & Shift Logs')}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('attendance.page.subtitle', 'Real-time check-in records, shift duration, late arrival tracking, and attendance audit trail.')}
          </p>
        </div>

        {/* Office Shift Timing Info Badge */}
        <div className="px-3.5 py-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span>{t('attendance.office_start_badge', 'Configured Office Start:')} <strong className="text-blue-700 font-bold">{systemSettings.officeStartTime}</strong></span>
        </div>
      </div>

      {/* Attendance Session Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('attendance.my_session_title', 'My Attendance Status')} ({new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })})
            </div>
            <div className="text-lg font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${checkedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              <span>{checkedIn ? t('attendance.session_active', 'Checked In • Working Session Active') : t('dashboard.not_checked_in', 'Not Checked In Yet')}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('dashboard.shift_instructions', 'Shift Start: 10:00 AM • Record your check-in and check-out daily from here.')}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>{t('attendance.go_to_dashboard', 'Go to Dashboard')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">{t('attendance.kpi.present_today', 'Present Today')}</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{presentCount}</div>
          </div>
          <CheckCircle2 className="w-7 h-7 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">{t('attendance.kpi.late_arrivals', 'Late Arrivals')}</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{lateCount}</div>
          </div>
          <Clock className="w-7 h-7 text-amber-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">{t('attendance.kpi.on_leave', 'On Leave')}</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">{leaveCount}</div>
          </div>
          <CalendarDays className="w-7 h-7 text-blue-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">{t('attendance.kpi.absent', 'Absent')}</div>
            <div className="text-2xl font-extrabold text-slate-400 mt-1">{absentCount}</div>
          </div>
          <UserX className="w-7 h-7 text-slate-400 opacity-80" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{t('common.labels.date', 'Date')}: Today ({new Date().toISOString().split('T')[0]})</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> {t('common.labels.status', 'Status')}:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t('common.labels.all', 'All Statuses')} ({attendance.length})</option>
            <option value="Present">{t('status_present', 'Present')} ({presentCount})</option>
            <option value="Late">{t('status_late', 'Late')} ({lateCount})</option>
            <option value="On Leave">{t('status_on_leave', 'On Leave')} ({leaveCount})</option>
            <option value="Absent">{t('status_absent', 'Absent')} ({absentCount})</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">{t('employees.table.team_member', 'Team Member')}</th>
                <th className="py-3.5 px-4">{t('common.labels.date', 'Date')}</th>
                <th className="py-3.5 px-4">{t('attendance.table.checkin_time', 'Check-In Time')}</th>
                <th className="py-3.5 px-4">{t('attendance.table.checkout_time', 'Check-Out Time')}</th>
                <th className="py-3.5 px-4">{t('attendance.table.working_duration', 'Working Duration')}</th>
                <th className="py-3.5 px-4">{t('common.labels.status', 'Status')}</th>
                <th className="py-3.5 px-4 text-right">{t('attendance.table.action_audit', 'Action / Audit')}</th>
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
                        <span>{t('attendance.btn.correct', 'Correct')}</span>
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
