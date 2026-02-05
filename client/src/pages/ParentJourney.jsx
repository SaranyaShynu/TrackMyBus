import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Bus, Bell, MapPin, ShieldCheck, Clock, Smartphone } from 'lucide-react';

const JourneyStep = ({ side, icon: Icon, title, time, desc }) => (
  <div className={`flex items-center justify-between w-full mb-24 ${side === 'left' ? 'flex-row-reverse' : ''}`}>
    <div className="w-5/12" /> {/* Spacer */}
    
    {/* Step Icon Node */}
    <div className="z-20 flex items-center justify-center w-12 h-12 bg-white border-4 border-amber-400 rounded-full shadow-xl">
      <Icon className="text-amber-500" size={20} />
    </div>

    {/* Content Card */}
    <motion.div 
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`w-5/12 p-6 bg-white rounded-3xl shadow-lg border-t-4 border-amber-400 ${side === 'left' ? 'text-right' : 'text-left'}`}
    >
      <span className="text-amber-500 font-black text-xs uppercase tracking-widest">{time}</span>
      <h3 className="text-xl font-black text-slate-900 mt-1">{title}</h3>
      <p className="text-slate-500 mt-2 text-sm leading-relaxed font-medium">{desc}</p>
    </motion.div>
  </div>
);

export default function ParentJourney() {
  const { scrollYProgress } = useScroll();
  // Maps the scroll progress (0 to 1) to a vertical percentage (0% to 95%)
  const busY = useTransform(scrollYProgress, [0, 1], ["0%", "95%"]);

  return (
    <div className="bg-slate-50 min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto relative">
        <header className="text-center mb-32">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-600 px-4 py-2 rounded-full mb-4">
            <Smartphone size={18} />
            <span className="text-xs font-black uppercase tracking-tighter">Parent Experience</span>
          </div>
          <h1 className="text-5xl font-black italic text-slate-900">A Day with <span className="text-amber-500">TrackMyBus</span></h1>
          <p className="text-slate-500 mt-4 font-medium">Scroll down to see the journey unfold</p>
        </header>

        {/* THE CENTRAL TRACK */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-[80%] w-1.5 bg-slate-200 rounded-full top-64">
          {/* THE ANIMATED BUS */}
          <motion.div 
            style={{ top: busY }} 
            className="absolute left-1/2 transform -translate-x-1/2 z-30 bg-slate-900 p-3 rounded-xl shadow-2xl border-2 border-amber-400"
          >
            <Bus className="text-amber-400" size={28} />
          </motion.div>
        </div>

        {/* TIMELINE STEPS */}
        <div className="relative z-10">
          <JourneyStep 
            side="right" time="07:00 AM" icon={Bell} 
            title="Good Morning Alert" 
            desc="You receive a notification that the bus has left the school depot and is heading your way." 
          />
          <JourneyStep 
            side="left" time="07:15 AM" icon={MapPin} 
            title="Live GPS Tracking" 
            desc="Open the portal to see the bus moving in real-time on our high-precision map." 
          />
          <JourneyStep 
            side="right" time="07:25 AM" icon={Clock} 
            title="Proximity Warning" 
            desc="The bus is 500 meters away. A smart alert tells you it's time to head to the stop." 
          />
          <JourneyStep 
            side="left" time="07:35 AM" icon={ShieldCheck} 
            title="Safe Boarding" 
            desc="Your child boards the bus safely. You get an instant confirmation ping." 
          />
        </div>
      </div>
    </div>
  );
}