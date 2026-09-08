'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import EmployeeModal from '@/components/EmployeeModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useCrm } from '@/context/CrmContext';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  UserX,
  UserCheck,
  ShieldCheck,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export default function EmployeesPage() {
  const {
    currentRole,
    employees,
    addEmployee,
    updateEmployee,
    deactivateEmployee,
    reactivateEmployee,
    t,
  } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  // Default status filter MUST be Active Members as per requirement
  const [statusFilter, setStatusFilter] = useState('ACTIVE'); // 'ACTIVE' | 'INACTIVE' | 'ALL'
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modals & Editing
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Deactivate Confirm Modal
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (emp.name || '').toLowerCase().includes(term) ||
      (emp.userId || '').toLowerCase().includes(term) ||
      (emp.id || '').toLowerCase().includes(term) ||
      (emp.email || '').toLowerCase().includes(term) ||
      (emp.mobile || '').toLowerCase().includes(term) ||
      (emp.department || '').toLowerCase().includes(term) ||
      (emp.designation || '').toLowerCase().includes(term);

    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') {
      matchesStatus = emp.status === 'Active';
    } else if (statusFilter === 'INACTIVE') {
      matchesStatus = emp.status === 'Inactive';
    } else {
      matchesStatus = true;
    }

    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleDeactivateClick = (emp) => {
    setDeactivateTarget(emp);
  };

  const handleConfirmDeactivate = () => {
    if (deactivateTarget) {
      deactivateEmployee(deactivateTarget.id);
      setDeactivateTarget(null);
    }
  };

  const handleReactivateClick = (emp) => {
    reactivateEmployee(emp.id);
  };

  // Stats
  const activeCount = employees.filter((e) => e.status === 'Active').length;
  const inactiveCount = employees.filter((e) => e.status === 'Inactive').length;

  return (
    <Shell>
      {/* Add / Edit Team Member Modal */}
      <EmployeeModal
        isOpen={isAddModalOpen || !!editingEmployee}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEmployee(null);
        }}
        initialData={editingEmployee}
        onSave={(data, frontFile, backFile) => {
          if (editingEmployee) {
            updateEmployee(editingEmployee.id, data, frontFile, backFile);
            setEditingEmployee(null);
          } else {
            addEmployee(data, frontFile, backFile);
            setIsAddModalOpen(false);
          }
        }}
      />

      {/* Deactivate Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deactivateTarget}
        title="Deactivate Team Member"
        message={`Are you sure you want to deactivate ${deactivateTarget?.name}? They will no longer be able to log in or access SEMS features. Their historical attendance, leaves, and task records will remain safely preserved.`}
        confirmText="Deactivate Member"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Team Members</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage company team member profiles, system access, identity documents, and credentials.
          </p>
        </div>

        {currentRole === 'ADMIN' && (
          <button
            onClick={() => {
              setEditingEmployee(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Members</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{employees.length}</div>
          </div>
          <Users className="w-7 h-7 text-blue-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Active Members</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</div>
          </div>
          <UserCheck className="w-7 h-7 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Deactivated</div>
            <div className="text-2xl font-black text-slate-500 mt-1">{inactiveCount}</div>
          </div>
          <UserX className="w-7 h-7 text-slate-400 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Departments</div>
            <div className="text-2xl font-black text-purple-600 mt-1">4</div>
          </div>
          <Building2 className="w-7 h-7 text-purple-500 opacity-80" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, User ID, mobile, email, department..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end text-xs">
          {/* Status Filter: Default Active Members */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-bold text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ACTIVE">Active Members ({activeCount})</option>
              <option value="INACTIVE">Deactivated Members ({inactiveCount})</option>
              <option value="ALL">All Members ({employees.length})</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-bold text-[11px]">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Departments</option>
              <option value="Technical & Operations">Technical & Operations</option>
              <option value="Sales & Business Dev">Sales & Business Dev</option>
              <option value="Site Execution">Site Execution</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Executive Management">Executive Management</option>
            </select>
          </div>
        </div>
      </div>

      {/* Team Members Table (No Permissions column, No separate Actions/View column, single Edit column) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10 text-[11px]">
              <tr>
                <th className="py-3.5 px-4 min-w-[200px]">Team Member</th>
                <th className="py-3.5 px-4 whitespace-nowrap">User ID</th>
                <th className="py-3.5 px-4 min-w-[200px]">Department & Designation</th>
                <th className="py-3.5 px-4 min-w-[220px]">Mobile & Email</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Team Member Name & Code */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                        {emp.avatar || emp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight">{emp.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{emp.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* User ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                      {emp.userId}
                    </span>
                  </td>

                  {/* Department & Designation */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 leading-snug">{emp.designation}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{emp.department}</div>
                  </td>

                  {/* Mobile & Email */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-800 font-medium font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{emp.mobile}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>

                  {/* Edit Column (Single clean control) */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingEmployee(emp)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5"
                        title="Edit Team Member Profile & Permissions"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </button>

                      {/* Optional inline activation if viewing deactivated members */}
                      {currentRole === 'ADMIN' && emp.role !== 'ADMIN' && (
                        <>
                          {emp.status === 'Inactive' ? (
                            <button
                              onClick={() => handleReactivateClick(emp)}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1 border border-emerald-200"
                              title="Reactivate Member"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Activate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeactivateClick(emp)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Deactivate Member"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-slate-500">No team members found</span>
                      <span className="text-[11px] text-slate-400">
                        {statusFilter === 'INACTIVE'
                          ? 'No deactivated members on record.'
                          : 'Try adjusting your search query or status filter.'}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
