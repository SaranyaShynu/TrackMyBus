import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Bus, Bell, MapPin, ShieldCheck, Clock, Smartphone, School, Home, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const JourneyStep = ({ side, icon: Icon, title, time, desc, img, isDarkMode }) => (
  <div className={`flex items-center justify-between w-full mb-32 ${side === 'left' ? 'flex-row-reverse' : ''}`}>
    <div className="w-5/12" /> 
    
    {/* Step Icon Node */}
    <div className={`z-20 flex items-center justify-center w-12 h-12 border-4 rounded-full shadow-xl transition-colors duration-500 ${
      isDarkMode ? 'bg-slate-800 border-amber-500 shadow-black/50' : 'bg-white border-amber-400'
    }`}>
      <Icon className="text-amber-500" size={20} />
    </div>

    {/* Content Card */}
    <motion.div 
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className={`w-5/12 p-8 rounded-[2.5rem] shadow-xl border-b-8 relative group overflow-hidden transition-all duration-500 ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 shadow-black/40' 
          : 'bg-white border-slate-100'
      } ${side === 'left' ? 'text-right' : 'text-left'}`}
    >
      {/* Cartoon Image */}
      <div className={`mb-4 flex ${side === 'left' ? 'justify-end' : 'justify-start'}`}>
        <img src={img} alt={title} className="w-20 h-20 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
      </div>

      <span className="text-amber-500 font-black text-xs uppercase tracking-[0.2em]">{time}</span>
      <h3 className={`text-2xl font-black mt-1 italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      <p className={`mt-3 text-sm leading-relaxed font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
      
      {/* Fake "Notification" Badge */}
      <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
      }`}>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Notification Sent
        </span>
      </div>
    </motion.div>
  </div>
);

export default function ParentJourney() {
  const { isDarkMode } = useTheme();
  const { scrollYProgress } = useScroll();
  const busY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className={`min-h-screen py-20 px-6 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-5xl mx-auto relative">
        <header className="text-center mb-40">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 transition-colors ${
            isDarkMode ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'bg-amber-100 text-amber-600'
          }`}>
            <Smartphone size={18} />
            <span className="text-xs font-black uppercase tracking-tighter">Real-Time Experience</span>
          </div>
          <h1 className={`text-6xl font-black italic tracking-tighter transition-colors ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Every Step, <span className="text-amber-500 underline decoration-amber-500/20">Tracked.</span>
          </h1>
          <p className={`mt-6 font-bold text-lg max-w-xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            From the first morning alarm to the final evening drop-off.
          </p>
        </header>

        {/* THE CENTRAL ROAD */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 h-[82%] w-6 rounded-full top-80 shadow-inner overflow-hidden border-x-4 transition-colors duration-500 ${
          isDarkMode ? 'bg-slate-800 border-slate-900' : 'bg-slate-400 border-slate-300'
        }`}>
          {/* Road Markings */}
          <div className={`h-full w-full border-l-2 border-dashed ml-[10px] ${
            isDarkMode ? 'border-slate-700' : 'border-white/50'
          }`} />

          {/* THE ANIMATED 3D BUS */}
          <motion.div 
            style={{ top: busY }} 
            className="absolute left-1/2 transform -translate-x-1/2 z-30 transition-all duration-300"
          >
            <div className="relative">
              {/* Bus Shadow */}
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-6 blur-md rounded-full ${
                isDarkMode ? 'bg-black/60' : 'bg-black/20'
              }`} />
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3448/3448339.png" 
                alt="3D Bus" 
                className="w-16 h-16 drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>

        {/* TIMELINE STEPS */}
        <div className="relative z-10">
          <JourneyStep 
            side="right" time="07:00 AM" icon={Bell} 
            title="Good Morning Alert" 
            img="https://cdn-icons-png.flaticon.com/512/3062/3062063.png" 
            desc="The bus has left the depot. You receive a push notification: 'Bus is active and heading your way!'" 
            isDarkMode={isDarkMode}
          />
          
          <JourneyStep 
            side="left" time="07:25 AM" icon={Clock} 
            title="Proximity Check" 
            img="https://cdn-icons-png.flaticon.com/512/1157/1157019.png" 
            desc="Smart alerts: 'Bus is 2 stops away.' This prevents waiting in the rain or hot sun." 
            isDarkMode={isDarkMode}
          />

          <JourneyStep 
            side="right" time="07:45 AM" icon={ShieldCheck} 
            title="Safe Boarding" 
            img="https://cdn-icons-png.flaticon.com/512/3062/3062013.png" 
            desc="A message passes instantly: 'Your child has successfully boarded Bus 4. Journey started.'" 
            isDarkMode={isDarkMode}
          />

          <JourneyStep 
            side="left" time="08:15 AM" icon={School} 
            title="School Arrival" 
            img="https://cdn-icons-png.flaticon.com/512/167/167707.png" 
            desc="Automatic Confirmation: 'Student reached school safely at 08:15 AM.' The school day begins!" 
            isDarkMode={isDarkMode}
          />

          <JourneyStep 
            side="right" time="08:45 AM" icon={AlertCircle} 
            title="Traffic Delays?" 
            img="https://cdn-icons-png.flaticon.com/512/815/815340.png" 
            desc="If the bus hits traffic, parents receive a real-time 'Late Notification' update with revised ETA." 
            isDarkMode={isDarkMode}
          />

          <JourneyStep 
            side="left" time="03:30 PM" icon={Home} 
            title="Evening Return" 
            img="https://cdn-icons-png.flaticon.com/512/619/619153.png" 
            desc="Final confirmation: 'Your child has reached home safely.' Journey complete for today!" 
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}