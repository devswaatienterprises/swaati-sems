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
    t,
  } = useCrm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [remarksInput, setRemarksInput] = useState({});

  const isEmployee = currentRole !== 'ADMIN';

  // Filter leaves
  const displayedLeaves = leaves.filter((l) => {
    const isMine = !isEmployee || l.employeeId === currentUser.id;
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return isMine && matchesStatus;
  });

  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

  const handleApprove = (leaveId) => {
    const remarks = remarksInput[leaveId] || 'Approved by Admin';
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
            <span>Leave Management & Approvals</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Apply for leave, track leave balances, and review team absence requests.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balances (For Employees) & Status Counters (For Admin) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">
              {isEmployee ? 'Casual Leaves (CL)' : 'Pending Requests'}
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
              {isEmployee ? 'Sick Leaves (SL)' : 'Approved Leaves'}
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
              {isEmployee ? 'Earned Leaves (EL)' : 'Rejected Requests'}
            </div>
            <div className="text-2xl font-extrabold text-slate-700 mt-1">
              {isEmployee ? '12 Available' : rejectedCount}
            </div>
          </div>
          <XCircle className="w-7 h-7 text-rose-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Total Balance</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">23 Days</div>
          </div>
          <CalendarCheck2 className="w-7 h-7 text-blue-500 opacity-80" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex items-center justify-between">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{isEmployee ? 'My Leave Applications' : 'All Team Member Leave Applications'}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-500">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses ({displayedLeaves.length})</option>
            <option value="Pending">Pending ({leaves.filter((l) => l.status === 'Pending').length})</option>
            <option value="Approved">Approved ({leaves.filter((l) => l.status === 'Approved').length})</option>
            <option value="Rejected">Rejected ({leaves.filter((l) => l.status === 'Rejected').length})</option>
          </select>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {displayedLeaves.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            {t('empty_leaves')}
          </div>
        ) : (
          displayedLeaves.map((lv) => (
            <div key={lv.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-sm">{lv.employeeName}</span>
                  <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                    {lv.leaveType}
                  </span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[10px]">
                    {lv.totalDays} Day{lv.totalDays > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="text-slate-600 font-medium">
                  <strong>Date Range:</strong> {lv.startDate} to {lv.endDate}
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

                {currentRole === 'ADMIN' && lv.status === 'Pending' && (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Add remarks..."
                      value={remarksInput[lv.id] || ''}
                      onChange={(e) => setRemarksInput({ ...remarksInput, [lv.id]: e.target.value })}
                      className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 w-36"
                    />
                    <button
                      onClick={() => handleApprove(lv.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(lv.id)}
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                    >
                      Reject
                    </button>
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
