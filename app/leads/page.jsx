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
  List,
  Phone,
  Mail,
  Building2,
  Calendar,
  IndianRupee,
} from 'lucide-react';

export default function LeadsPage() {
  const { currentRole, leads, addLead, updateLeadStatus } = useCrm();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.productInterested.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pipelineStages = ['New', 'Contacted', 'Follow-up', 'Quotation Sent', 'Won', 'Lost'];

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <span>Leads & Enterprise Enquiries</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Commercial pipeline management from initial contact to contract execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-xs flex items-center text-xs font-semibold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Pipeline Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List View
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, contact, product..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Stage:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Stages</option>
            {pipelineStages.map((stg) => (
              <option key={stg} value={stg}>{stg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KANBAN PIPELINE BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage);
            const totalStageVal = stageLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);

            return (
              <div
                key={stage}
                className="bg-slate-200/40 rounded-2xl p-3 border border-slate-200 flex flex-col min-w-[260px] min-h-[500px]"
              >
                {/* Column Header */}
                <div className="mb-3 pb-2 border-b border-slate-300">
                  <div className="flex items-center justify-between font-bold text-xs text-slate-800 uppercase tracking-wider">
                    <span>{stage}</span>
                    <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-800 text-[10px] flex items-center justify-center">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-1">
                    ₹{(totalStageVal / 100000).toFixed(1)} Lakhs
                  </div>
                </div>

                {/* Lead Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageLeads.length === 0 ? (
                    <div className="h-28 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-[11px] font-medium">
                      No leads in {stage}
                    </div>
                  ) : (
                    stageLeads.map((l) => (
                      <div
                        key={l.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-slate-400">{l.id}</span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">
                            ₹{(l.estimatedValue / 100000).toFixed(1)}L
                          </span>
                        </div>

                        <div className="font-bold text-slate-900 leading-snug">{l.customerCompany}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{l.productInterested}</div>
                        <div className="text-[10px] text-slate-400">{l.contactPerson}</div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Exec: <strong className="text-slate-700">{l.assignedTo}</strong></span>
                          <span>F/up: {l.followUpDate}</span>
                        </div>

                        {/* Interactive Move Buttons */}
                        <div className="pt-2 flex flex-wrap gap-1">
                          {pipelineStages
                            .filter((s) => s !== stage)
                            .map((targetStage) => (
                              <button
                                key={targetStage}
                                onClick={() => updateLeadStatus(l.id, targetStage)}
                                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px] font-bold"
                              >
                                → {targetStage}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Company / Lead</th>
                  <th className="py-3.5 px-4">Product Interested</th>
                  <th className="py-3.5 px-4">Est. Value</th>
                  <th className="py-3.5 px-4">Assigned Exec</th>
                  <th className="py-3.5 px-4">Follow-up</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4 text-right">Update Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                {filteredLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{l.customerCompany}</div>
                      <div className="text-[11px] text-slate-500">{l.contactPerson} • {l.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{l.productInterested}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ₹{l.estimatedValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{l.assignedTo}</td>
                    <td className="py-3.5 px-4 font-mono">{l.followUpDate}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        l.status === 'Won'
                          ? 'bg-emerald-100 text-emerald-800'
                          : l.status === 'Quotation Sent'
                          ? 'bg-purple-100 text-purple-800'
                          : l.status === 'Lost'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={l.status}
                        onChange={(e) => updateLeadStatus(l.id, e.target.value)}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded font-semibold text-xs"
                      >
                        {pipelineStages.map((stg) => (
                          <option key={stg} value={stg}>{stg}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addLead}
      />
    </Shell>
  );
}
