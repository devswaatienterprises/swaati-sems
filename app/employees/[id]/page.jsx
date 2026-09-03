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
  } = useCrm();

  const [activeTab, setActiveTab] = useState('overview');

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
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Team Members
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
                User ID: {employee.userId} • Team Member ID: {employee.id}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentRole === 'ADMIN' && employee.role !== 'ADMIN' && (
              <>
                {employee.status === 'Active' ? (
                  <button
                    onClick={() => deactivateEmployee(employee.id)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Deactivate Member</span>
                  </button>
                ) : (
                  <button
                    onClick={() => reactivateEmployee(employee.id)}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Reactivate Member</span>
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
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'overview' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          Profile & ID Documents
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'permissions' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          Feature Permissions
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'attendance' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          Attendance History
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          Tasks ({empTasks.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Employment Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Employment Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Official Mobile:</span>
                <span className="font-bold text-slate-900">{employee.mobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Official Email:</span>
                <span className="font-bold text-slate-900">{employee.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Joining Date:</span>
                <span className="font-bold text-slate-900">{employee.joiningDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Reporting Manager:</span>
                <span className="font-bold text-slate-900">{employee.reportingManager || 'Shailendra Patil'}</span>
              </div>
            </div>
          </div>

          {/* Identity Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" /> Identity Document
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verified
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Document Type:</span>
                <span className="font-bold text-slate-900">{employee.idCardType || 'Aadhaar Card'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ID Number:</span>
                <span className="font-mono font-bold text-slate-900">{employee.idCardNumber || 'XXXX-XXXX-4589'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="border border-slate-200 rounded-lg p-2 text-center bg-slate-50">
                <div className="text-[10px] font-bold text-slate-500 mb-1">Front Image</div>
                <div className="h-16 bg-slate-200/60 rounded flex items-center justify-center font-mono text-[10px] text-slate-400">
                  [Front Scan]
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-2 text-center bg-slate-50">
                <div className="text-[10px] font-bold text-slate-500 mb-1">Back Image</div>
                <div className="h-16 bg-slate-200/60 rounded flex items-center justify-center font-mono text-[10px] text-slate-400">
                  [Back Scan]
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs max-w-xl text-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" /> Active Feature Permissions
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
                    {active ? 'Active' : 'Inactive'}
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
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Status</th>
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
          <h3 className="font-bold text-slate-800 text-sm">Assigned Tasks</h3>
          <div className="divide-y divide-slate-100">
            {empTasks.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{t.title}</div>
                  <div className="text-[10px] text-slate-400">Assigned By: {t.assignedBy} • Due: {t.deadline}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Shell>
  );
}
