'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import Link from 'next/link';
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
} from 'lucide-react';

export default function EmployeeProfilePage({ params }) {
  const {
    currentRole,
    employees,
    tasks,
    attendance,
    leaves,
    deactivateEmployee,
    reactivateEmployee,
    getEmployeeKycSignedUrls,
    t,
  } = useCrm();

  const [activeTab, setActiveTab] = useState('overview');
  const [kycLoading, setKycLoading] = useState(false);

  const empId = params.id;
  const employee = employees.find((e) => e.id === empId || e.userId === empId) || employees[0];

  const empTasks = tasks.filter((t) => t.assignedTo === employee.name || t.assignedToId === employee.id);
  const completedTasks = empTasks.filter((t) => t.status === 'Completed').length;
  const empAttendance = attendance.filter((a) => a.employeeId === employee.id);
  const empLeaves = leaves.filter((l) => l.employeeId === employee.id);

  return (
    <Shell>
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/employees"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {t('employees.profile.back', 'Back to Team Members')}
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {employee.avatar || employee.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                  employee.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {employee.role}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  employee.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-700'
                }`}>
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

          <div className="flex items-center gap-2">
            {currentRole === 'ADMIN' && employee.role !== 'ADMIN' && (
              <>
                {employee.status === 'Active' ? (
                  <button
                    onClick={() => deactivateEmployee(employee.id)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>{t('employees.profile.deactivate_btn', 'Deactivate Member')}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => reactivateEmployee(employee.id)}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
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
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          {t('employees.profile.tab_overview', 'Profile & ID Documents')}
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'permissions' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          {t('employees.profile.tab_permissions', 'Feature Permissions')}
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'attendance' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          {t('employees.profile.tab_attendance', 'Attendance History')}
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          {t('employees.profile.tab_tasks', 'Tasks')} ({empTasks.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Employment Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">{t('employees.profile.emp_details', 'Employment Details')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{t('employees.profile.official_mobile', 'Official Mobile:')}</span>
                <span className="font-bold text-slate-900">{employee.mobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{t('employees.profile.official_email', 'Official Email:')}</span>
                <span className="font-bold text-slate-900">{employee.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{t('employees.form.role', 'System Role:')}</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {employee.role ? employee.role.replace('_', ' ') : 'OPERATION HEAD'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{t('employees.profile.joining_date', 'Joining Date:')}</span>
                <span className="font-bold text-slate-900">{employee.joiningDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{t('employees.profile.reporting_manager', 'Reporting Manager:')}</span>
                <span className="font-bold text-slate-900">{employee.reportingManager || 'Shailendra Patil'}</span>
              </div>
            </div>
          </div>

          {/* Identity Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" /> {t('employees.profile.identity_doc', 'Identity Document')}
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {t('employees.profile.verified', 'Verified')}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{t('employees.profile.doc_type', 'Document Type:')}</span>
                <span className="font-bold text-slate-900">{employee.idCardType || 'Aadhaar Card'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{t('employees.profile.id_number', 'ID Number:')}</span>
                <span className="font-mono font-bold text-slate-900">{employee.idCardNumber || 'XXXX-XXXX-4589'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
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
                className="border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-lg p-3 text-center bg-slate-50 transition-colors group cursor-pointer"
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
                className="border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-lg p-3 text-center bg-slate-50 transition-colors group cursor-pointer"
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

      {activeTab === 'permissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs max-w-xl text-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" /> {t('employees.profile.active_permissions', 'Active Feature Permissions')}
          </h3>
          <div className="divide-y divide-slate-100">
            {['dashboard', 'attendance', 'leave', 'tasks', 'leads', 'products', 'notifications', 'messaging', 'reports'].map((feat) => {
              const active = !!employee.permissions?.[feat];
              return (
                <div key={feat} className="py-2.5 flex items-center justify-between">
                  <span className="capitalize font-semibold text-slate-700">{feat}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {active ? t('common.status.active', 'Active') : t('common.status.inactive', 'Inactive')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">{t('attendance.table.date', 'Date')}</th>
                <th className="py-3 px-4">{t('attendance.table.checkin_time', 'Check-In')}</th>
                <th className="py-3 px-4">{t('attendance.table.checkout_time', 'Check-Out')}</th>
                <th className="py-3 px-4">{t('attendance.table.status', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {empAttendance.map((a) => (
                <tr key={a.id}>
                  <td className="py-3 px-4">{a.date}</td>
                  <td className="py-3 px-4">{a.checkIn}</td>
                  <td className="py-3 px-4">{a.checkOut}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-800 text-sm">{t('employees.profile.assigned_tasks', 'Assigned Tasks')}</h3>
          <div className="divide-y divide-slate-100">
            {empTasks.map((tItem) => (
              <div key={tItem.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{tItem.title}</div>
                  <div className="text-[10px] text-slate-400">Assigned By: {tItem.assignedBy} • Due: {tItem.deadline}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  {tItem.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Shell>
  );
}
