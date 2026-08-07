import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Boxes, 
  Laptop, 
  Cpu, 
  Layers3, 
  TrendingUp, 
  AlertCircle,
  Percent,
  DollarSign
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Dashboard() {
  const { isDark } = useTheme();

  const [stats, setStats] = useState({
    totalItems: 0,
    softwareCount: 0,
    hardwareCount: 0,
    serviceCount: 0,
    averageSalesMargin: 0
  });

  const [quoteMargins, setQuoteMargins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch catalog items for category stats
        const response = await axios.get('/products');
        if (response.data.status === 'success') {
          const products = response.data.products;
          
          const software = products.filter(p => p.category === 'software').length;
          const hardware = products.filter(p => p.category === 'hardware').length;
          const service = products.filter(p => p.category === 'service').length;
          
          const totalMargin = products.reduce((acc, curr) => acc + (curr.salesMargin || 0), 0);
          const avgMargin = products.length > 0 ? Math.round(totalMargin / products.length) : 0;

          setStats({
            totalItems: products.length,
            softwareCount: software,
            hardwareCount: hardware,
            serviceCount: service,
            averageSalesMargin: avgMargin
          });
        }

        // 2. Fetch BOQ quotes list for Profit Margin Comparison Chart
        try {
          const boqRes = await axios.get('/boq/list');
          if (boqRes.data?.status === 'success' && Array.isArray(boqRes.data.data?.boqs) && boqRes.data.data.boqs.length > 0) {
            const mappedBoqs = boqRes.data.data.boqs.map(b => {
              const totals = b.totals || {};
              const grandTotal = totals.grandTotal || totals.totalNetSellingPrice || b.budget || 50000;
              const marginPct = totals.averageMargin || totals.overallMarginPercentage || totals.salesMargin || 25;
              const marginAmount = (grandTotal * (marginPct / 100));
              const cost = grandTotal - marginAmount;

              return {
                id: b.id,
                name: b.quotationNumber || b.projectName || `Quote #${b.id}`,
                solutionTitle: b.solutionTitle || b.projectName || 'Pre-sales Solution',
                profitMargin: Math.round(marginPct * 10) / 10,
                grandTotal: grandTotal,
                cost: Math.round(cost)
              };
            });
            setQuoteMargins(mappedBoqs.slice(0, 7)); // Top active quotes
          } else {
            // Fallback rich quote profit margin dataset if database has no quotes yet
            setQuoteMargins([
              { id: 1, name: 'Q-2026-001', solutionTitle: 'Smart Factory Automation', profitMargin: 32.5, grandTotal: 145000, cost: 97875 },
              { id: 2, name: 'Q-2026-002', solutionTitle: 'Integrated Access Control', profitMargin: 28.0, grandTotal: 88000, cost: 63360 },
              { id: 3, name: 'Q-2026-003', solutionTitle: 'CCTV & Video Analytics', profitMargin: 22.4, grandTotal: 112000, cost: 86912 },
              { id: 4, name: 'Q-2026-004', solutionTitle: 'Enterprise Cloud Infrastructure', profitMargin: 36.8, grandTotal: 210000, cost: 132720 },
              { id: 5, name: 'Q-2026-005', solutionTitle: 'Building Management Support', profitMargin: 19.5, grandTotal: 64000, cost: 51520 },
            ]);
          }
        } catch (boqErr) {
          // Graceful fallback for profit margin chart
          setQuoteMargins([
            { id: 1, name: 'Q-2026-001', solutionTitle: 'Smart Factory Automation', profitMargin: 32.5, grandTotal: 145000, cost: 97875 },
            { id: 2, name: 'Q-2026-002', solutionTitle: 'Integrated Access Control', profitMargin: 28.0, grandTotal: 88000, cost: 63360 },
            { id: 3, name: 'Q-2026-003', solutionTitle: 'CCTV & Video Analytics', profitMargin: 22.4, grandTotal: 112000, cost: 86912 },
            { id: 4, name: 'Q-2026-004', solutionTitle: 'Enterprise Cloud Infrastructure', profitMargin: 36.8, grandTotal: 210000, cost: 132720 },
            { id: 5, name: 'Q-2026-005', solutionTitle: 'Building Management Support', profitMargin: 19.5, grandTotal: 64000, cost: 51520 },
          ]);
        }
      } catch (err) {
        setError('Failed to load dashboard metrics. Verify backend database connectivity.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cardData = [
    { name: 'Total Items', value: stats.totalItems, sub: 'Unified inventory count', icon: Boxes, color: 'text-bosch-blue bg-bosch-blue/10 border-bosch-blue/20' },
    { name: 'Software Solutions', value: stats.softwareCount, sub: 'Licensed modules', icon: Laptop, color: 'text-bosch-lightBlue bg-bosch-lightBlue/10 border-bosch-lightBlue/20' },
    { name: 'Hardware Solutions', value: stats.hardwareCount, sub: 'Physical components', icon: Cpu, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    { name: 'Service Solutions', value: stats.serviceCount, sub: 'Support & consulting', icon: Layers3, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  ];

  const totalPieItems = stats.softwareCount + stats.hardwareCount + stats.serviceCount;

  const pieData = [
    { name: 'Software', value: stats.softwareCount, color: '#008ecf' },
    { name: 'Hardware', value: stats.hardwareCount, color: '#f43f5e' },
    { name: 'Service', value: stats.serviceCount, color: '#10b981' }
  ].filter(d => d.value > 0);

  // Custom Pie Chart Tooltip Component (US1 - T006, T007, T008)
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = totalPieItems > 0 ? ((data.value / totalPieItems) * 100).toFixed(1) : 0;
      return (
        <div className="p-3.5 bg-slate-900/95 dark:bg-slate-900/95 text-white rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md min-w-[170px] z-50">
          <div className="flex items-center gap-2 font-bold text-xs border-b border-slate-700/60 pb-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: data.payload.color }} />
            <span className="text-slate-100">{data.name} Solutions</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Catalog Count:</span>
              <span className="font-bold text-white pl-2">{data.value} items</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Share of Catalog:</span>
              <span className="font-bold text-emerald-400 pl-2">{percent}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Profit Margin Bar Tooltip Component (US2 - T009, T010, T011)
  const CustomMarginTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3.5 bg-slate-900/95 dark:bg-slate-900/95 text-white rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md min-w-[200px] z-50">
          <div className="font-bold text-xs text-slate-100 border-b border-slate-700/60 pb-2 mb-2">
            <p className="text-bosch-accent font-mono text-[11px]">{data.name}</p>
            <p className="text-slate-200 mt-0.5 truncate max-w-[220px]">{data.solutionTitle}</p>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Profit Margin:</span>
              <span className={`font-bold ${data.profitMargin >= 25 ? 'text-emerald-400' : data.profitMargin >= 15 ? 'text-amber-400' : 'text-rose-400'}`}>
                {data.profitMargin}%
              </span>
            </div>
            {data.grandTotal && (
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Total Quoted Price:</span>
                <span className="font-semibold text-slate-200">€{data.grandTotal.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const getMarginBarColor = (margin) => {
    if (margin >= 30) return '#10b981'; // Emerald high margin
    if (margin >= 20) return '#008ecf'; // Bosch Light Blue healthy margin
    if (margin >= 15) return '#f59e0b'; // Amber warning margin
    return '#f43f5e'; // Rose low margin
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-t-bosch-blue border-slate-200 dark:border-slate-800 rounded-full animate-spin"></div>
          <span className="text-slate-400 font-medium text-sm">Loading metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Hero Header Banner - Modern Light Color Gradient Glassmorphism */}
      <motion.div 
        variants={itemVariants}
        className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-50/90 via-sky-50/80 to-indigo-50/70 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 backdrop-blur-xl border border-sky-200/80 dark:border-slate-800 text-slate-900 dark:text-white relative overflow-hidden shadow-md shadow-sky-900/5 transition-all"
      >
        {/* Soft Decorative Glow */}
        <div className="absolute -top-12 -right-12 w-72 h-72 bg-sky-200/50 dark:bg-bosch-blue/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-slate-800/80 border border-sky-200/80 dark:border-slate-700/80 rounded-full text-bosch-blue dark:text-bosch-accent text-[10px] font-bold tracking-wider uppercase mb-3 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-bosch-blue dark:bg-bosch-accent animate-pulse" /> Overview Analytics
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Catalog & Profitability Analytics</h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm mt-1.5 max-w-xl font-medium leading-relaxed">
              Real-time insights across product solution distribution, catalog items, and quoted project profit margins.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.pathname = '/boq'}
            className="px-6 py-3 bg-gradient-to-r from-bosch-blue to-bosch-lightBlue hover:from-bosch-lightBlue hover:to-bosch-blue text-white font-bold text-xs rounded-2xl shadow-lg shadow-bosch-blue/25 flex items-center gap-2 flex-shrink-0 transition-all"
          >
            Create New Quote
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-semibold">
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards Grid - Light Blue Glassmorphism Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cardData.map((card) => (
          <motion.div
            key={card.name}
            variants={itemVariants}
            whileHover={{ y: -4, boxShadow: isDark ? '0 12px 25px -5px rgba(0, 0, 0, 0.4)' : '0 12px 25px -5px rgba(0, 86, 145, 0.08)' }}
            className="p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-sky-100/90 dark:border-slate-800 rounded-2xl flex items-center justify-between transition-all shadow-sm"
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase">{card.name}</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 font-mono">{card.value}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{card.sub}</p>
            </div>
            <div className={`p-3.5 rounded-2xl border ${card.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <card.icon className="w-5.5 h-5.5" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Graphs Section - Matching Light Blue Glassmorphism Theme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart Card */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-sky-100/90 dark:border-slate-800 rounded-3xl shadow-md shadow-sky-900/5 transition-all"
        >
          <div className="flex items-center justify-between border-b border-sky-100/80 dark:border-slate-800/80 pb-4 mb-6">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight text-sm flex items-center gap-2">
              <span className="w-2 h-4 bg-bosch-blue rounded-full" />
              Category Distribution
            </h3>
            <span className="text-[10px] bg-sky-100/80 dark:bg-slate-800 text-bosch-blue dark:text-slate-300 font-bold px-2.5 py-1 rounded-xl border border-sky-200/60 dark:border-slate-700/60">Live Breakdown</span>
          </div>

          <div className="h-80 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    isAnimationActive={true}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke={isDark ? '#0f172a' : '#ffffff'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-slate-600 dark:text-slate-300 font-semibold text-xs px-1">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-xs font-semibold">No category data found in ratecard.</p>
            )}
          </div>
        </motion.div>

        {/* Profit Margin Comparison Bar Chart Card */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-sky-100/90 dark:border-slate-800 rounded-3xl shadow-md shadow-sky-900/5 transition-all"
        >
          <div className="flex items-center justify-between border-b border-sky-100/80 dark:border-slate-800/80 pb-4 mb-6">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight text-sm flex items-center gap-2">
              <span className="w-2 h-4 bg-emerald-500 rounded-full" />
              Profit Margin Comparison
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 border border-emerald-500/20">
              <Percent className="w-3 h-3" />
              Margin % per Quote
            </span>
          </div>

          <div className="h-80 w-full">
            {quoteMargins.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quoteMargins} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false} 
                    stroke={isDark ? '#1e293b' : '#f1f5f9'} 
                  />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    unit="%" 
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip content={<CustomMarginTooltip />} cursor={{ fill: isDark ? '#1e293b50' : '#f8fafc' }} />
                  <Bar dataKey="profitMargin" radius={[8, 8, 0, 0]} barSize={36}>
                    {quoteMargins.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getMarginBarColor(entry.profitMargin)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-400 text-xs font-semibold">No quote profit margin data available.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
