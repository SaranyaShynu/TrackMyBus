import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Bus, LayoutDashboard, Users, ShieldAlert, BarChart3, 
  Settings, ClipboardCheck, History, Fuel 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SchoolStep = ({ side, icon: Icon, title, time, desc, img, isDarkMode }) => (
  <div className={`flex items-center justify-between w-full mb-32 ${side === 'left' ? 'flex-row-reverse' : ''}`}>
    <div className="w-5/12" /> 
    
    {/* Step Icon Node */}
    <div className={`z-20 flex items-center justify-center w-12 h-12 border-4 rounded-full shadow-xl transition-colors duration-500 ${
      isDarkMode ? 'bg-slate-800 border-amber-500' : 'bg-white border-amber-400'
    }`}>
      <Icon className="text-amber-500" size={20} />
    </div>

    {/* Content Card */}
    <motion.div 
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className={`w-5/12 p-8 rounded-[2.5rem] shadow-xl relative group overflow-hidden border-b-8 transition-all duration-500 ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-white shadow-black/40' 
          : 'bg-white border-slate-100 text-left'
      } ${side === 'left' ? 'text-right' : 'text-left'}`}
    >
      {/* Image Container */}
      <div className={`mb-4 flex ${side === 'left' ? 'justify-end' : 'justify-start'}`}>
        <img src={img} alt={title} className="w-20 h-20 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
      </div>

      <span className="text-amber-500 font-black text-xs uppercase tracking-[0.2em]">{time}</span>
      <h3 className={`text-2xl font-black mt-1 italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      <p className={`mt-3 text-sm leading-relaxed font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
      
      {/* Status Badge */}
      <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
      }`}>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin System Active</span>
      </div>
    </motion.div>
  </div>
);

export default function SchoolJourney() {
  const { isDarkMode } = useTheme();
  const { scrollYProgress } = useScroll();
  const busY = useTransform(scrollYProgress, [0, 1], ["0%", "95%"]);

  return (
    <div className={`min-h-screen py-20 px-6 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-5xl mx-auto relative">
        <header className="text-center mb-40">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-amber-400 px-4 py-2 rounded-full mb-4 border border-slate-800">
            <Settings size={18} />
            <span className="text-xs font-black uppercase tracking-tighter">Fleet Command</span>
          </div>
          <h1 className={`text-6xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Full Fleet <span className="text-amber-500 underline decoration-slate-200/20">Command.</span>
          </h1>
          <p className={`mt-6 font-bold text-lg max-w-xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            A comprehensive 12-hour timeline of smart school transport management.
          </p>
        </header>

        {/* THE CENTRAL ROAD */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 h-[85%] w-6 rounded-full top-80 shadow-inner overflow-hidden border-x-4 transition-colors duration-500 ${
          isDarkMode ? 'bg-slate-800 border-slate-900' : 'bg-slate-400 border-slate-300'
        }`}>
          <div className={`h-full w-full border-l-2 border-dashed ml-[10px] ${
            isDarkMode ? 'border-slate-700' : 'border-white/50'
          }`} />

          {/* THE ANIMATED BUS */}
          <motion.div 
            style={{ top: busY }} 
            className="absolute left-1/2 transform -translate-x-1/2 z-30"
          >
            <div className="relative">
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-6 bg-black/40 blur-md rounded-full" />
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3448/3448339.png" 
                alt="3D Red Bus" 
                className="w-16 h-16 drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>

        {/* TIMELINE STEPS */}
        <div className="relative z-10">
          <SchoolStep 
            side="right" time="06:00 AM" icon={ClipboardCheck} 
            title="Pre-Trip Readiness" 
            img="https://cdn-icons-png.flaticon.com/512/2821/2821637.png" 
            desc="Automated check-in for drivers. The system verifies GPS health and fuel levels before departure." 
            isDarkMode={isDarkMode}
          />
          
          <SchoolStep 
            side="left" time="07:30 AM" icon={LayoutDashboard} 
            title="Active Monitoring" 
            img="https://cdn-icons-png.flaticon.com/512/854/854878.png" 
            desc="The Master Dashboard lights up. Admin sees all 50+ buses moving live across the city map." 
            isDarkMode={isDarkMode}
          />

          <SchoolStep 
            side="right" time="09:00 AM" icon={ShieldAlert} 
            title="Safety Protocol" 
            img="https://cdn-icons-png.flaticon.com/512/1157/1157019.png" 
            desc="Morning session audit. System flags any over-speeding or unscheduled stops for review." 
            isDarkMode={isDarkMode}
          />

          <SchoolStep 
            side="left" time="01:00 PM" icon={Fuel} 
            title="Route Optimization" 
            img="https://cdn-icons-png.flaticon.com/512/3201/3201521.png" 
            desc="Admin adjusts afternoon routes based on live city traffic data to save fuel and time." 
            isDarkMode={isDarkMode}
          />

          <SchoolStep 
            side="right" time="04:00 PM" icon={BarChart3} 
            title="Ridership Reports" 
            img="https://cdn-icons-png.flaticon.com/512/4222/4222025.png" 
            desc="Attendance data syncs with school records. See exactly which students are currently on which bus." 
            isDarkMode={isDarkMode}
          />

          <SchoolStep 
            side="left" time="06:00 PM" icon={History} 
            title="Fleet Archiving" 
            img="https://cdn-icons-png.flaticon.com/512/3503/3503786.png" 
            desc="Day complete. All journey logs are archived for 365 days for safety insurance and parent queries." 
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}