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
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle2,
  Search,
  Phone,
  Mail,
  MapPin,
  Globe2,
  MessageCircle,
  ArrowDown,
  ArrowUp,
  FileText,
} from 'lucide-react';

export default function ReportsPage() {
  const {
    currentRole,
    employees,
    attendance,
    leaves,
    leads,
    generateMonthlyPayrollData,
    exportPayrollReportCSV,
    exportLeadsReportCSV,
    hasPermission,
    t,
  } = useCrm();

  const canExport = hasPermission('reports.export');
  const canViewPayroll = currentRole === 'ADMIN' || hasPermission('payroll.view');

  const [activeTab, setActiveTab] = useState(canViewPayroll ? 'attendance' : 'leads'); // 'attendance' | 'leads'

  // Attendance & Payroll Filters
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [empFilter, setEmpFilter] = useState('ALL');

  // Leads Report Filters & Sorting
  const [leadSearchTerm, setLeadSearchTerm] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('ALL');
  const [leadSourceFilter, setLeadSourceFilter] = useState('ALL');
  const [leadAssigneeFilter, setLeadAssigneeFilter] = useState('ALL');
  const [leadMonthFilter, setLeadMonthFilter] = useState('ALL');
  const [leadSortOrder, setLeadSortOrder] = useState('desc'); // 'desc' (newest first) | 'asc' (oldest first)

  const [toastMessage, setToastMessage] = useState('');

  const payrollData = generateMonthlyPayrollData(selectedMonth, selectedYear, deptFilter, empFilter);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const formatCreatedDateTime = (timestamp) => {
    if (!timestamp) return { date: '-', time: '' };
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return { date: '-', time: '' };

      const dateStr = d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const timeStr = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      return { date: dateStr, time: timeStr };
    } catch (e) {
      return { date: '-', time: '' };
    }
  };

  // Helper for Source Badge
  const renderSourceBadge = (source) => {
    const s = (source || '').toLowerCase();
    if (s === 'website') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <Globe2 className="w-2.5 h-2.5" />
          Website
        </span>
      );
    }
    if (s === 'whatsapp') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <MessageCircle className="w-2.5 h-2.5" />
          WhatsApp
        </span>
      );
    }
    if (s === 'call' || s === 'phone') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Phone className="w-2.5 h-2.5" />
          Call
        </span>
      );
    }
    if (s === 'referral') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          Referral
        </span>
      );
    }
    if (s === 'email') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Mail className="w-2.5 h-2.5" />
          Email
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {source || 'Direct'}
      </span>
    );
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Follow-up':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Quotation Sent':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Won':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Lost':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-extrabold';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200 font-bold';
      case 'Medium':
        return 'bg-sky-50 text-sky-700 border-sky-200 font-semibold';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    }
  };

  // Filtered Leads Report Data
  const filteredReportLeads = leads
    .filter((l) => {
      const term = leadSearchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (l.leadCode || '').toLowerCase().includes(term) ||
        (l.id || '').toLowerCase().includes(term) ||
        (l.companyName || '').toLowerCase().includes(term) ||
        (l.leadName || '').toLowerCase().includes(term) ||
        (l.mobileNumber || '').toLowerCase().includes(term) ||
        (l.email || '').toLowerCase().includes(term) ||
        (l.productInterested || '').toLowerCase().includes(term) ||
        (l.requirement || '').toLowerCase().includes(term) ||
        (l.location || '').toLowerCase().includes(term) ||
        (l.assignedTo || '').toLowerCase().includes(term);

      const matchesStatus = leadStatusFilter === 'ALL' || l.status === leadStatusFilter;
      const matchesSource =
        leadSourceFilter === 'ALL' ||
        (l.source || '').toLowerCase() === leadSourceFilter.toLowerCase();
      const matchesAssignee = leadAssigneeFilter === 'ALL' || l.assignedTo === leadAssigneeFilter;

      let matchesMonth = true;
      if (leadMonthFilter !== 'ALL') {
        const leadDate = new Date(l.createdAt || l.createdDate || '');
        if (!isNaN(leadDate.getTime())) {
          const monthIdx = leadDate.getMonth();
          const monthName = months[monthIdx];
          matchesMonth = monthName === leadMonthFilter;
        }
      }

      return matchesSearch && matchesStatus && matchesSource && matchesAssignee && matchesMonth;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || a.createdDate || 0).getTime();
      const timeB = new Date(b.createdAt || b.createdDate || 0).getTime();
      if (leadSortOrder === 'asc') {
        return timeA - timeB; // Oldest first
      }
      return timeB - timeA; // Newest first (default)
    });

  // Export handlers
  const handleExportPayrollCSV = () => {
    exportPayrollReportCSV(selectedMonth, selectedYear);
    setToastMessage(`Payroll report exported as CSV for ${selectedMonth} ${selectedYear}!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleExportPayrollExcel = () => {
    exportPayrollReportCSV(selectedMonth, selectedYear);
    setToastMessage(`Excel spreadsheet generated for ${selectedMonth} ${selectedYear}!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleExportLeadsCSV = () => {
    if (exportLeadsReportCSV) {
      exportLeadsReportCSV(filteredReportLeads);
    }
    setToastMessage(`Leads Report exported (${filteredReportLeads.length} records)!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

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
            <span>{t('reports.title', 'Reports')}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('reports.subtitle', 'Downloadable operational summaries, attendance logs, and comprehensive leads reporting.')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canExport && activeTab === 'attendance' && (
            <>
              <button
                onClick={handleExportPayrollCSV}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('reports.download_csv', 'Download CSV')}</span>
              </button>
              <button
                onClick={handleExportPayrollExcel}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{t('reports.download_excel', 'Download Attendance Report (Excel)')}</span>
              </button>
            </>
          )}

          {canExport && activeTab === 'leads' && (
            <button
              onClick={handleExportLeadsCSV}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-purple-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('reports.download_leads_csv', 'Download Leads Report (CSV)')}</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={t('common.print', 'Print Report')}
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 text-xs font-bold text-slate-600">
        {canViewPayroll && (
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'attendance' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('reports.tab_attendance', 'Attendance & Monthly Payroll')}</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'leads' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{t('reports.tab_leads', 'Leads Report')}</span>
        </button>
      </div>

      {/* ========================================================== */}
      {/* 1. ATTENDANCE & MONTHLY PAYROLL TAB */}
      {/* ========================================================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {t('reports.month_year', 'Month & Year')}:
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
                <Filter className="w-3.5 h-3.5 text-slate-400" /> {t('reports.scope', 'Scope')}:
              </div>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none"
              >
                <option value="ALL">{t('reports.all_departments', 'All Departments')}</option>
                <option value="Technical & Operations">{t('departments.technical_operations', 'Technical & Operations')}</option>
                <option value="Sales & Business Dev">{t('departments.sales_business_dev', 'Sales & Business Dev')}</option>
                <option value="Site Execution">{t('departments.site_execution', 'Site Execution')}</option>
                <option value="Customer Support">{t('departments.customer_support', 'Customer Support')}</option>
              </select>

              <select
                value={empFilter}
                onChange={(e) => setEmpFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none"
              >
                <option value="ALL">{t('reports.all_team_members', 'All Team Members')} ({employees.filter((e) => e.status === 'Active').length})</option>
                {employees.filter((e) => e.status === 'Active').map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-slate-800 text-xs">
                {t('reports.attendance_summary_title', 'Monthly Attendance Summary')} — {selectedMonth} {selectedYear}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold">
                {t('reports.standard_working_days', 'Standard Working Days: 26 • Weekly Offs: 4')}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">{t('reports.col_team_member', 'Team Member')}</th>
                    <th className="py-3 px-3 text-center">{t('reports.col_working_days', 'Working Days')}</th>
                    <th className="py-3 px-3 text-center text-emerald-700">{t('reports.col_present', 'Present')}</th>
                    <th className="py-3 px-3 text-center text-amber-700">{t('reports.col_late_days', 'Late Days')}</th>
                    <th className="py-3 px-3 text-center text-blue-700">{t('reports.col_leave_days', 'Leave Days')}</th>
                    <th className="py-3 px-3 text-center text-rose-700">{t('reports.col_absent', 'Absent')}</th>
                    <th className="py-3 px-3 text-center">{t('reports.col_total_late_mins', 'Total Late Mins')}</th>
                    <th className="py-3 px-3 text-center">{t('reports.col_total_hours', 'Total Hours')}</th>
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
                        {d.totalLateMinutes} {t('common.mins', 'mins')}
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                        {d.totalHours}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 2. LEADS REPORT TAB */}
      {/* ========================================================== */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          {/* Leads Report Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4 text-xs">
            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={leadSearchTerm}
                onChange={(e) => setLeadSearchTerm(e.target.value)}
                placeholder={t('leads.search_placeholder', 'Search company, client, Lead ID, mobile...')}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
              {/* Month Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={leadMonthFilter}
                  onChange={(e) => setLeadMonthFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">{t('reports.all_months', 'All Months')}</option>
                  {months.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-400 font-bold text-[11px]">{t('leads.status', 'Status')}:</span>
                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">{t('leads.all_statuses', 'All Statuses')} ({leads.length})</option>
                  <option value="New">{t('leads.stage_new', 'New')}</option>
                  <option value="Contacted">{t('leads.stage_contacted', 'Contacted')}</option>
                  <option value="Follow-up">{t('leads.stage_follow_up', 'Follow-up')}</option>
                  <option value="Quotation Sent">{t('leads.stage_quotation_sent', 'Quotation Sent')}</option>
                  <option value="Won">{t('leads.stage_won', 'Won')}</option>
                  <option value="Lost">{t('leads.stage_lost', 'Lost')}</option>
                </select>
              </div>

              {/* Source Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-400 font-bold text-[11px]">{t('leads.source', 'Source')}:</span>
                <select
                  value={leadSourceFilter}
                  onChange={(e) => setLeadSourceFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">{t('leads.all_sources', 'All Sources')}</option>
                  <option value="Website">{t('leads.source_website', 'Website')}</option>
                  <option value="WhatsApp">{t('leads.source_whatsapp', 'WhatsApp')}</option>
                  <option value="Call">{t('leads.source_call', 'Call')}</option>
                  <option value="Walk-in">{t('leads.source_walk_in', 'Walk-in')}</option>
                  <option value="Referral">{t('leads.source_referral', 'Referral')}</option>
                  <option value="Email">{t('leads.source_email', 'Email')}</option>
                </select>
              </div>

              {/* Assigned To Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-400 font-bold text-[11px]">{t('leads.assigned', 'Assigned')}:</span>
                <select
                  value={leadAssigneeFilter}
                  onChange={(e) => setLeadAssigneeFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">{t('leads.all_team', 'All Team')}</option>
                  {employees
                    .filter((e) => e.status === 'Active')
                    .map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Leads Report Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                <span>{t('reports.leads_activity_report', 'Comprehensive Leads Activity Report')}</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold">
                  {filteredReportLeads.length} {filteredReportLeads.length === 1 ? 'Lead' : 'Leads'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {t('common.showing', 'Showing')} {filteredReportLeads.length} {t('common.of', 'of')} {leads.length} {t('common.total_records', 'total records')}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    {/* Created Date & Time with Sort Toggle */}
                    <th
                      onClick={() => setLeadSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                      className="py-3.5 px-4 whitespace-nowrap cursor-pointer select-none hover:bg-slate-100 transition-colors group"
                      title={
                        leadSortOrder === 'desc'
                          ? 'Sorted Newest first. Click to sort Oldest first'
                          : 'Sorted Oldest first. Click to sort Newest first'
                      }
                    >
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <span>{t('leads.created', 'Created')}</span>
                        {leadSortOrder === 'desc' ? (
                          <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                        ) : (
                          <ArrowUp className="w-3.5 h-3.5 text-purple-600" />
                        )}
                      </div>
                    </th>
                    <th className="py-3.5 px-4 whitespace-nowrap">{t('leads.lead_id', 'Lead ID')}</th>
                    <th className="py-3.5 px-4 min-w-[170px]">{t('leads.client_company', 'Client / Company')}</th>
                    <th className="py-3.5 px-4 min-w-[150px]">{t('leads.contact_person', 'Contact Person')}</th>
                    <th className="py-3.5 px-4 min-w-[180px]">{t('leads.product_requirement', 'Product / Requirement')}</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">{t('leads.source', 'Source')}</th>
                    <th className="py-3.5 px-4 min-w-[130px]">{t('leads.assigned_to', 'Assigned To')}</th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap">{t('tasks.priority', 'Priority')}</th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap">{t('leads.status', 'Status')}</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">{t('leads.follow_up', 'Follow-up')}</th>
                    <th className="py-3.5 px-4 min-w-[160px]">{t('reports.col_notes', 'Notes')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredReportLeads.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <div className="text-sm font-semibold text-slate-600">{t('reports.no_leads_matching', 'No leads found matching current filters')}</div>
                        <div className="text-xs text-slate-400 mt-1">{t('reports.no_leads_hint', 'Try adjusting your search query, status, or date range.')}</div>
                      </td>
                    </tr>
                  ) : (
                    filteredReportLeads.map((l) => {
                      const { date: createdDateStr, time: createdTimeStr } = formatCreatedDateTime(
                        l.createdAt || l.createdDate
                      );

                      const isFollowUpOverdue =
                        l.followUpDate &&
                        new Date(l.followUpDate) < new Date(new Date().setHours(0, 0, 0, 0)) &&
                        l.status !== 'Won' &&
                        l.status !== 'Lost';

                      return (
                        <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Created */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 text-[11px]">{createdDateStr}</span>
                              {createdTimeStr && (
                                <span className="text-[10px] text-slate-400 font-medium">{createdTimeStr}</span>
                              )}
                            </div>
                          </td>

                          {/* Lead ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-[11px] whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200/80">
                              {l.leadCode || l.id}
                            </span>
                          </td>

                          {/* Client / Company */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 leading-tight">
                              {l.companyName || l.leadName}
                            </div>
                            {l.location && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate max-w-[150px]">{l.location}</span>
                              </div>
                            )}
                          </td>

                          {/* Contact Person */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{l.leadName}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5 text-slate-400" />
                              <span>{l.mobileNumber}</span>
                            </div>
                          </td>

                          {/* Product / Requirement */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-blue-700 leading-snug">
                              {l.productInterested}
                            </div>
                            {l.requirement && (
                              <div
                                className="text-[10px] text-slate-500 truncate max-w-[200px] mt-0.5"
                                title={l.requirement}
                              >
                                {l.requirement}
                              </div>
                            )}
                          </td>

                          {/* Source */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {renderSourceBadge(l.source)}
                          </td>

                          {/* Assigned To */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                {(l.assignedTo || 'SE').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-800 truncate max-w-[110px]">
                                {l.assignedTo || t('common.unassigned', 'Unassigned')}
                              </span>
                            </div>
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${getPriorityBadgeClass(l.priority)}`}>
                              {l.priority === 'Urgent' ? t('tasks.priority_urgent', 'Urgent') :
                               l.priority === 'High' ? t('tasks.priority_high', 'High') :
                               l.priority === 'Medium' ? t('tasks.priority_medium', 'Medium') :
                               l.priority === 'Low' ? t('tasks.priority_low', 'Low') : (l.priority || t('tasks.priority_medium', 'Medium'))}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadgeClass(
                                l.status
                              )}`}
                            >
                              {l.status === 'New' ? t('leads.stage_new', 'New') :
                               l.status === 'Contacted' ? t('leads.stage_contacted', 'Contacted') :
                               l.status === 'Follow-up' ? t('leads.stage_follow_up', 'Follow-up') :
                               l.status === 'Quotation Sent' ? t('leads.stage_quotation_sent', 'Quotation Sent') :
                               l.status === 'Won' ? t('leads.stage_won', 'Won') :
                               l.status === 'Lost' ? t('leads.stage_lost', 'Lost') : l.status}
                            </span>
                          </td>

                          {/* Follow-up Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {l.followUpDate ? (
                              <div
                                className={`flex items-center gap-1 text-[11px] font-semibold ${
                                  isFollowUpOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'
                                }`}
                              >
                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{l.followUpDate}</span>
                                {isFollowUpOverdue && (
                                  <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                                    {t('leads.overdue', 'Overdue')}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>

                          {/* Notes */}
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {l.notes ? (
                              <span className="truncate max-w-[180px] block" title={l.notes}>
                                {l.notes}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
