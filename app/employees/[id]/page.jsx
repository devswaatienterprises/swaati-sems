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
  Activity,
} from 'lucide-react';

export default function EmployeeProfilePage({ params }) {
  const { employees, tasks, attendance } = useCrm();
  const [activeTab, setActiveTab] = useState('overview');

  const empId = params.id;
  const employee = employees.find((e) => e.id === empId) || employees[0];

  const empTasks = tasks.filter((t) => t.assignedTo === employee.name);
  const completedTasks = empTasks.filter((t) => t.status === 'Completed').length;
  const empAttendance = attendance.filter((a) => a.employeeId === employee.id);

  return (
    <Shell>
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/employees"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Employee Directory
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {employee.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                  employee.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : employee.role === 'MANAGER'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {employee.role}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-600 mt-0.5">
                {employee.designation} • {employee.department}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {employee.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {employee.mobile}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-center">
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Attendance Rate</div>
              <div className="text-xl font-extrabold text-emerald-600">96.5%</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Tasks Completed</div>
              <div className="text-xl font-extrabold text-blue-600">{completedTasks} / {empTasks.length}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-t border-slate-200 mt-6 pt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Personal Info
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Assigned Tasks ({empTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === 'activity'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Recent Activity Log
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Personal & Contact Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Employee ID</span>
                <span className="font-bold text-slate-800 font-mono">{employee.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Email Address</span>
                <span className="font-bold text-slate-800">{employee.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Mobile Phone</span>
                <span className="font-bold text-slate-800">{employee.mobile}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-medium">Primary Office Location</span>
                <span className="font-bold text-slate-800">Chinchwad Headquarters, Pune</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" /> Employment Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-bold text-slate-800">{employee.department}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Designation</span>
                <span className="font-bold text-slate-800">{employee.designation}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Date of Joining</span>
                <span className="font-bold text-slate-800">{employee.joiningDate}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-medium">Account Status</span>
                <span className="font-bold text-emerald-600">{employee.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-600" /> Current Tasks Assigned
          </h3>
          <div className="space-y-3 text-xs">
            {empTasks.length === 0 ? (
              <div className="text-slate-400 py-6 text-center">No tasks assigned to this employee.</div>
            ) : (
              empTasks.map((t) => (
                <div key={t.id} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{t.title}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Due: {t.dueDate} • Priority: {t.priority}</div>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 rounded font-bold text-slate-700">{t.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" /> Recent Site & System Activity
          </h3>
          <div className="space-y-4 text-xs font-medium border-l-2 border-slate-200 pl-4">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full absolute -left-[21px] top-1"></div>
              <div className="font-bold text-slate-800">Checked In at 09:00 AM</div>
              <div className="text-slate-500 text-[11px]">Today • Chinchwad Office</div>
            </div>
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full absolute -left-[21px] top-1"></div>
              <div className="font-bold text-slate-800">Completed Site Inspection</div>
              <div className="text-slate-500 text-[11px]">Yesterday • Godrej Emerald Bay Podium</div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
