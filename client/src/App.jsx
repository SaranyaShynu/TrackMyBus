import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import DemoModal from './components/DemoModal';
import Footer from './components/Footer';
import Auth from './pages/Auth';
import { motion } from 'framer-motion';
import { 
  Bus, 
  Shield, 
  Zap, 
  Bell, 
  History, 
  Mail, 
  Phone, 
  Globe,
  ArrowRight
} from 'lucide-react';

// --- LANDING PAGE COMPONENT ---
// We wrap the home content here so it only shows on the "/" route
const LandingPage = ({ onOpenDemo }) => {
  const navigate = useNavigate();

  return (
    <div className="scroll-smooth">
      <Navbar onOpenDemo={onOpenDemo} />

      {/* HERO SECTION */}
      <section id="home" className="pt-32 pb-20 bg-gradient-to-br from-amber-50 to-white min-h-screen px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-1/2"
          >
            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              Safety First. <br/> <span className="text-amber-500">Tracking Always.</span>
            </h1>
            <p className="mt-6 text-xl text-slate-600 max-w-lg">
              The advanced school bus tracking solution providing real-time peace of mind for parents and school authorities.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/auth')} 
                className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-amber-500 hover:text-slate-900 transition-all flex items-center gap-2"
              >
                Get Started <ArrowRight size={20} />
              </button>
              <button 
                onClick={onOpenDemo}
                className="border-2 border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Request Demo
              </button>
            </div>
          </motion.div>
          
          <div className="lg:w-1/2 bg-amber-400 rounded-[3rem] h-96 w-full shadow-2xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-slate-800/10 group-hover:bg-transparent transition-all"></div>
            <span className="text-white font-bold italic text-2xl drop-shadow-md">Live Tracking Preview</span>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 relative">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
              <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000" alt="Bus" className="w-full h-[500px] object-cover" />
            </div>
          </div>
          <div className="lg:w-1/2">
            <h4 className="text-amber-500 font-black uppercase tracking-widest text-sm mb-4">Our Mission</h4>
            <h2 className="text-4xl font-black italic mb-6">Bridging the gap between <span className="text-amber-500">Schools & Parents.</span></h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">We believe every child's journey should be safe. Our platform provides real-time visibility and fleet efficiency.</p>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="border-l-4 border-amber-400 pl-4">
                <h3 className="font-black text-slate-900 text-xl">Our Vision</h3>
                <p className="text-slate-500 text-sm">Setting the global standard for smart student transportation.</p>
              </div>
              <div className="border-l-4 border-amber-400 pl-4">
                <h3 className="font-black text-slate-900 text-xl">Our Value</h3>
                <p className="text-slate-500 text-sm">Integrity, precision, and relentless focus on safety.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black italic">Simple. Seamless. <span className="text-amber-500">Secure.</span></h2>
        </div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 relative">
          <StepCard step="01" title="Driver App Sync" desc="GPS syncs instantly from the driver's phone to our cloud servers." />
          <StepCard step="02" title="Real-Time Data" desc="Location and ETA are calculated and updated every 2 seconds." />
          <StepCard step="03" title="Parent Alert" desc="Receive instant notifications when the bus is near your stop." />
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="py-24 bg-slate-900 text-white px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black italic mb-16 text-center">Why Choose <span className="text-amber-400">TrackMyBus?</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BenefitCard icon={<Shield size={24} />} title="Geo-Fencing" desc="Alerts for school perimeter entry/exit." />
            <BenefitCard icon={<Zap size={24} />} title="Live ETA" desc="Precision tracking with instant updates." />
            <BenefitCard icon={<Bell size={24} />} title="Smart Alerts" desc="Notifications for delays or emergencies." />
            <BenefitCard icon={<History size={24} />} title="30-Day Logs" desc="Complete history for safety audits." />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <div className="font-sans text-slate-900 bg-white">
      <Routes>
        <Route path="/" element={<LandingPage onOpenDemo={() => setIsDemoOpen(true)} />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}

// --- SUB-COMPONENTS ---
function StepCard({ step, title, desc }) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl relative z-10 group hover:border-amber-400 transition-all duration-300">
      <div className="text-6xl font-black text-slate-50 group-hover:text-amber-50 transition-colors mb-6 absolute -top-4 right-8">{step}</div>
      <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white">
        <Bus size={24} />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function BenefitCard({ icon, title, desc }) {
  return (
    <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-3xl hover:bg-slate-800 hover:border-amber-400 transition-all group text-left">
      <div className="mb-6 bg-slate-700/50 w-12 h-12 rounded-xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-black mb-3 text-white">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}