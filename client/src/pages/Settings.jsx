import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Moon, Sun, Bell, BellOff, ShieldCheck, Smartphone, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  // 1. Fix: Use { } for destructuring an object
  const { isDarkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);

  // Toggle Switch Component
  const Toggle = ({ enabled, setEnabled, iconOn: IconOn, iconOff: IconOff }) => (
    <button
      onClick={setEnabled} // 2. Pass the function directly
      className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors duration-300 focus:outline-none ${
        enabled ? 'bg-amber-400' : 'bg-slate-200'
      }`}
    >
      <div
        className={`flex h-8 w-8 transform items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-300 ${
          enabled ? 'translate-x-11' : 'translate-x-1'
        }`}
      >
        {enabled ? <IconOn size={16} className="text-amber-600" /> : <IconOff size={16} className="text-slate-400" />}
      </div>
    </button>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <header className="mb-10">
            <h1 className={`text-5xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Set<span className="text-amber-500">tings</span>
            </h1>
            <p className="text-slate-500 font-bold mt-2">Manage your app experience and preferences.</p>
          </header>

          <div className="space-y-6">
            {/* --- APPEARANCE SECTION --- */}
            <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} shadow-xl transition-all`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-700 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                    {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
                  </div>
                  <div>
                    <p className={`font-black uppercase italic tracking-tight text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {isDarkMode ? 'Dark Mode' : 'Day Mode'}
                    </p>
                    <p className="text-sm font-medium text-slate-400">Switch between light and dark themes</p>
                  </div>
                </div>
                {/* 3. Fix: Pass toggleTheme here */}
                <Toggle enabled={isDarkMode} setEnabled={toggleTheme} iconOn={Moon} iconOff={Sun} />
              </div>
            </div>

            {/* --- NOTIFICATIONS SECTION --- */}
            <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} shadow-xl transition-all`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl ${notifications ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {notifications ? <Bell size={24} /> : <BellOff size={24} />}
                  </div>
                  <div>
                    <p className={`font-black uppercase italic tracking-tight text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Notifications
                    </p>
                    <p className="text-sm font-medium text-slate-400">Arrival alerts and route updates</p>
                  </div>
                </div>
                {/* 4. Fix: Notifications toggle logic */}
                <Toggle enabled={notifications} setEnabled={() => setNotifications(!notifications)} iconOn={Bell} iconOff={BellOff} />
              </div>
            </div>

            {/* --- QUICK ACTIONS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className={`p-6 rounded-[2rem] border text-left flex items-center gap-4 hover:border-amber-400 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="text-amber-500"><ShieldCheck size={20} /></div>
                <span className={`font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Change Password</span>
              </button>
              
              <div className={`p-6 rounded-[2rem] border flex items-center gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="text-slate-400"><Smartphone size={20} /></div>
                <div>
                  <p className={`font-bold text-xs uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Version</p>
                  <p className={`font-black text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>v1.0.4 (Stable)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}