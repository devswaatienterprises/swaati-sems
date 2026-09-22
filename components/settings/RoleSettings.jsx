'use client';

import React, { useState } from 'react';
import { useCrm } from '@/context/CrmContext';
import RoleModal from './RoleModal';
import {
  Shield,
  Plus,
  Edit2,
  Power,
  CheckCircle2,
  Building2,
  Users,
  ListTodo,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';

export default function RoleSettings() {
  const { roles, departments, createRole, updateRole, deactivateRole, t } = useCrm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRoleIds, setExpandedRoleIds] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleSaveRole = async (payload, roleId) => {
    let res;
    if (roleId) {
      res = await updateRole(roleId, payload);
    } else {
      res = await createRole(payload);
    }

    if (res?.success) {
      showToast(
        roleId
          ? t('settings.role_updated', 'Role updated successfully')
          : t('settings.role_created', 'Role created successfully')
      );
    }
    return res;
  };

  const handleToggleStatus = async (role) => {
    const newStatus = !role.active;
    try {
      const res = await deactivateRole(role.id, newStatus);
      if (res?.success) {
        showToast(
          newStatus
            ? t('settings.role_activated', 'Role activated successfully')
            : t('settings.role_deactivated', 'Role deactivated successfully')
        );
      }
    } catch (err) {
      console.error('Status toggle failed:', err);
    }
  };

  const toggleExpandRole = (roleId) => {
    setExpandedRoleIds((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  const filteredRoles = roles || [];

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>{t('settings.roles_title', 'Role & Recurring Tasks Configuration')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('settings.roles_subtitle', 'Define roles per department and configure role-based recurring task templates auto-inherited by employees.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-600/20 flex items-center gap-1.5 shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('settings.create_role', 'Create Role')}</span>
          </button>
        </div>
      </div>

      {/* Roles List */}
      <div className="space-y-3">
        {filteredRoles.map((role) => {
          const deptName = role.department?.name || 'Department';
          const recTasks = role.recurringTasks || [];
          const empCount = role._count?.employees || role.employees?.length || 0;
          const isExpanded = !!expandedRoleIds[role.id];

          return (
            <div
              key={role.id}
              className={`bg-white rounded-2xl border p-4 shadow-xs transition-all ${
                role.active ? 'border-slate-200' : 'border-slate-200 bg-slate-50/60 opacity-80'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start md:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-100">
                    <Shield className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{role.name}</h3>

                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{deptName}</span>
                      </span>

                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          role.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {role.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      {role.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{empCount} Employees</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <ListTodo className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-blue-700 font-bold">{recTasks.length} Configured SOPs</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {recTasks.length > 0 && (
                      <button
                        onClick={() => toggleExpandRole(role.id)}
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-200 transition-colors"
                      >
                        <span>SOP Tasks</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    <button
                      onClick={() => openEditModal(role)}
                      title="Edit Role & SOPs"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleStatus(role)}
                      title={role.active ? 'Deactivate Role' : 'Activate Role'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        role.active
                          ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable SOP Tasks List */}
              {isExpanded && recTasks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 bg-slate-50/70 p-3 rounded-xl border">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Configured Role SOP Tasks ({recTasks.length})
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {recTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{task.title}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-blue-600">{task.frequency}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {task.dueTime || '18:30'}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {task.active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredRoles.length === 0 && (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
            <Shield className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">No roles found</h4>
            <p className="text-xs text-slate-400">
              {searchQuery || selectedDeptFilter !== 'ALL'
                ? 'No roles match your search or department filter.'
                : 'Click "Create Role" to define your organization’s roles and recurring tasks.'}
            </p>
          </div>
        )}
      </div>

      {/* CREATE / EDIT ROLE MODAL */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
        editingRole={editingRole}
      />
    </div>
  );
}
