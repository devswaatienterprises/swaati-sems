'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import TaskModal from '@/components/TaskModal';
import RecurringTaskModal from '@/components/RecurringTaskModal';
import { useCrm } from '@/context/CrmContext';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Kanban,
  Table as TableIcon,
  Calendar,
  AlertTriangle,
  User,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  Edit2,
  Edit3,
  ArrowUpDown,
  Repeat,
  Play,
  Pause,
  Trash2,
  Sparkles,
  CalendarDays,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

export default function TasksPage() {
  const {
    currentRole,
    currentUser,
    employees,
    tasks,
    addTask,
    updateTask,
    updateTaskStatus,
    addTaskComment,
    recurringTasks,
    addRecurringTask,
    updateRecurringTask,
    toggleRecurringTaskStatus,
    deleteRecurringTask,
    generateRecurringTasks,
    hasPermission,
    t,
  } = useCrm();

  // Primary Tab: 'tasks' (Standard Tasks) | 'recurring' (Recurring SOPs)
  const [activeTab, setActiveTab] = useState('tasks');

  // Standard Tasks View Mode
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline' | 'priority' | 'title' | 'status'

  // Recurring SOPs Filters
  const [recurringSearchTerm, setRecurringSearchTerm] = useState('');
  const [recurringFreqFilter, setRecurringFreqFilter] = useState('ALL');
  const [recurringStatusFilter, setRecurringStatusFilter] = useState('ALL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateFeedback, setGenerateFeedback] = useState(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRecurringTask, setEditingRecurringTask] = useState(null);
  const [selectedTaskComments, setSelectedTaskComments] = useState(null);
  const [commentInput, setCommentInput] = useState('');

  const canCreate = hasPermission('tasks.create');
  const canViewTeam = hasPermission('tasks.view_team');
  const canEdit = hasPermission('tasks.edit');
  const canStatus = hasPermission('tasks.status');
  const canComment = hasPermission('tasks.comments');

  // Recurring Task permissions
  const canManageRecurring =
    hasPermission('tasks.recurring.create') ||
    hasPermission('tasks.recurring.edit') ||
    currentRole === 'ADMIN' ||
    currentRole === 'OPERATION_HEAD';

  const canViewRecurring =
    hasPermission('tasks.recurring.view') ||
    canManageRecurring ||
    currentRole === 'ADMIN' ||
    currentRole === 'OPERATION_HEAD' ||
    canViewTeam;

  const kanbanColumns = ['To Do', 'In Progress', 'Completed', 'Overdue'];

  // Status Styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'To Do':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Overdue':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold shadow-xs';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Priority Styling
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-800 border border-rose-200 font-extrabold';
      case 'High':
        return 'bg-amber-100 text-amber-800 border border-amber-200 font-bold';
      case 'Medium':
        return 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200 font-medium';
    }
  };

  const isRestrictedEmployee = currentRole !== 'ADMIN' && !canViewTeam;
  const visibleTasks = tasks.filter((task) => {
    if (!isRestrictedEmployee) return true;
    return (
      task.assignedTo === currentUser?.name ||
      task.assignedToId === currentUser?.id ||
      task.assignedToId === currentUser?.realId ||
      task.assignedBy === currentUser?.name
    );
  });

  // Filter & Search for Standard Tasks
  const filteredTasks = visibleTasks
    .filter((task) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (task.title || '').toLowerCase().includes(term) ||
        (task.taskCode || '').toLowerCase().includes(term) ||
        (task.id || '').toLowerCase().includes(term) ||
        (task.assignedTo || '').toLowerCase().includes(term) ||
        (task.assignedBy || '').toLowerCase().includes(term) ||
        (task.description || '').toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'ALL' || task.assignedTo === assigneeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline || '2099-01-01') - new Date(b.deadline || '2099-01-01');
      }
      if (sortBy === 'priority') {
        const pOrder = { Urgent: 1, High: 2, Medium: 3, Low: 4 };
        return (pOrder[a.priority] || 9) - (pOrder[b.priority] || 9);
      }
      if (sortBy === 'status') {
        return (a.status || '').localeCompare(b.status || '');
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return (b.id || '').localeCompare(a.id || '');
    });

  // Filter & Search for Recurring Tasks / SOPs
  const filteredRecurringTasks = (recurringTasks || []).filter((sop) => {
    const term = recurringSearchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (sop.title || '').toLowerCase().includes(term) ||
      (sop.recurringCode || '').toLowerCase().includes(term) ||
      (sop.assignedTo || '').toLowerCase().includes(term) ||
      (sop.description || '').toLowerCase().includes(term);

    const matchesFreq = recurringFreqFilter === 'ALL' || sop.frequency === recurringFreqFilter;
    const matchesStatus =
      recurringStatusFilter === 'ALL' ||
      (recurringStatusFilter === 'ACTIVE' && sop.active) ||
      (recurringStatusFilter === 'PAUSED' && !sop.active);

    return matchesSearch && matchesFreq && matchesStatus;
  });

  const handleAddComment = (e) => {
    e.preventDefault();
    if (selectedTaskComments && commentInput.trim()) {
      addTaskComment(selectedTaskComments.id, commentInput.trim());
      setCommentInput('');
      const updated = tasks.find((t) => t.id === selectedTaskComments.id);
      if (updated) {
        setSelectedTaskComments({
          ...updated,
          comments: [...(updated.comments || []), { author: currentUser.name, text: commentInput.trim(), time: 'Just now' }],
        });
      }
    }
  };

  const handleSaveTask = (formData) => {
    if (editingTask) {
      if (updateTask) {
        updateTask(editingTask.id, formData);
      }
      setEditingTask(null);
    } else {
      addTask(formData);
      setIsCreateModalOpen(false);
    }
  };

  const handleSaveRecurringTask = async (formData) => {
    if (editingRecurringTask) {
      await updateRecurringTask(editingRecurringTask.id, formData);
      setEditingRecurringTask(null);
    } else {
      await addRecurringTask(formData);
      setIsRecurringModalOpen(false);
    }
  };

  const handleManualGenerate = async () => {
    try {
      setIsGenerating(true);
      setGenerateFeedback(null);
      const res = await generateRecurringTasks();
      const count = res?.createdCount ?? 0;
      setGenerateFeedback({
        type: 'success',
        message: t('tasks.recurring.generated_success', `Generated ${count} tasks for today successfully!`),
      });
      setTimeout(() => setGenerateFeedback(null), 4000);
    } catch (err) {
      setGenerateFeedback({
        type: 'error',
        message: t('tasks.recurring.generate_error', 'Failed to generate recurring tasks.'),
      });
      setTimeout(() => setGenerateFeedback(null), 4000);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDaysOfWeek = (days = []) => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (!days || days.length === 0) return 'None';
    if (days.length === 6 && !days.includes(7)) return 'Mon - Sat (Working Days)';
    if (days.length === 7) return 'Every Day (Mon - Sun)';
    return days.map((d) => dayNames[d - 1] || `D${d}`).join(', ');
  };

  return (
    <Shell>
      {/* Create / Edit Standard Task Modal */}
      <TaskModal
        isOpen={isCreateModalOpen || !!editingTask}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        initialData={editingTask}
        onSave={handleSaveTask}
      />

      {/* Create / Edit Recurring Task Modal */}
      <RecurringTaskModal
        isOpen={isRecurringModalOpen || !!editingRecurringTask}
        onClose={() => {
          setIsRecurringModalOpen(false);
          setEditingRecurringTask(null);
        }}
        initialData={editingRecurringTask}
        onSave={handleSaveRecurringTask}
      />

      {/* Task Comments Modal */}
      {selectedTaskComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{t('tasks.notes_updates', 'Task Notes & Updates')}</h3>
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-[280px]">
                  {selectedTaskComments.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedTaskComments(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {!selectedTaskComments.comments || selectedTaskComments.comments.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">{t('tasks.no_notes', 'No notes posted yet.')}</div>
                ) : (
                  selectedTaskComments.comments.map((c, i) => (
                    <div key={c.id || i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{c.author}</span>
                        <span className="text-[10px] text-slate-400">{c.time || t('common.recent', 'Recent')}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={t('tasks.post_update_placeholder', 'Post progress update or site remark...')}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-sm flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('common.send', 'Send')}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-amber-600" />
            <span>{t('tasks.title', 'Team Tasks & Work Orders')}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('tasks.subtitle', 'Assign operational jobs, monitor completion status, due dates, and execution notes.')}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          {activeTab === 'tasks' && (
            <>
              {/* View Toggle: Table View is Default */}
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
                  <span>{t('tasks.table_view', 'Table View')}</span>
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
                  <span>{t('tasks.kanban_view', 'Kanban View')}</span>
                </button>
              </div>

              {canCreate && (
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs shadow-sm shadow-amber-600/20 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('tasks.create_task', 'Create Task')}</span>
                </button>
              )}
            </>
          )}

          {activeTab === 'recurring' && canManageRecurring && (
            <>
              <button
                onClick={handleManualGenerate}
                disabled={isGenerating}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer border border-slate-200"
                title={t('tasks.recurring.generate_now_hint', "Trigger today's SOP task generation immediately")}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? t('common.generating', 'Generating...') : t('tasks.recurring.generate_today', "Generate Today's SOPs")}</span>
              </button>

              <button
                onClick={() => {
                  setEditingRecurringTask(null);
                  setIsRecurringModalOpen(true);
                }}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-sm shadow-purple-600/20 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('tasks.recurring.create_sop', 'Create SOP')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>{t('tasks.tab_tasks', 'Standard Tasks')}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'tasks' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {tasks.length}
          </span>
        </button>

        {canViewRecurring && (
          <button
            onClick={() => setActiveTab('recurring')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'recurring'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Repeat className="w-4 h-4" />
            <span>{t('tasks.tab_recurring_sops', 'Recurring SOPs')}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'recurring' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {recurringTasks.length}
            </span>
          </button>
        )}
      </div>

      {/* Generate Feedback Alert */}
      {generateFeedback && (
        <div
          className={`p-3.5 mb-5 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
            generateFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {generateFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{generateFeedback.message}</span>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 1: STANDARD TASKS (TABLE OR KANBAN) */}
      {/* ========================================================== */}
      {activeTab === 'tasks' && (
        <>
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('tasks.search_placeholder', 'Search task title, Task ID, assignee, description...')}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end text-xs">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-400 font-bold text-[11px]">{t('tasks.status', 'Status')}:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">
                    {t('tasks.all_statuses', 'All Statuses')} ({tasks.length})
                  </option>
                  {kanbanColumns.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg === 'To Do'
                        ? t('tasks.status_todo', 'To Do')
                        : stg === 'In Progress'
                        ? t('tasks.status_in_progress', 'In Progress')
                        : stg === 'Completed'
                        ? t('tasks.status_completed', 'Completed')
                        : stg === 'Overdue'
                        ? t('tasks.status_overdue', 'Overdue')
                        : stg}{' '}
                      ({tasks.filter((t) => t.status === stg).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-400 font-bold text-[11px]">{t('tasks.priority', 'Priority')}:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">{t('tasks.all_priorities', 'All Priorities')}</option>
                  <option value="Urgent">{t('tasks.priority_urgent', 'Urgent')}</option>
                  <option value="High">{t('tasks.priority_high', 'High')}</option>
                  <option value="Medium">{t('tasks.priority_medium', 'Medium')}</option>
                  <option value="Low">{t('tasks.priority_low', 'Low')}</option>
                </select>
              </div>

              {/* Assigned To Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-400 font-bold text-[11px]">{t('tasks.assignee', 'Assignee')}:</span>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">{t('tasks.all_team', 'All Team')}</option>
                  {employees
                    .filter((e) => e.status === 'Active')
                    .map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="deadline">{t('tasks.due_date', 'Due Date')}</option>
                  <option value="priority">{t('tasks.priority', 'Priority')}</option>
                  <option value="status">{t('tasks.status', 'Status')}</option>
                  <option value="title">{t('tasks.task_title', 'Task Title')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE VIEW (PRIMARY / DEFAULT) */}
          {viewMode === 'table' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10 text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4 whitespace-nowrap">{t('tasks.task_id', 'Task ID')}</th>
                      <th className="py-3.5 px-4 max-w-[220px]">{t('tasks.task_title', 'Task')}</th>
                      <th className="py-3.5 px-4 min-w-[125px]">{t('tasks.status', 'Status')}</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">{t('tasks.priority', 'Priority')}</th>
                      <th className="py-3.5 px-4 min-w-[140px]">{t('tasks.assigned_to', 'Assigned To')}</th>
                      <th className="py-3.5 px-4 min-w-[130px]">{t('tasks.assigned_by', 'Assigned By')}</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">{t('tasks.due_date', 'Due Date')}</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap">{t('tasks.comments', 'Comments')}</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap">{t('common.edit', 'Edit')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredTasks.map((tItem) => {
                      const isOverdue =
                        tItem.deadline &&
                        new Date(tItem.deadline) < new Date(new Date().setHours(0, 0, 0, 0)) &&
                        tItem.status !== 'Completed';

                      return (
                        <tr key={tItem.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* 1. Task ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-[11px] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200/80">
                                {tItem.taskCode || tItem.id}
                              </span>
                              {(tItem.isRecurring || tItem.recurringTaskId) && (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200"
                                  title={t('tasks.recurring.recurring_sop_instance', 'Auto-generated Recurring SOP')}
                                >
                                  <Repeat className="w-2.5 h-2.5" />
                                  <span>SOP</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 2. Task */}
                          <td className="py-3.5 px-4 max-w-[220px]">
                            <div className="font-bold text-slate-900 leading-snug truncate" title={tItem.title}>
                              {tItem.title}
                            </div>
                            {tItem.description && (
                              <div
                                className="text-[11px] text-slate-500 truncate mt-0.5"
                                title={tItem.description}
                              >
                                {tItem.description}
                              </div>
                            )}
                          </td>

                          {/* 3. Status */}
                          <td className="py-3.5 px-4">
                            <select
                              value={tItem.status}
                              onChange={(e) => updateTaskStatus(tItem.id, e.target.value)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border focus:outline-none cursor-pointer transition-all ${getStatusBadgeClass(
                                tItem.status
                              )}`}
                            >
                              {kanbanColumns.map((stg) => (
                                <option key={stg} value={stg}>
                                  {stg === 'To Do'
                                    ? t('tasks.status_todo', 'To Do')
                                    : stg === 'In Progress'
                                    ? t('tasks.status_in_progress', 'In Progress')
                                    : stg === 'Completed'
                                    ? t('tasks.status_completed', 'Completed')
                                    : stg === 'Overdue'
                                    ? t('tasks.status_overdue', 'Overdue')
                                    : stg}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* 4. Priority */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] ${getPriorityBadgeClass(tItem.priority)}`}>
                              {tItem.priority === 'Urgent'
                                ? t('tasks.priority_urgent', 'Urgent')
                                : tItem.priority === 'High'
                                ? t('tasks.priority_high', 'High')
                                : tItem.priority === 'Medium'
                                ? t('tasks.priority_medium', 'Medium')
                                : tItem.priority === 'Low'
                                ? t('tasks.priority_low', 'Low')
                                : tItem.priority}
                            </span>
                          </td>

                          {/* 5. Assigned To */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                {(tItem.assignedTo || 'TM').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-800 truncate max-w-[120px]" title={tItem.assignedTo}>
                                {tItem.assignedTo}
                              </span>
                            </div>
                          </td>

                          {/* 6. Assigned By */}
                          <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                            {tItem.assignedBy}
                          </td>

                          {/* 7. Due Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div
                              className={`flex items-center gap-1 text-[11px] font-semibold ${
                                isOverdue || tItem.status === 'Overdue'
                                  ? 'text-rose-600 font-bold'
                                  : 'text-slate-600'
                              }`}
                            >
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{tItem.deadline}</span>
                              {(isOverdue || tItem.status === 'Overdue') && (
                                <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                                  {t('tasks.status_overdue', 'Overdue')}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 8. Comments */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => setSelectedTaskComments(tItem)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title={t('tasks.notes_updates', 'View / Add Comments')}
                            >
                              <MessageSquare className="w-3 h-3 text-slate-500" />
                              <span>{tItem.comments?.length || 0}</span>
                            </button>
                          </td>

                          {/* 9. Edit */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setEditingTask(tItem)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              title={t('tasks.edit_task', 'Edit Task Details')}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{t('common.edit', 'Edit')}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredTasks.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <CheckSquare className="w-8 h-8 text-slate-300" />
                            <span className="font-semibold text-slate-500">
                              {t('tasks.no_tasks_found', 'No matching tasks found')}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {t('tasks.no_tasks_filter_hint', 'Try adjusting your search query or filters.')}
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
            /* KANBAN VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {kanbanColumns.map((col) => {
                const colTasks = filteredTasks.filter((tItem) => tItem.status === col);

                return (
                  <div key={col} className="bg-slate-100/70 rounded-2xl p-4 flex flex-col min-h-[500px]">
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            col === 'To Do'
                              ? 'bg-blue-500'
                              : col === 'In Progress'
                              ? 'bg-amber-500'
                              : col === 'Completed'
                              ? 'bg-emerald-500'
                              : 'bg-rose-500'
                          }`}
                        ></span>
                        {col === 'To Do'
                          ? t('tasks.status_todo', 'To Do')
                          : col === 'In Progress'
                          ? t('tasks.status_in_progress', 'In Progress')
                          : col === 'Completed'
                          ? t('tasks.status_completed', 'Completed')
                          : col === 'Overdue'
                          ? t('tasks.status_overdue', 'Overdue')
                          : col}
                      </span>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Cards Container */}
                    <div className="flex-1 space-y-3 overflow-y-auto">
                      {colTasks.map((tItem) => (
                        <div
                          key={tItem.id}
                          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow text-xs space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-slate-400 font-bold">
                                {tItem.taskCode || tItem.id}
                              </span>
                              {(tItem.isRecurring || tItem.recurringTaskId) && (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200"
                                  title="Recurring SOP"
                                >
                                  <Repeat className="w-2.5 h-2.5" />
                                  SOP
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getPriorityBadgeClass(tItem.priority)}`}>
                              {tItem.priority === 'Urgent'
                                ? t('tasks.priority_urgent', 'Urgent')
                                : tItem.priority === 'High'
                                ? t('tasks.priority_high', 'High')
                                : tItem.priority === 'Medium'
                                ? t('tasks.priority_medium', 'Medium')
                                : tItem.priority === 'Low'
                                ? t('tasks.priority_low', 'Low')
                                : tItem.priority}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-xs leading-snug">{tItem.title}</h4>

                          {tItem.description && (
                            <p className="text-slate-500 text-[11px] line-clamp-2">{tItem.description}</p>
                          )}

                          {/* Explicit Assigned To & Assigned By Details */}
                          <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-medium">{t('tasks.assigned_to', 'Assigned To')}:</span>
                              <span className="font-bold text-slate-800 flex items-center gap-1">
                                <User className="w-3 h-3 text-blue-600" />
                                {tItem.assignedTo}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-medium">{t('tasks.assigned_by', 'Assigned By')}:</span>
                              <span className="font-semibold text-slate-600">{tItem.assignedBy}</span>
                            </div>
                          </div>

                          <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 font-medium text-slate-500">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {t('tasks.due_prefix', 'Due')}: {tItem.deadline}
                            </span>

                            <button
                              onClick={() => setSelectedTaskComments(tItem)}
                              className="flex items-center gap-1 text-slate-500 hover:text-amber-600 font-bold cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>{tItem.comments?.length || 0}</span>
                            </button>
                          </div>

                          {/* Quick Status & Edit */}
                          <div className="pt-1 flex items-center gap-1.5">
                            <select
                              value={tItem.status}
                              onChange={(e) => updateTaskStatus(tItem.id, e.target.value)}
                              className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                            >
                              <option value="To Do">{t('tasks.status', 'Status')}: {t('tasks.status_todo', 'To Do')}</option>
                              <option value="In Progress">{t('tasks.status', 'Status')}: {t('tasks.status_in_progress', 'In Progress')}</option>
                              <option value="Completed">{t('tasks.status', 'Status')}: {t('tasks.status_completed', 'Completed')}</option>
                              <option value="Overdue">{t('tasks.status', 'Status')}: {t('tasks.status_overdue', 'Overdue')}</option>
                            </select>

                            <button
                              onClick={() => setEditingTask(tItem)}
                              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded cursor-pointer"
                              title={t('tasks.edit_task', 'Edit Task')}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {colTasks.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-[11px]">
                          {t('tasks.no_tasks_stage', 'No tasks in this stage.')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================== */}
      {/* TAB 2: RECURRING TASKS / SOPS */}
      {/* ========================================================== */}
      {activeTab === 'recurring' && canViewRecurring && (
        <div className="space-y-6">
          {/* Informational Intro Card */}
          <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-purple-950 text-sm">
                  {t('tasks.recurring.info_title', 'Automated Daily & Recurring SOPs')}
                </h3>
                <p className="text-purple-800 text-[11px] leading-relaxed mt-0.5 max-w-2xl">
                  {t(
                    'tasks.recurring.info_desc',
                    'Configure standard operating procedures once. SEMS will automatically generate fresh tasks on scheduled working days, assign them to team members, and track end-of-day completion without manual overhead.'
                  )}
                </p>
              </div>
            </div>

            {canManageRecurring && (
              <button
                onClick={() => {
                  setEditingRecurringTask(null);
                  setIsRecurringModalOpen(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{t('tasks.recurring.create_sop', 'Create SOP')}</span>
              </button>
            )}
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={recurringSearchTerm}
                onChange={(e) => setRecurringSearchTerm(e.target.value)}
                placeholder={t('tasks.recurring.search_placeholder', 'Search SOP title, SOP ID, assignee...')}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-start sm:justify-end text-xs">
              {/* Frequency Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-400 font-bold text-[11px]">{t('tasks.recurring.frequency', 'Frequency')}:</span>
                <select
                  value={recurringFreqFilter}
                  onChange={(e) => setRecurringFreqFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">{t('common.all', 'All')}</option>
                  <option value="Daily">{t('tasks.recurring.daily', 'Daily')}</option>
                  <option value="Weekly">{t('tasks.recurring.weekly', 'Weekly')}</option>
                  <option value="Monthly">{t('tasks.recurring.monthly', 'Monthly')}</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-400 font-bold text-[11px]">{t('tasks.status', 'Status')}:</span>
                <select
                  value={recurringStatusFilter}
                  onChange={(e) => setRecurringStatusFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">{t('common.all', 'All')}</option>
                  <option value="ACTIVE">{t('tasks.recurring.active_status', 'Active')}</option>
                  <option value="PAUSED">{t('tasks.recurring.paused_status', 'Paused')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* SOPs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 whitespace-nowrap">{t('tasks.recurring.sop_id', 'SOP Code')}</th>
                    <th className="py-3.5 px-4 min-w-[200px]">{t('tasks.task_title', 'SOP Title')}</th>
                    <th className="py-3.5 px-4 min-w-[140px]">{t('tasks.recurring.schedule', 'Frequency & Days')}</th>
                    <th className="py-3.5 px-4 min-w-[130px]">{t('tasks.assigned_to', 'Assigned To')}</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">{t('tasks.priority', 'Priority')}</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">{t('tasks.recurring.due_time', 'Due Time')}</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">{t('tasks.status', 'Status')}</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">{t('common.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredRecurringTasks.map((sop) => {
                    return (
                      <tr key={sop.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* 1. SOP Code */}
                        <td className="py-3.5 px-4 font-mono font-bold text-purple-700 text-[11px] whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-purple-50 rounded border border-purple-200">
                            {sop.recurringCode || sop.id}
                          </span>
                        </td>

                        {/* 2. SOP Title */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 leading-snug">{sop.title}</div>
                          {sop.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{sop.description}</p>
                          )}
                        </td>

                        {/* 3. Frequency & Days */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-purple-600" />
                              {sop.frequency === 'Daily'
                                ? t('tasks.recurring.daily', 'Daily')
                                : sop.frequency === 'Weekly'
                                ? t('tasks.recurring.weekly', 'Weekly')
                                : t('tasks.recurring.monthly', 'Monthly')}
                            </span>
                            <div className="text-[10px] text-slate-500">
                              {sop.frequency === 'Weekly' ? (
                                formatDaysOfWeek(sop.daysOfWeek)
                              ) : sop.frequency === 'Monthly' ? (
                                <span>Day {sop.dayOfMonth} of month</span>
                              ) : sop.workingDaysOnly ? (
                                <span className="text-emerald-700 font-semibold">{t('tasks.recurring.working_days_only', 'Mon-Sat (Working Days)')}</span>
                              ) : (
                                <span>All 7 Days</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 4. Assigned To */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                              {(sop.assignedTo || 'TM').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-800 truncate max-w-[120px]" title={sop.assignedTo}>
                              {sop.assignedTo}
                            </span>
                          </div>
                        </td>

                        {/* 5. Priority */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] ${getPriorityBadgeClass(sop.priority)}`}>
                            {sop.priority === 'Urgent'
                              ? t('tasks.priority_urgent', 'Urgent')
                              : sop.priority === 'High'
                              ? t('tasks.priority_high', 'High')
                              : sop.priority === 'Medium'
                              ? t('tasks.priority_medium', 'Medium')
                              : sop.priority === 'Low'
                              ? t('tasks.priority_low', 'Low')
                              : sop.priority}
                          </span>
                        </td>

                        {/* 6. Due Time */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{sop.dueTime || '18:30'}</span>
                          </div>
                        </td>

                        {/* 7. Status & Toggle */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {canManageRecurring ? (
                            <button
                              onClick={() => toggleRecurringTaskStatus(sop.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 border transition-all cursor-pointer ${
                                sop.active
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                              }`}
                              title={sop.active ? t('tasks.recurring.pause_sop', 'Click to Pause') : t('tasks.recurring.activate_sop', 'Click to Activate')}
                            >
                              {sop.active ? <Play className="w-2.5 h-2.5 fill-current" /> : <Pause className="w-2.5 h-2.5" />}
                              <span>{sop.active ? t('tasks.recurring.active_status', 'Active') : t('tasks.recurring.paused_status', 'Paused')}</span>
                            </button>
                          ) : (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                sop.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {sop.active ? t('tasks.recurring.active_status', 'Active') : t('tasks.recurring.paused_status', 'Paused')}
                            </span>
                          )}
                        </td>

                        {/* 8. Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {canManageRecurring && (
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setEditingRecurringTask(sop)}
                                className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                title={t('common.edit', 'Edit SOP')}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(t('tasks.recurring.confirm_delete', 'Are you sure you want to delete this Recurring SOP? Generated past tasks will remain intact.'))) {
                                    deleteRecurringTask(sop.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title={t('common.delete', 'Delete SOP')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredRecurringTasks.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Repeat className="w-8 h-8 text-slate-300" />
                          <span className="font-semibold text-slate-500">
                            {t('tasks.recurring.no_sops_found', 'No recurring SOPs configured')}
                          </span>
                          <span className="text-[11px] text-slate-400 max-w-sm">
                            {t('tasks.recurring.no_sops_hint', 'Define routine daily, weekly, or monthly tasks once to automate team workflows.')}
                          </span>
                          {canManageRecurring && (
                            <button
                              onClick={() => {
                                setEditingRecurringTask(null);
                                setIsRecurringModalOpen(true);
                              }}
                              className="mt-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              + {t('tasks.recurring.create_sop', 'Create First SOP')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
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
