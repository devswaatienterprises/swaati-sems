'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import LeadModal from '@/components/LeadModal';
import { useCrm } from '@/context/CrmContext';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Kanban,
  Table as TableIcon,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Globe2,
  MessageCircle,
  User,
  CheckCircle2,
  Clock,
  Edit2,
  Eye,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  FileText,
} from 'lucide-react';

export default function LeadsPage() {
  const {
    currentRole,
    currentUser,
    employees,
    leads,
    addLead,
    updateLeadStatus,
    updateLead,
    t,
  } = useCrm();

  // Table View is primary / default as required
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest first) | 'asc' (oldest first)

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const formatCreatedDateTime = (timestamp) => {
    if (!timestamp) return { date: '-', time: '' };
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return { date: '-', time: '' };

      const dateStr = d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }); // e.g., "08 Sep 2026"

      const timeStr = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }); // e.g., "05:32 PM"

      return { date: dateStr, time: timeStr };
    } catch (e) {
      return { date: '-', time: '' };
    }
  };

  const pipelineStages = [
    'New',
    'Contacted',
    'Follow-up',
    'Quotation Sent',
    'Won',
    'Lost',
  ];

  // Helper for Status Badge styling
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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Phone className="w-2.5 h-2.5" />
          Call
        </span>
      );
    }
    if (s === 'referral') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          Referral
        </span>
      );
    }
    if (s === 'email') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Mail className="w-2.5 h-2.5" />
          Email
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {source || 'Direct'}
      </span>
    );
  };

  // Filter & Search
  const filteredLeads = leads
    .filter((l) => {
      const term = searchTerm.toLowerCase().trim();
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

      const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
      const matchesSource =
        sourceFilter === 'ALL' ||
        (l.source || '').toLowerCase() === sourceFilter.toLowerCase();
      const matchesAssignee = assigneeFilter === 'ALL' || l.assignedTo === assigneeFilter;

      return matchesSearch && matchesStatus && matchesSource && matchesAssignee;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || a.createdDate || 0).getTime();
      const timeB = new Date(b.createdAt || b.createdDate || 0).getTime();
      if (sortOrder === 'asc') {
        return timeA - timeB; // Oldest first
      }
      return timeB - timeA; // Newest first (default)
    });

  const handleEditLead = (lead) => {
    setEditingLead(lead);
  };

  const handleSaveLead = (formData) => {
    if (editingLead) {
      if (updateLead) {
        updateLead(editingLead.id, formData);
      }
      setEditingLead(null);
    } else {
      addLead(formData);
      setIsAddModalOpen(false);
    }
  };

  return (
    <Shell>
      {/* Add / Edit Lead Modal */}
      <LeadModal
        isOpen={isAddModalOpen || !!editingLead}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingLead(null);
        }}
        initialData={editingLead}
        onSave={handleSaveLead}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <span>{t('leads.title', 'Leads & Business Inquiries')}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('leads.subtitle', 'Track customer inquiries, material requirements, sales stages, and follow-up schedules.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle: Table View is Default */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-xs flex items-center text-xs font-bold">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{t('leads.table_view', 'Table View')}</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>{t('leads.pipeline_view', 'Pipeline View')}</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingLead(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-sm shadow-purple-600/20 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('leads.add_lead', 'Add Lead')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('leads.search_placeholder', 'Search company, client, Lead ID, product, mobile...')}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-bold text-[11px]">{t('leads.status', 'Status')}:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">{t('leads.all_statuses', 'All Statuses')} ({leads.length})</option>
              {pipelineStages.map((stg) => (
                <option key={stg} value={stg}>
                  {stg === 'New' ? t('leads.stage_new', 'New') :
                   stg === 'Contacted' ? t('leads.stage_contacted', 'Contacted') :
                   stg === 'Follow-up' ? t('leads.stage_follow_up', 'Follow-up') :
                   stg === 'Quotation Sent' ? t('leads.stage_quotation_sent', 'Quotation Sent') :
                   stg === 'Won' ? t('leads.stage_won', 'Won') :
                   stg === 'Lost' ? t('leads.stage_lost', 'Lost') : stg} ({leads.filter((l) => l.status === stg).length})
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-bold text-[11px]">{t('leads.source', 'Source')}:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
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
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
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

      {/* ========================================================== */}
      {/* 1. TABLE VIEW (PRIMARY / DEFAULT) */}
      {/* ========================================================== */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10 text-[11px]">
                <tr>
                  <th
                    onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                    className="py-3.5 px-4 whitespace-nowrap cursor-pointer select-none hover:bg-slate-100 transition-colors group"
                    title={
                      sortOrder === 'desc'
                        ? 'Sorted Newest first. Click to sort Oldest first'
                        : 'Sorted Oldest first. Click to sort Newest first'
                    }
                  >
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span>{t('leads.created', 'Created')}</span>
                      {sortOrder === 'desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                      ) : (
                        <ArrowUp className="w-3.5 h-3.5 text-purple-600" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 whitespace-nowrap">{t('leads.lead_id', 'Lead ID')}</th>
                  <th className="py-3.5 px-4 min-w-[180px]">{t('leads.client_company', 'Client / Company')}</th>
                  <th className="py-3.5 px-4 min-w-[160px]">{t('leads.contact_person', 'Contact Person')}</th>
                  <th className="py-3.5 px-4 min-w-[200px]">{t('leads.product_requirement', 'Product / Requirement')}</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">{t('leads.source', 'Source')}</th>
                  <th className="py-3.5 px-4 min-w-[140px]">{t('leads.assigned_to', 'Assigned To')}</th>
                  <th className="py-3.5 px-4 min-w-[130px]">{t('leads.status', 'Status')}</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">{t('leads.follow_up', 'Follow-up')}</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">{t('leads.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLeads.map((l) => {
                  const isFollowUpOverdue =
                    l.followUpDate &&
                    new Date(l.followUpDate) < new Date(new Date().setHours(0, 0, 0, 0)) &&
                    l.status !== 'Won' &&
                    l.status !== 'Lost';

                  const { date: createdDateStr, time: createdTimeStr } = formatCreatedDateTime(
                    l.createdAt || l.createdDate
                  );

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Created Date & Time */}
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
                            <span className="truncate max-w-[160px]">{l.location}</span>
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
                            className="text-[10px] text-slate-500 truncate max-w-[220px] mt-0.5"
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
                          <span className="font-bold text-slate-800 truncate max-w-[120px]">
                            {l.assignedTo || t('common.unassigned', 'Unassigned')}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={l.status}
                          onChange={(e) => updateLeadStatus(l.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border focus:outline-none cursor-pointer transition-all ${getStatusBadgeClass(
                            l.status
                          )}`}
                        >
                          {pipelineStages.map((stg) => (
                            <option key={stg} value={stg}>
                              {stg === 'New' ? t('leads.stage_new', 'New') :
                               stg === 'Contacted' ? t('leads.stage_contacted', 'Contacted') :
                               stg === 'Follow-up' ? t('leads.stage_follow_up', 'Follow-up') :
                               stg === 'Quotation Sent' ? t('leads.stage_quotation_sent', 'Quotation Sent') :
                               stg === 'Won' ? t('leads.stage_won', 'Won') :
                               stg === 'Lost' ? t('leads.stage_lost', 'Lost') : stg}
                            </option>
                          ))}
                        </select>
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

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleEditLead(l)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5"
                          title={t('leads.edit_lead', 'Edit Lead Details')}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{t('common.edit', 'Edit')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <TrendingUp className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-slate-500">{t('leads.no_leads_found', 'No matching leads found')}</span>
                        <span className="text-[11px] text-slate-400">
                          {t('leads.no_leads_hint', 'Try adjusting your search criteria or add a new lead inquiry.')}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================== */
        /* 2. PIPELINE KANBAN VIEW (OPTIONAL TOGGLE) */
        /* ========================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage);

            return (
              <div key={stage} className="bg-slate-100/70 rounded-2xl p-3.5 flex flex-col min-h-[500px]">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    {stage === 'New' ? t('leads.stage_new', 'New') :
                     stage === 'Contacted' ? t('leads.stage_contacted', 'Contacted') :
                     stage === 'Follow-up' ? t('leads.stage_follow_up', 'Follow-up') :
                     stage === 'Quotation Sent' ? t('leads.stage_quotation_sent', 'Quotation Sent') :
                     stage === 'Won' ? t('leads.stage_won', 'Won') :
                     stage === 'Lost' ? t('leads.stage_lost', 'Lost') : stage}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {stageLeads.map((l) => (
                    <div
                      key={l.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow text-xs space-y-2"
                    >
                      {/* Source Badge & Code */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] text-slate-400 font-bold">
                          {l.leadCode || l.id}
                        </span>
                        {renderSourceBadge(l.source)}
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs leading-snug">
                        {l.companyName || l.leadName}
                      </h4>
                      {l.companyName && l.leadName && (
                        <div className="text-[10px] text-slate-500 font-medium">{l.leadName}</div>
                      )}

                      <div className="text-[11px] text-blue-700 font-semibold bg-blue-50/60 p-1.5 rounded-lg border border-blue-100/80">
                        {l.productInterested}
                      </div>

                      {/* Phone & Location */}
                      <div className="space-y-0.5 text-[10px] text-slate-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span className="font-mono">{l.mobileNumber}</span>
                        </div>
                        {l.location && (
                          <div className="flex items-center gap-1 text-slate-500 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{l.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Attribution Info */}
                      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-0.5">
                        <div>
                          {t('leads.assigned', 'Assignee')}: <strong className="text-blue-700">{l.assignedTo}</strong>
                        </div>
                        {l.followUpDate && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{t('leads.follow_up', 'Follow-up')}: <strong>{l.followUpDate}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Status Dropdown & Edit Action */}
                      <div className="pt-1 flex items-center gap-1.5">
                        <select
                          value={l.status}
                          onChange={(e) => updateLeadStatus(l.id, e.target.value)}
                          className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-700 focus:outline-none"
                        >
                          {pipelineStages.map((stg) => (
                            <option key={stg} value={stg}>
                              {stg === 'New' ? t('leads.stage_new', 'New') :
                               stg === 'Contacted' ? t('leads.stage_contacted', 'Contacted') :
                               stg === 'Follow-up' ? t('leads.stage_follow_up', 'Follow-up') :
                               stg === 'Quotation Sent' ? t('leads.stage_quotation_sent', 'Quotation Sent') :
                               stg === 'Won' ? t('leads.stage_won', 'Won') :
                               stg === 'Lost' ? t('leads.stage_lost', 'Lost') : stg}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleEditLead(l)}
                          className="p-1 text-slate-400 hover:text-purple-600 hover:bg-slate-100 rounded"
                          title={t('leads.edit_lead', 'Edit Lead')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="p-6 text-center text-slate-400 text-[10px]">{t('leads.no_leads', 'No leads')}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
