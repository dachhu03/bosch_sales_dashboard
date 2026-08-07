import React, { createContext, useContext, useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

// Lazy loaded page modules for optimal bundle loading & performance
const Login = lazy(() => import('./pages/Login.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Ratecard = lazy(() => import('./pages/Ratecard.jsx'));
const BOQGenerator = lazy(() => import('./pages/BOQGenerator.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));
const AdminManagement = lazy(() => import('./pages/AdminManagement.jsx'));

// Components
import Sidebar from './components/Sidebar.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { isSuperAdmin, isViewer, hasRole, hasPermission } from './utils/rbac.js';
import { API_BASE_URL } from './utils/api.js';

// Axios global defaults & Interceptors
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

// Automatically attach Bearer token to all outgoing REST API requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401 Unauthorized globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Page Fallback Spinner Component
function ModulePageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8">
      <div className="w-10 h-10 border-4 border-t-bosch-blue border-slate-200 rounded-full animate-spin"></div>
      <span className="text-slate-400 font-semibold text-xs mt-3">Loading module...</span>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate current token session with backend API on app startup
    const validateSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/auth/validate');
        if (response.data.status === 'success') {
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/auth/login', { username, password });
      if (response.data.status === 'success') {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user);
        }
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid username or password.'
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-bosch-accent border-slate-700 rounded-full animate-spin"></div>
          <span className="text-slate-400 font-medium tracking-wide">Loading PRE-SALES CRM...</span>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthContext.Provider value={{ 
        user, 
        login, 
        logout,
        isSuperAdmin: () => isSuperAdmin(user),
        isViewer: () => isViewer(user),
        hasRole: (...roles) => hasRole(user, ...roles),
        hasPermission: (perm) => hasPermission(user, perm)
      }}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<ModulePageLoader />}>
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
              <Route 
                path="/*" 
                element={
                  user ? (
                    <AuthenticatedLayout user={user} onLogout={logout}>
                      <Suspense fallback={<ModulePageLoader />}>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/ratecard" element={<Ratecard />} />
                          <Route path="/boq" element={<BOQGenerator />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route 
                            path="/admin" 
                            element={
                              <ProtectedRoute requiredRole="super_admin">
                                <AdminManagement />
                              </ProtectedRoute>
                            } 
                          />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Suspense>
                    </AuthenticatedLayout>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
            </Routes>
          </Suspense>
        </Router>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

function AuthenticatedLayout({ children, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Header Bar with Same Light Blue Glassmorphism Effect as Sidebar */}
        <header className="h-16 border-b border-sky-200/70 dark:border-slate-800 bg-gradient-to-r from-sky-100/80 via-blue-50/70 to-sky-100/80 dark:from-slate-950/95 dark:via-slate-900/95 dark:to-slate-950/95 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6 transition-all shadow-sm">
          {/* Integrated Sidebar Toggle Icon Button (No Text) */}
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-bosch-blue dark:text-bosch-accent focus:outline-none transition-all border border-sky-200/70 dark:border-slate-700/70 shadow-sm flex items-center justify-center group"
              aria-label="Toggle Sidebar"
              title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="flex items-center gap-3 border-l border-sky-200/60 dark:border-slate-800 pl-4">
              <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-bosch-blue to-bosch-lightBlue flex items-center justify-center text-white text-xs font-bold shadow-md shadow-bosch-blue/20">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'B'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight leading-none">{user?.username || 'Bosch User'}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {user?.is_superuser || user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'price_admin' ? 'Price Admin' : user?.role === 'viewer' ? 'Viewer' : 'Pre-sales Admin'}
                </p>
              </div>
              <button 
                onClick={onLogout}
                className="ml-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 font-semibold text-slate-600 dark:text-slate-300 rounded-xl transition-all border border-sky-200/50 dark:border-slate-700/60 shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
