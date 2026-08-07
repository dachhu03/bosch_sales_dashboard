import React, { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App.jsx';
import { 
  FileText, 
  Search, 
  Filter, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  TrendingUp, 
  X, 
  AlertCircle,
  Building2,
  User,
  ShieldCheck,
  ChevronDown,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Channel Filter Dropdown Component
const CustomChannelDropdown = memo(function CustomChannelDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { id: 'all', label: 'All Channels' },
    { id: 'si', label: 'System Integrator (SI)' },
    { id: 'direct', label: 'Direct Purchase' }
  ];

  const selectedOption = options.find(o => o.id === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-bosch-blue/20 min-w-[170px]"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>{selectedOption.label}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                  isSelected 
                    ? 'bg-blue-50/70 dark:bg-blue-950/50 text-bosch-blue dark:text-bosch-accent font-bold' 
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-bosch-blue dark:text-bosch-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

// Fast Custom Status Dropdown Component for Table Rows (Super Admin Only)
const CustomStatusDropdown = memo(function CustomStatusDropdown({ currentStatus, onSelectStatus, canChangeStatus }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const statusOptions = [
    { id: 'Pending', label: 'Pending', colorClass: 'bg-amber-500', bgBadge: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80' },
    { id: 'Approved', label: 'Approved', colorClass: 'bg-emerald-500', bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80' },
    { id: 'In Review', label: 'In Review', colorClass: 'bg-blue-500', bgBadge: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/80' },
    { id: 'Rejected', label: 'Rejected', colorClass: 'bg-rose-500', bgBadge: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80' }
  ];

  const currentOpt = statusOptions.find(s => s.id.toLowerCase() === (currentStatus || 'Pending').toLowerCase()) || statusOptions[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optId) => {
    setIsOpen(false);
    onSelectStatus(optId);
  };

  if (!canChangeStatus) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold border ${currentOpt.bgBadge} cursor-default select-none`}>
        <span className={`w-1.5 h-1.5 rounded-full ${currentOpt.colorClass}`} />
        <span>{currentOpt.label}</span>
      </span>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${currentOpt.bgBadge}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${currentOpt.colorClass}`} />
        <span>{currentOpt.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1 z-50 animate-in fade-in zoom-in-95 duration-75">
          {statusOptions.map((opt) => {
            const isSelected = opt.id.toLowerCase() === (currentStatus || 'Pending').toLowerCase();
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                  isSelected ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${opt.colorClass}`} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3 h-3 text-slate-700" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default function Reports() {
  const navigate = useNavigate();
  const { user, isViewer, isSuperAdmin, hasPermission } = useAuth();
  const isReadOnly = isViewer ? isViewer() : user?.role === 'viewer';
  const canWriteBOQ = !isReadOnly && (user?.is_superuser === 1 || user?.role === 'super_admin' || (hasPermission && hasPermission('boq:write')));
  const canChangeStatus = isSuperAdmin ? isSuperAdmin() : (user?.is_superuser === 1 || user?.role === 'super_admin');

  const [boqList, setBoqList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Search and Channel Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all'); // 'all', 'si', 'direct'

  // Deletion Modal State
  const [deleteModalBoq, setDeleteModalBoq] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBoqs();
  }, []);

  const fetchBoqs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/boq/list');
      if (response.data.status === 'success') {
        setBoqList(response.data.data.boqs || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load pre-sales reports. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  // Helper calculation for sales total & profit margin
  const getBoqTotals = (boq) => {
    const totals = typeof boq.totals === 'string' ? JSON.parse(boq.totals) : (boq.totals || {});
    const sales = parseFloat(totals.grandTotalSales) || 0;
    const buy = parseFloat(totals.grandTotalBuy) || 0;
    const profit = sales - buy;
    const margin = sales > 0 ? ((profit / sales) * 100).toFixed(1) : 0;
    return { sales, buy, profit, margin };
  };

  // Filtered BOQ list
  const filteredBoqs = boqList.filter(boq => {
    const q = searchQuery.toLowerCase().trim();

    // Keyword matching
    const matchesKeyword = !q || (
      (boq.projectName || '').toLowerCase().includes(q) ||
      (boq.quotationNumber || '').toLowerCase().includes(q) ||
      (boq.solutionTitle || '').toLowerCase().includes(q) ||
      (boq.projectLocation || '').toLowerCase().includes(q) ||
      (user?.username || boq.preparedBy || '').toLowerCase().includes(q)
    );

    // Channel matching ('si' vs 'direct')
    const boqApproach = (boq.approach || 'si').toLowerCase();
    const matchesChannel = channelFilter === 'all' || 
      (channelFilter === 'si' && (boqApproach === 'si' || boqApproach.includes('system'))) ||
      (channelFilter === 'direct' && (boqApproach === 'direct' || boqApproach.includes('direct')));

    return matchesKeyword && matchesChannel;
  });

  // Aggregate Metrics based on filtered list
  const totalQuotesCount = filteredBoqs.length;
  const totalSalesVolume = filteredBoqs.reduce((acc, b) => acc + getBoqTotals(b).sales, 0);
  const totalProfitVolume = filteredBoqs.reduce((acc, b) => acc + getBoqTotals(b).profit, 0);

  // Solution Navigation to BOQ Generator
  const handleOpenSolutionInGenerator = (boq) => {
    navigate('/boq', { state: { loadBoqId: boq.id } });
  };

  // Optimistic Instant Status Change Handler (0ms Lag)
  const handleStatusChange = (boqId, newStatus) => {
    // 1. Instant local state update for zero latency
    const previousBoqs = [...boqList];
    setBoqList(prev => prev.map(b => b.id === boqId ? { ...b, approvalStatus: newStatus } : b));
    showToast(`Status updated to "${newStatus}".`);

    // 2. Perform backend save asynchronously in background
    axios.patch(`/boq/${boqId}/status`, { approval_status: newStatus })
      .catch(err => {
        console.error('Failed to update status on server:', err);
        // Revert on error
        setBoqList(previousBoqs);
        setError('Failed to save status update on server.');
      });
  };

  // Confirm Solution Deletion Handler
  const handleConfirmDelete = async () => {
    if (!deleteModalBoq) return;

    setIsDeleting(true);
    try {
      const response = await axios.delete(`/boq/${deleteModalBoq.id}`);
      if (response.data.status === 'success') {
        setBoqList(prev => prev.filter(b => b.id !== deleteModalBoq.id));
        showToast(`Solution "${deleteModalBoq.solutionTitle || deleteModalBoq.projectName}" deleted successfully.`);
        setDeleteModalBoq(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete solution quote.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white font-medium text-sm rounded-xl shadow-2xl"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span className="w-2 h-6 bg-gradient-to-b from-bosch-accent to-bosch-blue rounded-full" />
          Pre-Sales Solution Reports
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Summaries of active quotes, channel filter (SI vs Direct Purchase), solution statuses, and profit margins.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards - Light Blue Glassmorphism Theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div 
          whileHover={{ y: -3 }}
          className="p-5 bg-white/90 dark:bg-slate-900/90 border border-sky-100/90 dark:border-slate-800 rounded-3xl shadow-md shadow-sky-900/5 backdrop-blur-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Active Quotes</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-bosch-blue dark:text-bosch-accent flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 font-mono">{totalQuotesCount}</h3>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Generated estimates in system</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="p-5 bg-white/90 dark:bg-slate-900/90 border border-sky-100/90 dark:border-slate-800 rounded-3xl shadow-md shadow-sky-900/5 backdrop-blur-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Combined Quoted Sales</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 font-mono">₹{totalSalesVolume.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Total pipeline monetary value</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="p-5 bg-white/90 dark:bg-slate-900/90 border border-sky-100/90 dark:border-slate-800 rounded-3xl shadow-md shadow-sky-900/5 backdrop-blur-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Profit Margins</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">₹{totalProfitVolume.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Combined profit margin across quotes</p>
        </motion.div>
      </div>

      {/* Control Bar: Search + Custom Channel Filter Dropdown - Light Blue Glassmorphism Theme */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-sky-100/90 dark:border-slate-800 rounded-3xl p-4 shadow-md shadow-sky-900/5 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search BOQs by project, quote #, solution, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-bosch-blue focus:outline-none text-xs font-semibold placeholder-slate-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Custom Channel Dropdown Component */}
        <CustomChannelDropdown 
          value={channelFilter} 
          onChange={(newChannel) => setChannelFilter(newChannel)} 
        />
      </div>

      {/* Main Reports Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-bosch-blue" />
            Generated Quotations Log
          </h3>
          <span className="text-xs bg-slate-200/60 text-slate-600 font-semibold px-2.5 py-0.5 rounded-lg">
            {filteredBoqs.length} {filteredBoqs.length === 1 ? 'Quote' : 'Quotes'}
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-t-bosch-blue border-slate-200 rounded-full animate-spin"></div>
            <span className="text-slate-400 font-semibold text-xs">Loading reports log...</span>
          </div>
        ) : filteredBoqs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Project Details</th>
                  <th className="px-5 py-3.5">Solution</th>
                  <th className="px-5 py-3.5">Quotation No</th>
                  <th className="px-5 py-3.5">Prepared By</th>
                  <th className="px-5 py-3.5 text-center">Channel</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Quoted Sales</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBoqs.map((boq) => {
                  const { sales, profit, margin } = getBoqTotals(boq);
                  const isSI = (boq.approach || 'si').toLowerCase() === 'si';
                  const loggedInUser = user?.username || boq.preparedBy || 'Sales Member';

                  return (
                    <tr key={boq.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Project Details */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{boq.projectName}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" /> {boq.projectLocation || 'Location N/A'}
                          </p>
                        </div>
                      </td>

                      {/* Solution Title (Clickable to open in BOQ Generator) */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleOpenSolutionInGenerator(boq)}
                          className="font-semibold text-slate-800 hover:text-bosch-blue text-left flex items-center gap-1.5 transition-colors"
                          title="Click to open & auto-populate in BOQ Generator"
                        >
                          <span>{boq.solutionTitle || 'Custom Integrated Solution'}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 hover:text-bosch-blue" />
                        </button>
                      </td>

                      {/* Quotation Number */}
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {boq.quotationNumber || 'N/A'}
                      </td>

                      {/* Prepared By (Currently Logged-In User) */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{loggedInUser}</span>
                        </div>
                      </td>

                      {/* Plain Channel Column (No Color Highlighting) */}
                      <td className="px-5 py-4 text-center font-medium text-slate-700">
                        {isSI ? 'SI (System Integrator)' : 'Direct Purchase'}
                      </td>

                      {/* Fast Custom Status Dropdown Component */}
                      <td className="px-5 py-4 text-center">
                        <CustomStatusDropdown 
                          currentStatus={boq.approvalStatus} 
                          canChangeStatus={canChangeStatus}
                          onSelectStatus={(newStatus) => canChangeStatus && handleStatusChange(boq.id, newStatus)} 
                        />
                      </td>

                      {/* Quoted Sales & Margin */}
                      <td className="px-5 py-4 text-right">
                        <p className="font-bold text-slate-900 text-sm">
                          ₹{sales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                          Margin: {margin}% (₹{profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                        </p>
                      </td>

                      {/* Action Column (Delete button only) */}
                      <td className="px-5 py-4 text-center">
                        {canWriteBOQ && (
                          <button
                            onClick={() => setDeleteModalBoq(boq)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Solution Quote"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center gap-3">
            <FileText className="w-12 h-12 text-slate-200" />
            <p className="text-slate-600 font-semibold text-sm">No BOQ solutions match your search and filter criteria.</p>
            {(searchQuery || channelFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setChannelFilter('all');
                }}
                className="mt-2 text-xs text-bosch-blue hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalBoq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <button 
                  onClick={() => setDeleteModalBoq(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">Delete Solution Quote?</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete solution <span className="font-bold text-slate-800">"{deleteModalBoq.solutionTitle || deleteModalBoq.projectName}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <p><span className="font-semibold text-slate-500">Quotation No:</span> <span className="font-bold text-slate-800">{deleteModalBoq.quotationNumber || 'N/A'}</span></p>
                <p><span className="font-semibold text-slate-500">Project:</span> {deleteModalBoq.projectName}</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  onClick={() => setDeleteModalBoq(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
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
