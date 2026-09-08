'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EmployeeModal from '@/components/EmployeeModal';
import TaskModal from '@/components/TaskModal';
import LeadModal from '@/components/LeadModal';
import LeaveModal from '@/components/LeaveModal';
import { formatOfficeDateDisplay } from '@/utils/timezone';
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
  const router = useRouter();
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
    isTodayCheckedIn,
    isTodayCompleted,
    todayAttendance,
    isSubmittingAttendance,
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

  const canCreateEmployee = hasPermission('employees.create') || currentRole === 'ADMIN';
  const canCreateLead = hasPermission('leads.create') || hasPermission('leads') || currentRole === 'ADMIN';
  const canCreateTask = hasPermission('tasks.create') || currentRole === 'ADMIN';

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
  const myTasks = tasks
    .filter((t) => t.assignedToId === currentUser.id || t.assignedToId === currentUser.realId || t.assignedTo === currentUser.name)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
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
            {t('dashboard.welcome', 'Welcome')}, {currentUser.name} 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {currentRole === 'ADMIN'
              ? t('dashboard.admin_overview_subtitle', 'Administrator Overview • Operations, Team Members, Pipeline, and Payroll Management')
              : `${currentUser.designation} • ${currentUser.department}`}
          </p>
        </div>
      </div>

      {/* Prominent Daily Attendance Check-In / Check-Out Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('dashboard.shift_card_title', "Today's Shift Attendance")} ({formatOfficeDateDisplay()})
            </div>
            {isTodayCompleted ? (
              <>
                <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{t('dashboard.shift_completed', 'Shift Completed • Day Closed')}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('attendance.check_in', 'In')}: <strong className="text-slate-800">{todayAttendance?.checkIn}</strong> • {t('attendance.check_out', 'Out')}: <strong className="text-slate-800">{todayAttendance?.checkOut}</strong> • {t('attendance.duration', 'Duration')}: <strong className="text-slate-800">{todayAttendance?.workingHours || 'Closed'}</strong>
                </p>
              </>
            ) : isTodayCheckedIn ? (
              <>
                <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{t('dashboard.checked_in_active', 'Checked In')} ({todayAttendance?.checkIn}) • {t('attendance.working_active', 'Working Session Active')}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('dashboard.shift_instructions', 'Shift Start: 10:00 AM • Record your check-in and check-out daily from here.')}
                </p>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span>{t('dashboard.not_checked_in', 'Not Checked In Yet')}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('dashboard.shift_instructions', 'Shift Start: 10:00 AM • Record your check-in and check-out daily from here.')}
                </p>
              </>
            )}
          </div>

          <div>
            {isTodayCompleted ? (
              <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs self-start sm:self-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t('dashboard.day_closed', 'Completed / Day Closed')}</span>
              </div>
            ) : (
              <button
                onClick={toggleCheckIn}
                disabled={isSubmittingAttendance}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50 ${
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
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 1. ADMIN DASHBOARD VIEW */}
      {/* ========================================================== */}
      {currentRole === 'ADMIN' ? (
        <div className="space-y-6">
          {/* Top KPI Cards Grid - Clickable Navigation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Team Members Card */}
            <div
              onClick={() => router.push('/employees')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
                    {t('dashboard.kpi.team_members', 'Team Members')}
                  </span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{totalEmployees}</div>
                <div className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">{activeEmployees} {t('dashboard.kpi.active_members', 'Active')}</span>
                  <span>•</span>
                  <span className="text-slate-400">{inactiveEmployees} {t('dashboard.kpi.inactive_members', 'Inactive')}</span>
                </div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                {canCreateEmployee && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEmployeeModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('dashboard.kpi.add_member', 'Add Member')}</span>
                  </button>
                )}
                <span className="text-slate-400 group-hover:text-blue-600 flex items-center gap-0.5 ml-auto transition-colors">
                  <span>{t('common.buttons.view_all', 'View All')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* 2. Today's Attendance Card */}
            <div
              onClick={() => router.push('/attendance')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-600 transition-colors">
                    {t('dashboard.kpi.today_attendance', "Today's Attendance")}
                  </span>
                  <Clock className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {presentToday} <span className="text-xs text-slate-400 font-medium">/ {activeEmployees}</span>
                </div>
                <div className="text-[11px] text-amber-600 font-semibold mt-1">
                  {lateToday} {t('dashboard.kpi.late_checkins', 'Late Check-ins')}
                </div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-end text-[11px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                <span>{t('dashboard.kpi.view_attendance', 'View Attendance')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 3. Active Pipeline Card */}
            <div
              onClick={() => router.push('/leads')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-purple-600 transition-colors">
                    {t('dashboard.kpi.active_pipeline', 'Active Pipeline')}
                  </span>
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{openLeads}</div>
                <div className="text-[11px] text-purple-600 font-semibold mt-1 flex items-center gap-1.5">
                  <Globe2 className="w-3 h-3" />
                  <span>{websiteLeads} {t('dashboard.kpi.from_website', 'from Website')}</span>
                </div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                {canCreateLead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLeadModalOpen(true);
                    }}
                    className="text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('dashboard.kpi.add_lead', 'Add Lead')}</span>
                  </button>
                )}
                <span className="text-slate-400 group-hover:text-purple-600 flex items-center gap-0.5 ml-auto transition-colors">
                  <span>{t('dashboard.kpi.view_pipeline', 'View Pipeline')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* 4. Pending Tasks Card */}
            <div
              onClick={() => router.push('/tasks')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-600 transition-colors">
                    {t('dashboard.kpi.pending_tasks', 'Pending Tasks')}
                  </span>
                  <CheckSquare className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{pendingTasks}</div>
                <div className="text-[11px] text-rose-600 font-bold mt-1">
                  {overdueTasks} {t('dashboard.kpi.overdue_tasks', 'Overdue Tasks')}
                </div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                {canCreateTask && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTaskModalOpen(true);
                    }}
                    className="text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('dashboard.kpi.create_task', 'Create Task')}</span>
                  </button>
                )}
                <span className="text-slate-400 group-hover:text-amber-600 flex items-center gap-0.5 ml-auto transition-colors">
                  <span>{t('dashboard.kpi.view_tasks', 'View Tasks')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
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
                    {t('dashboard.pending_leaves_title', 'Pending Leave Requests')} ({pendingLeaves.length})
                  </h3>
                </div>
                <Link
                  href="/leave"
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  <span>{t('common.buttons.view_all', 'View All')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {pendingLeaves.map((lv) => (
                  <div key={lv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">
                        {lv.employeeName} — <span className="text-slate-600 font-medium">{lv.leaveType} ({lv.totalDays} {lv.totalDays > 1 ? t('leave.days', 'days') : t('leave.day', 'day')})</span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {t('leave.label.duration', 'Duration')}: {lv.startDate} {t('leave.label.to', 'to')} {lv.endDate} • {t('leave.label.reason', 'Reason')}: "{lv.reason}"
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => approveLeave(lv.id, 'Approved via dashboard')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        {t('common.buttons.approve', 'Approve')}
                      </button>
                      <button
                        onClick={() => rejectLeave(lv.id, 'Unable to approve')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        {t('common.buttons.reject', 'Reject')}
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
                  <h3 className="font-bold text-slate-800 text-sm">{t('dashboard.recent_leads_title', 'Recent Leads & Enquiries')}</h3>
                </div>
                <Link
                  href="/leads"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>{t('dashboard.open_pipeline_link', 'Open Pipeline')}</span>
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
                        {t('leads.table.source', 'Source')}: {l.source} • {t('leads.table.added_by', 'Added By')}: {l.leadAddedBy}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                        {l.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 font-medium">
                        {t('tasks.table.assigned_to', 'Assignee')}: {l.assignedTo}
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
                  <h3 className="font-bold text-slate-800 text-sm">{t('dashboard.site_tasks_title', 'Site & Operational Tasks')}</h3>
                </div>
                <Link
                  href="/tasks"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>{t('dashboard.all_tasks_link', 'All Tasks')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                {tasks.slice(0, 4).map((tItem) => (
                  <div
                    key={tItem.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{tItem.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {t('tasks.table.assigned_to', 'Assigned To')}: <strong className="text-slate-700">{tItem.assignedTo}</strong> • {t('tasks.table.assigned_by', 'Assigned By')}: {tItem.assignedBy}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-medium">
                        {t('tasks.table.deadline', 'Deadline')}: {tItem.deadline}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      tItem.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tItem.status === 'Overdue'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tItem.status}
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
          {/* Employee KPI Cards - Clickable Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. My Tasks Card */}
            <div
              onClick={() => router.push('/tasks')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-600 transition-colors">
                    {t('dashboard.my_tasks_title', 'My Tasks')}
                  </span>
                  <CheckSquare className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{myTasks.length}</div>
                <div className="text-[11px] text-amber-600 font-semibold mt-1">
                  {myDueTodayTasks.length} {t('dashboard.pending_completion', 'Pending Completion')}
                </div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                {canCreateTask && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTaskModalOpen(true);
                    }}
                    className="text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('dashboard.kpi.create_task', 'Create Task')}</span>
                  </button>
                )}
                <span className="text-slate-400 group-hover:text-amber-600 flex items-center gap-0.5 ml-auto transition-colors">
                  <span>{t('dashboard.kpi.view_tasks', 'View Tasks')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* 2. My Leads Card */}
            {hasPermission('leads') && (
              <div
                onClick={() => router.push('/leads')}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-purple-600 transition-colors">
                      {t('dashboard.my_leads_title', 'My Leads')}
                    </span>
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">{myLeads.length}</div>
                  <div className="text-[11px] text-purple-600 font-semibold mt-1">
                    {t('dashboard.active_client_inquiries', 'Active Client Inquiries')}
                  </div>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                  {canCreateLead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLeadModalOpen(true);
                      }}
                      className="text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('dashboard.kpi.add_lead', 'Add Lead')}</span>
                    </button>
                  )}
                  <span className="text-slate-400 group-hover:text-purple-600 flex items-center gap-0.5 ml-auto transition-colors">
                    <span>{t('dashboard.kpi.view_pipeline', 'View Leads')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )}

            {/* 3. Leave Status Card */}
            <div
              onClick={() => router.push('/leave')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-600 transition-colors">
                    {t('dashboard.leave_status_title', 'Leave Status')}
                  </span>
                  <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {myPendingLeaves.length > 0 ? `${myPendingLeaves.length} ${t('common.labels.pending', 'Pending')}` : t('dashboard.up_to_date', 'Up to Date')}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  {t('dashboard.available_leaves', 'Available Casual / Sick Leaves')}
                </div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLeaveModalOpen(true);
                  }}
                  className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <CalendarCheck2 className="w-3.5 h-3.5" />
                  <span>{t('dashboard.apply_leave_btn', 'Apply Leave')}</span>
                </button>
                <span className="text-slate-400 group-hover:text-emerald-600 flex items-center gap-0.5 ml-auto transition-colors">
                  <span>{t('dashboard.view_leaves_link', 'View Leaves')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* My Tasks List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-800 text-sm">{t('dashboard.my_assigned_tasks', 'My Assigned Tasks')}</h3>
              </div>
              <Link
                href="/tasks"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>{t('dashboard.view_all_my_tasks', 'View All My Tasks')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                {t('empty_tasks', 'No tasks assigned yet.')}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {myTasks.map((tItem) => (
                  <div
                    key={tItem.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{tItem.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {t('tasks.table.assigned_by', 'Assigned By')}: <strong className="text-slate-700">{tItem.assignedBy}</strong> • {t('tasks.table.deadline', 'Due')}: {tItem.deadline}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold self-start sm:self-auto ${
                      tItem.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tItem.status === 'Overdue'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tItem.status}
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
