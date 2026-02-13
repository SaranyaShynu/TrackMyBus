import React, { useState, useEffect, useRef } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { Bus, Headphones, Menu, X, ChevronDown, User, School, Settings, LogOut, Edit3, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onOpenDemo, onHomeClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem('token'));
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('storage', checkAuth);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('storage', checkAuth);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  const navLinks = [
    { name: 'Home', id: 'home', type: 'scroll' },
    { name: 'About Us', id: 'about', type: 'scroll' },
    { 
      name: 'How it Works', 
      id: 'how-it-works', 
      type: 'dropdown',
      subLinks: [
        { name: 'Parent Journey', path: '/parent-journey', icon: <User size={16} /> },
        { name: 'School Journey', path: '/school-journey', icon: <School size={16} /> }
      ]
    },
    { name: 'Benefits', id: 'benefits', type: 'scroll' },
  ];

  const handleNavClick = (link) => {
    if (link.type === 'scroll') {
      if (location.pathname !== '/') {
        navigate('/');
        // Timeout to allow navigation before scrolling
        setTimeout(() => {
          document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        if (link.id === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          onHomeClick();
        } else {
          document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
        }
      }
      setIsMobileMenuOpen(false);
    }
  };

 return (
   <motion.nav 
      initial={false}
      animate={{ 
        backgroundColor: isDarkMode ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.9)",
        borderColor: isDarkMode ? "rgba(30, 41, 59, 1)" : "rgba(241, 245, 249, 1)"
      }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-[5000] backdrop-blur-md shadow-sm border-b font-sans"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* 1. LOGO */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="bg-amber-400 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-amber-200">
            <Bus className="text-slate-900" size={24} />
          </div>
         <motion.span 
            animate={{ color: isDarkMode ? "#ffffff" : "#0f172a" }}
            className="text-2xl font-black tracking-tighter italic uppercase"
          >
            TrackMy<span className="text-amber-500 font-black">Bus</span>
          </motion.span>
        </div>
        
        {/* 2. CENTER LINKS (Desktop) */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => (
            <div key={link.id} className="relative">
              {link.type === 'dropdown' ? (
                <div onMouseEnter={() => setIsHowItWorksOpen(true)} onMouseLeave={() => setIsHowItWorksOpen(false)} className="py-4">
                  <button className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} hover:text-amber-500 font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center gap-1`}>
                    {link.name} <ChevronDown size={14} className={`transition-transform ${isHowItWorksOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isHowItWorksOpen && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className={`absolute top-full left-0 w-56 border shadow-2xl rounded-2xl overflow-hidden p-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                        {link.subLinks.map(sub => (
                          <button key={sub.path} onClick={() => navigate(sub.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold text-left ${isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-amber-400' : 'text-slate-600 hover:bg-amber-50 hover:text-amber-600'}`}>
                            <span className="text-amber-500">{sub.icon}</span> {sub.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={() => handleNavClick(link)} className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} hover:text-amber-500 font-black text-[11px] uppercase tracking-[0.2em] transition-all`}>
                  {link.name}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 3. RIGHT SECTION (Auth & Profile) */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/dashboard')} className={`hidden md:flex items-center gap-2 font-black text-[10px] uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-amber-400' : 'bg-slate-50 text-slate-500 hover:text-amber-600'}`}>
                <LayoutDashboard size={14} /> Dashboard
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`flex items-center gap-2 p-1 rounded-full border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-amber-50 border-amber-200 hover:shadow-md'}`}>
                  <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-slate-900 shadow-inner">
                    <User size={18} />
                  </div>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute right-0 mt-3 w-60 border shadow-2xl rounded-[1.5rem] overflow-hidden p-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                      <div className={`px-4 py-3 border-b mb-1 ${isDarkMode ? 'border-slate-700' : 'border-slate-50'}`}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged in as</p>
                        <p className={`text-sm font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Parent Account</p>
                      </div>
                      <button onClick={() => {navigate('/profile'); setIsProfileOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-amber-400' : 'text-slate-600 hover:bg-amber-50 hover:text-amber-600'}`}><Edit3 size={16}/> Edit Details</button>
                      <button onClick={() => {navigate('/settings'); setIsProfileOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-amber-400' : 'text-slate-600 hover:bg-amber-50 hover:text-amber-600'}`}><Settings size={16}/> Settings</button>
                      <div className={`border-t my-1 ${isDarkMode ? 'border-slate-700' : 'border-slate-50'}`}></div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all text-sm font-black"><LogOut size={16}/> Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <button onClick={() => navigate('/auth')} className="hidden sm:flex bg-slate-900 dark:bg-amber-500 hover:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-900 px-6 py-2.5 rounded-2xl font-black text-xs transition-all shadow-lg">
              Sign In
            </button>
          )}

          <button onClick={onOpenDemo} className={`hidden sm:flex p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-amber-400' : 'bg-slate-50 text-slate-400 hover:text-amber-500'}`}>
            <Headphones size={20} />
          </button>

          {/* Hamburger */}
          <button className={`lg:hidden p-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className={`lg:hidden border-t overflow-hidden shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'}`}>
            <div className="px-6 py-8 space-y-4">
              {navLinks.map(link => (
                <div key={link.id}>
                  {link.type === 'dropdown' ? (
                    <div className="space-y-2">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{link.name}</p>
                      {link.subLinks.map(sub => (
                        <button key={sub.path} onClick={() => { navigate(sub.path); setIsMobileMenuOpen(false); }}
                          className={`flex items-center gap-3 text-lg font-black ml-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          <span className="text-amber-500">{sub.icon}</span> {sub.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button onClick={() => handleNavClick(link)} className={`text-xl font-black block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{link.name}</button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}