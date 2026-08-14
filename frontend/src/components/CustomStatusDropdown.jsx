import React, { useState, useEffect, useRef, memo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const STATUS_OPTIONS = [
  { 
    id: 'Closed', 
    label: 'Closed', 
    colorClass: 'bg-emerald-500', 
    bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' 
  },
  { 
    id: 'In Review', 
    label: 'In Review', 
    colorClass: 'bg-blue-500', 
    bgBadge: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' 
  },
  { 
    id: 'Rejected', 
    label: 'Rejected', 
    colorClass: 'bg-rose-500', 
    bgBadge: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' 
  }
];

export function normalizeStatusString(rawStatus) {
  if (!rawStatus) return 'In Review';
  const statusLower = String(rawStatus).trim().toLowerCase();
  if (statusLower === 'approved' || statusLower === 'closed') return 'Closed';
  if (statusLower === 'rejected') return 'Rejected';
  return 'In Review';
}

const CustomStatusDropdown = memo(function CustomStatusDropdown({ currentStatus, onSelectStatus, canChangeStatus }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const normalized = normalizeStatusString(currentStatus);
  const currentOpt = STATUS_OPTIONS.find(s => s.id === normalized) || STATUS_OPTIONS[1];

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
    if (optId !== normalized && onSelectStatus) {
      onSelectStatus(optId);
    }
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
        title="Click to update status"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${currentOpt.colorClass}`} />
        <span>{currentOpt.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/90 dark:border-slate-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-75">
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = opt.id === normalized;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                  isSelected 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${opt.colorClass}`} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3 h-3 text-slate-700 dark:text-slate-300" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default CustomStatusDropdown;
