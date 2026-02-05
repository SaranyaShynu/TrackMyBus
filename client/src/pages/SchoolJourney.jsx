import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LayoutDashboard, Users, ShieldAlert, BarChart3, Bus, Settings } from 'lucide-react';

const SchoolStep = ({ side, icon: Icon, title, desc }) => (
  <div className={`flex items-center justify-between w-full mb-32 ${side === 'left' ? 'flex-row-reverse' : ''}`}>
    <div className="w-5/12" />
    <div className="z-20 flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl rotate-45 shadow-xl border-2 border-amber-400">
      <Icon className="text-amber-400 -rotate-45" size={24} />
    </div>
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="w-5/12 p-8 bg-white rounded-[2.5rem] shadow-xl border-b-8 border-slate-900"
    >
      <h3 className="text-2xl font-black text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium text-sm">{desc}</p>
    </motion.div>
  </div>
);

export default function SchoolJourney() {
  const { scrollYProgress } = useScroll();
  const busY = useTransform(scrollYProgress, [0, 1], ["0%", "92%"]);

  return (
    <div className="bg-amber-50 min-h-screen py-24 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto relative">
        <header className="text-center mb-32">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-amber-400 px-4 py-2 rounded-full mb-4">
            <Settings size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Admin Control</span>
          </div>
          <h1 className="text-5xl font-black italic text-slate-900">Full Fleet <span className="text-amber-500">Command.</span></h1>
          <p className="text-slate-600 mt-4 font-bold">Managing student safety at scale.</p>
        </header>

        <div className="absolute left-1/2 transform -translate-x-1/2 h-[80%] w-2 bg-slate-200/50 rounded-full top-64" />
        
        <motion.div style={{ top: busY }} className="absolute left-1/2 transform -translate-x-1/2 z-30 top-64">
           <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border-2 border-amber-400">
              <Bus className="text-amber-400" size={32} />
           </div>
        </motion.div>

        <div className="relative z-10">
          <SchoolStep side="right" icon={LayoutDashboard} title="The Overview" desc="See every bus in your fleet on a single live-tracking dashboard with speed and route data." />
          <SchoolStep side="left" icon={Users} title="Driver Management" desc="Assign drivers to routes, track their attendance, and monitor driving behavior automatically." />
          <SchoolStep side="right" icon={ShieldAlert} title="Incident Alerts" desc="Instant notifications if a bus deviates from its route or exceeds the speed limit." />
          <SchoolStep side="left" icon={BarChart3} title="Data Insights" desc="Generate weekly reports on fuel efficiency, on-time performance, and student ridership." />
        </div>
      </div>
    </div>
  );
}