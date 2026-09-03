'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/api';
import { translations } from '@/utils/translations';
import { DEFAULT_PERMISSIONS, INITIAL_GROUPS, INITIAL_MESSAGES } from './mockData';

const CrmContext = createContext();

export function CrmProvider({ children }) {
  const router = useRouter();

  // Localization
  const [locale, setLocale] = useState('en');

  // Auth State
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState({
    id: 'EMP-101',
    userId: 'admin',
    name: 'Shailendra Patil',
    email: 'admin@swaatienterprises.in',
    role: 'ADMIN',
    department: 'Executive Management',
    designation: 'Founder & Managing Director',
    status: 'Active',
    avatar: 'SP',
    permissions: DEFAULT_PERMISSIONS,
  });
  const [currentRole, setCurrentRole] = useState('ADMIN');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Domain State Collections (Live Database Records)
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [systemSettings, setSystemSettings] = useState({
    officeStartTime: '10:00 AM',
    officeEndTime: '06:30 PM',
    gracePeriodMinutes: 15,
    workingDaysPerMonth: 26,
    weeklyOffs: 4,
    companyName: 'Swaati Enterprises',
    companyEmail: 'info@swaatienterprises.in',
    companyPhone: '+91 93700 11133',
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [checkedIn, setCheckedIn] = useState(false);

  // Content & Translation Management State (Database-backed)
  const [contentBundle, setContentBundle] = useState({});
  const [availableLanguages, setAvailableLanguages] = useState([
    { code: 'en', name: 'English' },
    { code: 'mr', name: 'मराठी' },
    { code: 'hi', name: 'हिंदी' },
  ]);

  // Load Content Translation Bundle from Database API
  const loadContentBundle = useCallback(async (langCode) => {
    try {
      const res = await apiRequest(`/content/bundle?lang=${langCode}`);
      if (res?.success && res.data?.bundle) {
        setContentBundle(res.data.bundle);
      }
    } catch (err) {
      console.warn('[CrmContext loadContentBundle Error]:', err);
    }
  }, []);

  // Central Translation Function with Fallback Hierarchy
  // Lookup: Database published translation -> Locale dictionary -> Default English dictionary -> Content key
  const t = useCallback(
    (key) => {
      if (contentBundle && contentBundle[key]) {
        return contentBundle[key];
      }
      return translations[locale]?.[key] || translations.en[key] || key;
    },
    [contentBundle, locale]
  );

  // Granular Permission Helper
  const hasPermission = useCallback(
    (featureKey) => {
      if (currentRole === 'ADMIN') return true;
      if (!currentUser || !currentUser.permissions) return false;
      return !!currentUser.permissions[featureKey];
    },
    [currentRole, currentUser]
  );

  // Normalize Backend Database Models to Frontend UI Models
  const normalizeEmployee = (emp) => ({
    id: emp.employeeCode || emp.id,
    realId: emp.id,
    userId: emp.userId || emp.email?.split('@')[0],
    name: emp.name,
    email: emp.email,
    mobile: emp.mobile,
    role: emp.user?.role || (emp.department?.includes('Executive') ? 'ADMIN' : 'EMPLOYEE'),
    department: emp.department,
    designation: emp.designation,
    status: emp.active ? 'Active' : 'Inactive',
    joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '2022-01-01',
    reportingManager: emp.reportingManager || 'Shailendra Patil',
    avatar: emp.avatar || emp.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'SE',
    idCardType: emp.documents?.[0]?.documentType || 'Aadhaar Card',
    idCardNumber: emp.documents?.[0]?.documentNumber || '',
    idCardFrontUrl: emp.documents?.[0]?.frontImagePath || null,
    idCardBackUrl: emp.documents?.[0]?.backImagePath || null,
    permissions: emp.user?.permissions?.reduce((acc, p) => {
      acc[p.featureKey] = p.enabled;
      return acc;
    }, {}) || DEFAULT_PERMISSIONS,
  });

  const normalizeAttendance = (att) => ({
    id: att.id,
    date: att.attendanceDate ? att.attendanceDate.split('T')[0] : (att.date ? new Date(att.date).toISOString().split('T')[0] : ''),
    employeeId: att.employee?.employeeCode || att.employeeId,
    employeeName: att.employee?.name || 'Team Member',
    department: att.employee?.department || 'Operations',
    checkIn: att.checkIn ? (typeof att.checkIn === 'string' && att.checkIn.includes('T') ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : att.checkIn) : '-',
    checkOut: att.checkOut ? (typeof att.checkOut === 'string' && att.checkOut.includes('T') ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : att.checkOut) : '-',
    workingHours: att.workingHours ? (typeof att.workingHours === 'number' ? `${Number(att.workingHours).toFixed(1)} hrs` : att.workingHours) : (att.checkIn && !att.checkOut ? 'In progress' : '-'),
    status:
      att.attendanceStatus === 'PRESENT' || att.status === 'Present'
        ? 'Present'
        : att.attendanceStatus === 'LATE' || att.status === 'Late'
        ? 'Late'
        : att.attendanceStatus === 'ON_LEAVE' || att.status === 'On Leave'
        ? 'On Leave'
        : att.attendanceStatus === 'HALF_DAY' || att.status === 'Half Day'
        ? 'Half Day'
        : att.attendanceStatus === 'ABSENT' || att.status === 'Absent'
        ? 'Absent'
        : 'Present',
    isLate: !!att.isLate || att.attendanceStatus === 'LATE',
    lateMinutes: att.lateMinutes || 0,
    correctedBy: att.correctedBy || null,
    correctionReason: att.correctionReason || null,
  });

  const normalizeLeave = (lv) => ({
    id: lv.id,
    employeeId: lv.employee?.employeeCode || lv.employeeId,
    employeeName: lv.employee?.name || 'Team Member',
    leaveType: lv.leaveType,
    startDate: lv.startDate ? lv.startDate.split('T')[0] : '',
    endDate: lv.endDate ? lv.endDate.split('T')[0] : '',
    totalDays: lv.totalDays || 1,
    reason: lv.reason,
    status:
      lv.status === 'APPROVED'
        ? 'Approved'
        : lv.status === 'REJECTED'
        ? 'Rejected'
        : lv.status === 'CANCELLED'
        ? 'Cancelled'
        : 'Pending',
    appliedDate: lv.appliedAt ? lv.appliedAt.split('T')[0] : '',
    adminRemarks: lv.reviewerRemarks || '',
  });

  const normalizeTask = (tsk) => ({
    id: tsk.id,
    taskCode: tsk.taskCode,
    title: tsk.title,
    description: tsk.description || '',
    assignedTo: tsk.assignedTo?.name || 'Unassigned',
    assignedToId: tsk.assignedTo?.employeeCode || tsk.assignedToId,
    assignedBy: tsk.assignedBy?.name || 'Admin',
    assignedById: tsk.assignedBy?.employeeCode || tsk.assignedById,
    priority:
      tsk.priority === 'URGENT'
        ? 'Urgent'
        : tsk.priority === 'HIGH'
        ? 'High'
        : tsk.priority === 'LOW'
        ? 'Low'
        : 'Medium',
    status:
      tsk.status === 'IN_PROGRESS'
        ? 'In Progress'
        : tsk.status === 'COMPLETED'
        ? 'Completed'
        : tsk.status === 'OVERDUE'
        ? 'Overdue'
        : tsk.status === 'CANCELLED'
        ? 'Cancelled'
        : 'To Do',
    startDate: tsk.startDate ? tsk.startDate.split('T')[0] : '',
    deadline: tsk.deadline ? tsk.deadline.split('T')[0] : '',
    reminder: tsk.reminderTime || '1 day before deadline',
    comments: (tsk.comments || []).map((c) => ({
      id: c.id,
      author: c.author,
      text: c.content,
      time: c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
    })),
  });

  const normalizeLead = (ld) => ({
    id: ld.id,
    leadCode: ld.leadCode,
    leadName: ld.leadName,
    companyName: ld.companyName || '',
    mobileNumber: ld.mobileNumber,
    email: ld.email || '',
    location: ld.location || '',
    requirement: ld.requirement || '',
    productInterested: ld.productInterested,
    source: ld.source || 'Website',
    leadAddedBy: ld.leadAddedBy || 'Website Form (Auto)',
    assignedTo: ld.assignedTo?.name || 'Unassigned',
    assignedToId: ld.assignedTo?.employeeCode || ld.assignedToId,
    status:
      ld.status === 'QUOTATION_SENT'
        ? 'Quotation Sent'
        : ld.status === 'CONTACTED'
        ? 'Contacted'
        : ld.status === 'FOLLOW_UP'
        ? 'Follow-up'
        : ld.status === 'QUALIFIED'
        ? 'Qualified'
        : ld.status === 'NEGOTIATION'
        ? 'Negotiation'
        : ld.status === 'WON'
        ? 'Won'
        : ld.status === 'LOST'
        ? 'Lost'
        : 'New',
    priority:
      ld.priority === 'URGENT'
        ? 'Urgent'
        : ld.priority === 'HIGH'
        ? 'High'
        : ld.priority === 'LOW'
        ? 'Low'
        : 'Medium',
    notes: ld.notes || '',
    followUpDate: ld.followUpDate ? ld.followUpDate.split('T')[0] : '',
    createdDate: ld.createdAt ? ld.createdAt.split('T')[0] : '',
  });

  const normalizeProduct = (prod) => ({
    id: prod.id,
    productCode: prod.productCode,
    name: prod.name,
    brand: prod.brand,
    category: prod.category,
    productType: prod.productType || '',
    subcategory: prod.subcategory || '',
    status: prod.status || 'Active',
    documents: (prod.documents || []).map((d) => ({
      id: d.id,
      title: d.title,
      docType: d.documentType === 'datasheet' ? 'Datasheet' : d.documentType,
      fileName: d.fileName,
      fileSize: d.fileSize || '1.0 MB',
      version: d.version || 'v1.0',
      uploadedBy: d.uploadedBy || 'Admin',
      uploadedDate: d.createdAt ? d.createdAt.split('T')[0] : '',
      fileUrl: d.fileUrl || '/datasheets/sample.pdf',
    })),
  });

  const normalizeNotification = (notif) => ({
    id: notif.id,
    title: notif.title,
    message: notif.message,
    time: notif.createdAt
      ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Just now',
    unread: !notif.isRead,
    type: notif.type || 'system',
    relatedType: notif.relatedType,
    relatedId: notif.relatedId,
  });

  const normalizeMessage = (msg) => ({
    id: msg.id,
    senderId: msg.senderId,
    senderName: msg.sender?.employee?.name || msg.sender?.email?.split('@')[0] || 'User',
    recipientId: msg.recipientId || '',
    recipientName: 'Team Member',
    text: msg.content,
    time: msg.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Just now',
    timestamp: msg.createdAt,
    isRead: !!msg.isRead,
  });

  // Fetch all domain data from Backend Database
  const fetchAllData = useCallback(async () => {
    try {
      const [
        empRes,
        attRes,
        leaveRes,
        taskRes,
        leadRes,
        prodRes,
        notifRes,
        settRes,
        auditRes,
      ] = await Promise.all([
        apiRequest('/employees'),
        apiRequest('/attendance'),
        apiRequest('/leaves'),
        apiRequest('/tasks'),
        apiRequest('/leads'),
        apiRequest('/products'),
        apiRequest('/notifications'),
        apiRequest('/settings'),
        apiRequest('/audit'),
      ]);

      if (empRes?.success && empRes.data) {
        setEmployees(empRes.data.map(normalizeEmployee));
      }
      if (attRes?.success && attRes.data) {
        const normalizedAtt = attRes.data.map(normalizeAttendance);
        setAttendance(normalizedAtt);

        // Check if current user is checked in today
        const todayStr = new Date().toISOString().split('T')[0];
        const userAttToday = normalizedAtt.find(
          (a) => a.date === todayStr && a.checkIn && a.checkOut === '-'
        );
        setCheckedIn(!!userAttToday);
      }
      if (leaveRes?.success && leaveRes.data) {
        setLeaves(leaveRes.data.map(normalizeLeave));
      }
      if (taskRes?.success && taskRes.data) {
        setTasks(taskRes.data.map(normalizeTask));
      }
      if (leadRes?.success && leadRes.data) {
        setLeads(leadRes.data.map(normalizeLead));
      }
      if (prodRes?.success && prodRes.data) {
        setProducts(prodRes.data.map(normalizeProduct));
      }
      if (notifRes?.success && notifRes.data) {
        setNotifications(notifRes.data.map(normalizeNotification));
      }
      if (settRes?.success && settRes.data) {
        setSystemSettings((prev) => ({ ...prev, ...settRes.data }));
      }
      if (auditRes?.success && auditRes.data) {
        setAuditLogs(
          auditRes.data.map((log) => ({
            id: log.id,
            action: log.action,
            performedBy: log.user?.employee?.name || log.user?.email || 'System',
            target: `${log.entityType}: ${log.entityId || ''}`,
            time: log.createdAt ? new Date(log.createdAt).toLocaleString() : '',
          }))
        );
      }
    } catch (err) {
      console.error('[CrmContext Fetch Error]:', err);
    }
  }, []);

  // Load content translation bundle whenever locale changes
  useEffect(() => {
    loadContentBundle(locale);
  }, [locale, loadContentBundle]);

  // Load available enabled languages on startup
  useEffect(() => {
    async function loadLanguages() {
      const res = await apiRequest('/content/languages');
      if (res?.success && res.data?.length > 0) {
        setAvailableLanguages(res.data);
      }
    }
    loadLanguages();
  }, []);

  // Check authenticated session on startup
  useEffect(() => {
    async function checkAuth() {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('crm_token') : null;
      if (storedToken) {
        setAuthToken(storedToken);
        const meRes = await apiRequest('/auth/me');
        if (meRes?.success && meRes.data) {
          const user = meRes.data;
          setCurrentUser({
            id: user.employee?.employeeCode || user.employee?.id || user.id,
            realId: user.employee?.id || user.id,
            userId: user.userId || user.email?.split('@')[0],
            name: user.employee?.name || user.email,
            email: user.email,
            role: user.role,
            department: user.employee?.department || 'Operations',
            designation: user.employee?.designation || 'Staff',
            status: user.isActive ? 'Active' : 'Inactive',
            avatar: user.employee?.avatar || 'SE',
            permissions: user.permissions || DEFAULT_PERMISSIONS,
          });
          setCurrentRole(user.role);
          setIsAuthenticated(true);
        } else {
          // Token invalid or expired
          localStorage.removeItem('crm_token');
          setAuthToken(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoadingAuth(false);
    }

    checkAuth();
  }, []);

  // When authenticated, load all database collections
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, fetchAllData]);

  // Login Handler (Real Database Authentication)
  const login = async (credential, password, mode = 'ADMIN') => {
    const payload =
      mode === 'ADMIN'
        ? { email: credential, password }
        : { userId: credential, password };

    const res = await apiRequest('/auth/login', 'POST', payload);
    if (res?.success && res.data) {
      const { token, user } = res.data;
      localStorage.setItem('crm_token', token);
      setAuthToken(token);
      setCurrentUser({
        id: user.employee?.employeeCode || user.employee?.id || user.id,
        realId: user.employee?.id || user.id,
        userId: user.userId || user.email?.split('@')[0],
        name: user.employee?.name || user.email,
        email: user.email,
        role: user.role,
        department: user.employee?.department || 'Operations',
        designation: user.employee?.designation || 'Staff',
        status: 'Active',
        avatar: user.employee?.avatar || 'SE',
        permissions: user.permissions || DEFAULT_PERMISSIONS,
      });
      setCurrentRole(user.role);
      setIsAuthenticated(true);
      return { success: true };
    }

    return { success: false, message: res?.message || 'Login failed. Please check credentials.' };
  };

  // Logout Handler
  const logout = async () => {
    await apiRequest('/auth/logout', 'POST');
    localStorage.removeItem('crm_token');
    setAuthToken(null);
    setIsAuthenticated(false);
    router.push('/');
  };

  // Switch User (Prototype / Testing Persona Selector)
  const switchUser = async (targetUserId) => {
    const emp = employees.find((e) => e.userId === targetUserId || e.id === targetUserId);
    if (!emp) return;

    setCurrentUser(emp);
    setCurrentRole(emp.role);
  };

  // ----------------------------------------------------
  // EMPLOYEE MANAGEMENT (Persistent Database Sync)
  // ----------------------------------------------------
  const addEmployee = async (empData) => {
    const res = await apiRequest('/employees', 'POST', {
      name: empData.name,
      email: empData.email,
      mobile: empData.mobile,
      department: empData.department,
      designation: empData.designation,
      reportingManager: empData.reportingManager,
      joiningDate: empData.joiningDate,
      role: empData.role || 'EMPLOYEE',
      userId: empData.userId,
      permissions: empData.permissions,
      idCardType: empData.idCardType,
      idCardNumber: empData.idCardNumber,
    });

    if (res?.success && res.data) {
      const normalized = normalizeEmployee(res.data);
      setEmployees((prev) => [normalized, ...prev]);
      return normalized;
    }
    return null;
  };

  const updateEmployee = async (empId, updatedData) => {
    const emp = employees.find((e) => e.id === empId);
    const realId = emp?.realId || empId;

    await apiRequest(`/employees/${realId}`, 'PUT', updatedData);
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, ...updatedData } : e))
    );
  };

  const deactivateEmployee = async (empId) => {
    const emp = employees.find((e) => e.id === empId);
    const realId = emp?.realId || empId;

    await apiRequest(`/employees/${realId}/status`, 'PATCH', { active: false });
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, status: 'Inactive' } : e))
    );
  };

  const reactivateEmployee = async (empId) => {
    const emp = employees.find((e) => e.id === empId);
    const realId = emp?.realId || empId;

    await apiRequest(`/employees/${realId}/status`, 'PATCH', { active: true });
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, status: 'Active' } : e))
    );
  };

  const updateEmployeePermissions = async (empId, newPermissions) => {
    const emp = employees.find((e) => e.id === empId);
    const realId = emp?.realId || empId;

    await apiRequest(`/employees/${realId}/permissions`, 'PATCH', { permissions: newPermissions });
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, permissions: newPermissions } : e))
    );
    if (currentUser.id === empId) {
      setCurrentUser((prev) => ({ ...prev, permissions: newPermissions }));
    }
  };

  // ----------------------------------------------------
  // DAILY ATTENDANCE & SHIFTS (Persistent Database Sync)
  // ----------------------------------------------------
  const toggleCheckIn = async () => {
    if (!checkedIn) {
      // Check In
      const res = await apiRequest('/attendance/check-in', 'POST', { source: 'CRM Web' });
      if (res?.success && res.data) {
        setCheckedIn(true);
        const normalized = normalizeAttendance(res.data);
        setAttendance((prev) => [normalized, ...prev.filter((a) => a.id !== normalized.id)]);
      }
    } else {
      // Check Out
      const res = await apiRequest('/attendance/check-out', 'POST');
      if (res?.success && res.data) {
        setCheckedIn(false);
        const normalized = normalizeAttendance(res.data);
        setAttendance((prev) =>
          prev.map((a) => (a.id === normalized.id ? normalized : a))
        );
      }
    }
  };

  const correctAttendance = async (recordId, newStatus, reason) => {
    const statusMap = {
      Present: 'PRESENT',
      Late: 'LATE',
      'Half Day': 'HALF_DAY',
      Absent: 'ABSENT',
      'On Leave': 'ON_LEAVE',
    };

    await apiRequest(`/attendance/${recordId}/correct`, 'PATCH', {
      attendanceStatus: statusMap[newStatus] || newStatus,
      correctionReason: reason,
    });

    setAttendance((prev) =>
      prev.map((a) =>
        a.id === recordId
          ? {
              ...a,
              status: newStatus,
              correctedBy: currentUser.name,
              correctionReason: reason,
            }
          : a
      )
    );
  };

  // ----------------------------------------------------
  // LEAVE MANAGEMENT (Persistent Database Sync)
  // ----------------------------------------------------
  const applyLeave = async (leaveData) => {
    const res = await apiRequest('/leaves', 'POST', {
      leaveType: leaveData.leaveType,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      totalDays: leaveData.totalDays || 1,
      reason: leaveData.reason,
    });

    if (res?.success && res.data) {
      const normalized = normalizeLeave(res.data);
      setLeaves((prev) => [normalized, ...prev]);
      return normalized;
    }
    return null;
  };

  const approveLeave = async (leaveId, remarks = '') => {
    await apiRequest(`/leaves/${leaveId}/status`, 'PATCH', {
      status: 'APPROVED',
      reviewerRemarks: remarks,
    });

    setLeaves((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status: 'Approved', adminRemarks: remarks } : l))
    );
  };

  const rejectLeave = async (leaveId, remarks = '') => {
    await apiRequest(`/leaves/${leaveId}/status`, 'PATCH', {
      status: 'REJECTED',
      reviewerRemarks: remarks,
    });

    setLeaves((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status: 'Rejected', adminRemarks: remarks } : l))
    );
  };

  // ----------------------------------------------------
  // TASK MANAGEMENT (Persistent Database Sync)
  // ----------------------------------------------------
  const addTask = async (taskData) => {
    const res = await apiRequest('/tasks', 'POST', {
      title: taskData.title,
      description: taskData.description,
      priority: (taskData.priority || 'MEDIUM').toUpperCase(),
      assignedToId: taskData.assignedToRealId || taskData.assignedToId,
      startDate: taskData.startDate,
      deadline: taskData.deadline,
      reminderTime: taskData.reminder,
    });

    if (res?.success && res.data) {
      const normalized = normalizeTask(res.data);
      setTasks((prev) => [normalized, ...prev]);
      return normalized;
    }
    return null;
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    const statusMap = {
      'To Do': 'TODO',
      'In Progress': 'IN_PROGRESS',
      Completed: 'COMPLETED',
      Overdue: 'OVERDUE',
      Cancelled: 'CANCELLED',
    };

    await apiRequest(`/tasks/${taskId}/status`, 'PATCH', {
      status: statusMap[newStatus] || newStatus,
    });

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const addTaskComment = async (taskId, commentText) => {
    const res = await apiRequest(`/tasks/${taskId}/comments`, 'POST', {
      content: commentText,
      author: currentUser.name,
    });

    const newComment = {
      id: res?.data?.id || `c-${Date.now()}`,
      author: currentUser.name,
      text: commentText,
      time: 'Just now',
    };

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, comments: [...(t.comments || []), newComment] } : t
      )
    );
  };

  // ----------------------------------------------------
  // LEADS & PIPELINE (Persistent Database Sync)
  // ----------------------------------------------------
  const addLead = async (leadData) => {
    const res = await apiRequest('/leads', 'POST', {
      leadName: leadData.leadName || leadData.contactPerson,
      companyName: leadData.companyName,
      mobileNumber: leadData.mobileNumber || leadData.phone,
      email: leadData.email,
      location: leadData.location,
      requirement: leadData.requirement,
      productInterested: leadData.productInterested,
      source: leadData.source || 'website',
      priority: (leadData.priority || 'MEDIUM').toUpperCase(),
      assignedToId: leadData.assignedToId,
      followUpDate: leadData.followUpDate,
      notes: leadData.notes,
    });

    if (res?.success && res.data) {
      const normalized = normalizeLead(res.data);
      setLeads((prev) => [normalized, ...prev]);
      return normalized;
    }
    return null;
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    const statusMap = {
      New: 'NEW',
      Contacted: 'CONTACTED',
      'Follow-up': 'FOLLOW_UP',
      Qualified: 'QUALIFIED',
      'Quotation Sent': 'QUOTATION_SENT',
      Negotiation: 'NEGOTIATION',
      Won: 'WON',
      Lost: 'LOST',
    };

    await apiRequest(`/leads/${leadId}/status`, 'PATCH', {
      status: statusMap[newStatus] || newStatus,
    });

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
  };

  const updateLead = async (leadId, updatedFields) => {
    await apiRequest(`/leads/${leadId}`, 'PATCH', updatedFields);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, ...updatedFields } : l))
    );
  };

  // ----------------------------------------------------
  // PRODUCT & DOCUMENT LIBRARY (Single Source of Truth)
  // ----------------------------------------------------
  const addProduct = async (prodData) => {
    const res = await apiRequest('/products', 'POST', prodData);
    if (res?.success && res.data) {
      const normalized = normalizeProduct(res.data);
      setProducts((prev) => [normalized, ...prev]);
      return normalized;
    }
    return null;
  };

  const uploadProductDocument = async (productId, docData) => {
    const res = await apiRequest(`/products/${productId}/documents`, 'POST', {
      title: docData.title || 'Technical Datasheet (TDS)',
      documentType: docData.docType || 'datasheet',
      fileName: docData.fileName,
      fileSize: docData.fileSize || '1.2 MB',
      version: docData.version || 'v1.0',
      fileUrl: docData.fileUrl || '/datasheets/sample.pdf',
      uploadedBy: currentUser.name,
    });

    if (res?.success && res.data) {
      const newDoc = {
        id: res.data.id,
        title: res.data.title,
        docType: res.data.documentType,
        fileName: res.data.fileName,
        fileSize: res.data.fileSize,
        version: res.data.version,
        uploadedBy: res.data.uploadedBy,
        uploadedDate: res.data.createdAt ? res.data.createdAt.split('T')[0] : '',
        fileUrl: res.data.fileUrl,
      };

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, documents: [...(p.documents || []), newDoc] } : p
        )
      );
    }
  };

  const replaceProductDocument = async (productId, docId, newDocData) => {
    const res = await apiRequest(`/products/${productId}/documents/${docId}`, 'PUT', {
      title: newDocData.title,
      fileName: newDocData.fileName,
      version: newDocData.version,
      fileSize: newDocData.fileSize,
      fileUrl: newDocData.fileUrl,
      uploadedBy: currentUser.name,
    });

    if (res?.success && res.data) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          return {
            ...p,
            documents: (p.documents || []).map((doc) =>
              doc.id === docId
                ? {
                    ...doc,
                    title: res.data.title,
                    fileName: res.data.fileName,
                    version: res.data.version,
                    fileSize: res.data.fileSize,
                    fileUrl: res.data.fileUrl,
                    uploadedBy: res.data.uploadedBy,
                    uploadedDate: new Date().toISOString().split('T')[0],
                  }
                : doc
            ),
          };
        })
      );
    }
  };

  const deleteProductDocument = async (productId, docId) => {
    await apiRequest(`/products/${productId}/documents/${docId}`, 'DELETE');
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, documents: (p.documents || []).filter((d) => d.id !== docId) }
          : p
      )
    );
  };

  // ----------------------------------------------------
  // INTERNAL MESSAGING (Database Persistence + Direct & Groups)
  // ----------------------------------------------------
  const sendMessage = async (recipientOrGroupId, text, isGroup = false) => {
    let newMsg;
    if (isGroup) {
      const group = groups.find((g) => g.id === recipientOrGroupId);
      newMsg = {
        id: `MSG-G-${Date.now()}`,
        groupId: recipientOrGroupId,
        groupName: group?.name || 'Team Group',
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase(),
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString(),
        isRead: true,
      };
    } else {
      const recipient = employees.find((e) => e.id === recipientOrGroupId);
      newMsg = {
        id: `MSG-${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase(),
        recipientId: recipientOrGroupId,
        recipientName: recipient?.name || 'Team Member',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      try {
        await apiRequest('/messages', 'POST', {
          recipientId: recipientOrGroupId,
          message: text,
        });
      } catch (err) {
        console.error('API message error:', err);
      }
    }

    setMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  const createGroup = (name, memberIds, description = '') => {
    const newGroup = {
      id: `GRP-${Date.now()}`,
      name,
      description,
      memberIds: Array.from(new Set([currentUser.id, ...memberIds])),
      createdBy: currentUser.name,
      createdAt: new Date().toISOString().split('T')[0],
      avatar:
        name
          .split(' ')
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'GP',
    };
    setGroups((prev) => [newGroup, ...prev]);
    return newGroup;
  };

  const markConversationRead = async (otherUserId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.recipientId === currentUser.id && m.senderId === otherUserId ? { ...m, isRead: true } : m
      )
    );
  };

  const markGroupRead = (groupId) => {
    setMessages((prev) =>
      prev.map((m) => (m.groupId === groupId ? { ...m, isRead: true } : m))
    );
  };

  // ----------------------------------------------------
  // NOTIFICATIONS (Database Persistence)
  // ----------------------------------------------------
  const markNotificationRead = async (notifId) => {
    await apiRequest(`/notifications/${notifId}/read`, 'PATCH');
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n))
    );
  };

  const markAllNotificationsRead = async () => {
    await apiRequest('/notifications/mark-all-read', 'PATCH');
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // ----------------------------------------------------
  // SYSTEM SETTINGS (Database Persistence)
  // ----------------------------------------------------
  const updateSystemSettings = async (newSettings) => {
    await apiRequest('/settings', 'PATCH', newSettings);
    setSystemSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // ----------------------------------------------------
  // REPORTS & PAYROLL
  // ----------------------------------------------------
  const generateMonthlyPayrollData = (month, year, filterDept = 'ALL', filterEmpId = 'ALL') => {
    const workingDays = systemSettings.workingDaysPerMonth || 26;

    let targetEmployees = employees.filter((e) => e.status === 'Active');
    if (filterDept !== 'ALL') {
      targetEmployees = targetEmployees.filter((e) => e.department === filterDept);
    }
    if (filterEmpId !== 'ALL') {
      targetEmployees = targetEmployees.filter((e) => e.id === filterEmpId);
    }

    return targetEmployees.map((emp) => {
      const empAtt = attendance.filter((a) => a.employeeId === emp.id);
      const presentDays = empAtt.filter((a) => a.status === 'Present').length;
      const lateDays = empAtt.filter((a) => a.status === 'Late' || a.isLate).length;
      const leaveDays = leaves
        .filter((l) => l.employeeId === emp.id && l.status === 'Approved')
        .reduce((acc, l) => acc + (l.totalDays || 0), 0);
      const halfDays = empAtt.filter((a) => a.status === 'Half Day').length;
      const absentDays = Math.max(0, workingDays - presentDays - lateDays - leaveDays);
      const totalLateMinutes = empAtt
        .filter((a) => a.isLate)
        .reduce((acc, a) => acc + (a.lateMinutes || 0), 0);
      const totalHours = (presentDays + lateDays) * 8.5;

      return {
        employeeId: emp.id,
        employeeCode: emp.id,
        employeeName: emp.name,
        department: emp.department,
        designation: emp.designation,
        workingDays,
        presentDays: Math.min(workingDays, presentDays),
        absentDays,
        leaveDays,
        halfDays,
        lateDays,
        totalLateMinutes,
        totalHours: `${totalHours.toFixed(1)} hrs`,
        weeklyOffs: 4,
        checkInSummary: '09:45 AM Avg',
        checkOutSummary: '06:15 PM Avg',
      };
    });
  };

  const exportPayrollReportCSV = (month, year) => {
    const data = generateMonthlyPayrollData(month, year);
    const headers = [
      'Team Member ID',
      'Team Member Name',
      'Department',
      'Designation',
      'Working Days',
      'Present Days',
      'Absent Days',
      'Leave Days',
      'Late Days',
      'Total Late (Mins)',
      'Total Working Hours',
      'Weekly Offs',
    ];

    const rows = data.map((d) => [
      d.employeeId,
      `"${d.employeeName}"`,
      `"${d.department}"`,
      `"${d.designation}"`,
      d.workingDays,
      d.presentDays,
      d.absentDays,
      d.leaveDays,
      d.lateDays,
      d.totalLateMinutes,
      `"${d.totalHours}"`,
      d.weeklyOffs,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Swaati_Enterprises_Payroll_Report_${month}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <CrmContext.Provider
      value={{
        // Localization & Content Management
        locale,
        setLocale,
        t,
        availableLanguages,
        contentBundle,
        loadContentBundle,

        // Auth & Role
        currentUser,
        currentRole,
        isAuthenticated,
        isLoadingAuth,
        login,
        logout,
        switchUser,
        hasPermission,
        fetchAllData,

        // Domain Collections & Operations
        employees,
        addEmployee,
        updateEmployee,
        deactivateEmployee,
        reactivateEmployee,
        updateEmployeePermissions,

        attendance,
        checkedIn,
        toggleCheckIn,
        correctAttendance,

        leaves,
        applyLeave,
        approveLeave,
        rejectLeave,

        tasks,
        addTask,
        updateTaskStatus,
        addTaskComment,

        leads,
        addLead,
        updateLeadStatus,
        updateLead,

        products,
        addProduct,
        uploadProductDocument,
        replaceProductDocument,
        deleteProductDocument,

        messages,
        groups,
        sendMessage,
        createGroup,
        markConversationRead,
        markGroupRead,

        notifications,
        markNotificationRead,
        markAllNotificationsRead,

        systemSettings,
        updateSystemSettings,
        auditLogs,

        // Reports
        generateMonthlyPayrollData,
        exportPayrollReportCSV,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
}
