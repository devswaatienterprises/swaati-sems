'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Repeat,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function RecurringTaskModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
}) {
  const { employees, currentUser, t } = useCrm();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    frequency: 'Daily', // Daily | Weekly | Monthly
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon-Sat default
    dayOfMonth: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    dueTime: '18:30',
    workingDaysOnly: true,
    assignedToId: '',
    active: true,
  });

  const [errorMessage, setErrorMessage] = useState('');

  const activeEmployees = employees.filter((e) => e.status === 'Active');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          priority: initialData.priority || 'Medium',
          frequency: initialData.frequency || 'Daily',
          daysOfWeek: initialData.daysOfWeek || [1, 2, 3, 4, 5, 6],
          dayOfMonth: initialData.dayOfMonth || 1,
          startDate: initialData.startDate || new Date().toISOString().split('T')[0],
          endDate: initialData.endDate || '',
          dueTime: initialData.dueTime || '18:30',
          workingDaysOnly: initialData.workingDaysOnly !== false,
          assignedToId: initialData.assignedToRealId || initialData.assignedToId || (activeEmployees[0]?.realId || activeEmployees[0]?.id || ''),
          active: initialData.active !== false,
        });
      } else {
        setFormData({
          title: '',
          description: '',
          priority: 'Medium',
          frequency: 'Daily',
          daysOfWeek: [1, 2, 3, 4, 5, 6],
          dayOfMonth: 1,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          dueTime: '18:30',
          workingDaysOnly: true,
          assignedToId: activeEmployees[0]?.realId || activeEmployees[0]?.id || '',
          active: true,
        });
      }
      setErrorMessage('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleWeekdayToggle = (dayNum) => {
    setFormData((prev) => {
      const current = prev.daysOfWeek || [];
      const exists = current.includes(dayNum);
      const next = exists ? current.filter((d) => d !== dayNum) : [...current, dayNum];
      return { ...prev, daysOfWeek: next.sort((a, b) => a - b) };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMessage(t('tasks.form.title_required', 'Task Title is required'));
      return;
    }
    if (!formData.assignedToId) {
      setErrorMessage(t('tasks.form.assignee_required', 'Please select an assigned team member'));
      return;
    }
    if (formData.frequency === 'Weekly' && (!formData.daysOfWeek || formData.daysOfWeek.length === 0)) {
      setErrorMessage(t('tasks.recurring.select_weekday_warning', 'Please select at least one day of the week'));
      return;
    }

    onSave(formData);
    onClose();
  };

  const weekdaysList = [
    { num: 1, label: t('common.days.mon', 'Mon') },
    { num: 2, label: t('common.days.tue', 'Tue') },
    { num: 3, label: t('common.days.wed', 'Wed') },
    { num: 4, label: t('common.days.thu', 'Thu') },
    { num: 5, label: t('common.days.fri', 'Fri') },
    { num: 6, label: t('common.days.sat', 'Sat') },
    { num: 7, label: t('common.days.sun', 'Sun') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {initialData
                  ? t('tasks.recurring.edit_title', 'Edit Recurring Task / SOP')
                  : t('tasks.recurring.create_title', 'Create Recurring Task / SOP')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {t(
                  'tasks.recurring.subtitle',
                  'Define routine work once. SEMS will automatically generate standard tasks for the assignee.'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t('tasks.form.title', 'Task Title')} *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Daily Site Safety Inspection & Attendance Log"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t('tasks.form.description', 'Description & Standard Operating Procedure')}
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detail the routine checklist or steps the assignee must perform..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Assignee & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('tasks.form.assigned_to', 'Assigned To')} *
              </label>
              <select
                required
                value={formData.assignedToId}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                {activeEmployees.map((emp) => (
                  <option key={emp.id} value={emp.realId || emp.id}>
                    {emp.name} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('tasks.form.priority', 'Priority')}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="Low">{t('common.priority.low', 'Low')}</option>
                <option value="Medium">{t('common.priority.medium', 'Medium')}</option>
                <option value="High">{t('common.priority.high', 'High')}</option>
                <option value="Urgent">{t('common.priority.urgent', 'Urgent')}</option>
              </select>
            </div>
          </div>

          {/* Recurrence Frequency */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t('tasks.recurring.frequency', 'Recurrence Frequency')} *</span>
              </label>

              {/* Working Days Only Toggle */}
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={formData.workingDaysOnly}
                  onChange={(e) => setFormData({ ...formData, workingDaysOnly: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{t('tasks.recurring.working_days_only', 'Working Days Only (Skip Weekly Offs)')}</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['Daily', 'Weekly', 'Monthly'].map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFormData({ ...formData, frequency: freq })}
                  className={`py-2 px-3 rounded-lg font-bold text-xs border transition-colors cursor-pointer text-center ${
                    formData.frequency === freq
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {freq === 'Daily' && t('tasks.recurring.freq_daily', 'Daily')}
                  {freq === 'Weekly' && t('tasks.recurring.freq_weekly', 'Weekly')}
                  {freq === 'Monthly' && t('tasks.recurring.freq_monthly', 'Monthly')}
                </button>
              ))}
            </div>

            {/* Weekly Days Selector */}
            {formData.frequency === 'Weekly' && (
              <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-600">
                  {t('tasks.recurring.select_weekdays', 'Repeat on days:')}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {weekdaysList.map((day) => {
                    const isSelected = formData.daysOfWeek?.includes(day.num);
                    return (
                      <button
                        key={day.num}
                        type="button"
                        onClick={() => handleWeekdayToggle(day.num)}
                        className={`w-9 h-7 rounded-md text-[11px] font-bold border transition-colors cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-1 ring-indigo-400'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Monthly Day Selector */}
            {formData.frequency === 'Monthly' && (
              <div className="pt-2 border-t border-slate-200/70 flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-600">
                  {t('tasks.recurring.day_of_month', 'Day of Month')}:
                </span>
                <select
                  value={formData.dayOfMonth}
                  onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value, 10) })}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}{d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'} {t('tasks.recurring.of_every_month', 'of every month')}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Schedule Period & Due Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('tasks.recurring.start_date', 'Start Date')} *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('tasks.recurring.end_date', 'End Date (Optional)')}
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('tasks.recurring.due_time', 'Daily Due Time')}
              </label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <div className="font-bold text-slate-800 text-xs">
                {t('tasks.recurring.active_status', 'Active Generation')}
              </div>
              <div className="text-[10px] text-slate-500">
                {t('tasks.recurring.active_desc', 'Pause this SOP to stop future task instances without altering historical ones.')}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, active: !formData.active })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                formData.active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{formData.active ? t('tasks.recurring.status_active', 'Active') : t('tasks.recurring.status_paused', 'Paused')}</span>
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg cursor-pointer"
            >
              {t('common.buttons.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-sm shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>
                {initialData
                  ? t('common.buttons.save', 'Save Changes')
                  : t('tasks.recurring.btn_create', 'Create SOP Schedule')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
