# Interface Contract: Modern Layout Design Tokens & Components

**Feature**: `011-modern-layout-optimization`  
**Contract Type**: UI Styling & Component Design Tokens Contract

## Layout Component Class Contracts

### Header Navigation (`AuthenticatedLayout`)
- Must feature sticky positioning (`sticky top-0 z-30`).
- Must incorporate glassmorphism background (`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md`).
- Must render brand logo accent with gradient bar (`bg-gradient-to-b from-bosch-accent to-bosch-lightBlue`).

### Sidebar Navigation (`Sidebar.jsx`)
- Active menu items MUST feature glowing indicator shadow (`bg-bosch-blue text-white shadow-lg shadow-bosch-blue/25`).
- Inactive menu items MUST transition text and background on hover (`text-slate-400 hover:text-slate-100 hover:bg-slate-800/60`).

### Content Cards & Panels
- All primary cards MUST apply `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium`.
- Modal popups MUST incorporate Framer Motion scale-in and backdrop blur overlay (`bg-slate-900/60 backdrop-blur-sm`).

### Buttons & Interactive Controls
- Primary actions: `bg-bosch-blue hover:bg-bosch-lightBlue text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]`.
- Secondary actions: `bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700`.
