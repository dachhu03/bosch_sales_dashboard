import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App.jsx';

export default function EditableCell({ value, onSave, type = 'text', suffix = '', colorClass = '', disabled = false, requiredPermission }) {
  const { user, isViewer, hasPermission } = useAuth();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const inputRef = useRef(null);

  const isReadOnly = disabled || (isViewer ? isViewer() : user?.role === 'viewer') || (requiredPermission && hasPermission && !hasPermission(requiredPermission));

  useEffect(() => {
    setVal(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Select text for quick overwrite
      inputRef.current.select();
    }
  }, [editing]);

  const handleBlur = () => {
    setEditing(false);
    if (val !== value) {
      onSave(val);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current.blur();
    } else if (e.key === 'Escape') {
      setVal(value);
      setEditing(false);
    }
  };

  if (editing && !isReadOnly) {
    return (
      <div className="flex items-center w-full min-w-[70px]">
        <input
          ref={inputRef}
          type={type}
          value={val ?? ''}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full px-2 py-1 text-xs border-2 border-bosch-blue dark:border-bosch-accent rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none ${type === 'number' ? 'font-mono font-semibold' : 'font-medium'}`}
        />
        {suffix && <span className="ml-1 text-[11px] text-slate-400 font-semibold">{suffix}</span>}
      </div>
    );
  }

  // Formatting colors for quotation age indicators
  const getColorStyle = () => {
    if (colorClass === 'green') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    if (colorClass === 'yellow') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
    if (colorClass === 'red') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
    if (colorClass === 'orange') return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20';
    return isReadOnly ? 'text-slate-800 dark:text-slate-100' : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100';
  };

  return (
    <div
      onClick={() => {
        if (!isReadOnly) setEditing(true);
      }}
      className={`
        px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 min-h-[32px] flex items-center justify-between
        ${isReadOnly ? 'cursor-default select-text' : 'cursor-pointer'}
        ${type === 'number' ? 'font-mono font-semibold' : 'font-medium'}
        ${getColorStyle()}
      `}
    >
      <span>
        {value !== null && value !== undefined && value !== '' ? value : 'NAN'}
      </span>
      {suffix && value !== null && value !== undefined && value !== '' && (
        <span className="text-[10px] text-slate-400 font-semibold ml-1">{suffix}</span>
      )}
    </div>
  );
}
