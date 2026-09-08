'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UserPlus,
  Upload,
  ShieldCheck,
  Check,
  CreditCard,
  Image as ImageIcon,
  Eye,
  EyeOff,
  FileText,
  CheckCircle2,
  RefreshCw,
  LayoutDashboard,
  Clock,
  CalendarCheck2,
  CheckSquare,
  TrendingUp,
  FileSpreadsheet,
  Bell,
  MessageSquare,
  BarChart3,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  SlidersHorizontal,
  Sparkles,
  Shield,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import {
  DEFAULT_PERMISSIONS,
  FEATURE_PERMISSIONS_SCHEMA,
  ROLE_PERMISSION_PRESETS,
} from '@/context/mockData';
import { useCrm } from '@/context/CrmContext';

export default function EmployeeModal({ isOpen, onClose, onSave, initialData = null }) {
  const { getEmployeeKycSignedUrls, deleteEmployeeDocument, t } = useCrm();

  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    password: '',
    email: '',
    mobile: '',
    department: 'Technical & Operations',
    designation: 'Site Engineer',
    role: 'OPERATION_HEAD',
    joiningDate: new Date().toISOString().split('T')[0],
    reportingManager: 'Shailendra Patil',
    employmentStatus: 'Active',
    idCardType: 'Aadhaar Card',
    idCardNumber: '',
    idCardFrontUrl: '',
    idCardBackUrl: '',
    permissions: { ...DEFAULT_PERMISSIONS, reports: false },
  });

  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [frontPreviewUrl, setFrontPreviewUrl] = useState(null);
  const [backPreviewUrl, setBackPreviewUrl] = useState(null);
  const [existingFrontSignedUrl, setExistingFrontSignedUrl] = useState(null);
  const [existingBackSignedUrl, setExistingBackSignedUrl] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'documents' | 'permissions'
  const [expandedModules, setExpandedModules] = useState({
    attendance: true,
    leave: true,
    tasks: true,
    dashboard: false,
    leads: false,
    products: false,
    notifications: false,
    messaging: false,
    reports: false,
  });

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  useEffect(() => {
    setFrontFile(null);
    setBackFile(null);
    setFrontPreviewUrl(null);
    setBackPreviewUrl(null);
    setExistingFrontSignedUrl(null);
    setExistingBackSignedUrl(null);
    setShowPassword(false);

    if (initialData) {
      const doc = initialData.documents?.[0];
      const frontUrl = initialData.idCardFrontUrl || doc?.frontImagePath || '';
      const backUrl = initialData.idCardBackUrl || doc?.backImagePath || '';

      setFormData({
        ...initialData,
        role: initialData.role || initialData.user?.role || 'OPERATION_HEAD',
        idCardType: initialData.idCardType || doc?.documentType || 'Aadhaar Card',
        idCardNumber: initialData.idCardNumber || doc?.documentNumber || '',
        idCardFrontUrl: frontUrl,
        idCardBackUrl: backUrl,
        permissions: initialData.permissions || { ...DEFAULT_PERMISSIONS, reports: false },
      });

      // Pre-fetch signed URLs for existing documents if available
      const docId = doc?.id || 'kyc';
      const empId = initialData.realId || initialData.id;
      if (empId && (frontUrl || backUrl) && getEmployeeKycSignedUrls) {
        getEmployeeKycSignedUrls(empId, docId)
          .then((res) => {
            if (res?.frontSignedUrl) setExistingFrontSignedUrl(res.frontSignedUrl);
            if (res?.backSignedUrl) setExistingBackSignedUrl(res.backSignedUrl);
          })
          .catch((err) => console.warn('[EmployeeModal KYC signed URLs]', err));
      }
    } else {
      setFormData({
        name: '',
        userId: '',
        password: '',
        email: '',
        mobile: '',
        department: 'Technical & Operations',
        designation: 'Site Engineer',
        role: 'OPERATION_HEAD',
        joiningDate: new Date().toISOString().split('T')[0],
        reportingManager: 'Shailendra Patil',
        employmentStatus: 'Active',
        idCardType: 'Aadhaar Card',
        idCardNumber: '',
        idCardFrontUrl: '',
        idCardBackUrl: '',
        permissions: { ...DEFAULT_PERMISSIONS, reports: false },
      });
    }
  }, [initialData, isOpen]);

  // Handle local image preview URLs
  useEffect(() => {
    if (frontFile && frontFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(frontFile);
      setFrontPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFrontPreviewUrl(null);
    }
  }, [frontFile]);

  useEffect(() => {
    if (backFile && backFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(backFile);
      setBackPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setBackPreviewUrl(null);
    }
  }, [backFile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, frontFile, backFile);
    onClose();
  };

  const moduleIconMap = {
    dashboard: LayoutDashboard,
    attendance: Clock,
    leave: CalendarCheck2,
    tasks: CheckSquare,
    leads: TrendingUp,
    products: FileSpreadsheet,
    notifications: Bell,
    messaging: MessageSquare,
    reports: BarChart3,
  };

  const toggleModuleExpand = (featKey) => {
    setExpandedModules((prev) => ({
      ...prev,
      [featKey]: !prev[featKey],
    }));
  };

  const toggleFeature = (featKey) => {
    setFormData((prev) => {
      const currentEnabled = !!prev.permissions?.[featKey];
      const newEnabled = !currentEnabled;
      const nextPerms = { ...prev.permissions, [featKey]: newEnabled };

      if (newEnabled) {
        const schema = FEATURE_PERMISSIONS_SCHEMA.find((s) => s.key === featKey);
        if (schema) {
          const anySubActive = schema.actions.some((a) => prev.permissions?.[a.key]);
          if (!anySubActive) {
            schema.actions.forEach((a) => {
              if (DEFAULT_PERMISSIONS[a.key] !== undefined) {
                nextPerms[a.key] = DEFAULT_PERMISSIONS[a.key];
              } else {
                nextPerms[a.key] = true;
              }
            });
          }
        }
      }

      return {
        ...prev,
        permissions: nextPerms,
      };
    });
  };

  const toggleAction = (actionKey, featKey) => {
    setFormData((prev) => {
      const currentVal = !!prev.permissions?.[actionKey];
      const newVal = !currentVal;
      const nextPerms = {
        ...prev.permissions,
        [actionKey]: newVal,
      };

      if (newVal) {
        nextPerms[featKey] = true;
      }

      return {
        ...prev,
        permissions: nextPerms,
      };
    });
  };

  const setAllActionsForFeature = (featKey, enableAll) => {
    const schema = FEATURE_PERMISSIONS_SCHEMA.find((s) => s.key === featKey);
    if (!schema) return;

    setFormData((prev) => {
      const nextPerms = { ...prev.permissions };
      if (enableAll) {
        nextPerms[featKey] = true;
        schema.actions.forEach((a) => {
          nextPerms[a.key] = true;
        });
      } else {
        schema.actions.forEach((a) => {
          nextPerms[a.key] = false;
        });
      }
      return { ...prev, permissions: nextPerms };
    });
  };

  const applyPreset = (presetKey) => {
    const preset = ROLE_PERMISSION_PRESETS[presetKey];
    if (!preset) return;
    setFormData((prev) => ({
      ...prev,
      role: presetKey,
      permissions: { ...preset },
    }));
  };

  const toggleAllGlobalFeatures = (enableAll) => {
    setFormData((prev) => {
      const nextPerms = { ...prev.permissions };
      FEATURE_PERMISSIONS_SCHEMA.forEach((schema) => {
        nextPerms[schema.key] = enableAll;
        schema.actions.forEach((a) => {
          nextPerms[a.key] = enableAll;
        });
      });
      return { ...prev, permissions: nextPerms };
    });
  };

  const togglePermission = (key) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const handleViewFront = async () => {
    if (frontFile) {
      const url = URL.createObjectURL(frontFile);
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (existingFrontSignedUrl) {
      window.open(existingFrontSignedUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (formData.idCardFrontUrl?.startsWith('http')) {
      window.open(formData.idCardFrontUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (initialData && getEmployeeKycSignedUrls) {
      const docId = initialData.documents?.[0]?.id || 'kyc';
      const empId = initialData.realId || initialData.id;
      const res = await getEmployeeKycSignedUrls(empId, docId);
      if (res?.frontSignedUrl) {
        setExistingFrontSignedUrl(res.frontSignedUrl);
        window.open(res.frontSignedUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('Front document preview link is not available');
      }
    }
  };

  const handleViewBack = async () => {
    if (backFile) {
      const url = URL.createObjectURL(backFile);
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (existingBackSignedUrl) {
      window.open(existingBackSignedUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (formData.idCardBackUrl?.startsWith('http')) {
      window.open(formData.idCardBackUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (initialData && getEmployeeKycSignedUrls) {
      const docId = initialData.documents?.[0]?.id || 'kyc';
      const empId = initialData.realId || initialData.id;
      const res = await getEmployeeKycSignedUrls(empId, docId);
      if (res?.backSignedUrl) {
        setExistingBackSignedUrl(res.backSignedUrl);
        window.open(res.backSignedUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('Back document preview link is not available');
      }
    }
  };

  const handleDeleteFront = async () => {
    if (!window.confirm('Are you sure you want to remove the front ID document?')) {
      return;
    }

    if (frontFile) {
      setFrontFile(null);
      setFrontPreviewUrl(null);
      if (frontInputRef.current) frontInputRef.current.value = '';
    }

    if (formData.idCardFrontUrl) {
      const doc = initialData?.documents?.[0];
      const docId = doc?.id;
      const empId = initialData?.realId || initialData?.id;

      if (docId && empId && deleteEmployeeDocument && !formData.idCardBackUrl && !backFile) {
        // If no back document exists, deleting the KYC doc cleans the db record completely
        try {
          await deleteEmployeeDocument(empId, docId);
        } catch (e) {
          console.warn('[EmployeeModal Delete KYC Front]:', e);
        }
      }

      setFormData((prev) => ({ ...prev, idCardFrontUrl: '' }));
      setExistingFrontSignedUrl(null);
    }
  };

  const handleDeleteBack = async () => {
    if (!window.confirm('Are you sure you want to remove the back ID document?')) {
      return;
    }

    if (backFile) {
      setBackFile(null);
      setBackPreviewUrl(null);
      if (backInputRef.current) backInputRef.current.value = '';
    }

    if (formData.idCardBackUrl) {
      const doc = initialData?.documents?.[0];
      const docId = doc?.id;
      const empId = initialData?.realId || initialData?.id;

      if (docId && empId && deleteEmployeeDocument && !formData.idCardFrontUrl && !frontFile) {
        // If no front document exists, deleting the KYC doc cleans the db record completely
        try {
          await deleteEmployeeDocument(empId, docId);
        } catch (e) {
          console.warn('[EmployeeModal Delete KYC Back]:', e);
        }
      }

      setFormData((prev) => ({ ...prev, idCardBackUrl: '' }));
      setExistingBackSignedUrl(null);
    }
  };

  const hasFrontDoc = Boolean(frontFile || formData.idCardFrontUrl);
  const isFrontPdf = frontFile
    ? (frontFile.type === 'application/pdf' || frontFile.name.toLowerCase().endsWith('.pdf'))
    : (formData.idCardFrontUrl ? formData.idCardFrontUrl.toLowerCase().endsWith('.pdf') : false);

  const getFrontFileName = () => {
    if (frontFile) return frontFile.name;
    if (formData.idCardFrontUrl) {
      const parts = formData.idCardFrontUrl.split('/');
      const rawName = parts[parts.length - 1] || '';
      return rawName.replace(/^front-/, '') || `${formData.idCardType || 'ID Card'} (Front)`;
    }
    return 'Document';
  };

  const hasBackDoc = Boolean(backFile || formData.idCardBackUrl);
  const isBackPdf = backFile
    ? (backFile.type === 'application/pdf' || backFile.name.toLowerCase().endsWith('.pdf'))
    : (formData.idCardBackUrl ? formData.idCardBackUrl.toLowerCase().endsWith('.pdf') : false);

  const getBackFileName = () => {
    if (backFile) return backFile.name;
    if (formData.idCardBackUrl) {
      const parts = formData.idCardBackUrl.split('/');
      const rawName = parts[parts.length - 1] || '';
      return rawName.replace(/^back-/, '') || `${formData.idCardType || 'ID Card'} (Back)`;
    }
    return 'Document';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {initialData ? t('employees.modal.edit_title', 'Edit Team Member Profile') : t('employees.modal.add_title', 'Add New Team Member')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {t('employees.modal.subtitle', 'Enter team member details, identity documents, and assign feature permissions.')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-slate-50/30 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'basic' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            {t('employees.modal.tab_basic', '1. Basic Information')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{t('employees.modal.tab_docs', '2. Identity Documents')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'permissions' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('employees.modal.tab_permissions', '3. Feature Permissions')}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('employees.form.full_name', 'Full Name')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kulkarni"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('employees.form.system_user_id', 'System User ID')} *</label>
                  <input
                    type="text"
                    required
                    disabled={!!initialData}
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    placeholder="e.g. ramesh.k"
                    className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      initialData ? 'text-slate-500 cursor-not-allowed bg-slate-100' : 'text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('employees.form.email_address', 'Email Address')} *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. ramesh@swaatienterprises.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('employees.form.mobile_number', 'Mobile Number')} *</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {initialData ? t('employees.form.password_credentials', 'Password / Credentials') : `${t('employees.form.initial_password', 'Initial Password')} *`}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!initialData}
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={
                      initialData
                        ? '•••••••• (Enter new password to change)'
                        : 'Provide temporary login password'
                    }
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {initialData && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    {t('employees.form.password_hint', 'Default is hidden. Click the eye icon to view or type a new password to update.')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('employees.form.role', 'System Role')} *</label>
                  <select
                    value={formData.role || 'OPERATION_HEAD'}
                    onChange={(e) => {
                      const selectedRole = e.target.value;
                      const preset = ROLE_PERMISSION_PRESETS[selectedRole];
                      setFormData((prev) => ({
                        ...prev,
                        role: selectedRole,
                        permissions: preset ? { ...preset } : prev.permissions,
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="ADMIN">{t('role.admin', 'Admin (Full Access)')}</option>
                    <option value="OPERATION_HEAD">{t('role.operation_head', 'Operation Head')}</option>
                    <option value="SALES">{t('role.sales', 'Sales')}</option>
                    <option value="ACCOUNTANT">{t('role.accountant', 'Accountant')}</option>
                    <option value="WAREHOUSE_MANAGER">{t('role.warehouse_manager', 'Warehouse Manager')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('employees.form.department', 'Department')}</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Technical & Operations">{t('dept.technical_ops', 'Technical & Operations')}</option>
                    <option value="Sales & Business Dev">{t('dept.sales_dev', 'Sales & Business Dev')}</option>
                    <option value="Site Execution">{t('dept.site_execution', 'Site Execution')}</option>
                    <option value="Customer Support">{t('dept.customer_support', 'Customer Support')}</option>
                    <option value="Executive Management">{t('dept.executive_mgmt', 'Executive Management')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('employees.form.designation', 'Designation')}</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Site Engineer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('employees.form.joining_date', 'Joining Date')}</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('employees.form.reporting_manager', 'Reporting Manager')}</label>
                  <input
                    type="text"
                    value={formData.reportingManager}
                    onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                    placeholder="e.g. Shailendra Patil"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITY DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200/80 text-blue-800 text-[11px] leading-relaxed">
                <strong>{t('employees.kyc.storage_note', 'Secure Identity Storage: Identity document images are stored securely and accessible only to authorized administrators.')}</strong>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('employees.kyc.id_card_type', 'ID Card Type')} *</label>
                  <select
                    value={formData.idCardType}
                    onChange={(e) => setFormData({ ...formData, idCardType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('employees.kyc.id_card_number', 'ID Card Number')} *</label>
                  <input
                    type="text"
                    value={formData.idCardNumber}
                    onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })}
                    placeholder="e.g. XXXX-XXXX-4589"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Front Image / Document Slot */}
                <div className="flex flex-col">
                  <input
                    ref={frontInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFrontFile(e.target.files[0]);
                      }
                      e.target.value = '';
                    }}
                  />

                  {!hasFrontDoc ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors flex flex-col items-center justify-center min-h-[140px]">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-slate-700 mb-0.5 text-xs">{t('employees.kyc.front_image_title', 'ID Card Front Image')}</div>
                      <div className="text-[10px] text-slate-500 mb-2.5">{t('employees.kyc.format_hint', 'PNG, JPG, PDF up to 10MB')}</div>
                      <button
                        type="button"
                        onClick={() => frontInputRef.current?.click()}
                        className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{t('employees.kyc.upload_front', 'Upload Front')}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-3.5 flex flex-col justify-between min-h-[140px] hover:border-slate-300 transition-all">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{t('employees.kyc.uploaded', 'Uploaded')}</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {t('employees.kyc.front_doc', 'Front Document')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {isFrontPdf ? (
                            <div className="w-11 h-11 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                              <FileText className="w-5 h-5" />
                              <span className="text-[8px] font-extrabold uppercase mt-0.5">PDF</span>
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-2xs">
                              {frontPreviewUrl || existingFrontSignedUrl ? (
                                <img
                                  src={frontPreviewUrl || existingFrontSignedUrl}
                                  alt="Front Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-blue-500" />
                              )}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={getFrontFileName()}>
                              {getFrontFileName()}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {frontFile
                                ? `${(frontFile.size / 1024).toFixed(0)} KB • ${t('employees.kyc.ready_to_save', 'Ready to save')}`
                                : t('employees.kyc.saved_cloud', 'Saved in cloud storage')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2.5 mt-2.5 border-t border-slate-200/70 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={handleViewFront}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                          title="View document in new tab"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('common.buttons.view', 'View')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => frontInputRef.current?.click()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                          title="Upload a different document"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{t('common.buttons.replace', 'Replace')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteFront}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                          title="Remove document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t('common.buttons.delete', 'Delete')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Back Image / Document Slot */}
                <div className="flex flex-col">
                  <input
                    ref={backInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setBackFile(e.target.files[0]);
                      }
                      e.target.value = '';
                    }}
                  />

                  {!hasBackDoc ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors flex flex-col items-center justify-center min-h-[140px]">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-slate-700 mb-0.5 text-xs">{t('employees.kyc.back_image_title', 'ID Card Back Image')}</div>
                      <div className="text-[10px] text-slate-500 mb-2.5">{t('employees.kyc.format_hint', 'PNG, JPG, PDF up to 10MB')}</div>
                      <button
                        type="button"
                        onClick={() => backInputRef.current?.click()}
                        className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{t('employees.kyc.upload_back', 'Upload Back')}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-3.5 flex flex-col justify-between min-h-[140px] hover:border-slate-300 transition-all">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{t('employees.kyc.uploaded', 'Uploaded')}</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {t('employees.kyc.back_doc', 'Back Document')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {isBackPdf ? (
                            <div className="w-11 h-11 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                              <FileText className="w-5 h-5" />
                              <span className="text-[8px] font-extrabold uppercase mt-0.5">PDF</span>
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-2xs">
                              {backPreviewUrl || existingBackSignedUrl ? (
                                <img
                                  src={backPreviewUrl || existingBackSignedUrl}
                                  alt="Back Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-blue-500" />
                              )}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={getBackFileName()}>
                              {getBackFileName()}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {backFile
                                ? `${(backFile.size / 1024).toFixed(0)} KB • ${t('employees.kyc.ready_to_save', 'Ready to save')}`
                                : t('employees.kyc.saved_cloud', 'Saved in cloud storage')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2.5 mt-2.5 border-t border-slate-200/70 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={handleViewBack}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                          title="View document in new tab"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('common.buttons.view', 'View')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => backInputRef.current?.click()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                          title="Upload a different document"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{t('common.buttons.replace', 'Replace')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteBack}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                          title="Remove document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t('common.buttons.delete', 'Delete')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FEATURE & ACTION PERMISSIONS (TWO-LEVEL SYSTEM) */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              {/* Header Info Banner & Preset Actions */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{t('employees.perms.architecture_title', 'Two-Level Permission Architecture')}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {t('employees.perms.architecture_desc', 'Level 1 toggles module visibility; Level 2 controls specific functional actions.')}
                      </div>
                    </div>
                  </div>

                  {/* Global Quick Toggle */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => toggleAllGlobalFeatures(true)}
                      className="px-2 py-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
                    >
                      {t('employees.perms.enable_all', 'Enable All')}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllGlobalFeatures(false)}
                      className="px-2 py-1 text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer"
                    >
                      {t('employees.perms.disable_all', 'Disable All')}
                    </button>
                  </div>
                </div>

                {/* Preset Selectors */}
                <div className="pt-2.5 border-t border-slate-200/70 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {t('employees.perms.presets_label', 'Presets:')}
                  </span>
                  <button
                    type="button"
                    onClick={() => applyPreset('OPERATION_HEAD')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    {t('role.operation_head', 'Operation Head')}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('SALES')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    {t('role.sales', 'Sales')}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('ACCOUNTANT')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    {t('role.accountant', 'Accountant')}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('WAREHOUSE_MANAGER')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    {t('role.warehouse_manager', 'Warehouse Manager')}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('ADMIN')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200 transition-colors cursor-pointer"
                  >
                    {t('role.admin', 'Admin (Full Access)')}
                  </button>
                </div>
              </div>

              {/* Module List */}
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {FEATURE_PERMISSIONS_SCHEMA.map((schema) => {
                  const Icon = moduleIconMap[schema.key] || LayoutDashboard;
                  const isFeatureActive = !!formData.permissions?.[schema.key];
                  const isExpanded = !!expandedModules[schema.key];
                  const activeSubCount = schema.actions.filter((a) => !!formData.permissions?.[a.key]).length;
                  const totalSubCount = schema.actions.length;

                  return (
                    <div
                      key={schema.key}
                      className={`border rounded-xl transition-all duration-150 overflow-hidden ${
                        isFeatureActive
                          ? 'border-slate-200 bg-white shadow-2xs'
                          : 'border-slate-200/70 bg-slate-50/70'
                      }`}
                    >
                      {/* Module Level 1 Header */}
                      <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
                        <div
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
                          onClick={() => toggleModuleExpand(schema.key)}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isFeatureActive
                                ? 'bg-blue-50 text-blue-600 border border-blue-200/60'
                                : 'bg-slate-200/70 text-slate-400 border border-slate-200'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 text-xs truncate">
                                {schema.label}
                              </span>
                              {isFeatureActive ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCheck className="w-2.5 h-2.5" />
                                  {activeSubCount}/{totalSubCount} {t('employees.perms.actions_count', 'actions')}
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-500">
                                  {t('employees.perms.disabled', 'Disabled')}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {schema.description}
                            </div>
                          </div>
                        </div>

                        {/* Level 1 Toggle & Accordion Caret */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Level 1 Switch */}
                          <button
                            type="button"
                            onClick={() => toggleFeature(schema.key)}
                            title={`Toggle ${schema.label} feature access`}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isFeatureActive ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                isFeatureActive ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>

                          {/* Expand Button */}
                          <button
                            type="button"
                            onClick={() => toggleModuleExpand(schema.key)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Level 2 Actions Section */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/50 p-3 sm:p-3.5 space-y-2.5">
                          {!isFeatureActive ? (
                            <div className="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                              <div className="flex items-center gap-2">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{t('employees.perms.feature_off_warning', 'Feature is turned OFF. Turn on to configure granular actions.')}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleFeature(schema.key)}
                                className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded cursor-pointer"
                              >
                                {t('employees.perms.enable_feature_btn', 'Enable Feature')}
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Sub-actions Toolbar */}
                              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-200/60">
                                <span className="font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                                  {t('employees.perms.granular_actions', 'Granular Actions')} ({schema.label})
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setAllActionsForFeature(schema.key, true)}
                                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                  >
                                    {t('employees.perms.select_all', 'Select All')}
                                  </button>
                                  <span className="text-slate-300">•</span>
                                  <button
                                    type="button"
                                    onClick={() => setAllActionsForFeature(schema.key, false)}
                                    className="text-[10px] font-bold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                                  >
                                    {t('employees.perms.deselect_all', 'Deselect All')}
                                  </button>
                                </div>
                              </div>

                              {/* Action Items List */}
                              <div className="grid grid-cols-1 gap-1.5">
                                {schema.actions.map((act) => {
                                  const isActionActive = !!formData.permissions?.[act.key];
                                  return (
                                    <div
                                      key={act.key}
                                      onClick={() => toggleAction(act.key, schema.key)}
                                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                        isActionActive
                                          ? 'bg-white border-blue-200 shadow-2xs'
                                          : 'bg-white/60 border-slate-200/70 hover:bg-white'
                                      }`}
                                    >
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-bold text-slate-800">
                                            {act.label}
                                          </span>
                                          <code className="text-[9px] text-slate-400 font-mono bg-slate-100 px-1 py-0.2 rounded">
                                            {act.key}
                                          </code>
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                          {act.desc}
                                        </div>
                                      </div>

                                      {/* Action Toggle Checkbox */}
                                      <div className="shrink-0">
                                        <input
                                          type="checkbox"
                                          checked={isActionActive}
                                          onChange={() => {}} // Handled by container onClick
                                          className="h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 font-medium">
              {t('employees.form.required_hint', '* All required fields must be completed.')}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg cursor-pointer"
              >
                {t('common.buttons.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm shadow-blue-600/20 cursor-pointer"
              >
                {initialData ? t('common.buttons.save', 'Save Changes') : t('employees.btn.add_member', 'Add Team Member')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
