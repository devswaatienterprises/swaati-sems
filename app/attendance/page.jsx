'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import { formatOfficeDateDisplay } from '@/utils/timezone';
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
  History,
  FileText,
  User,
  MapPin,
  Globe,
  ShieldAlert,
} from 'lucide-react';

export default function AttendancePage() {
  const {
    currentRole,
    currentUser,
    employees,
    attendance,
    checkedIn,
    isTodayCheckedIn,
    isTodayCompleted,
    todayAttendance,
    isSubmittingAttendance,
    toggleCheckIn,
    correctAttendance,
    systemSettings,
    hasPermission,
    t,
  } = useCrm();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedAuditRecord, setSelectedAuditRecord] = useState(null);
  const [selectedVerificationRecord, setSelectedVerificationRecord] = useState(null);
  const [correctionStatus, setCorrectionStatus] = useState('Present');
  const [correctionReason, setCorrectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentRole === 'ADMIN';
  const canViewTeam = hasPermission('attendance.view_team');

  const visibleAttendance = attendance.filter((item) => {
    if (isAdmin || canViewTeam) return true;
    return item.employeeId === currentUser?.id || item.employeeId === currentUser?.realId || item.employeeRealId === currentUser?.realId;
  });

  const filteredAttendance = visibleAttendance.filter(
    (item) => statusFilter === 'ALL' || item.status === statusFilter
  );

  const presentCount = visibleAttendance.filter((a) => a.status === 'Present').length;
  const lateCount = visibleAttendance.filter((a) => a.status === 'Late' || a.isLate).length;
  const leaveCount = visibleAttendance.filter((a) => a.status === 'On Leave').length;
  const absentCount = visibleAttendance.filter((a) => a.status === 'Absent').length;

  const openCorrectionModal = (record) => {
    if (!isAdmin) return;
    setSelectedRecord(record);
    setCorrectionStatus(record.status || 'Present');
    setCorrectionReason(record.correctionReason || '');
  };

  const handleCorrectSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin || !selectedRecord) return;
    if (!correctionReason.trim()) return;

    setIsSubmitting(true);
    try {
      await correctAttendance(selectedRecord.id, correctionStatus, correctionReason.trim());
      setSelectedRecord(null);
      setCorrectionReason('');
    } catch (err) {
      console.error('Error correcting attendance:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const parseVer = (data) => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  const getVerificationBadge = (ver, prefix = '') => {
    if (!ver || ver.method === 'NONE' || ver.overallResult === 'NOT_CONFIGURED') {
      return null;
    }
    const res = ver.overallResult;
    if (res === 'VERIFIED') {
      return {
        label: `${prefix ? prefix + ': ' : ''}Verified`,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: '✅',
      };
    }
    if (res === 'IP_MISMATCH') {
      return {
        label: `${prefix ? prefix + ': ' : ''}IP Mismatch`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: '🔴',
      };
    }
    if (res === 'LOCATION_MISMATCH') {
      return {
        label: `${prefix ? prefix + ': ' : ''}Location Mismatch`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: '🔴',
      };
    }
    if (res === 'LOCATION_UNAVAILABLE') {
      return {
        label: `${prefix ? prefix + ': ' : ''}Location Unavailable`,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: '⚠️',
      };
    }
    if (res === 'IP_UNAVAILABLE') {
      return {
        label: `${prefix ? prefix + ': ' : ''}IP Unavailable`,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: '⚠️',
      };
    }
    return {
      label: `${prefix ? prefix + ': ' : ''}${res}`,
      badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
      icon: 'ℹ️',
    };
  };

  return (
    <Shell>
      {/* Attendance Correction Modal (Strictly Admin Only) */}
      {isAdmin && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Correct Attendance Record</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {selectedRecord.employeeName} • {selectedRecord.date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCorrectSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100/80 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-slate-500 block font-medium">Current Recorded Status</span>
                  <span className="font-bold text-slate-800">{selectedRecord.status}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block font-medium">Recorded Check-In</span>
                  <span className="font-bold text-slate-800">{selectedRecord.checkIn}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adjusted Status *</label>
                <select
                  value={correctionStatus}
                  onChange={(e) => setCorrectionStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Reason for Correction (Audit Log) *</label>
                  <span className="text-[10px] text-slate-400 font-medium">Saved permanently in audit history</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Team member was on approved client visit / authorized holiday..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !correctionReason.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm shadow-blue-600/20 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Audit & Correction Details Modal (Admin View) */}
      {selectedAuditRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Attendance Correction Audit Log</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Verified record history & adjustment rationale
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditRecord(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Record Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Employee</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedAuditRecord.employeeName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{selectedAuditRecord.employeeId} • {selectedAuditRecord.department}</div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Date</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedAuditRecord.date}</div>
                  <div className="text-[10px] text-slate-500">Check-In: {selectedAuditRecord.checkIn}</div>
                </div>
              </div>

              {/* Status Comparison */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status Adjustment</div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Original Status</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">{selectedAuditRecord.originalStatus || 'Initial Check-In'}</span>
                  </div>
                  <div className="text-slate-400 font-bold">➔</div>
                  <div className="flex-1 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-center">
                    <span className="text-[10px] text-emerald-600 uppercase font-bold block">Corrected Status</span>
                    <span className="font-bold text-emerald-800 mt-0.5 block">{selectedAuditRecord.status}</span>
                  </div>
                </div>
              </div>

              {/* Reason for Correction */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Reason for Correction (Audit Log)
                </span>
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 text-slate-800 font-medium leading-relaxed">
                  &ldquo;{selectedAuditRecord.correctionReason || 'No reason specified'}&rdquo;
                </div>
              </div>

              {/* Audit Metadata */}
              <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1.5">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Corrected by: <strong className="text-slate-700 font-bold">{selectedAuditRecord.correctedBy || 'Administrator'}</strong></span>
                </div>
                {selectedAuditRecord.correctedAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDateTime(selectedAuditRecord.correctedAt)}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAuditRecord(null)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Verification Details Modal (Admin Only) */}
      {isAdmin && selectedVerificationRecord && (() => {
        const inVer = parseVer(selectedVerificationRecord.checkInVerification);
        const outVer = parseVer(selectedVerificationRecord.checkOutVerification);
        const emp = employees.find(
          (e) => e.id === selectedVerificationRecord.employeeRealId ||
                 e.employeeCode === selectedVerificationRecord.employeeId ||
                 e.userId === selectedVerificationRecord.employeeId
        );
        const configuredMethod = emp?.attendanceVerification || inVer?.method || 'NONE';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Attendance Verification Audit</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {selectedVerificationRecord.employeeName} ({selectedVerificationRecord.employeeId}) • {selectedVerificationRecord.date}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVerificationRecord(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {/* Configured Verification Policy Card */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Configured Verification Policy
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Method</span>
                      <strong className="text-slate-800">{configuredMethod}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Approved Office IP(s)</span>
                      <strong className="text-slate-800 font-mono text-[10px] break-all">{emp?.approvedIPs || 'None configured'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Approved GPS Coords</span>
                      <strong className="text-slate-800 font-mono text-[10px]">
                        {emp?.approvedLat && emp?.approvedLng ? `${emp.approvedLat}, ${emp.approvedLng}` : 'None configured'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Allowed GPS Radius</span>
                      <strong className="text-slate-800">{emp?.approvedRadiusMeters || 200} metres</strong>
                    </div>
                  </div>
                </div>

                {/* Check-In Verification Card */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Check-In Verification ({selectedVerificationRecord.checkIn})</span>
                    </div>
                    {inVer ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        inVer.overallResult === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : inVer.overallResult === 'IP_MISMATCH' || inVer.overallResult === 'LOCATION_MISMATCH'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {inVer.overallResult}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">No verification recorded</span>
                    )}
                  </div>

                  {inVer ? (
                    <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-400 text-[10px] block font-bold">Captured Public IP</span>
                        <span className="font-mono text-slate-800 font-semibold">{inVer.ip || 'Unavailable'}</span>
                        {inVer.ipResult && (
                          <span className={`block text-[9px] font-bold mt-0.5 ${inVer.ipResult === 'VERIFIED' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            IP: {inVer.ipResult}
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-400 text-[10px] block font-bold">Captured GPS Location</span>
                        <span className="font-mono text-slate-800 font-semibold">
                          {inVer.lat != null && inVer.lng != null ? `${inVer.lat.toFixed(5)}, ${inVer.lng.toFixed(5)}` : 'Unavailable'}
                        </span>
                        {inVer.distanceMeters != null && (
                          <span className="block text-[9px] text-slate-500 font-medium">
                            Distance: {inVer.distanceMeters}m {inVer.accuracy != null ? `(±${Math.round(inVer.accuracy)}m)` : ''}
                          </span>
                        )}
                        {inVer.gpsResult && (
                          <span className={`block text-[9px] font-bold mt-0.5 ${inVer.gpsResult === 'VERIFIED' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            GPS: {inVer.gpsResult}
                          </span>
                        )}
                      </div>

                      {inVer.reason && (
                        <div className="col-span-2 bg-amber-50/70 border border-amber-200/80 rounded-lg p-2 text-amber-900 text-[10px] leading-relaxed">
                          <strong>Note / Reason:</strong> {inVer.reason}
                        </div>
                      )}

                      <div className="col-span-2 text-[10px] text-slate-400">
                        Server timestamp: {formatDateTime(inVer.capturedAt)}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No check-in verification data captured for this record.</p>
                  )}
                </div>

                {/* Check-Out Verification Card */}
                {selectedVerificationRecord.checkOut && selectedVerificationRecord.checkOut !== '-' && (
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Check-Out Verification ({selectedVerificationRecord.checkOut})</span>
                      </div>
                      {outVer ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          outVer.overallResult === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : outVer.overallResult === 'IP_MISMATCH' || outVer.overallResult === 'LOCATION_MISMATCH'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {outVer.overallResult}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No verification recorded</span>
                      )}
                    </div>

                    {outVer ? (
                      <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-slate-400 text-[10px] block font-bold">Captured Public IP</span>
                          <span className="font-mono text-slate-800 font-semibold">{outVer.ip || 'Unavailable'}</span>
                          {outVer.ipResult && (
                            <span className={`block text-[9px] font-bold mt-0.5 ${outVer.ipResult === 'VERIFIED' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              IP: {outVer.ipResult}
                            </span>
                          )}
                        </div>

                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-slate-400 text-[10px] block font-bold">Captured GPS Location</span>
                          <span className="font-mono text-slate-800 font-semibold">
                            {outVer.lat != null && outVer.lng != null ? `${outVer.lat.toFixed(5)}, ${outVer.lng.toFixed(5)}` : 'Unavailable'}
                          </span>
                          {outVer.distanceMeters != null && (
                            <span className="block text-[9px] text-slate-500 font-medium">
                              Distance: {outVer.distanceMeters}m {outVer.accuracy != null ? `(±${Math.round(outVer.accuracy)}m)` : ''}
                            </span>
                          )}
                          {outVer.gpsResult && (
                            <span className={`block text-[9px] font-bold mt-0.5 ${outVer.gpsResult === 'VERIFIED' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              GPS: {outVer.gpsResult}
                            </span>
                          )}
                        </div>

                        {outVer.reason && (
                          <div className="col-span-2 bg-amber-50/70 border border-amber-200/80 rounded-lg p-2 text-amber-900 text-[10px] leading-relaxed">
                            <strong>Note / Reason:</strong> {outVer.reason}
                          </div>
                        )}

                        <div className="col-span-2 text-[10px] text-slate-400">
                          Server timestamp: {formatDateTime(outVer.capturedAt)}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">No check-out verification data captured for this record.</p>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedVerificationRecord(null)}
                    className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
              {t('attendance.my_session_title', 'My Attendance Status')} ({formatOfficeDateDisplay()})
            </div>
            {isTodayCompleted ? (
              <>
                <div className="text-lg font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{t('dashboard.shift_completed', 'Shift Completed • Day Closed')}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('attendance.check_in', 'In')}: <strong className="text-slate-800">{todayAttendance?.checkIn}</strong> • {t('attendance.check_out', 'Out')}: <strong className="text-slate-800">{todayAttendance?.checkOut}</strong> • {t('attendance.duration', 'Duration')}: <strong className="text-slate-800">{todayAttendance?.workingHours || 'Closed'}</strong>
                </p>
              </>
            ) : isTodayCheckedIn ? (
              <>
                <div className="text-lg font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{t('dashboard.checked_in_active', 'Checked In')} ({todayAttendance?.checkIn}) • {t('attendance.session_active', 'Working Session Active')}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('dashboard.shift_instructions', 'Shift Start: 10:00 AM • Record your check-in and check-out daily from here.')}
                </p>
              </>
            ) : (
              <>
                <div className="text-lg font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span>{t('dashboard.not_checked_in', 'Not Checked In Yet')}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('dashboard.shift_instructions', 'Shift Start: 10:00 AM • Record your check-in and check-out daily from here.')}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {isTodayCompleted ? (
              <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t('dashboard.day_closed', 'Completed / Day Closed')}</span>
              </div>
            ) : (
              <button
                onClick={toggleCheckIn}
                disabled={isSubmittingAttendance}
                className={`px-5 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  isTodayCheckedIn
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                }`}
              >
                {isTodayCheckedIn ? <UserCheck className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                <span>
                  {isSubmittingAttendance
                    ? (isTodayCheckedIn ? 'Checking Out...' : 'Checking In...')
                    : (isTodayCheckedIn ? t('dashboard.mark_check_out', 'Check Out') : t('dashboard.mark_check_in', 'Mark Check-In'))}
                </span>
              </button>
            )}

            <Link
              href="/dashboard"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>{t('attendance.go_to_dashboard', 'Go to Dashboard')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
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
            <option value="ALL">{t('common.labels.all', 'All Statuses')} ({visibleAttendance.length})</option>
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
                {isAdmin && <th className="py-3.5 px-4">Verification</th>}
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
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Late' || item.isLate
                          ? 'bg-amber-100 text-amber-800'
                          : item.status === 'On Leave'
                          ? 'bg-blue-100 text-blue-800'
                          : item.status === 'Holiday'
                          ? 'bg-purple-100 text-purple-800'
                          : item.status === 'Weekly Off'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status}
                        {item.isLate && item.lateMinutes ? ` (${item.lateMinutes}m Late)` : ''}
                      </span>

                      {/* Corrected Badge */}
                      {item.isCorrected && (
                        <button
                          type="button"
                          onClick={() => setSelectedAuditRecord(item)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200/60 cursor-pointer transition-colors"
                          title="Click to view correction audit details"
                        >
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          <span>Corrected</span>
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Verification Column (Admin Only) */}
                  {isAdmin && (
                    <td className="py-3.5 px-4">
                      {(() => {
                        const inVer = parseVer(item.checkInVerification);
                        const outVer = parseVer(item.checkOutVerification);
                        const inBadge = getVerificationBadge(inVer, 'In');
                        const outBadge = item.checkOut && item.checkOut !== '-' ? getVerificationBadge(outVer, 'Out') : null;

                        if (!inBadge && !outBadge) {
                          return <span className="text-slate-300 text-xs font-mono">—</span>;
                        }

                        return (
                          <div className="flex flex-col gap-1 items-start">
                            {inBadge && (
                              <button
                                type="button"
                                onClick={() => setSelectedVerificationRecord(item)}
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${inBadge.badgeClass}`}
                                title="Click to view check-in verification details"
                              >
                                <span>{inBadge.icon}</span>
                                <span>{inBadge.label}</span>
                              </button>
                            )}
                            {outBadge && (
                              <button
                                type="button"
                                onClick={() => setSelectedVerificationRecord(item)}
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${outBadge.badgeClass}`}
                                title="Click to view check-out verification details"
                              >
                                <span>{outBadge.icon}</span>
                                <span>{outBadge.label}</span>
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  )}

                  <td className="py-3.5 px-4 text-right">
                    {isAdmin ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedVerificationRecord(item)}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer border border-indigo-200/50"
                          title="View verification details"
                        >
                          <ShieldCheck className="w-3 h-3 text-indigo-600" />
                          <span>Verification</span>
                        </button>
                        {item.isCorrected && (
                          <button
                            type="button"
                            onClick={() => setSelectedAuditRecord(item)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer border border-blue-200/50"
                            title="View correction audit details"
                          >
                            <History className="w-3 h-3 text-blue-600" />
                            <span>Audit</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openCorrectionModal(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-slate-500" />
                          <span>{t('attendance.btn.correct', 'Correct')}</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs font-mono">-</span>
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
