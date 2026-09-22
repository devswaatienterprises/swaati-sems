'use client';

import React, { useState } from 'react';
import { useCrm } from '@/context/CrmContext';
import {
  Building2,
  Plus,
  Edit2,
  Power,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  Shield,
  Search,
} from 'lucide-react';

export default function DepartmentSettings() {
  const { departments, createDepartment, updateDepartment, deactivateDepartment, t } = useCrm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const openCreateModal = () => {
    setEditingDepartment(null);
    setName('');
    setDescription('');
    setActive(true);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDepartment(dept);
    setName(dept.name || '');
    setDescription(dept.description || '');
    setActive(dept.active !== false);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage(t('settings.department_name_required', 'Department name is required'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        active,
      };

      let res;
      if (editingDepartment) {
        res = await updateDepartment(editingDepartment.id, payload);
      } else {
        res = await createDepartment(payload);
      }

      if (res?.success) {
        showToast(
          editingDepartment
            ? t('settings.department_updated', 'Department updated successfully')
            : t('settings.department_created', 'Department created successfully')
        );
        setIsModalOpen(false);
      } else {
        setErrorMessage(res?.message || 'An error occurred while saving department');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Server connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (dept) => {
    const newStatus = !dept.active;
    try {
      const res = await deactivateDepartment(dept.id, newStatus);
      if (res?.success) {
        showToast(
          newStatus
            ? t('settings.department_activated', 'Department activated successfully')
            : t('settings.department_deactivated', 'Department deactivated successfully')
        );
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const filteredDepartments = (departments || []).filter((d) =>
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toast Banner */}
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
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>{t('settings.departments_title', 'Department Management')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('settings.departments_subtitle', 'Organize organizational units, configure status, and manage department definitions.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-600/20 flex items-center gap-1.5 shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('settings.create_department', 'Create Department')}</span>
          </button>
        </div>
      </div>

      {/* Departments Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map((dept) => {
          const roleCount = dept._count?.roles || dept.roles?.length || 0;
          const empCount = dept._count?.employees || 0;

          return (
            <div
              key={dept.id}
              className={`bg-white rounded-2xl border p-4 shadow-xs transition-all hover:shadow-md relative flex flex-col justify-between ${
                dept.active ? 'border-slate-200' : 'border-slate-200 bg-slate-50/60 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-100">
                      {dept.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dept.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {dept.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(dept)}
                      title="Edit Department"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(dept)}
                      title={dept.active ? 'Deactivate Department' : 'Activate Department'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        dept.active
                          ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                  {dept.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>{roleCount} Roles</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{empCount} Employees</span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredDepartments.length === 0 && (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">No departments found</h4>
            <p className="text-xs text-slate-400">
              {searchQuery
                ? 'No departments match your search criteria.'
                : 'Click "Create Department" to add your organization’s first department.'}
            </p>
          </div>
        )}
      </div>

      {/* CREATE / EDIT DEPARTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>
                  {editingDepartment
                    ? t('settings.edit_department', 'Edit Department')
                    : t('settings.create_department', 'Create Department')}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('settings.department_name', 'Department Name')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical & Operations, Sales & Marketing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('settings.department_description', 'Description (Optional)')}
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the functions of this department..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="deptActive"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="deptActive" className="font-bold text-slate-700 cursor-pointer">
                  {t('settings.department_active_label', 'Active Department Status')}
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingDepartment ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
