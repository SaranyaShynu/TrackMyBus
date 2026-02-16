import React, { useState, useRef, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { 
  Bus, LayoutDashboard, ShieldCheck, Settings, 
  LogOut, Bell, UserCog, Search, Moon, Sun 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  return (
    <nav className={`fixed top-0 w-full z-[5000] border-b backdrop-blur-md transition-all duration-300 ${
      isDarkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'
    }`}>
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand - Specific for Admin */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin-panel')}>
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-700 shadow-xl shadow-slate-900/20">
            <ShieldCheck className="text-amber-500" size={24} />
          </div>
          <div className="flex flex-col">
            <span className={`text-xl font-black tracking-tighter italic uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Admin<span className="text-amber-500">Panel</span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Fleet Management</span>
          </div>
        </div>

        {/* Admin Quick Search/Status (Optional) */}
        <div className="hidden md:flex items-center bg-slate-500/10 px-4 py-2 rounded-2xl border border-transparent focus-within:border-amber-500/50 transition-all">
          <Search size={16} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Search UID, Bus No..." 
            className="bg-transparent border-none outline-none px-3 text-xs font-bold w-48"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-slate-500/10 transition-colors">
            {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
          </button>
          
          <button className="p-2.5 rounded-xl hover:bg-slate-500/10 transition-colors relative">
            <Bell size={20} className={isDarkMode ? 'text-slate-400' : 'text-slate-600'} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
          </button>

          <div className="h-8 w-[1px] bg-slate-500/20 mx-2"></div>

          {/* Admin Profile */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-1 pr-4 rounded-full border border-transparent hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
            >
              <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center border-2 border-amber-500">
                <UserCog size={20} className="text-amber-500" />
              </div>
              <div className="hidden sm:block text-left">
                <p className={`text-xs font-black leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name}</p>
                <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-1">Super Admin</p>
              </div>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className={`absolute right-0 mt-4 w-64 border shadow-2xl rounded-[2rem] p-3 overflow-hidden ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="p-4 bg-slate-500/5 rounded-2xl mb-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Privileges</p>
                    <p className="text-xs font-bold mt-1 text-green-500 flex items-center gap-2">
                       <ShieldCheck size={12}/> Full Database Access
                    </p>
                  </div>

                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-amber-500/10 hover:text-amber-500`}>
                    <Settings size={16} /> System Settings
                  </button>
                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-amber-500/10 hover:text-amber-500`}>
                    <UserCog size={16} /> Admin Profile
                  </button>
                  
                  <div className="h-[1px] bg-slate-500/10 my-2"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-black text-sm hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <LogOut size={16} /> Terminate Session
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}