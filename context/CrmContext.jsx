'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import {
  INITIAL_EMPLOYEES,
  INITIAL_LEADS,
  INITIAL_TASKS,
  INITIAL_CUSTOMERS,
  INITIAL_FOLLOW_UPS,
  INITIAL_ATTENDANCE,
  INITIAL_NOTIFICATIONS,
  MOCK_PRODUCTS,
} from './mockData';

const CrmContext = createContext();

export function CrmProvider({ children }) {
  // Demo Role State: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  const [currentRole, setCurrentRole] = useState('ADMIN');
  const [currentUser, setCurrentUser] = useState(INITIAL_EMPLOYEES[0]); // Default Admin

  // Domain States
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [followUps, setFollowUps] = useState(INITIAL_FOLLOW_UPS);
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  // Check-In / Check-Out Toggle State for Current User
  const [checkedIn, setCheckedIn] = useState(true);

  // Initial Sync with Backend API
  useEffect(() => {
    async function loadBackendData() {
      // 1. Fetch Employees
      const empRes = await apiRequest('/employees');
      if (empRes?.success && Array.isArray(empRes.data) && empRes.data.length > 0) {
        setEmployees(empRes.data);
      }

      // 2. Fetch Tasks
      const taskRes = await apiRequest('/tasks');
      if (taskRes?.success && Array.isArray(taskRes.data) && taskRes.data.length > 0) {
        setTasks(taskRes.data);
      }

      // 3. Fetch Leads
      const leadRes = await apiRequest('/leads');
      if (leadRes?.success && Array.isArray(leadRes.data) && leadRes.data.length > 0) {
        setLeads(leadRes.data);
      }

      // 4. Fetch Customers
      const custRes = await apiRequest('/customers');
      if (custRes?.success && Array.isArray(custRes.data) && custRes.data.length > 0) {
        setCustomers(custRes.data);
      }

      // 5. Fetch Attendance
      const attRes = await apiRequest('/attendance');
      if (attRes?.success && Array.isArray(attRes.data) && attRes.data.length > 0) {
        setAttendance(attRes.data);
      }
    }

    loadBackendData();
  }, []);

  // Role Switcher Function (with API Sync attempt)
  const setDemoRole = async (role) => {
    setCurrentRole(role);
    let targetEmail = 'admin@swaatienterprises.in';
    let targetUser = INITIAL_EMPLOYEES[0];

    if (role === 'MANAGER') {
      targetEmail = 'manager@swaatienterprises.in';
      targetUser = INITIAL_EMPLOYEES[1];
    } else if (role === 'EMPLOYEE') {
      targetEmail = 'employee@swaatienterprises.in';
      targetUser = INITIAL_EMPLOYEES[3];
    }

    setCurrentUser(targetUser);

    // Call API Login
    await apiRequest('/auth/login', 'POST', {
      email: targetEmail,
      password: role === 'ADMIN' ? 'Admin@123' : role === 'MANAGER' ? 'Manager@123' : 'Employee@123',
    });
  };

  // State & API Modifiers
  const addEmployee = async (empData) => {
    const apiRes = await apiRequest('/employees', 'POST', empData);
    const newEmp = apiRes?.success
      ? apiRes.data
      : {
          ...empData,
          id: `EMP-${100 + employees.length + 1}`,
          avatar: empData.name.split(' ').map((n) => n[0]).join('').toUpperCase(),
          status: 'Active',
          joiningDate: empData.joiningDate || new Date().toISOString().split('T')[0],
        };
    setEmployees([newEmp, ...employees]);
  };

  const updateEmployeeStatus = async (empId, newStatus) => {
    await apiRequest(`/employees/${empId}/status`, 'PATCH', { status: newStatus });
    setEmployees(
      employees.map((emp) => (emp.id === empId ? { ...emp, status: newStatus } : emp))
    );
  };

  const addTask = async (taskData) => {
    const apiRes = await apiRequest('/tasks', 'POST', taskData);
    const newTask = apiRes?.success
      ? apiRes.data
      : {
          ...taskData,
          id: `TSK-${500 + tasks.length + 1}`,
          createdBy: currentUser.name,
          status: 'To Do',
          startDate: new Date().toISOString().split('T')[0],
        };
    setTasks([newTask, ...tasks]);
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    await apiRequest(`/tasks/${taskId}/status`, 'PATCH', { status: newStatus });
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    );
  };

  const addLead = async (leadData) => {
    const apiRes = await apiRequest('/leads', 'POST', leadData);
    const newLead = apiRes?.success
      ? apiRes.data
      : {
          ...leadData,
          id: `LEAD-2026-00${leads.length + 1}`,
          status: 'New',
          createdDate: new Date().toISOString().split('T')[0],
        };
    setLeads([newLead, ...leads]);
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    await apiRequest(`/leads/${leadId}/status`, 'PATCH', { status: newStatus });
    setLeads(
      leads.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
    );
  };

  const updateFollowUpStatus = async (followUpId, newStatus) => {
    await apiRequest(`/follow-ups/${followUpId}/status`, 'PATCH', { status: newStatus });
    setFollowUps(
      followUps.map((item) => (item.id === followUpId ? { ...item, status: newStatus } : item))
    );
  };

  const toggleCheckIn = async () => {
    const endpoint = !checkedIn ? '/attendance/check-in' : '/attendance/check-out';
    await apiRequest(endpoint, 'POST');
    setCheckedIn(!checkedIn);

    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title: !checkedIn ? 'Check-In Success' : 'Check-Out Success',
      message: `${currentUser.name} marked ${!checkedIn ? 'Check-In' : 'Check-Out'} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      time: 'Just now',
      unread: true,
      type: 'attendance',
    };
    setNotifications([newNotif, ...notifications]);
  };

  const markNotificationRead = async (notifId) => {
    await apiRequest(`/notifications/${notifId}/read`, 'PATCH');
    setNotifications(
      notifications.map((n) => (n.id === notifId ? { ...n, unread: false } : n))
    );
  };

  return (
    <CrmContext.Provider
      value={{
        currentRole,
        currentUser,
        setDemoRole,
        employees,
        addEmployee,
        updateEmployeeStatus,
        leads,
        addLead,
        updateLeadStatus,
        tasks,
        addTask,
        updateTaskStatus,
        customers,
        followUps,
        updateFollowUpStatus,
        attendance,
        checkedIn,
        toggleCheckIn,
        notifications,
        markNotificationRead,
        products,
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
