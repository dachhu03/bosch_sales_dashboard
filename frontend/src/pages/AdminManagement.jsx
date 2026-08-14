import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Key, 
  X, 
  Check, 
  Lock, 
  AlertCircle,
  Tag,
  Trash2,
  Bell,
  FileText,
  Clock,
  MessageSquare,
  Send,
  RefreshCw,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

export default function AdminManagement() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'notifications'
  
  // User Management State
  const [users, setUsers] = useState([]);
  const [rolesMap, setRolesMap] = useState({});
  const [permissionCatalog, setPermissionCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Notifications & Review Panel State
  const [notifications, setNotifications] = useState([]);
  const [boqs, setBoqs] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [reviewModalBoq, setReviewModalBoq] = useState(null);
  const [reviewForm, setReviewForm] = useState({ review_status: 'APPROVED', review_remarks: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => {
      setErrorMsg('');
    }, 5000);
  };

  // User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Form State for User
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'presales_admin',
    permissions: []
  });

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [usersRes, rolesRes] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/roles-permissions')
      ]);

      if (usersRes.data.status === 'success') {
        setUsers(usersRes.data.data.users || []);
      }
      if (rolesRes.data.status === 'success') {
        setRolesMap(rolesRes.data.data.rolePermissionsMap || {});
        setPermissionCatalog(rolesRes.data.data.permissionCatalog || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load user administration data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await axios.get('/admin/notifications');
      if (res.data.status === 'success') {
        setNotifications(res.data.data.notifications || []);
        setBoqs(res.data.data.boqs || []);
        setPendingCount(res.data.data.pendingCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    const defaultRole = 'presales_admin';
    setFormData({
      username: '',
      email: '',
      password: '',
      role: defaultRole,
      permissions: rolesMap[defaultRole] || ['ratecard:read', 'ratecard:write', 'boq:read', 'boq:write', 'reports:read']
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      password: '',
      role: user.role || 'presales_admin',
      permissions: Array.isArray(user.permissions) ? user.permissions : []
    });
    setIsModalOpen(true);
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: rolesMap[newRole] ? [...rolesMap[newRole]] : prev.permissions
    }));
  };

  const handleTogglePermission = (permKey) => {
    setFormData(prev => {
      const current = prev.permissions || [];
      const updated = current.includes(permKey)
        ? current.filter(p => p !== permKey)
        : [...current, permKey];
      return { ...prev, permissions: updated };
    });
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (modalMode === 'create') {
        const response = await axios.post('/admin/users', formData);
        if (response.data.status === 'success') {
          showSuccess('User account created successfully.');
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const response = await axios.put(`/admin/users/${selectedUser.id}`, formData);
        if (response.data.status === 'success') {
          showSuccess('User updated successfully.');
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error('Submit user form error:', err);
      showError(err.response?.data?.message || 'Failed to save user configuration.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActiveStatus = async (user) => {
    const newStatus = user.is_active === 1 ? 0 : 1;
    try {
      const response = await axios.patch(`/admin/users/${user.id}/status`, { is_active: newStatus });
      if (response.data.status === 'success') {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
        showSuccess(`User ${user.username} is now ${newStatus === 1 ? 'Active' : 'Inactive'}.`);
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      showError(err.response?.data?.message || 'Failed to update user active status.');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const targetUser = userToDelete;
    setIsDeletingUser(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await axios.delete(`/admin/users/${targetUser.id}`);
      if (response.data.status === 'success') {
        setUsers(prev => prev.filter(u => u.id !== targetUser.id));
        setUserToDelete(null);
        showSuccess(`User account '${targetUser.username}' deleted successfully.`);
      } else {
        showError(response.data.message || 'Failed to delete user account.');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      const msg = err.response?.data?.message || 'Failed to delete user account.';
      showError(msg);
      setUserToDelete(null);
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Open BOQ Review Modal
  const handleOpenReviewModal = (boq) => {
    setReviewModalBoq(boq);
    setReviewForm({
      review_status: boq.reviewStatus || 'APPROVED',
      review_remarks: boq.reviewRemarks || ''
    });
  };

  // Submit BOQ Review Update
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalBoq) return;

    setSubmittingReview(true);
    try {
      const res = await axios.patch(`/admin/boq/${reviewModalBoq.id}/review`, reviewForm);
      if (res.data.status === 'success') {
        showSuccess(`BOQ #${reviewModalBoq.id} review status updated to "${res.data.data.reviewStatus}".`);
        setReviewModalBoq(null);
        fetchNotifications();
      }
    } catch (err) {
      console.error('Submit BOQ review error:', err);
      showError(err.response?.data?.message || 'Failed to update BOQ review status.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'price_admin':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'presales_admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'viewer':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'price_admin': return 'Price Admin';
      case 'presales_admin': return 'Pre-Sales Admin';
      case 'viewer': return 'Viewer (Read Only)';
      default: return role;
    }
  };

  const getReviewBadgeStyle = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300';
      case 'IN_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300';
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
      default: // PENDING_REVIEW
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-100/90 via-blue-50/80 to-sky-100/90 dark:from-slate-900/90 dark:via-slate-900/95 dark:to-slate-950/90 p-6 rounded-2xl border border-sky-200/80 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-bosch-blue to-bosch-lightBlue flex items-center justify-center text-white shadow-lg shadow-bosch-blue/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Super Admin & RBAC Control Center</h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Manage system access roles, user provisioning, and BOQ save review notifications.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-bosch-blue to-bosch-lightBlue text-white font-bold text-xs rounded-xl shadow-md shadow-bosch-blue/20 hover:shadow-lg hover:shadow-bosch-blue/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision New User</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'users'
              ? 'bg-bosch-blue text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Administration & Security</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('notifications');
            fetchNotifications();
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all relative ${
            activeTab === 'notifications'
              ? 'bg-bosch-blue text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>BOQ Notifications & Internal Review</span>
          {pendingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white font-black text-[10px] rounded-full animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Global Notifications */}
      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/70 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-md"><X className="w-3.5 h-3.5" /></button>
        </motion.div>
      )}

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/70 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-md"><X className="w-3.5 h-3.5" /></button>
        </motion.div>
      )}

      {/* TAB 1: User Administration */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Stats Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-bosch-blue/30 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Total Accounts: <strong className="text-slate-900 dark:text-white">{users.length}</strong></span>
              <span>•</span>
              <span>Active: <strong className="text-emerald-600 dark:text-emerald-400">{users.filter(u => u.is_active === 1).length}</strong></span>
              <span>•</span>
              <span>Deactivated: <strong className="text-rose-500">{users.filter(u => u.is_active === 0).length}</strong></span>
            </div>
          </div>

          {/* User Directory Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-t-bosch-blue border-slate-200 rounded-full animate-spin"></div>
                <span className="text-xs font-semibold text-slate-400 mt-3">Loading user directory...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center p-12 text-slate-400 font-semibold text-xs">
                No matching user accounts found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 uppercase font-black tracking-wider text-slate-400 dark:text-slate-500 text-[10px]">
                    <tr>
                      <th className="py-3.5 px-6">User Account</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Assigned Permissions</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-sky-50/40 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-bosch-blue to-bosch-lightBlue flex items-center justify-center text-white font-bold text-xs shadow-sm">
                              {(user.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                <span>{user.username}</span>
                                {user.is_superuser === 1 && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold uppercase">Root</span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-normal">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getRoleBadgeStyle(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>

                        <td className="py-4 px-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(user.permissions) && user.permissions.map(p => (
                              <span key={p} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleToggleActiveStatus(user)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                              user.is_active === 1 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' 
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${user.is_active === 1 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span>{user.is_active === 1 ? 'Active' : 'Deactivated'}</span>
                          </button>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(user)}
                              className="p-1.5 text-slate-400 hover:text-bosch-blue hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit User Role & Permissions"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                              title="Delete User Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BOQ Notifications & Internal Review Panel */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-bosch-blue dark:text-bosch-accent" />
              Super Admin BOQ Save Notifications & Internal Review Panel
            </h3>
            <button
              onClick={fetchNotifications}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingNotifications ? 'animate-spin' : ''}`} />
              <span>Refresh Panel</span>
            </button>
          </div>

          {/* BOQ Review Queue Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-bosch-blue" />
                Submitted BOQ Solutions for Management Review
              </span>
              <span className="text-xs font-bold bg-blue-50 dark:bg-blue-950 text-bosch-blue dark:text-bosch-accent px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                {boqs.length} Total Quotes ({pendingCount} Pending Review)
              </span>
            </div>

            {loadingNotifications ? (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-t-bosch-blue border-slate-200 rounded-full animate-spin" />
                <span className="text-xs font-semibold text-slate-400 mt-3">Loading review queue...</span>
              </div>
            ) : boqs.length === 0 ? (
              <div className="text-center p-12 text-slate-400 font-semibold text-xs">
                No BOQ quotes available for review.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 uppercase font-black tracking-wider text-slate-400 dark:text-slate-500 text-[10px]">
                    <tr>
                      <th className="py-3.5 px-5">Project Details</th>
                      <th className="py-3.5 px-4">Solution Title</th>
                      <th className="py-3.5 px-4">Quotation #</th>
                      <th className="py-3.5 px-4">Prepared By</th>
                      <th className="py-3.5 px-4 text-right">Sales Value</th>
                      <th className="py-3.5 px-4 text-center">Internal Review Status</th>
                      <th className="py-3.5 px-5">Review Remarks</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {boqs.map((boq) => (
                      <tr key={boq.id} className="hover:bg-sky-50/40 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{boq.projectName}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{boq.projectLocation || 'N/A'}</div>
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {boq.solutionTitle || 'Custom Solution'}
                        </td>

                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {boq.quotationNumber || 'N/A'}
                        </td>

                        <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                          {boq.preparedBy}
                        </td>

                        <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          ₹{boq.salesTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getReviewBadgeStyle(boq.reviewStatus)}`}>
                            <span>{boq.reviewStatus}</span>
                          </span>
                        </td>

                        <td className="py-4 px-5 max-w-xs">
                          <div className="text-slate-600 dark:text-slate-400 truncate text-[11px]">
                            {boq.reviewRemarks || <span className="italic text-slate-400">No remarks yet</span>}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleOpenReviewModal(boq)}
                            className="px-3 py-1.5 bg-bosch-blue hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Email Notification Audit Logs Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Send className="w-4 h-4 text-bosch-blue" />
                Nodemailer Email Notification Audit Logs
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {notifications.length} Dispatch Logs
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center p-8 text-slate-400 font-semibold text-xs">
                No notification audit logs recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 uppercase font-black tracking-wider text-slate-400 dark:text-slate-500 text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Event Type</th>
                      <th className="py-3 px-4">BOQ ID</th>
                      <th className="py-3 px-4">Super Admin Recipient</th>
                      <th className="py-3 px-4">Event ID</th>
                      <th className="py-3 px-4 text-center">Dispatch Status</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                    {notifications.map((n) => (
                      <tr key={n.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {n.notificationType}
                        </td>
                        <td className="py-3 px-4 font-mono">#{n.boqId}</td>
                        <td className="py-3 px-4">{n.recipient}</td>
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-400 max-w-[140px] truncate">
                          {n.eventId || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            n.status === 'SENT' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {n.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-400">
                          {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOQ Review Modal */}
      {reviewModalBoq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Super Admin BOQ Review</h4>
                <p className="text-xs text-slate-400 mt-0.5">Project: {reviewModalBoq.projectName} (#{reviewModalBoq.id})</p>
              </div>
              <button onClick={() => setReviewModalBoq(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Review Status:
                </label>
                <select
                  value={reviewForm.review_status}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, review_status: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-bosch-blue/20"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                  <option value="IN_REVIEW">IN_REVIEW</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Review Remarks & Feedback:
                </label>
                <textarea
                  rows={4}
                  value={reviewForm.review_remarks}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, review_remarks: e.target.value }))}
                  placeholder="Record internal technical or commercial review remarks..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-bosch-blue/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalBoq(null)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-bosch-blue hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingReview ? (
                    <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Review Status</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* User Provisioning Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {modalMode === 'create' ? 'Provision New User Account' : `Edit User: ${selectedUser?.username}`}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {modalMode === 'create' ? 'Create new user and assign RBAC role permissions.' : 'Modify role and security permissions.'}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitModal} className="space-y-4 text-xs font-medium">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="e.g. jdoe_presales"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-bosch-blue/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. john.doe@bosch.com"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-bosch-blue/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {modalMode === 'create' ? 'Password *' : 'New Password (Leave blank to keep existing)'}
                  </label>
                  <input
                    type="password"
                    required={modalMode === 'create'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••••••"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-bosch-blue/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assign User Role *</label>
                  <select
                    value={formData.role}
                    onChange={handleRoleChange}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-bosch-blue/20"
                  >
                    <option value="presales_admin">Pre-Sales Admin</option>
                    <option value="price_admin">Price Admin</option>
                    <option value="super_admin">Super Admin (Full Root Access)</option>
                    <option value="viewer">Viewer (Read Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Fine-Grained Permissions:</label>
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto">
                    {permissionCatalog.map((perm) => {
                      const isChecked = (formData.permissions || []).includes(perm.key);
                      return (
                        <label key={perm.key} className="flex items-start gap-2.5 p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.key)}
                            className="mt-0.5 rounded text-bosch-blue focus:ring-bosch-blue/20"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">{perm.label}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{perm.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-gradient-to-r from-bosch-blue to-bosch-lightBlue text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : modalMode === 'create' ? 'Create User' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <button onClick={() => setUserToDelete(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Delete User Account?</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to delete user account <span className="font-bold text-slate-800 dark:text-slate-200">"{userToDelete.username}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeletingUser}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeletingUser ? (
                    <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
