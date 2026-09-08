'use client';

import React, { useState } from 'react';
import Shell from '@/components/Shell';
import TaskModal from '@/components/TaskModal';
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
    hasPermission,
    t,
  } = useCrm();

  // Table View is primary / default as required
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline' | 'priority' | 'title' | 'status'

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTaskComments, setSelectedTaskComments] = useState(null);
  const [commentInput, setCommentInput] = useState('');

  const canCreate = hasPermission('tasks.create');
  const canViewTeam = hasPermission('tasks.view_team');
  const canEdit = hasPermission('tasks.edit');
  const canStatus = hasPermission('tasks.status');
  const canComment = hasPermission('tasks.comments');

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

  // Filter & Search
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

  return (
    <Shell>
      {/* Create / Edit Task Modal */}
      <TaskModal
        isOpen={isCreateModalOpen || !!editingTask}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        initialData={editingTask}
        onSave={handleSaveTask}
      />

      {/* Task Comments Modal */}
      {selectedTaskComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Task Notes & Updates</h3>
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
                  <div className="p-6 text-center text-slate-400">No notes posted yet.</div>
                ) : (
                  selectedTaskComments.comments.map((c, i) => (
                    <div key={c.id || i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{c.author}</span>
                        <span className="text-[10px] text-slate-400">{c.time || 'Recent'}</span>
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
                  placeholder="Post progress update or site remark..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-sm flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
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
            <span>Team Tasks & Work Orders</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Assign operational jobs, monitor completion status, due dates, and execution notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
              <span>Table View</span>
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
              <span>Kanban View</span>
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
              <span>Create Task</span>
            </button>
          )}
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
            placeholder="Search task title, Task ID, assignee, description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-bold text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Statuses ({tasks.length})</option>
              {kanbanColumns.map((stg) => (
                <option key={stg} value={stg}>
                  {stg} ({tasks.filter((t) => t.status === stg).length})
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-bold text-[11px]">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Assigned To Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-bold text-[11px]">Assignee:</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Team</option>
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
              <option value="deadline">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="title">Task Title</option>
            </select>
          </div>
        </div>
      </div>      {/* ========================================================== */}
      {/* 1. TABLE LIST VIEW (PRIMARY / DEFAULT) */}
      {/* ========================================================== */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 whitespace-nowrap">Task ID</th>
                  <th className="py-3.5 px-4 max-w-[220px]">Task</th>
                  <th className="py-3.5 px-4 min-w-[125px]">Status</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Priority</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Assigned To</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Assigned By</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Due Date</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Comments</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTasks.map((t) => {
                  const isOverdue =
                    t.deadline &&
                    new Date(t.deadline) < new Date(new Date().setHours(0, 0, 0, 0)) &&
                    t.status !== 'Completed';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Task ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-[11px] whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200/80">
                          {t.taskCode || t.id}
                        </span>
                      </td>

                      {/* 2. Task */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-bold text-slate-900 leading-snug truncate" title={t.title}>
                          {t.title}
                        </div>
                        {t.description && (
                          <div
                            className="text-[11px] text-slate-500 truncate mt-0.5"
                            title={t.description}
                          >
                            {t.description}
                          </div>
                        )}
                      </td>

                      {/* 3. Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={t.status}
                          onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border focus:outline-none cursor-pointer transition-all ${getStatusBadgeClass(
                            t.status
                          )}`}
                        >
                          {kanbanColumns.map((stg) => (
                            <option key={stg} value={stg}>
                              {stg}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* 4. Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] ${getPriorityBadgeClass(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>

                      {/* 5. Assigned To */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                            {(t.assignedTo || 'TM').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-800 truncate max-w-[120px]" title={t.assignedTo}>
                            {t.assignedTo}
                          </span>
                        </div>
                      </td>

                      {/* 6. Assigned By */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {t.assignedBy}
                      </td>

                      {/* 7. Due Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div
                          className={`flex items-center gap-1 text-[11px] font-semibold ${
                            isOverdue || t.status === 'Overdue'
                              ? 'text-rose-600 font-bold'
                              : 'text-slate-600'
                          }`}
                        >
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{t.deadline}</span>
                          {(isOverdue || t.status === 'Overdue') && (
                            <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 8. Comments */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTaskComments(t)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                          title="View / Add Comments"
                        >
                          <MessageSquare className="w-3 h-3 text-slate-500" />
                          <span>{t.comments?.length || 0}</span>
                        </button>
                      </td>

                      {/* 9. Edit */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditingTask(t)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                          title="Edit Task Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
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
                        <span className="font-semibold text-slate-500">No matching tasks found</span>
                        <span className="text-[11px] text-slate-400">
                          Try adjusting your search query or filters.
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
        /* 2. KANBAN VIEW (OPTIONAL TOGGLE) */
        /* ========================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col);

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
                    {col}
                  </span>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow text-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[10px] text-slate-400 font-bold">
                          {t.taskCode || t.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getPriorityBadgeClass(t.priority)}`}>
                          {t.priority}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs leading-snug">{t.title}</h4>

                      {t.description && (
                        <p className="text-slate-500 text-[11px] line-clamp-2">{t.description}</p>
                      )}

                      {/* Explicit Assigned To & Assigned By Details */}
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Assigned To:</span>
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <User className="w-3 h-3 text-blue-600" />
                            {t.assignedTo}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Assigned By:</span>
                          <span className="font-semibold text-slate-600">{t.assignedBy}</span>
                        </div>
                      </div>

                      <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Due: {t.deadline}
                        </span>

                        <button
                          onClick={() => setSelectedTaskComments(t)}
                          className="flex items-center gap-1 text-slate-500 hover:text-amber-600 font-bold"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>{t.comments?.length || 0}</span>
                        </button>
                      </div>

                      {/* Quick Status & Edit */}
                      <div className="pt-1 flex items-center gap-1.5">
                        <select
                          value={t.status}
                          onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                          className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-700 focus:outline-none"
                        >
                          <option value="To Do">Status: To Do</option>
                          <option value="In Progress">Status: In Progress</option>
                          <option value="Completed">Status: Completed</option>
                          <option value="Overdue">Status: Overdue</option>
                        </select>

                        <button
                          onClick={() => setEditingTask(t)}
                          className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-[11px]">
                      No tasks in this stage.
                    </div>
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
