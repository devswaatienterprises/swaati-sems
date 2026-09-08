'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import LeaveModal from '@/components/LeaveModal';
import { useCrm } from '@/context/CrmContext';
import {
  CalendarCheck2,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Calendar,
  User,
  MessageSquare,
} from 'lucide-react';

export default function LeavePage() {
  const {
    currentRole,
    currentUser,
    leaves,
    applyLeave,
    approveLeave,
    rejectLeave,
    hasPermission,
    t,
  } = useCrm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [remarksInput, setRemarksInput] = useState({});

  const canApply = hasPermission('leave.apply');
  const canViewTeam = hasPermission('leave.view_team');
  const canApprove = hasPermission('leave.approve');
  const canReject = hasPermission('leave.reject');

  const isEmployee = currentRole !== 'ADMIN' && !canViewTeam;

  // Filter leaves
  const displayedLeaves = leaves.filter((l) => {
    const isMine = !isEmployee || l.employeeId === currentUser?.id || l.employeeId === currentUser?.realId;
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return isMine && matchesStatus;
  });

  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

  const handleApprove = (leaveId) => {
    const remarks = remarksInput[leaveId] || 'Approved';
    approveLeave(leaveId, remarks);
    setRemarksInput((prev) => ({ ...prev, [leaveId]: '' }));
  };

  const handleReject = (leaveId) => {
    const remarks = remarksInput[leaveId] || 'Request cannot be accommodated';
    rejectLeave(leaveId, remarks);
    setRemarksInput((prev) => ({ ...prev, [leaveId]: '' }));
  };

  return (
    <Shell>
      {/* Apply Leave Modal */}
      <LeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={applyLeave}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-emerald-600" />
            <span>{t('leave.page.title', 'Leave Management & Approvals')}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('leave.page.subtitle', 'Apply for leave, track leave balances, and review team absence requests.')}
          </p>
        </div>

        {canApply && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('leave.btn.apply_leave', 'Apply for Leave')}</span>
          </button>
        )}
      </div>

      {/* Leave Balances (For Employees) & Status Counters (For Admin) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">
              {isEmployee ? t('leave.type.casual', 'Casual Leave (CL)') : t('dashboard.pending_leaves_title', 'Pending Requests')}
            </div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {isEmployee ? '6 Available' : pendingCount}
            </div>
          </div>
          <Clock className="w-7 h-7 text-amber-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">
              {isEmployee ? t('leave.type.sick', 'Sick / Medical Leave (SL)') : t('leave.status.approved', 'Approved Leaves')}
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {isEmployee ? '5 Available' : approvedCount}
            </div>
          </div>
          <CheckCircle2 className="w-7 h-7 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">
              {isEmployee ? t('leave.type.paid', 'Paid Leave (PL)') : t('leave.status.rejected', 'Rejected Requests')}
            </div>
            <div className="text-2xl font-extrabold text-slate-700 mt-1">
              {isEmployee ? '12 Available' : rejectedCount}
            </div>
          </div>
          <XCircle className="w-7 h-7 text-rose-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">{t('leave.label.total_balance', 'Total Balance')}</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">23 Days</div>
          </div>
          <CalendarCheck2 className="w-7 h-7 text-blue-500 opacity-80" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex items-center justify-between">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{isEmployee ? t('leave.label.my_applications', 'My Leave Applications') : t('leave.label.team_applications', 'All Team Member Leave Applications')}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-500">{t('common.buttons.filter', 'Filter')}:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t('common.labels.all', 'All Statuses')} ({displayedLeaves.length})</option>
            <option value="Pending">{t('common.labels.pending', 'Pending')} ({leaves.filter((l) => l.status === 'Pending').length})</option>
            <option value="Approved">{t('common.buttons.approve', 'Approved')} ({leaves.filter((l) => l.status === 'Approved').length})</option>
            <option value="Rejected">{t('common.buttons.reject', 'Rejected')} ({leaves.filter((l) => l.status === 'Rejected').length})</option>
          </select>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {displayedLeaves.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            {t('empty_leaves', 'No leave requests submitted.')}
          </div>
        ) : (
          displayedLeaves.map((lv) => (
            <div key={lv.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 text-[10px]">
                    {lv.leaveCode || lv.id}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{lv.employeeName}</span>
                  <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                    {lv.leaveType}
                  </span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[10px]">
                    {lv.totalDays} {lv.totalDays > 1 ? t('leave.days', 'Days') : t('leave.day', 'Day')}
                  </span>
                </div>

                <div className="text-slate-600 font-medium">
                  <strong>{t('leave.label.date_range', 'Date Range')}:</strong> {lv.startDate} {t('leave.label.to', 'to')} {lv.endDate}
                </div>

                <div className="text-slate-500 italic">
                  "{lv.reason}"
                </div>

                {lv.adminRemarks && (
                  <div className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1.5 pt-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Admin Remarks: {lv.adminRemarks}</span>
                  </div>
                )}
              </div>

              {/* Status Badge & Admin Action Buttons */}
              <div className="flex flex-col md:items-end gap-2 shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold self-start md:self-auto ${
                  lv.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : lv.status === 'Pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {lv.status}
                </span>

                {(currentRole === 'ADMIN' || canApprove || canReject) && lv.status === 'Pending' && (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Add remarks (optional)..."
                      value={remarksInput[lv.id] || ''}
                      onChange={(e) =>
                        setRemarksInput((prev) => ({ ...prev, [lv.id]: e.target.value }))
                      }
                      className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
                    />
                    {canApprove && (
                      <button
                        onClick={() => handleApprove(lv.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        {t('common.buttons.approve', 'Approve')}
                      </button>
                    )}
                    {canReject && (
                      <button
                        onClick={() => handleReject(lv.id)}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        {t('common.buttons.reject', 'Reject')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Shell>
  );
}
