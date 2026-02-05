import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { Bus, Headphones, Menu, X, ChevronDown, User, School, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ onOpenDemo, onHomeClick }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Check if user is logged in (Authentication State)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // Sync login state if token changes
  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
    setIsMobileMenuOpen(false);
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
      if (link.id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onHomeClick();
      } else {
        document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
      }
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => { navigate('/'); onHomeClick(); }}
        >
          <div className="bg-amber-400 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-amber-200">
            <Bus className="text-slate-900" size={24} />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">
            TrackMy<span className="text-amber-500 font-black">Bus</span>
          </span>
        </div>
        
        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => (
            <div key={link.id} className="relative group">
              {link.type === 'dropdown' ? (
                <div 
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                  className="relative py-4"
                >
                  <button className="flex items-center gap-1 text-slate-500 hover:text-amber-500 font-black text-[11px] uppercase tracking-[0.2em] transition-all">
                    {link.name} <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden p-2"
                      >
                        {link.subLinks.map(sub => (
                          <button
                            key={sub.path}
                            onClick={() => { navigate(sub.path); setIsDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all text-sm font-bold text-left"
                          >
                            <span className="text-amber-500">{sub.icon}</span>
                            {sub.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => handleNavClick(link)}
                  className="text-slate-500 hover:text-amber-500 font-black text-[11px] uppercase tracking-[0.2em] transition-all"
                >
                  {link.name}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons & Hamburger */}
        <div className="flex items-center gap-3">
          {/* SETTINGS (Only visible if logged in) */}
          {isLoggedIn && (
            <button 
              onClick={() => navigate('/dashboard')}
              className="hidden sm:flex p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all group"
              title="Settings"
            >
              <Settings size={22} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>
          )}

          {/* CONTACT OFFICE */}
          <button 
            onClick={onOpenDemo}
            className="hidden sm:flex bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-900 px-6 py-2.5 rounded-2xl font-black text-xs items-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <Headphones size={16} />
            Contact Office
          </button>

          {/* Hamburger Toggle */}
          <button 
            className="lg:hidden p-2 text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-t border-slate-50 overflow-hidden shadow-xl"
          >
            <div className="px-6 py-8 space-y-6">
              {navLinks.map(link => (
                <div key={link.id}>
                  {link.type === 'dropdown' ? (
                    <div className="space-y-4">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{link.name}</p>
                      {link.subLinks.map(sub => (
                        <button
                          key={sub.path}
                          onClick={() => { navigate(sub.path); setIsMobileMenuOpen(false); }}
                          className="flex items-center gap-3 text-xl font-black text-slate-900"
                        >
                          <span className="text-amber-500">{sub.icon}</span>
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavClick(link)}
                      className="text-2xl font-black text-slate-900 hover:text-amber-500 transition-colors"
                    >
                      {link.name}
                    </button>
                  )}
                </div>
              ))}
              
              <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                {/* Mobile Settings & Logout */}
                {isLoggedIn && (
                  <>
                    <button 
                      onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-start gap-3 text-slate-600 font-bold py-2"
                    >
                      <Settings size={20} /> Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-start gap-3 text-red-500 font-bold py-2"
                    >
                      <LogOut size={20} /> Logout
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => { onOpenDemo(); setIsMobileMenuOpen(false); }}
                  className="w-full bg-amber-400 py-4 rounded-2xl font-black text-slate-900 flex items-center justify-center gap-3"
                >
                  <Headphones size={20} />
                  Contact Office
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}