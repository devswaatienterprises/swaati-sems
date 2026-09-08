'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  FileSpreadsheet,
  Users,
  CheckSquare,
  TrendingUp,
  CalendarCheck2,
  Clock,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export default function ReportsPage() {
  const {
    currentRole,
    employees,
    attendance,
    leaves,
    tasks,
    leads,
    generateMonthlyPayrollData,
    exportPayrollReportCSV,
    hasPermission,
    t,
  } = useCrm();

  const canExport = hasPermission('reports.export');
  const canViewPayroll = currentRole === 'ADMIN' || hasPermission('payroll.view');

  const [activeTab, setActiveTab] = useState(canViewPayroll ? 'payroll' : 'tasks'); // 'payroll' | 'tasks' | 'leads' | 'leaves'
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [empFilter, setEmpFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  const payrollData = generateMonthlyPayrollData(selectedMonth, selectedYear, deptFilter, empFilter);

  const handleExportCSV = () => {
    exportPayrollReportCSV(selectedMonth, selectedYear);
    setToastMessage(`Payroll report exported as CSV for ${selectedMonth} ${selectedYear}!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleExportExcel = () => {
    // Generates formatted CSV / Excel compatible download
    exportPayrollReportCSV(selectedMonth, selectedYear);
    setToastMessage(`Excel spreadsheet generated for ${selectedMonth} ${selectedYear}!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Shell>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Attendance & Payroll Reports</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Downloadable monthly summaries for payroll processing, shift hours, and operational accountability.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canExport && (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Download CSV</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download Payroll Report (Excel)</span>
              </button>
            </>
          )}
          <button
            onClick={handlePrint}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 text-xs font-bold text-slate-600">
        {canViewPayroll && (
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'payroll' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Attendance & Monthly Payroll</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'tasks' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Task Productivity</span>
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'leads' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Lead Conversion Pipeline</span>
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'leaves' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <CalendarCheck2 className="w-3.5 h-3.5" />
          <span>Leave Summary</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Month & Year:
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none"
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Scope:
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Technical & Operations">Technical & Operations</option>
            <option value="Sales & Business Dev">Sales & Business Dev</option>
            <option value="Site Execution">Site Execution</option>
            <option value="Customer Support">Customer Support</option>
          </select>

          <select
            value={empFilter}
            onChange={(e) => setEmpFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Team Members ({employees.filter((e) => e.status === 'Active').length})</option>
            {employees.filter((e) => e.status === 'Active').map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 1. PAYROLL ATTENDANCE REPORT TAB */}
      {/* ========================================================== */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="font-bold text-slate-800 text-xs">
              Monthly Payroll Attendance Sheet — {selectedMonth} {selectedYear}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold">
              Standard Working Days: 26 • Weekly Offs: 4
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Team Member</th>
                  <th className="py-3 px-3 text-center">Working Days</th>
                  <th className="py-3 px-3 text-center text-emerald-700">Present</th>
                  <th className="py-3 px-3 text-center text-amber-700">Late Days</th>
                  <th className="py-3 px-3 text-center text-blue-700">Leave Days</th>
                  <th className="py-3 px-3 text-center text-rose-700">Absent</th>
                  <th className="py-3 px-3 text-center">Total Late Mins</th>
                  <th className="py-3 px-3 text-center">Total Hours</th>
                  <th className="py-3 px-4 text-center">Check-In / Out Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                {payrollData.map((d) => (
                  <tr key={d.employeeId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{d.employeeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {d.employeeId} • {d.designation}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                      {d.workingDays}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-emerald-700 bg-emerald-50/40">
                      {d.presentDays}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-amber-700 bg-amber-50/40">
                      {d.lateDays}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-blue-700 bg-blue-50/40">
                      {d.leaveDays}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-rose-700 bg-rose-50/40">
                      {d.absentDays}
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-600">
                      {d.totalLateMinutes} mins
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                      {d.totalHours}
                    </td>

                    <td className="py-3.5 px-4 text-center text-[11px] text-slate-500 font-mono">
                      {d.checkInSummary} / {d.checkOutSummary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 2. TASK PRODUCTIVITY TAB */}
      {/* ========================================================== */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-800 text-sm">Team Member Task Performance Summary</h3>
          <div className="divide-y divide-slate-100">
            {employees.filter((e) => e.status === 'Active').map((emp) => {
              const empTasks = tasks.filter((t) => t.assignedTo === emp.name || t.assignedToId === emp.id);
              const done = empTasks.filter((t) => t.status === 'Completed').length;
              const pending = empTasks.filter((t) => t.status !== 'Completed').length;
              const overdue = empTasks.filter((t) => t.status === 'Overdue').length;

              return (
                <div key={emp.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{emp.name}</div>
                    <div className="text-slate-500 text-[11px]">{emp.designation} • {emp.department}</div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="font-bold text-emerald-700">{done}</span>
                      <span className="text-slate-400 text-[10px] block">Completed</span>
                    </div>
                    <div>
                      <span className="font-bold text-amber-700">{pending}</span>
                      <span className="text-slate-400 text-[10px] block">In Progress</span>
                    </div>
                    <div>
                      <span className="font-bold text-rose-700">{overdue}</span>
                      <span className="text-slate-400 text-[10px] block">Overdue</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 3. LEAD PIPELINE TAB */}
      {/* ========================================================== */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-800 text-sm">Lead Generation & Conversion by Source</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Website', 'WhatsApp', 'Call', 'Referral'].map((src) => {
              const count = leads.filter((l) => l.source === src).length;
              const won = leads.filter((l) => l.source === src && l.status === 'Won').length;

              return (
                <div key={src} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800">{src}</div>
                  <div className="text-xl font-extrabold text-blue-600 mt-1">{count} Inquiries</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{won} Won Contracts</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 4. LEAVES TAB */}
      {/* ========================================================== */}
      {activeTab === 'leaves' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-800 text-sm">Monthly Absence & Leave Breakdown</h3>
          <div className="divide-y divide-slate-100">
            {leaves.map((l) => (
              <div key={l.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{l.employeeName}</div>
                  <div className="text-slate-500 text-[11px]">{l.leaveType} ({l.startDate} to {l.endDate})</div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Shell>
  );
}
