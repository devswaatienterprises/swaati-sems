'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import EmployeeModal from '@/components/EmployeeModal';
import { useCrm } from '@/context/CrmContext';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  CheckSquare,
  Clock,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  UserX,
  UserCheck,
  Edit3,
  History,
  Activity,
  Loader2,
  Repeat,
  MessageSquare,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function EmployeeProfilePage({ params }) {
  const {
    currentRole,
    currentUser,
    employees,
    tasks,
    attendance,
    leaves,
    updateEmployee,
    deactivateEmployee,
    reactivateEmployee,
    getEmployeeKycSignedUrls,
    getEmployeeActivityLogs,
    updateEmployeePermissions,
    t,
  } = useCrm();

  const [activeTab, setActiveTab] = useState('overview');
  const [kycLoading, setKycLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Activity History State (Admin Only)
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const empId = params.id;
  const employee = employees.find((e) => e.id === empId || e.userId === empId || e.realId === empId) || employees[0];

  const formatCreatedDateTime = (dateStr) => {
    if (!dateStr) return { date: '-', time: '' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: dateStr, time: '' };
      return {
        date: d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        time: d.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      };
    } catch {
      return { date: dateStr, time: '' };
    }
  };

  const empTasks = tasks
    .filter(
      (tItem) =>
        tItem.assignedTo === employee?.name ||
        tItem.assignedToId === employee?.id ||
        tItem.assignedToId === employee?.employeeCode ||
        tItem.assignedToId === employee?.realId ||
        tItem.assignedBy === employee?.name
    )
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const empAttendance = attendance.filter(
    (a) => a.employeeId === employee?.id || a.employeeId === employee?.realId
  );

  // Fetch Activity Logs when Activity tab is active and user is ADMIN
  useEffect(() => {
    if (activeTab === 'activity' && currentRole === 'ADMIN' && employee?.id) {
      setActivityLoading(true);
      getEmployeeActivityLogs(employee.id)
        .then((logs) => {
          setActivityLogs(Array.isArray(logs) ? logs : []);
        })
        .catch((err) => {
          console.error('Failed to fetch employee activity logs:', err);
          setActivityLogs([]);
        })
        .finally(() => {
          setActivityLoading(false);
        });
    }
  }, [activeTab, employee?.id, currentRole]);

  if (!employee) {
    return (
      <Shell>
        <div className="p-8 text-center text-slate-500 text-xs">
          <p>{t('employees.empty.no_found', 'Employee not found')}</p>
          <Link href="/employees" className="text-blue-600 font-bold mt-2 inline-block">
            {t('employees.profile.back', 'Back to Team Members')}
          </Link>
        </div>
      </Shell>
    );
  }

  const handleSaveEmployee = async (formData, frontFile, backFile) => {
    await updateEmployee(employee.id, formData, frontFile, backFile);
    setIsEditModalOpen(false);
  };

  const getActionBadgeClass = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('REGISTER') || act.includes('WON')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('DEACTIVATE') || act.includes('LOST') || act.includes('REJECT')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('MODIFY') || act.includes('PATCH') || act.includes('CORRECT')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (act.includes('LOGIN') || act.includes('AUTH')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    if (act.includes('CHECK_IN') || act.includes('CHECK_OUT') || act.includes('ATTENDANCE')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const canEdit = currentRole === 'ADMIN' || currentUser?.id === employee.id || currentUser?.realId === employee.realId;

  return (
    <Shell>
      {/* Edit Employee Modal */}
      <EmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={employee}
        onSave={handleSaveEmployee}
      />

      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/employees"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {t('employees.profile.back', 'Back to Team Members')}
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
              {employee.avatar || employee.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                    employee.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {employee.role ? employee.role.replace('_', ' ') : 'OPERATION HEAD'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    employee.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  {employee.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {employee.designation} • {employee.department}
              </p>
              <div className="text-xs font-mono text-blue-700 font-bold mt-1">
                {t('employees.table.user_id', 'User ID')}: {employee.userId} • {t('employees.table.team_member', 'Team Member')}: {employee.id}
              </div>
            </div>
          </div>

          {/* Action Buttons: [ Edit ] placed immediately to the LEFT of [ Deactivate Member ] */}
          <div className="flex items-center gap-2.5 shrink-0">
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title={t('common.edit', 'Edit Employee Details')}
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('common.edit', 'Edit')}</span>
              </button>
            )}

            {currentRole === 'ADMIN' && employee.role !== 'ADMIN' && (
              <>
                {employee.status === 'Active' ? (
                  <button
                    type="button"
                    onClick={() => deactivateEmployee(employee.id)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>{t('employees.profile.deactivate_btn', 'Deactivate Member')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => reactivateEmployee(employee.id)}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{t('employees.profile.reactivate_btn', 'Reactivate Member')}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 mb-6 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          {t('employees.profile.tab_overview', 'Profile & ID Documents')}
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'permissions' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          {t('employees.profile.tab_permissions', 'Feature Permissions')}
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'attendance' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          {t('employees.profile.tab_attendance', 'Attendance History')}
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'tasks' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <span>{t('employees.profile.tab_tasks', 'Tasks')}</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'tasks' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {empTasks.length}
          </span>
        </button>

        {/* Activity History Tab: Admin Only */}
        {currentRole === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'activity' ? 'bg-purple-700 text-white shadow-xs' : 'hover:bg-slate-100 text-purple-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t('employees.profile.tab_activity', 'Activity History')}</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 uppercase">
              Admin
            </span>
          </button>
        )}
      </div>

      {/* Tab Contents */}

      {/* TAB 1: Profile & ID Documents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Employment Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>{t('employees.profile.emp_details', 'Employment Details')}</span>
            </h3>
            <div className="space-y-2.5">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">{t('employees.profile.official_mobile', 'Official Mobile:')}</span>
                <span className="font-bold font-mono text-slate-900">{employee.mobile}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">{t('employees.profile.official_email', 'Official Email:')}</span>
                <span className="font-bold text-slate-900">{employee.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">{t('employees.form.role', 'System Role:')}</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {employee.role ? employee.role.replace('_', ' ') : 'OPERATION HEAD'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">{t('employees.profile.joining_date', 'Joining Date:')}</span>
                <span className="font-bold text-slate-900">{employee.joiningDate || '2024-01-15'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">{t('employees.profile.reporting_manager', 'Reporting Manager:')}</span>
                <span className="font-bold text-slate-900">{employee.reportingManager || 'Shailendra Patil'}</span>
              </div>
            </div>
          </div>

          {/* Identity Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>{t('employees.profile.identity_doc', 'Identity Document')}</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {t('employees.profile.verified', 'Verified')}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">{t('employees.profile.doc_type', 'Document Type:')}</span>
                <span className="font-bold text-slate-900">{employee.idCardType || 'Aadhaar Card'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">{t('employees.profile.id_number', 'ID Number:')}</span>
                <span className="font-mono font-bold text-slate-900">{employee.idCardNumber || 'XXXX-XXXX-4589'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={async () => {
                  const docId = employee.documents?.[0]?.id || 'kyc';
                  setKycLoading(true);
                  try {
                    const data = await getEmployeeKycSignedUrls(employee.id, docId);
                    if (data?.frontSignedUrl) {
                      window.open(data.frontSignedUrl, '_blank', 'noopener,noreferrer');
                    } else if (employee.idCardFrontUrl) {
                      window.open(employee.idCardFrontUrl, '_blank', 'noopener,noreferrer');
                    } else {
                      alert('Front image not available');
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setKycLoading(false);
                  }
                }}
                disabled={kycLoading}
                className="border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl p-3 text-center bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="text-[10px] font-bold text-slate-600 mb-1">{t('employees.profile.front_scan', 'ID Card Front')}</div>
                <div className="text-xs font-semibold text-blue-600 group-hover:underline flex items-center justify-center gap-1">
                  {t('employees.profile.view_scan', 'View Secure Scan ↗')}
                </div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const docId = employee.documents?.[0]?.id || 'kyc';
                  setKycLoading(true);
                  try {
                    const data = await getEmployeeKycSignedUrls(employee.id, docId);
                    if (data?.backSignedUrl) {
                      window.open(data.backSignedUrl, '_blank', 'noopener,noreferrer');
                    } else if (employee.idCardBackUrl) {
                      window.open(employee.idCardBackUrl, '_blank', 'noopener,noreferrer');
                    } else {
                      alert('Back image not available');
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setKycLoading(false);
                  }
                }}
                disabled={kycLoading}
                className="border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl p-3 text-center bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="text-[10px] font-bold text-slate-600 mb-1">{t('employees.profile.back_scan', 'ID Card Back')}</div>
                <div className="text-xs font-semibold text-blue-600 group-hover:underline flex items-center justify-center gap-1">
                  {t('employees.profile.view_scan', 'View Secure Scan ↗')}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Feature Permissions */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs max-w-2xl text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>{t('employees.profile.active_permissions', 'Active Feature Permissions')}</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Role-based access control and system entitlements for {employee.name}
              </p>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-colors cursor-pointer"
              >
                {t('common.edit', 'Edit Permissions')}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'dashboard', label: 'Dashboard & Metrics' },
              { key: 'attendance', label: 'Attendance & Clock-In' },
              { key: 'leave', label: 'Leave Management' },
              { key: 'tasks', label: 'Tasks & SOP Orders' },
              { key: 'leads', label: 'Leads & Business Inquiries' },
              { key: 'products', label: 'Product Library & TDS' },
              { key: 'notifications', label: 'System Notifications' },
              { key: 'messaging', label: 'Team Messaging & Chat' },
              { key: 'reports', label: 'Operational & Payroll Reports' },
            ].map(({ key, label }) => {
              const active = !!employee.permissions?.[key];
              return (
                <div
                  key={key}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-800">{label}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      active
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {active ? t('common.status.active', 'Active') : t('common.status.inactive', 'Inactive')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Attendance History */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">{t('attendance.table.date', 'Date')}</th>
                <th className="py-3.5 px-4">{t('attendance.table.checkin_time', 'Check-In')}</th>
                <th className="py-3.5 px-4">{t('attendance.table.checkout_time', 'Check-Out')}</th>
                <th className="py-3.5 px-4">{t('attendance.table.working_duration', 'Duration')}</th>
                <th className="py-3.5 px-4">{t('attendance.table.status', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {empAttendance.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{a.date}</td>
                  <td className="py-3 px-4 font-mono">{a.checkIn || '-'}</td>
                  <td className="py-3 px-4 font-mono">{a.checkOut || '-'}</td>
                  <td className="py-3 px-4 font-semibold text-slate-600">{a.workingHours || a.duration || '-'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : a.status === 'Late'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : a.status === 'Half Day'
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}

              {empAttendance.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Clock className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-slate-500">No attendance logs on record</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: Tasks Associated with this Employee */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-amber-600" />
                <span>{t('employees.profile.assigned_tasks', 'Tasks Associated with')} {employee.name}</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                All operational jobs, routine SOPs, and work orders assigned to this employee.
              </p>
            </div>
            <Link
              href="/tasks"
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold text-xs transition-colors"
            >
              {t('tasks.title', 'Go to Tasks Module')} →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 whitespace-nowrap">{t('tasks.table.created_on', 'Created On')}</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">{t('tasks.task_id', 'Task ID')}</th>
                  <th className="py-3.5 px-4 min-w-[200px]">{t('tasks.task_title', 'Task Title')}</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">{t('tasks.status', 'Status')}</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">{t('tasks.priority', 'Priority')}</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">{t('tasks.assigned_by', 'Assigned By')}</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">{t('tasks.due_date', 'Due Date')}</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">{t('tasks.comments', 'Comments')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {empTasks.map((tItem) => {
                  const isOverdue =
                    tItem.deadline &&
                    new Date(tItem.deadline) < new Date(new Date().setHours(0, 0, 0, 0)) &&
                    tItem.status !== 'Completed';

                  return (
                    <tr key={tItem.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 text-[11px] leading-snug">
                          {formatCreatedDateTime(tItem.createdAt).date}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {formatCreatedDateTime(tItem.createdAt).time}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                            {tItem.taskCode || tItem.id}
                          </span>
                          {(tItem.isRecurring || tItem.recurringTaskId) && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200"
                              title="Recurring SOP"
                            >
                              <Repeat className="w-2.5 h-2.5" />
                              SOP
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 leading-snug">{tItem.title}</div>
                        {tItem.description && (
                          <div className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
                            {tItem.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            tItem.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : tItem.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isOverdue || tItem.status === 'Overdue'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {tItem.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700 border border-slate-200">
                          {tItem.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{tItem.assignedBy}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {tItem.deadline || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-slate-500 font-bold">
                          <MessageSquare className="w-3 h-3 text-slate-400" />
                          <span>{tItem.comments?.length || 0}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {empTasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CheckSquare className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-slate-500">No tasks currently assigned to this member</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Activity History (ADMIN ONLY) */}
      {activeTab === 'activity' && currentRole === 'ADMIN' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-purple-950 text-sm">
                  {t('employees.activity.title', 'Audit & System Activity History')}
                </h3>
                <p className="text-[11px] text-purple-800 font-medium mt-0.5">
                  Chronological activity trail and system logs for {employee.name} ({employee.id})
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
              Admin Protected
            </span>
          </div>

          {activityLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <span className="font-medium text-xs">Loading activity trail...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 whitespace-nowrap">Action</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Entity / Module</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Details & Metadata</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Performed By</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${getActionBadgeClass(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{log.entityType || 'SYSTEM'}</span>
                        {log.entityId && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">{log.entityId}</div>
                        )}
                      </td>

                      {/* Metadata */}
                      <td className="py-3.5 px-4 text-slate-800">
                        {typeof log.metadata === 'object' && log.metadata !== null ? (
                          <div className="space-y-0.5 font-mono text-[11px] text-slate-600">
                            {JSON.stringify(log.metadata)}
                          </div>
                        ) : (
                          <span className="text-slate-700 leading-snug">{log.metadata || 'System record updated'}</span>
                        )}
                      </td>

                      {/* Performed By */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{log.performedBy}</div>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {log.time}
                      </td>
                    </tr>
                  ))}

                  {activityLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Activity className="w-8 h-8 text-slate-300" />
                          <span className="font-semibold text-slate-500">No activity trail records found</span>
                          <span className="text-[11px] text-slate-400">
                            User actions and status updates will be logged here automatically.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
