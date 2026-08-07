import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App.jsx';
import { Lock, User, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(username, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-50/60 overflow-hidden font-sans select-none">
      {/* Background Bright Ambient Light Blue Orbs Layer */}
      <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-sky-400/35 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[34rem] h-[34rem] bg-blue-400/25 rounded-full blur-[140px] animation-delay-2000 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[38rem] bg-cyan-300/30 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Subtle Light Geometric Tech Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c718_1px,transparent_1px),linear-gradient(to_bottom,#0284c718_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_80%,transparent_100%)] opacity-60 pointer-events-none" />

      {/* Main Light Glass Card Panel Container */}
      <motion.div 
        initial={{ opacity: 0, y: 35, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 sm:p-10 rounded-3xl light-blue-glass-panel relative z-10 mx-4 shadow-2xl backdrop-blur-2xl border border-white/80"
      >
        {/* Top Highlight Accent Bar */}
        <div className="absolute -top-px left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-sky-500/80 to-transparent" />

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <motion.div 
            whileHover={{ scale: 1.06, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-16 h-16 bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-sky-500/25 mb-4 border border-white/60 relative"
          >
            <ShieldCheck className="w-9 h-9 text-white drop-shadow-md" />
          </motion.div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-xs">
            PRE-SALES CRM
          </h2>
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 mt-2.5 rounded-full bg-sky-50 border border-sky-200/90 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
            <p className="text-[11px] font-bold text-sky-800 tracking-wide uppercase">
              Pre-sales Operations Portal
            </p>
          </div>
        </div>

        {/* Form Error Alert with Shake Animation */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: [-8, 8, -6, 6, -3, 3, 0] }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs mb-6 font-medium shadow-sm backdrop-blur-md"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <span className={`absolute inset-y-0 left-0 pl-3.5 flex items-center transition-colors duration-200 pointer-events-none ${
                focusedField === 'username' ? 'text-sky-600' : 'text-slate-400'
              }`}>
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter username"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  focusedField === 'username'
                    ? 'bg-white border-sky-500 ring-2 ring-sky-400/30 text-slate-900 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                    : 'bg-white/85 border border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 hover:bg-white'
                } outline-none`}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className={`absolute inset-y-0 left-0 pl-3.5 flex items-center transition-colors duration-200 pointer-events-none ${
                focusedField === 'password' ? 'text-sky-600' : 'text-slate-400'
              }`}>
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                className={`w-full pl-11 pr-11 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  focusedField === 'password'
                    ? 'bg-white border-sky-500 ring-2 ring-sky-400/30 text-slate-900 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                    : 'bg-white/85 border border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 hover:bg-white'
                } outline-none`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-sky-600 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.015, boxShadow: "0 12px 30px -5px rgba(14, 165, 233, 0.45)" }}
            whileTap={{ scale: 0.985 }}
            type="submit"
            disabled={submitting}
            className="w-full mt-3 py-3.5 bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              'Sign In to Portal'
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200/80 text-center">
          <p className="text-[10px] text-slate-500 font-mono tracking-tight">
            Protected under corporate authentication guidelines.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
