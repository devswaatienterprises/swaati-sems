'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import Link from 'next/link';
import EmployeeModal from '@/components/EmployeeModal';
import TaskModal from '@/components/TaskModal';
import LeadModal from '@/components/LeadModal';
import LeaveModal from '@/components/LeaveModal';
import {
  Users,
  Clock,
  CheckSquare,
  TrendingUp,
  CalendarCheck2,
  FileSpreadsheet,
  BarChart3,
  Bell,
  MessageSquare,
  Plus,
  ArrowUpRight,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Globe2,
  UserCheck,
  UserX,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    currentRole,
    currentUser,
    employees,
    attendance,
    leaves,
    tasks,
    leads,
    notifications,
    checkedIn,
    toggleCheckIn,
    approveLeave,
    rejectLeave,
    addEmployee,
    addTask,
    addLead,
    applyLeave,
    hasPermission,
    t,
  } = useCrm();

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Admin Metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'Active').length;
  const inactiveEmployees = employees.filter((e) => e.status === 'Inactive').length;

  const presentToday = attendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const lateToday = attendance.filter((a) => a.status === 'Late' || a.isLate).length;
  const onLeaveToday = attendance.filter((a) => a.status === 'On Leave').length;
  const absentToday = Math.max(0, activeEmployees - presentToday - onLeaveToday);

  const websiteLeads = leads.filter((l) => l.source === 'Website').length;
  const openLeads = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length;
  const wonLeads = leads.filter((l) => l.status === 'Won').length;
  const followUpsToday = leads.filter((l) => l.followUpDate === new Date().toISOString().split('T')[0] || l.status === 'Follow-up').length;

  const pendingTasks = tasks.filter((t) => t.status === 'To Do' || t.status === 'In Progress').length;
  const overdueTasks = tasks.filter((t) => t.status === 'Overdue').length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;

  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');

  // Employee Metrics
  const myTasks = tasks.filter((t) => t.assignedToId === currentUser.id || t.assignedTo === currentUser.name);
  const myDueTodayTasks = myTasks.filter((t) => t.status !== 'Completed');
  const myLeads = leads.filter((l) => l.assignedToId === currentUser.id || l.assignedTo === currentUser.name);
  const myPendingLeaves = leaves.filter((l) => l.employeeId === currentUser.id && l.status === 'Pending');

  return (
    <Shell>
      {/* Modals */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSave={addEmployee}
      />
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={addTask}
      />
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSave={addLead}
      />
      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onApply={applyLeave}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Welcome, {currentUser.name} 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {currentRole === 'ADMIN'
              ? 'Administrator Overview • Operations, Team Members, Pipeline, and Payroll Management'
              : `${currentUser.designation} • ${currentUser.department}`}
          </p>
        </div>

        {/* Quick Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {currentRole === 'ADMIN' ? (
            <>
              <button
                onClick={() => setIsEmployeeModalOpen(true)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Team Member</span>
              </button>
              <button
                onClick={() => setIsLeadModalOpen(true)}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lead</span>
              </button>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <CalendarCheck2 className="w-3.5 h-3.5" />
                <span>Apply for Leave</span>
              </button>
              {hasPermission('leads') && (
                <button
                  onClick={() => setIsLeadModalOpen(true)}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Lead</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ========================================================== */}
      {/* 1. ADMIN DASHBOARD VIEW */}
      {/* ========================================================== */}
      {currentRole === 'ADMIN' ? (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Team Members Summary Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Team Members
                  </span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{totalEmployees}</div>
                <div className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">{activeEmployees} Active</span>
                  <span>•</span>
                  <span className="text-slate-400">{inactiveEmployees} Inactive</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                <button
                  onClick={() => setIsEmployeeModalOpen(true)}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Member</span>
                </button>
                <Link
                  href="/employees"
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-0.5"
                >
                  <span>Manage</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Attendance Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Today's Attendance
                </span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {presentToday} <span className="text-xs text-slate-400 font-medium">/ {activeEmployees}</span>
              </div>
              <div className="text-[11px] text-amber-600 font-semibold mt-1">
                {lateToday} Late Check-in{lateToday !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Leads Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Pipeline
                </span>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{openLeads}</div>
              <div className="text-[11px] text-purple-600 font-semibold mt-1 flex items-center gap-1.5">
                <Globe2 className="w-3 h-3" />
                <span>{websiteLeads} from Website</span>
              </div>
            </div>

            {/* Tasks Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pending Tasks
                </span>
                <CheckSquare className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{pendingTasks}</div>
              <div className="text-[11px] text-rose-600 font-bold mt-1">
                {overdueTasks} Overdue Task{overdueTasks !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Pending Leaves & Action Queue */}
          {pendingLeaves.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs bg-gradient-to-r from-amber-50/40 to-transparent">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CalendarCheck2 className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-slate-800 text-sm">
                    Pending Leave Requests ({pendingLeaves.length})
                  </h3>
                </div>
                <Link
                  href="/leave"
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {pendingLeaves.map((lv) => (
                  <div key={lv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">
                        {lv.employeeName} — <span className="text-slate-600 font-medium">{lv.leaveType} ({lv.totalDays} day{lv.totalDays > 1 ? 's' : ''})</span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Duration: {lv.startDate} to {lv.endDate} • Reason: "{lv.reason}"
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => approveLeave(lv.id, 'Approved via dashboard')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectLeave(lv.id, 'Unable to approve')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dual Grid: Recent Leads & Priority Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Leads */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Recent Leads & Enquiries</h3>
                </div>
                <Link
                  href="/leads"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Open Pipeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                {leads.slice(0, 4).map((l) => (
                  <div
                    key={l.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{l.companyName || l.leadName}</div>
                      <div className="text-slate-500 text-[11px]">{l.productInterested}</div>
                      <div className="text-[10px] text-purple-700 font-semibold mt-1">
                        Source: {l.source} • Added By: {l.leadAddedBy}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                        {l.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 font-medium">
                        Assignee: {l.assignedTo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operational Tasks */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Site & Operational Tasks</h3>
                </div>
                <Link
                  href="/tasks"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>All Tasks</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                {tasks.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{t.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Assigned To: <strong className="text-slate-700">{t.assignedTo}</strong> • Assigned By: {t.assignedBy}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-medium">
                        Deadline: {t.deadline}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      t.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'Overdue'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================== */
        /* 2. EMPLOYEE DASHBOARD VIEW */
        /* ========================================================== */
        <div className="space-y-6">
          {/* Prominent Daily Attendance Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Today's Shift Attendance
                </span>
                <div className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${checkedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  <span>{checkedIn ? 'Currently Checked In (Active Shift)' : 'Not Checked In Yet'}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Shift Start Time: 10:00 AM • Record your check-in promptly each workday.
                </p>
              </div>

              <button
                onClick={toggleCheckIn}
                className={`px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
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

          {/* Employee KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  My Tasks
                </span>
                <CheckSquare className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{myTasks.length}</div>
              <div className="text-[11px] text-amber-600 font-semibold mt-1">
                {myDueTodayTasks.length} Pending Completion
              </div>
            </div>

            {hasPermission('leads') && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    My Leads
                  </span>
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{myLeads.length}</div>
                <div className="text-[11px] text-purple-600 font-semibold mt-1">
                  Active Client Inquiries
                </div>
              </div>
            )}

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Leave Status
                </span>
                <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {myPendingLeaves.length > 0 ? `${myPendingLeaves.length} Pending` : 'Up to Date'}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                12 Available Casual / Sick Days
              </div>
            </div>
          </div>

          {/* My Tasks List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-800 text-sm">My Assigned Tasks</h3>
              </div>
              <Link
                href="/tasks"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All My Tasks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                {t('empty_tasks')}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {myTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{t.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Assigned By: <strong className="text-slate-700">{t.assignedBy}</strong> • Due: {t.deadline}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold self-start sm:self-auto ${
                      t.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'Overdue'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}
