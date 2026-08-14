import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
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
  Check,
  Edit3,
  MessageSquare,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Layers,
  Save,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import CustomStatusDropdown, { normalizeStatusString, STATUS_OPTIONS } from '../components/CustomStatusDropdown.jsx';

// Custom Channel Filter Dropdown
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
        className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-bosch-blue/20 min-w-[160px]"
      >
        <div className="flex items-center gap-1.5">
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

// Custom Status Filter Dropdown
const StatusFilterDropdown = memo(function StatusFilterDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { id: 'all', label: 'All Statuses' },
    { id: 'Closed', label: 'Closed' },
    { id: 'In Review', label: 'In Review' },
    { id: 'Rejected', label: 'Rejected' }
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
        className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-bosch-blue/20 min-w-[140px]"
      >
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>{selectedOption.label}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
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

// Remarks Modal / Editor Component
const RemarksModal = memo(function RemarksModal({ quotation, isOpen, onClose, onSave, canEdit }) {
  const [remarksText, setRemarksText] = useState(quotation?.remarks || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (quotation) {
      setRemarksText(quotation.remarks || '');
    }
  }, [quotation]);

  if (!isOpen || !quotation) return null;

  const handleSaveSubmit = async () => {
    setSaving(true);
    await onSave(quotation.id, remarksText);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-bosch-blue dark:text-bosch-accent flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Quotation Remarks & Feedback</h4>
              <p className="text-xs text-slate-400 font-medium">Project: {quotation.projectName} ({quotation.quotationNumber || 'N/A'})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Follow-up Notes / Rejection & Improvement Remarks:
          </label>
          {canEdit ? (
            <textarea
              rows={4}
              value={remarksText}
              onChange={(e) => setRemarksText(e.target.value)}
              placeholder="Add feedback, reasons for non-approval, required price adjustments, or follow-up notes..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-bosch-blue focus:outline-none text-slate-800 dark:text-slate-100 font-medium"
            />
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 min-h-[90px]">
              {remarksText || <span className="text-slate-400 italic">No remarks recorded.</span>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          {canEdit && (
            <button 
              onClick={handleSaveSubmit}
              disabled={saving}
              className="px-4 py-2 bg-bosch-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save Remarks</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
});

export default function Reports() {
  const navigate = useNavigate();
  const { user, isViewer, isSuperAdmin, hasPermission } = useAuth();
  
  const isReadOnly = isViewer ? isViewer() : user?.role === 'viewer';
  const canEditReports = !isReadOnly && (
    user?.is_superuser === 1 || 
    user?.role === 'super_admin' || 
    (hasPermission && hasPermission('boq:write'))
  );

  const [quotations, setQuotations] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Filtering Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all'); // 'all', 'si', 'direct'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'Closed', 'In Review', 'Rejected'
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');

  // Chart View State ('monthly', 'yearly', 'status')
  const [chartView, setChartView] = useState('monthly');

  // Remarks Modal State
  const [selectedRemarkBoq, setSelectedRemarkBoq] = useState(null);

  // Deletion Modal State
  const [deleteModalBoq, setDeleteModalBoq] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    setLoading(true);
    setError('');
    try {
      // First try optimized summary endpoint
      const response = await axios.get('/reports/summary');
      if (response.data.status === 'success') {
        setQuotations(response.data.data.quotations || []);
        setSummaryMetrics(response.data.data.summaryMetrics || null);
      }
    } catch (err) {
      console.warn('Optimized /reports/summary fallback to /boq/list:', err);
      try {
        const fallbackRes = await axios.get('/boq/list');
        if (fallbackRes.data.status === 'success') {
          const rawBoqs = fallbackRes.data.data.boqs || [];
          const mappedProjections = rawBoqs.map(b => {
            const totals = typeof b.totals === 'string' ? JSON.parse(b.totals) : (b.totals || {});
            const sales = parseFloat(totals.grandTotalSales || totals.grand_sales_total) || 0;
            const buy = parseFloat(totals.grandTotalBuy || totals.grand_buy_total) || 0;
            const profit = totals.total_profit !== undefined ? parseFloat(totals.total_profit) : (sales - buy);
            const margin = sales > 0 ? parseFloat(((profit / sales) * 100).toFixed(1)) : 0;
            const rawStatus = b.approvalStatus || b.approval_status || 'In Review';
            const status = normalizeStatusString(rawStatus);
            return {
              id: b.id,
              projectName: b.projectName || 'Untitled Project',
              projectLocation: b.projectLocation || '',
              quotationNumber: b.quotationNumber || '',
              approach: b.approach || 'si',
              solutionTitle: b.solutionTitle || '',
              preparedBy: b.preparedBy || totals.preparedBy || 'Sales Member',
              status: status,
              rawStatus: rawStatus,
              remarks: totals.remarks || totals.notes || '',
              salesTotal: sales,
              buyTotal: buy,
              profitTotal: profit,
              marginPercentage: margin,
              createdAt: b.createdAt || new Date().toISOString()
            };
          });
          setQuotations(mappedProjections);
        }
      } catch (fallbackErr) {
        console.error(fallbackErr);
        setError('Failed to load pre-sales reports. Check backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  // Available Years and Months extracted from dataset
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    quotations.forEach(q => {
      if (q.createdAt) {
        const d = new Date(q.createdAt);
        if (!isNaN(d.getFullYear())) yearsSet.add(d.getFullYear());
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [quotations]);

  // Memoized Fast Multi-Criteria Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const kw = searchQuery.toLowerCase().trim();
      const matchesSearch = !kw || (
        (q.projectName || '').toLowerCase().includes(kw) ||
        (q.quotationNumber || '').toLowerCase().includes(kw) ||
        (q.solutionTitle || '').toLowerCase().includes(kw) ||
        (q.projectLocation || '').toLowerCase().includes(kw) ||
        (q.preparedBy || '').toLowerCase().includes(kw) ||
        (q.remarks || '').toLowerCase().includes(kw)
      );

      const approach = (q.approach || 'si').toLowerCase();
      const matchesChannel = channelFilter === 'all' || 
        (channelFilter === 'si' && (approach === 'si' || approach.includes('system'))) ||
        (channelFilter === 'direct' && (approach === 'direct' || approach.includes('direct')));

      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;

      let matchesYear = true;
      let matchesMonth = true;
      if (q.createdAt) {
        const d = new Date(q.createdAt);
        if (!isNaN(d.getTime())) {
          if (yearFilter !== 'all') matchesYear = d.getFullYear() === parseInt(yearFilter);
          if (monthFilter !== 'all') matchesMonth = (d.getMonth() + 1) === parseInt(monthFilter);
        }
      }

      return matchesSearch && matchesChannel && matchesStatus && matchesYear && matchesMonth;
    });
  }, [quotations, searchQuery, channelFilter, statusFilter, yearFilter, monthFilter]);

  // Aggregate Metrics based on filtered list
  const totalQuotesCount = filteredQuotations.length;
  const totalSalesVolume = filteredQuotations.reduce((acc, q) => acc + q.salesTotal, 0);
  const totalProfitVolume = filteredQuotations.reduce((acc, q) => acc + q.profitTotal, 0);
  const overallMarginPercent = totalSalesVolume > 0 
    ? parseFloat(((totalProfitVolume / totalSalesVolume) * 100).toFixed(1)) 
    : 0;

  const statusBreakdownCounts = useMemo(() => {
    return {
      closed: filteredQuotations.filter(q => q.status === 'Closed').length,
      inReview: filteredQuotations.filter(q => q.status === 'In Review').length,
      rejected: filteredQuotations.filter(q => q.status === 'Rejected').length
    };
  }, [filteredQuotations]);

  // Time-Series Aggregate Data for Monthly & Yearly Recharts Charts
  const monthlyChartData = useMemo(() => {
    const monthlyMap = {};
    filteredQuotations.forEach(q => {
      if (q.createdAt) {
        const d = new Date(q.createdAt);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
          if (!monthlyMap[key]) {
            monthlyMap[key] = { key, label: monthLabel, sales: 0, profit: 0, count: 0 };
          }
          monthlyMap[key].sales += q.salesTotal;
          monthlyMap[key].profit += q.profitTotal;
          monthlyMap[key].count += 1;
        }
      }
    });

    return Object.keys(monthlyMap)
      .sort()
      .map(k => {
        const item = monthlyMap[k];
        const marginPct = item.sales > 0 ? parseFloat(((item.profit / item.sales) * 100).toFixed(1)) : 0;
        return {
          name: item.label,
          Sales: Math.round(item.sales),
          Profit: Math.round(item.profit),
          MarginPct: marginPct,
          Quotes: item.count
        };
      });
  }, [filteredQuotations]);

  const yearlyChartData = useMemo(() => {
    const yearlyMap = {};
    filteredQuotations.forEach(q => {
      if (q.createdAt) {
        const d = new Date(q.createdAt);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          if (!yearlyMap[year]) {
            yearlyMap[year] = { year, sales: 0, profit: 0, count: 0 };
          }
          yearlyMap[year].sales += q.salesTotal;
          yearlyMap[year].profit += q.profitTotal;
          yearlyMap[year].count += 1;
        }
      }
    });

    return Object.keys(yearlyMap)
      .sort()
      .map(y => {
        const item = yearlyMap[y];
        const marginPct = item.sales > 0 ? parseFloat(((item.profit / item.sales) * 100).toFixed(1)) : 0;
        return {
          name: String(y),
          Sales: Math.round(item.sales),
          Profit: Math.round(item.profit),
          MarginPct: marginPct,
          Quotes: item.count
        };
      });
  }, [filteredQuotations]);

  const pieChartData = useMemo(() => {
    return [
      { name: 'Closed', value: statusBreakdownCounts.closed, color: '#10b981' },
      { name: 'In Review', value: statusBreakdownCounts.inReview, color: '#3b82f6' },
      { name: 'Rejected', value: statusBreakdownCounts.rejected, color: '#f43f5e' }
    ].filter(d => d.value > 0);
  }, [statusBreakdownCounts]);

  // Open Solution in BOQ Generator
  const handleOpenSolutionInGenerator = (boq) => {
    navigate('/boq', { state: { loadBoqId: boq.id } });
  };

  // Status Change Handler with Optimistic UI & Server Patch
  const handleStatusChange = async (boqId, newStatus) => {
    if (!canEditReports) return;

    const previousQuotations = [...quotations];
    setQuotations(prev => prev.map(q => q.id === boqId ? { ...q, status: newStatus } : q));
    showToast(`Quotation status updated to "${newStatus}".`);

    try {
      await axios.patch(`/reports/${boqId}/status`, { status: newStatus });
    } catch (err) {
      console.warn('Falling back to /boq status patch:', err);
      try {
        await axios.patch(`/boq/${boqId}/status`, { approval_status: newStatus });
      } catch (fallbackErr) {
        console.error('Failed to update status on server:', fallbackErr);
        setQuotations(previousQuotations);
        setError('Failed to save status update on server.');
      }
    }
  };

  // Remarks Save Handler with Optimistic UI & Server Patch
  const handleSaveRemarks = async (boqId, newRemarks) => {
    if (!canEditReports) return;

    const previousQuotations = [...quotations];
    setQuotations(prev => prev.map(q => q.id === boqId ? { ...q, remarks: newRemarks } : q));
    showToast('Quotation remarks saved successfully.');

    try {
      await axios.patch(`/reports/${boqId}/remarks`, { remarks: newRemarks });
    } catch (err) {
      console.error('Failed to update remarks on server:', err);
      setQuotations(previousQuotations);
      setError('Failed to save remarks update on server.');
    }
  };

  // Confirm Delete Solution Handler
  const handleConfirmDelete = async () => {
    if (!deleteModalBoq || !canEditReports) return;

    setIsDeleting(true);
    try {
      const response = await axios.delete(`/boq/${deleteModalBoq.id}`);
      if (response.data.status === 'success') {
        setQuotations(prev => prev.filter(q => q.id !== deleteModalBoq.id));
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-7 bg-gradient-to-b from-bosch-accent to-bosch-blue rounded-full" />
            Management Reporting Dashboard
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Performance analytics, monthly & yearly sales/margin trends, quotation status tracking, and remarks management.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Active Quotes */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="p-5 bg-white/90 dark:bg-slate-900/90 border border-sky-100/90 dark:border-slate-800 rounded-3xl shadow-md shadow-sky-900/5 backdrop-blur-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Active Quotes</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-bosch-blue dark:text-bosch-accent flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 font-mono">{totalQuotesCount}</h3>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Filtered estimates in pipeline</p>
        </motion.div>

        {/* Combined Quoted Sales */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="p-5 bg-white/90 dark:bg-slate-900/90 border border-sky-100/90 dark:border-slate-800 rounded-3xl shadow-md shadow-sky-900/5 backdrop-blur-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Combined Quoted Sales</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 font-mono">
            ₹{totalSalesVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Total quoted revenue volume</p>
        </motion.div>

        {/* Est. Profit Margins */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="p-5 bg-white/90 dark:bg-slate-900/90 border border-sky-100/90 dark:border-slate-800 rounded-3xl shadow-md shadow-sky-900/5 backdrop-blur-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Est. Profit Margin</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              ₹{totalProfitVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
              {overallMarginPercent}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Combined profit margin value</p>
        </motion.div>

        {/* Status Breakdown Summary */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="p-5 bg-white/90 dark:bg-slate-900/90 border border-sky-100/90 dark:border-slate-800 rounded-3xl shadow-md shadow-sky-900/5 backdrop-blur-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status Distribution</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <PieChartIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-3">
            <div className="text-center p-1 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900">
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Closed</p>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{statusBreakdownCounts.closed}</p>
            </div>
            <div className="text-center p-1 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900">
              <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">Review</p>
              <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">{statusBreakdownCounts.inReview}</p>
            </div>
            <div className="text-center p-1 bg-rose-50/70 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900">
              <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">Rejected</p>
              <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 font-mono">{statusBreakdownCounts.rejected}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Analytics Trend Chart Section */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-sky-100/90 dark:border-slate-800 rounded-3xl p-6 shadow-md shadow-sky-900/5 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-bosch-blue dark:text-bosch-accent" />
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
              Sales Revenue & Profit Margin Analytics
            </h3>
          </div>
          
          {/* Chart View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
            <button
              onClick={() => setChartView('monthly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                chartView === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-bosch-blue dark:text-bosch-accent shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Monthly Trend
            </button>
            <button
              onClick={() => setChartView('yearly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                chartView === 'yearly'
                  ? 'bg-white dark:bg-slate-700 text-bosch-blue dark:text-bosch-accent shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Yearly Comparison
            </button>
            <button
              onClick={() => setChartView('status')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                chartView === 'status'
                  ? 'bg-white dark:bg-slate-700 text-bosch-blue dark:text-bosch-accent shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Status Breakdown
            </button>
          </div>
        </div>

        {/* Recharts Render Area */}
        <div className="h-72 w-full pt-2">
          {chartView === 'monthly' ? (
            monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyChartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#10b981' }} unit="%" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'MarginPct') return [`${value}%`, 'Margin %'];
                      return [`₹${value.toLocaleString('en-IN')}`, name];
                    }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="Sales" name="Quoted Sales (₹)" fill="#005691" radius={[6, 6, 0, 0]} barSize={28} />
                  <Bar yAxisId="left" dataKey="Profit" name="Profit Margin (₹)" fill="#38bdf8" radius={[6, 6, 0, 0]} barSize={28} />
                  <Line yAxisId="right" type="monotone" dataKey="MarginPct" name="Margin %" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                No monthly data points match current filter criteria.
              </div>
            )
          ) : chartView === 'yearly' ? (
            yearlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={yearlyChartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#10b981' }} unit="%" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'MarginPct') return [`${value}%`, 'Margin %'];
                      return [`₹${value.toLocaleString('en-IN')}`, name];
                    }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="Sales" name="Quoted Sales (₹)" fill="#005691" radius={[6, 6, 0, 0]} barSize={40} />
                  <Bar yAxisId="left" dataKey="Profit" name="Profit Margin (₹)" fill="#38bdf8" radius={[6, 6, 0, 0]} barSize={40} />
                  <Line yAxisId="right" type="monotone" dataKey="MarginPct" name="Margin %" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                No yearly comparison data available.
              </div>
            )
          ) : (
            pieChartData.length > 0 ? (
              <div className="h-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val, name) => [`${val} Quotes`, name]} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                No status distribution data available.
              </div>
            )
          )}
        </div>
      </div>

      {/* Control Bar: Search + Multi-Criteria Filter Dropdowns */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-sky-100/90 dark:border-slate-800 rounded-3xl p-4 shadow-md shadow-sky-900/5 space-y-3 lg:space-y-0 lg:flex lg:items-center lg:justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by project, quote #, solution, sales user, or remarks..."
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

        {/* Dropdown Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year Filter */}
          <div className="relative">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-bosch-blue/20"
            >
              <option value="all">All Years</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="relative">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-bosch-blue/20"
            >
              <option value="all">All Months</option>
              <option value="1">Jan</option>
              <option value="2">Feb</option>
              <option value="3">Mar</option>
              <option value="4">Apr</option>
              <option value="5">May</option>
              <option value="6">Jun</option>
              <option value="7">Jul</option>
              <option value="8">Aug</option>
              <option value="9">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>
          </div>

          {/* Status Filter */}
          <StatusFilterDropdown 
            value={statusFilter} 
            onChange={(st) => setStatusFilter(st)} 
          />

          {/* Channel Filter */}
          <CustomChannelDropdown 
            value={channelFilter} 
            onChange={(ch) => setChannelFilter(ch)} 
          />

          {/* Reset Filters button if any active */}
          {(searchQuery || channelFilter !== 'all' || statusFilter !== 'all' || yearFilter !== 'all' || monthFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setChannelFilter('all');
                setStatusFilter('all');
                setYearFilter('all');
                setMonthFilter('all');
              }}
              className="p-2 text-slate-400 hover:text-bosch-blue hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Quotations Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-bosch-blue" />
            Generated Quotations & Performance Log
          </h3>
          <span className="text-xs bg-slate-200/60 text-slate-600 font-semibold px-2.5 py-0.5 rounded-lg">
            {filteredQuotations.length} {filteredQuotations.length === 1 ? 'Quote' : 'Quotes'}
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-t-bosch-blue border-slate-200 rounded-full animate-spin"></div>
            <span className="text-slate-400 font-semibold text-xs">Loading management reports...</span>
          </div>
        ) : filteredQuotations.length > 0 ? (
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
                  <th className="px-5 py-3.5">Remarks / Feedback</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotations.map((q) => {
                  const isSI = (q.approach || 'si').toLowerCase() === 'si';
                  const hasRemarks = Boolean(q.remarks && q.remarks.trim());

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Project Details */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{q.projectName}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" /> {q.projectLocation || 'Location N/A'}
                          </p>
                        </div>
                      </td>

                      {/* Solution Title */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleOpenSolutionInGenerator(q)}
                          className="font-semibold text-slate-800 hover:text-bosch-blue text-left flex items-center gap-1.5 transition-colors"
                          title="Click to open & auto-populate in BOQ Generator"
                        >
                          <span>{q.solutionTitle || 'Custom Integrated Solution'}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 hover:text-bosch-blue" />
                        </button>
                      </td>

                      {/* Quotation Number */}
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {q.quotationNumber || 'N/A'}
                      </td>

                      {/* Prepared By */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{q.preparedBy}</span>
                        </div>
                      </td>

                      {/* Channel Column */}
                      <td className="px-5 py-4 text-center font-medium text-slate-700">
                        {isSI ? 'SI (System Integrator)' : 'Direct Purchase'}
                      </td>

                      {/* Normalized Status Badge (Read-only on Reports page; managed via Admin Panel Internal Review Status) */}
                      <td className="px-5 py-4 text-center" title="Quotation status is managed via the Super Admin Review Panel in Admin Management.">
                        <CustomStatusDropdown 
                          currentStatus={q.status} 
                          canChangeStatus={false}
                          onSelectStatus={() => {}} 
                        />
                      </td>

                      {/* Quoted Sales & Margin */}
                      <td className="px-5 py-4 text-right">
                        <p className="font-bold text-slate-900 text-sm">
                          ₹{q.salesTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                        <p className={`text-[10px] font-semibold mt-0.5 ${q.marginPercentage < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          Margin: {q.marginPercentage}% (₹{q.profitTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                        </p>
                      </td>

                      {/* Super Admin Review Remarks / Feedback Column (Read-only; managed via Admin Panel Review Remarks) */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 max-w-[200px]">
                          <button
                            onClick={() => setSelectedRemarkBoq(q)}
                            className={`text-left text-xs font-medium truncate flex-1 hover:underline cursor-pointer ${
                              hasRemarks ? 'text-slate-800 font-semibold' : 'text-slate-400 italic'
                            }`}
                            title="Click to view Super Admin review remarks"
                          >
                            {hasRemarks ? q.remarks : 'No admin remarks'}
                          </button>
                        </div>
                      </td>

                      {/* Action Column */}
                      <td className="px-5 py-4 text-center">
                        {canEditReports && (
                          <button
                            onClick={() => setDeleteModalBoq(q)}
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
            <p className="text-slate-600 font-semibold text-sm">No BOQ quotations match your search and filter criteria.</p>
            {(searchQuery || channelFilter !== 'all' || statusFilter !== 'all' || yearFilter !== 'all' || monthFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setChannelFilter('all');
                  setStatusFilter('all');
                  setYearFilter('all');
                  setMonthFilter('all');
                }}
                className="mt-2 text-xs text-bosch-blue hover:underline font-semibold"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Super Admin Review Remarks / Feedback View Modal */}
      <RemarksModal
        quotation={selectedRemarkBoq}
        isOpen={Boolean(selectedRemarkBoq)}
        onClose={() => setSelectedRemarkBoq(null)}
        onSave={() => {}}
        canEdit={false}
      />

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
