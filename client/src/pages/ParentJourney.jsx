import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Bus, Bell, MapPin, ShieldCheck, Clock, Smartphone, School, Home, AlertCircle } from 'lucide-react';

const JourneyStep = ({ side, icon: Icon, title, time, desc, img }) => (
  <div className={`flex items-center justify-between w-full mb-32 ${side === 'left' ? 'flex-row-reverse' : ''}`}>
    <div className="w-5/12" /> {/* Spacer */}
    
    {/* Step Icon Node */}
    <div className="z-20 flex items-center justify-center w-12 h-12 bg-white border-4 border-amber-400 rounded-full shadow-xl">
      <Icon className="text-amber-500" size={20} />
    </div>

    {/* Content Card */}
    <motion.div 
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className={`w-5/12 p-8 bg-white rounded-[2.5rem] shadow-xl border-b-8 border-slate-100 relative group overflow-hidden ${side === 'left' ? 'text-right' : 'text-left'}`}
    >
      {/* Cartoon Image */}
      <div className={`mb-4 flex ${side === 'left' ? 'justify-end' : 'justify-start'}`}>
        <img src={img} alt={title} className="w-20 h-20 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
      </div>

      <span className="text-amber-500 font-black text-xs uppercase tracking-[0.2em]">{time}</span>
      <h3 className="text-2xl font-black text-slate-900 mt-1 italic">{title}</h3>
      <p className="text-slate-500 mt-3 text-sm leading-relaxed font-bold">{desc}</p>
      
      {/* Fake "Notification" Badge */}
      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notification Sent</span>
      </div>
    </motion.div>
  </div>
);

export default function ParentJourney() {
  const { scrollYProgress } = useScroll();
  // Adjusting the bus travel to fit the longer timeline
  const busY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="bg-slate-50 min-h-screen py-20 px-6">
      <div className="max-w-5xl mx-auto relative">
        <header className="text-center mb-40">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-600 px-4 py-2 rounded-full mb-4">
            <Smartphone size={18} />
            <span className="text-xs font-black uppercase tracking-tighter">Real-Time Experience</span>
          </div>
          <h1 className="text-6xl font-black italic text-slate-900 tracking-tighter">
            Every Step, <span className="text-amber-500 underline decoration-slate-200">Tracked.</span>
          </h1>
          <p className="text-slate-500 mt-6 font-bold text-lg max-w-xl mx-auto">
            From the first morning alarm to the final evening drop-off.
          </p>
        </header>

        {/* THE CENTRAL ROAD */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-[82%] w-6 bg-slate-400 border-x-4 border-slate-300 rounded-full top-80 shadow-inner overflow-hidden">
          {/* Road Markings */}
          <div className="h-full w-full border-l-2 border-dashed border-white/50 ml-[10px]" />

          {/* THE ANIMATED 3D BUS */}
          <motion.div 
            style={{ top: busY }} 
            className="absolute left-1/2 transform -translate-x-1/2 z-30 transition-all duration-300"
          >
            <div className="relative">
              {/* Bus Shadow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-6 bg-black/20 blur-md rounded-full" />
              {/* Cartoon Bus Image */}
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
            img="https://cdn-icons-png.flaticon.com/512/3062/3062063.png" // House
            desc="The bus has left the depot. You receive a push notification: 'Bus is active and heading your way!'" 
          />
          
          <JourneyStep 
            side="left" time="07:25 AM" icon={Clock} 
            title="Proximity Check" 
            img="https://cdn-icons-png.flaticon.com/512/1157/1157019.png" // Traffic/Alert
            desc="Smart alerts: 'Bus is 2 stops away.' This prevents waiting in the rain or hot sun." 
          />

          <JourneyStep 
            side="right" time="07:45 AM" icon={ShieldCheck} 
            title="Safe Boarding" 
            img="https://cdn-icons-png.flaticon.com/512/3062/3062013.png" // Bus Stop
            desc="A message passes instantly: 'Your child has successfully boarded Bus 4. Journey started.'" 
          />

          <JourneyStep 
            side="left" time="08:15 AM" icon={School} 
            title="School Arrival" 
            img="https://cdn-icons-png.flaticon.com/512/167/167707.png" // School
            desc="Automatic Confirmation: 'Student reached school safely at 08:15 AM.' The school day begins!" 
          />

          <JourneyStep 
            side="right" time="08:45 AM" icon={AlertCircle} 
            title="Traffic Delays?" 
            img="https://cdn-icons-png.flaticon.com/512/815/815340.png" // Cone/Alert
            desc="If the bus hits traffic, parents receive a real-time 'Late Notification' update with revised ETA." 
          />

          <JourneyStep 
            side="left" time="03:30 PM" icon={Home} 
            title="Evening Return" 
            img="https://cdn-icons-png.flaticon.com/512/619/619153.png" // Family Home
            desc="Final confirmation: 'Your child has reached home safely.' Journey complete for today!" 
          />
        </div>
      </div>
    </div>
  );
}