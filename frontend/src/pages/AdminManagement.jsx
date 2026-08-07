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
  Trash2
} from 'lucide-react';

export default function AdminManagement() {
  const [users, setUsers] = useState([]);
  const [rolesMap, setRolesMap] = useState({});
  const [permissionCatalog, setPermissionCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'presales_admin',
    permissions: []
  });

  useEffect(() => {
    fetchData();
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-100/90 via-blue-50/80 to-sky-100/90 dark:from-slate-900/90 dark:via-slate-900/95 dark:to-slate-950/90 p-6 rounded-2xl border border-sky-200/80 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-bosch-blue to-bosch-lightBlue flex items-center justify-center text-white shadow-lg shadow-bosch-blue/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Admin & RBAC Control Center</h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Manage system access roles, user provisioning, and fine-grained security permissions.</p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-bosch-blue to-bosch-lightBlue text-white font-bold text-xs rounded-xl shadow-md shadow-bosch-blue/20 hover:shadow-lg hover:shadow-bosch-blue/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Notifications */}
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
                        {user.permissions && user.permissions.includes('*') ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            * (All System Rights)
                          </span>
                        ) : Array.isArray(user.permissions) && user.permissions.length > 0 ? (
                          user.permissions.slice(0, 3).map((p, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                              {p}
                            </span>
                          )).concat(user.permissions.length > 3 ? [<span key="more" className="text-[10px] text-slate-400 font-bold self-center">+{user.permissions.length - 3} more</span>] : [])
                        ) : (
                          <span className="text-slate-400 text-[10px]">No specific rights</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleActiveStatus(user)}
                        title={`Click to ${user.is_active === 1 ? 'deactivate' : 'activate'} user`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                          user.is_active === 1
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 hover:bg-rose-100'
                        }`}
                      >
                        {user.is_active === 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{user.is_active === 1 ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 text-slate-600 dark:text-slate-300 hover:text-bosch-blue dark:hover:text-bosch-accent hover:bg-sky-100/70 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-800"
                          title="Edit User Role & Permissions"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-all border border-slate-200 dark:border-slate-800"
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

      {/* User Form Modal (Create / Edit) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-sky-200/80 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-50 via-blue-50/50 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-bosch-blue text-white flex items-center justify-center font-bold text-xs">
                    {modalMode === 'create' ? <UserPlus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {modalMode === 'create' ? 'Provision New Account' : `Configure Account: ${selectedUser?.username}`}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleSubmitModal} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                {/* Username & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="e.g. jdoe"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-bosch-blue/30"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-bosch-blue/30"
                    />
                  </div>
                </div>

                {/* Password (Required for create, optional for edit) */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {modalMode === 'create' ? 'Account Password *' : 'Change Password (leave blank to keep current)'}
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required={modalMode === 'create'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder={modalMode === 'create' ? 'Enter initial password...' : 'Enter new password to reset...'}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-bosch-blue/30"
                    />
                  </div>
                </div>

                {/* Role Selection Dropdown */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Predefined Role *</label>
                  <select
                    value={formData.role}
                    onChange={handleRoleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-bosch-blue/30"
                  >
                    <option value="super_admin">Super Admin (Full Administrative Override)</option>
                    <option value="price_admin">Price Admin (Ratecard Buying & List Price Management)</option>
                    <option value="presales_admin">Pre-Sales Admin (Full Pre-sales & BOQ Workflow)</option>
                    <option value="viewer">Viewer (Read-Only Access Across All Modules)</option>
                  </select>
                </div>

                {/* Fine-grained Permission Tag Picker */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Permission Tags Selection
                    </label>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Role selection defaults tags automatically
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                    {permissionCatalog.map((perm) => {
                      const isChecked = formData.permissions.includes(perm.key) || formData.permissions.includes('*');
                      return (
                        <label
                          key={perm.key}
                          className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            isChecked ? 'bg-sky-100/70 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-900'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.key)}
                            disabled={formData.role === 'super_admin'}
                            className="mt-0.5 accent-bosch-blue w-4 h-4 rounded"
                          />
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{perm.label} <code className="text-[10px] text-slate-400 font-mono">({perm.key})</code></div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{perm.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-gradient-to-r from-bosch-blue to-bosch-lightBlue text-white font-bold rounded-xl shadow-md shadow-bosch-blue/20 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting && <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>}
                    <span>{modalMode === 'create' ? 'Create User Account' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/70 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/70 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Delete User Account</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                Are you sure you want to permanently delete the user account <strong className="text-slate-900 dark:text-white">{userToDelete.username}</strong> ({userToDelete.email})?
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeletingUser}
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingUser}
                  onClick={handleDeleteUser}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeletingUser && <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>}
                  <span>Delete User</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
