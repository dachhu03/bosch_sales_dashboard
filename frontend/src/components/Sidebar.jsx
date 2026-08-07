import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App.jsx';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Layers, 
  FileBarChart2, 
  LogOut, 
  X,
  Shield
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, isSuperAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Ratecard', path: '/ratecard', icon: FileSpreadsheet },
    { name: 'BOQ Generator', path: '/boq', icon: Layers },
    { name: 'Reports', path: '/reports', icon: FileBarChart2 },
  ];

  if (isSuperAdmin ? isSuperAdmin() : (user?.is_superuser === 1 || user?.role === 'super_admin')) {
    menuItems.push({ name: 'Admin', path: '/admin', icon: Shield });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col transform transition-all duration-300 ease-in-out
        bg-gradient-to-b from-sky-100/80 via-blue-50/70 to-sky-100/80 dark:from-slate-950/95 dark:via-slate-900/95 dark:to-slate-950/95
        backdrop-blur-xl border-r border-sky-200/70 dark:border-slate-800 text-slate-800 dark:text-white shadow-xl shadow-sky-900/5
        lg:static
        ${isOpen ? 'translate-x-0 w-64 opacity-100' : '-translate-x-full w-0 lg:w-0 lg:opacity-0 overflow-hidden'}
      `}>
        {/* Header/Brand logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-sky-200/60 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-bosch-blue to-bosch-lightBlue flex items-center justify-center text-white text-xs font-black tracking-tighter shadow-md shadow-bosch-blue/20">
              B
            </div>
            <div>
              <h1 className="font-extrabold text-xs tracking-wider text-slate-900 dark:text-slate-100 uppercase">Pre-Sales CRM</h1>
              <p className="text-[9px] font-bold text-bosch-blue dark:text-bosch-accent tracking-widest uppercase">Bosch Enterprise</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white lg:hidden rounded-xl hover:bg-sky-200/60 dark:hover:bg-slate-800/80 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Category Label */}
        <div className="px-6 pt-6 pb-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Platform Menu
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-gradient-to-r from-bosch-blue to-bosch-lightBlue text-white shadow-lg shadow-bosch-blue/25 border border-bosch-blue/30' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-sky-200/50 dark:hover:bg-slate-800/60'}
              `}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0 transition-transform group-hover:scale-110" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-sky-200/60 dark:border-slate-800/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition-all duration-200"
          >
            <LogOut className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400 group-hover:text-rose-500" />
            <span>Sign Out Session</span>
          </button>
          
          <div className="mt-3 pt-2.5 border-t border-sky-200/40 dark:border-slate-800/60 text-[10px] text-slate-400 dark:text-slate-500 text-center font-mono tracking-tight">
            v1.0.0 • Bosch Building Tech
          </div>
        </div>
      </aside>
    </>
  );
}
