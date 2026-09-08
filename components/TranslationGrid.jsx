'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Languages,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  Lock,
  Unlock,
  Sparkles,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  X,
  AlertTriangle,
  FileText,
  CheckCheck,
  Edit3,
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function TranslationGrid() {
  const {
    currentRole,
    contentItems,
    isLoadingContent,
    fetchContentItems,
    saveContentRow,
    createContentItem,
    importContentCsv,
    renameContentAlias,
  } = useCrm();

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'MISSING_MR' | 'MISSING_HI' | 'DIRTY'
  const [sortBy, setSortBy] = useState('alias'); // 'alias' | 'module' | 'updatedAt'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Edit Buffer: { [alias]: { en, mr, hi, description, module } }
  const [editBuffer, setEditBuffer] = useState({});
  const [savingRows, setSavingRows] = useState({});
  const [toast, setToast] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [historyModalItem, setHistoryModalItem] = useState(null);
  const [aliasRenameItem, setAliasRenameItem] = useState(null);
  const [newAliasValue, setNewAliasValue] = useState('');

  // New Content Item Form State
  const [newItemForm, setNewItemForm] = useState({
    alias: '',
    module: 'global',
    description: '',
    en: '',
    mr: '',
    hi: '',
  });

  // CSV Import State
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreviewRows, setCsvPreviewRows] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch all content items on mount
  useEffect(() => {
    fetchContentItems();
  }, [fetchContentItems]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Modules List for Filter
  const availableModules = useMemo(() => {
    const mods = new Set(['global', 'dashboard', 'attendance', 'leave', 'tasks', 'leads', 'products', 'reports', 'messages', 'notifications', 'navigation', 'settings']);
    contentItems.forEach((item) => {
      if (item.module) mods.add(item.module);
    });
    return Array.from(mods).sort();
  }, [contentItems]);

  // Handle cell text change
  const handleCellChange = (alias, field, value, originalItem) => {
    setEditBuffer((prev) => {
      const current = prev[alias] || {
        en: originalItem.en,
        mr: originalItem.mr,
        hi: originalItem.hi,
        description: originalItem.description,
        module: originalItem.module,
      };

      const updated = {
        ...current,
        [field]: value,
      };

      // Check if identical to original
      const isUnchanged =
        updated.en === originalItem.en &&
        updated.mr === originalItem.mr &&
        updated.hi === originalItem.hi &&
        updated.description === originalItem.description &&
        updated.module === originalItem.module;

      if (isUnchanged) {
        const next = { ...prev };
        delete next[alias];
        return next;
      }

      return {
        ...prev,
        [alias]: updated,
      };
    });
  };

  // Revert row edits
  const handleRevertRow = (alias) => {
    setEditBuffer((prev) => {
      const next = { ...prev };
      delete next[alias];
      return next;
    });
  };

  // Save single row
  const handleSaveRow = async (item) => {
    const alias = item.alias;
    const edits = editBuffer[alias];
    if (!edits) return;

    setSavingRows((prev) => ({ ...prev, [alias]: true }));
    const payload = {
      contentKey: alias,
      alias,
      en: edits.en !== undefined ? edits.en : item.en,
      mr: edits.mr !== undefined ? edits.mr : item.mr,
      hi: edits.hi !== undefined ? edits.hi : item.hi,
      description: edits.description !== undefined ? edits.description : item.description,
      module: edits.module !== undefined ? edits.module : item.module,
    };

    const res = await saveContentRow(payload);
    setSavingRows((prev) => ({ ...prev, [alias]: false }));

    if (res.success) {
      handleRevertRow(alias);
      showToast(`Saved translations for '${alias}'`);
    } else {
      showToast(res.error || 'Failed to save translations', 'error');
    }
  };

  // Save all modified rows
  const handleSaveAllModified = async () => {
    const dirtyAliases = Object.keys(editBuffer);
    if (dirtyAliases.length === 0) return;

    let savedCount = 0;
    for (const alias of dirtyAliases) {
      const item = contentItems.find((i) => i.alias === alias);
      if (item) {
        const edits = editBuffer[alias];
        const res = await saveContentRow({
          contentKey: alias,
          alias,
          en: edits.en !== undefined ? edits.en : item.en,
          mr: edits.mr !== undefined ? edits.mr : item.mr,
          hi: edits.hi !== undefined ? edits.hi : item.hi,
          description: edits.description !== undefined ? edits.description : item.description,
          module: edits.module !== undefined ? edits.module : item.module,
        });
        if (res.success) savedCount++;
      }
    }

    setEditBuffer({});
    showToast(`Successfully saved ${savedCount} modified translation rows!`);
  };

  // Create new content item
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newItemForm.alias.trim()) {
      showToast('Alias / Content Key is required', 'error');
      return;
    }

    const res = await createContentItem({
      contentKey: newItemForm.alias.trim(),
      alias: newItemForm.alias.trim(),
      module: newItemForm.module.trim() || 'global',
      description: newItemForm.description.trim(),
      en: newItemForm.en,
      mr: newItemForm.mr,
      hi: newItemForm.hi,
    });

    if (res.success) {
      setIsAddModalOpen(false);
      setNewItemForm({ alias: '', module: 'global', description: '', en: '', mr: '', hi: '' });
      showToast(`Created new content item '${res.data.alias}'`);
    } else {
      showToast(res.error || 'Failed to create item', 'error');
    }
  };

  // Rename Alias Submit
  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!aliasRenameItem || !newAliasValue.trim()) return;

    const res = await renameContentAlias(aliasRenameItem.id, newAliasValue.trim());
    if (res.success) {
      setAliasRenameItem(null);
      setNewAliasValue('');
      showToast('Alias successfully renamed');
    } else {
      showToast(res.error || 'Failed to rename alias', 'error');
    }
  };

  // CSV Export: Alias,English,Marathi,Hindi,Module,Description
  const handleExportCsv = () => {
    const headers = ['Alias', 'English', 'Marathi', 'Hindi', 'Module', 'Description'];
    const rows = filteredItems.map((item) => {
      const live = editBuffer[item.alias] || item;
      const escape = (str) => {
        const val = (str || '').replace(/"/g, '""');
        return `"${val}"`;
      };
      return [
        escape(item.alias),
        escape(live.en),
        escape(live.mr),
        escape(live.hi),
        escape(live.module),
        escape(live.description),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sems_translations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredItems.length} translations to CSV`);
  };

  // Parse CSV Helper
  const parseCSVText = (text) => {
    const lines = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c !== '')) lines.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c !== '')) lines.push(currentRow);
    }

    if (lines.length < 2) return [];

    const header = lines[0].map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));
    const aliasIdx = header.findIndex((h) => h.includes('alias') || h.includes('key'));
    const enIdx = header.findIndex((h) => h.includes('en') || h.includes('english'));
    const mrIdx = header.findIndex((h) => h.includes('mr') || h.includes('marathi'));
    const hiIdx = header.findIndex((h) => h.includes('hi') || h.includes('hindi'));
    const modIdx = header.findIndex((h) => h.includes('module') || h.includes('category'));
    const descIdx = header.findIndex((h) => h.includes('desc'));

    return lines.slice(1).map((row) => ({
      Alias: aliasIdx >= 0 ? row[aliasIdx] || '' : row[0] || '',
      English: enIdx >= 0 ? row[enIdx] || '' : '',
      Marathi: mrIdx >= 0 ? row[mrIdx] || '' : '',
      Hindi: hiIdx >= 0 ? row[hiIdx] || '' : '',
      Module: modIdx >= 0 ? row[modIdx] || 'global' : 'global',
      Description: descIdx >= 0 ? row[descIdx] || '' : '',
    }));
  };

  const handleCsvFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const parsed = parseCSVText(text);
        const valid = [];
        const errs = [];
        const seen = new Set();

        parsed.forEach((row, idx) => {
          if (!row.Alias) {
            errs.push(`Row ${idx + 2}: Missing Alias key.`);
          } else if (seen.has(row.Alias)) {
            errs.push(`Row ${idx + 2}: Duplicate Alias '${row.Alias}'.`);
          } else {
            seen.add(row.Alias);
            valid.push(row);
          }
        });

        setCsvPreviewRows(valid);
        setCsvErrors(errs);
      } catch (err) {
        setCsvErrors(['Failed to parse CSV file: ' + err.message]);
      }
    };
    reader.readAsText(file);
  };

  const handleCsvImportSubmit = async () => {
    if (csvPreviewRows.length === 0) return;
    setIsImporting(true);

    const res = await importContentCsv(csvPreviewRows);
    setIsImporting(false);

    if (res?.success) {
      setIsImportModalOpen(false);
      setCsvFile(null);
      setCsvPreviewRows([]);
      setCsvErrors([]);
      showToast(`Imported ${res.data?.totalProcessed || csvPreviewRows.length} translations successfully!`);
    } else {
      showToast(res?.message || 'Import failed', 'error');
    }
  };

  // Filter & Search
  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return contentItems
      .filter((item) => {
        const live = editBuffer[item.alias] || item;
        const matchesSearch =
          !term ||
          item.alias.toLowerCase().includes(term) ||
          (live.en || '').toLowerCase().includes(term) ||
          (live.mr || '').toLowerCase().includes(term) ||
          (live.hi || '').toLowerCase().includes(term) ||
          (live.description || '').toLowerCase().includes(term) ||
          (live.module || '').toLowerCase().includes(term);

        const matchesModule = moduleFilter === 'ALL' || item.module === moduleFilter;

        let matchesStatus = true;
        if (statusFilter === 'MISSING_MR') matchesStatus = !live.mr || live.mr.trim() === '';
        if (statusFilter === 'MISSING_HI') matchesStatus = !live.hi || live.hi.trim() === '';
        if (statusFilter === 'DIRTY') matchesStatus = !!editBuffer[item.alias];

        return matchesSearch && matchesModule && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        if (sortBy === 'updatedAt') {
          valA = new Date(a.updatedAt || 0).getTime();
          valB = new Date(b.updatedAt || 0).getTime();
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [contentItems, searchTerm, moduleFilter, statusFilter, sortBy, sortOrder, editBuffer]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const dirtyCount = Object.keys(editBuffer).length;

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5 ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Action Toolbar Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Languages className="w-4 h-4" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                SEMS Translation & Copywriting Grid
              </h2>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                {filteredItems.length} Total Keys
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              One row per alias. Edit English, Marathi, and Hindi side-by-side with automatic real-time sync across SEMS.
            </p>
          </div>

          {/* Top Actions: Add Item, CSV Import, CSV Export, Batch Save */}
          <div className="flex flex-wrap items-center gap-2">
            {dirtyCount > 0 && (
              <button
                type="button"
                onClick={handleSaveAllModified}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer animate-pulse"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All ({dirtyCount} Modified)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Key / Alias</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by alias, English, Marathi, or Hindi text..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Modules ({availableModules.length})</option>
              {availableModules.map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Status / Missing Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Rows</option>
              <option value="MISSING_MR">Missing Marathi</option>
              <option value="MISSING_HI">Missing Hindi</option>
              {dirtyCount > 0 && <option value="DIRTY">Unsaved Changes ({dirtyCount})</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Spreadsheet Data Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            {/* Sticky Header */}
            <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
              <tr>
                <th className="py-3 px-3.5 w-56">
                  <div
                    className="flex items-center gap-1.5 cursor-pointer hover:text-blue-300"
                    onClick={() => {
                      if (sortBy === 'alias') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('alias'); setSortOrder('asc'); }
                    }}
                  >
                    <span>Alias (Key)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5 min-w-[200px]">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>English</span>
                  </div>
                </th>
                <th className="py-3 px-3.5 min-w-[200px]">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    <span>मराठी (Marathi)</span>
                  </div>
                </th>
                <th className="py-3 px-3.5 min-w-[200px]">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>हिंदी (Hindi)</span>
                  </div>
                </th>
                <th className="py-3 px-3.5 w-28">Module</th>
                <th className="py-3 px-3.5 w-44">Description</th>
                <th className="py-3 px-3.5 w-28 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoadingContent ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    Loading translation database...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No translation keys matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const edits = editBuffer[item.alias];
                  const isDirty = Boolean(edits);
                  const isSaving = Boolean(savingRows[item.alias]);

                  const currentEn = edits?.en !== undefined ? edits.en : item.en;
                  const currentMr = edits?.mr !== undefined ? edits.mr : item.mr;
                  const currentHi = edits?.hi !== undefined ? edits.hi : item.hi;
                  const currentDesc = edits?.description !== undefined ? edits.description : item.description;

                  return (
                    <tr
                      key={item.id || item.alias}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isDirty ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Alias Column (Locked by default, with quick unlock action) */}
                      <td className="py-2.5 px-3.5 align-top">
                        <div className="flex items-center gap-1.5 group">
                          <code
                            className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 select-all truncate block max-w-[200px]"
                            title={item.alias}
                          >
                            {item.alias}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              setAliasRenameItem(item);
                              setNewAliasValue(item.alias);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-opacity cursor-pointer"
                            title="Advanced: Rename alias key"
                          >
                            <Lock className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{item.updatedAt || 'Recent'}</span>
                        </div>
                      </td>

                      {/* English Input */}
                      <td className="py-2 px-2.5 align-top">
                        <textarea
                          rows={2}
                          value={currentEn}
                          onChange={(e) => handleCellChange(item.alias, 'en', e.target.value, item)}
                          placeholder="English copy..."
                          className="w-full px-2.5 py-1.5 text-xs bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-400 focus:bg-white rounded-lg text-slate-900 font-medium transition-colors resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </td>

                      {/* Marathi Input */}
                      <td className="py-2 px-2.5 align-top">
                        <textarea
                          rows={2}
                          value={currentMr}
                          onChange={(e) => handleCellChange(item.alias, 'mr', e.target.value, item)}
                          placeholder="मराठी भाषांतर..."
                          className={`w-full px-2.5 py-1.5 text-xs bg-transparent border rounded-lg font-medium transition-colors resize-none focus:outline-none focus:ring-1 focus:ring-orange-400 ${
                            !currentMr
                              ? 'border-orange-200/80 bg-orange-50/30 placeholder:text-orange-300'
                              : 'border-transparent hover:border-slate-200 focus:border-orange-400 focus:bg-white text-slate-900'
                          }`}
                        />
                      </td>

                      {/* Hindi Input */}
                      <td className="py-2 px-2.5 align-top">
                        <textarea
                          rows={2}
                          value={currentHi}
                          onChange={(e) => handleCellChange(item.alias, 'hi', e.target.value, item)}
                          placeholder="हिंदी अनुवाद..."
                          className={`w-full px-2.5 py-1.5 text-xs bg-transparent border rounded-lg font-medium transition-colors resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                            !currentHi
                              ? 'border-emerald-200/80 bg-emerald-50/30 placeholder:text-emerald-300'
                              : 'border-transparent hover:border-slate-200 focus:border-emerald-400 focus:bg-white text-slate-900'
                          }`}
                        />
                      </td>

                      {/* Module Badge */}
                      <td className="py-2.5 px-3.5 align-top">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                          {item.module}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-2 px-2.5 align-top">
                        <input
                          type="text"
                          value={currentDesc}
                          onChange={(e) =>
                            handleCellChange(item.alias, 'description', e.target.value, item)
                          }
                          placeholder="Context / notes..."
                          className="w-full px-2 py-1 text-[11px] text-slate-600 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-300 focus:bg-white rounded-md transition-colors focus:outline-none"
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3.5 align-top text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isDirty && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveRow(item)}
                                disabled={isSaving}
                                className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                title="Save this row"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRevertRow(item.alias)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                title="Discard changes"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => setHistoryModalItem(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View revision history"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Grid Footer */}
        <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>
              Showing {filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length} items
            </span>
            <span>•</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-bold focus:outline-none"
            >
              <option value={15}>15 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 font-bold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD NEW CONTENT ITEM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Add New Content Key</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Register a new copy alias and its initial translations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alias / Content Key (e.g. `leave.apply_button`) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="module.action_or_label"
                  value={newItemForm.alias}
                  onChange={(e) => setNewItemForm({ ...newItemForm, alias: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Module</label>
                  <input
                    type="text"
                    placeholder="e.g. leave, tasks, global"
                    value={newItemForm.module}
                    onChange={(e) => setNewItemForm({ ...newItemForm, module: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description / Context</label>
                  <input
                    type="text"
                    placeholder="e.g. Header button on leave page"
                    value={newItemForm.description}
                    onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">English Translation</label>
                <input
                  type="text"
                  placeholder="English text..."
                  value={newItemForm.en}
                  onChange={(e) => setNewItemForm({ ...newItemForm, en: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">मराठी (Marathi) Translation</label>
                <input
                  type="text"
                  placeholder="मराठी भाषांतर..."
                  value={newItemForm.mr}
                  onChange={(e) => setNewItemForm({ ...newItemForm, mr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">हिंदी (Hindi) Translation</label>
                <input
                  type="text"
                  placeholder="हिंदी अनुवाद..."
                  value={newItemForm.hi}
                  onChange={(e) => setNewItemForm({ ...newItemForm, hi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Save New Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CSV IMPORT WITH VALIDATION PREVIEW */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Import Translations from CSV</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Column format: `Alias, English, Marathi, Hindi, Module, Description`
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCsvFileSelect}
              />

              {!csvFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-2xl p-8 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-bold text-slate-800 text-sm">Choose CSV File to Upload</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Click here to select a .csv file from your computer
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-800 truncate">{csvFile.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {csvPreviewRows.length} valid rows found
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCsvFile(null);
                        setCsvPreviewRows([]);
                        setCsvErrors([]);
                      }}
                      className="px-2.5 py-1 text-slate-500 hover:text-rose-600 font-bold text-[11px] rounded cursor-pointer"
                    >
                      Change File
                    </button>
                  </div>

                  {csvErrors.length > 0 && (
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-[11px] space-y-1 max-h-28 overflow-y-auto">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{csvErrors.length} Issue(s) detected:</span>
                      </div>
                      {csvErrors.map((err, i) => (
                        <div key={i} className="text-[10px] font-mono">
                          • {err}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 font-bold text-slate-700 sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Alias</th>
                          <th className="py-2 px-3">English</th>
                          <th className="py-2 px-3">Marathi</th>
                          <th className="py-2 px-3">Hindi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {csvPreviewRows.slice(0, 8).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 font-mono font-bold text-slate-800">{r.Alias}</td>
                            <td className="py-1.5 px-3 truncate max-w-[120px]">{r.English}</td>
                            <td className="py-1.5 px-3 truncate max-w-[120px]">{r.Marathi}</td>
                            <td className="py-1.5 px-3 truncate max-w-[120px]">{r.Hindi}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-medium">
                  Existing aliases will be updated; new aliases will be created.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={csvPreviewRows.length === 0 || isImporting}
                    onClick={handleCsvImportSubmit}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    {isImporting ? 'Importing...' : `Import ${csvPreviewRows.length} Rows`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADVANCED ALIAS RENAME WITH WARNING */}
      {aliasRenameItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Rename Content Key (Alias)</h3>
                  <p className="text-[11px] text-amber-700 font-medium">
                    Advanced Administrator Action
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAliasRenameItem(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                <strong>Warning:</strong> The Alias is the backend key used in code. Changing it may break UI labels unless the code reference is updated simultaneously.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Alias</label>
                <input
                  type="text"
                  disabled
                  value={aliasRenameItem.alias}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Alias Key *</label>
                <input
                  type="text"
                  required
                  value={newAliasValue}
                  onChange={(e) => setNewAliasValue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAliasRenameItem(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Confirm Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: VERSION REVISION HISTORY */}
      {historyModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Revision History</h3>
                  <code className="text-[10px] text-blue-700 font-mono font-bold">
                    {historyModalItem.alias}
                  </code>
                </div>
              </div>
              <button
                onClick={() => setHistoryModalItem(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs max-h-96 overflow-y-auto">
              {(!historyModalItem.versions || historyModalItem.versions.length === 0) ? (
                <div className="text-center py-6 text-slate-400 font-medium">
                  No historical revisions recorded for this key yet.
                </div>
              ) : (
                historyModalItem.versions.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        Version {v.version} • {v.languageId || 'en'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {v.createdAt ? new Date(v.createdAt).toLocaleString('en-IN') : 'Recent'}
                      </span>
                    </div>
                    <div className="font-medium text-slate-700 italic bg-white p-2 rounded border border-slate-100">
                      "{v.value}"
                    </div>
                    <div className="text-[10px] text-slate-400">Changed by {v.changedBy || 'Admin'}</div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-right">
              <button
                type="button"
                onClick={() => setHistoryModalItem(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
