import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// Layout & UI Components
import Navbar from './components/Navbar';
import ContactModal from './components/ContactModal';
import Footer from './components/Footer';

// Page Components
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import DriverPanel from './pages/DriverPanel';
import AdminPanel from './pages/AdminPanel';
import ParentJourney from './pages/ParentJourney';
import SchoolJourney from './pages/SchoolJourney';

// Animation & Icons
import { motion } from 'framer-motion';
import { 
  Bus, 
  Shield, 
  Zap, 
  Bell, 
  History, 
  ArrowRight,
  PhoneCall
} from 'lucide-react';

// --- LOADING SCREEN ---
const LoadingScreen = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-amber-400">
    <motion.div 
      animate={{ x: [-100, 100, -100] }} 
      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      className="mb-4"
    >
      <Bus size={64} className="text-slate-900" />
    </motion.div> 
  </div>
);

// --- PROTECTED ROUTE ---
const ProtectedRoute = ({ children , allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'))
  if (!token) { return <Navigate to="/auth" replace />; }
  if(allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/" replace />
  }
  return children;
};

// --- LANDING PAGE COMPONENT ---
const LandingPage = ({ onOpenContact, onHomeClick }) => {
  const navigate = useNavigate();

  return (
    <div className="scroll-smooth">
      <Navbar onOpenDemo={onOpenContact} onHomeClick={onHomeClick}/>

      {/* HERO SECTION */}
      <section id="home" className="pt-32 pb-20 bg-gradient-to-br from-amber-50 to-white min-h-screen px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="lg:w-1/2"
          >
            <h1 className="text-5xl lg:text-7xl font-black leading-tight text-slate-900">
              Your Child’s <br/> <span className="text-amber-500 underline decoration-slate-200">Safe Journey</span> Starts Here.
            </h1>
            <p className="mt-6 text-xl text-slate-600 max-w-lg font-medium leading-relaxed">
              The official transportation portal for our students. Log in to track the school bus in real-time and get arrival updates.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/auth')} 
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-amber-500 hover:text-slate-900 transition-all flex items-center gap-3 hover:-translate-y-1"
              >
                 Portal Login <ArrowRight size={20} />
              </button>
              <button 
                onClick={onOpenContact}
                className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <PhoneCall size={20} className="text-amber-500" />
                Contact Transport Office
              </button>
            </div>
          </motion.div>
          
          {/* IMAGE: School Bus Hero */}
          <div className="lg:w-1/2 bg-slate-100 rounded-[3.5rem] h-[500px] w-full shadow-2xl relative overflow-hidden group border-8 border-white">
            <img 
              src="https://buscdn.cardekho.com/in/ashok-leyland/mitr-school-bus/ashok-leyland-mitr-school-bus-57229.jpg?imwidth=480&impolicy=resize" 
              alt="Yellow School Bus" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-12">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-amber-400 rounded-full shadow-lg">
                  <Bus className="text-slate-900" size={24} />
                </div>
                <span className="text-white font-bold italic tracking-tight">Active Tracking System Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 relative">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white z-10 aspect-square">
              <img 
                src="https://blog.fentress.com/hubfs/Blog%20Images%20and%20Materials/Morgan_School%20Bus%20Safety/School%20Bus%20Safety%20(Blog%20Title).png" 
                alt="Safe Student Commute" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl -z-0"></div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-400 rounded-3xl -z-0 rotate-12 flex items-center justify-center shadow-2xl">
                <Shield className="text-white" size={40} />
            </div>
          </div>
          <div className="lg:w-1/2">
            <h4 className="text-amber-500 font-black uppercase tracking-widest text-sm mb-4">Safety First</h4>
            <h2 className="text-5xl font-black italic mb-6 leading-tight text-slate-900">Our Commitment to <br/> <span className="text-amber-500">Student Safety.</span></h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
              We provide this tracking service exclusively for our parents to ensure peace of mind. Every bus is equipped with GPS technology to monitor routes and arrival times with total precision.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-3xl border-b-4 border-amber-400">
                <h3 className="font-black text-slate-900 text-xl">Real-Time</h3>
                <p className="text-slate-500 text-sm mt-1">Live GPS coordinates updated every 2 seconds for accuracy.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border-b-4 border-amber-400">
                <h3 className="font-black text-slate-900 text-xl">Verified</h3>
                <p className="text-slate-500 text-sm mt-1">Secure portal accessible only to registered school guardians.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-slate-50 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black italic text-slate-900">Simple. Seamless. <span className="text-amber-500">Secure.</span></h2>
        </div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 relative">
          <StepCard step="01" title="Login" desc="Use your school-provided ID to access the secure portal dashboard." />
          <StepCard step="02" title="Track Live" desc="View your child’s bus movement on our high-precision live map." />
          <StepCard step="03" title="Arrival Alert" desc="Get notified when the bus is within 5 minutes of your specific stop." />
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="py-24 bg-slate-900 text-white px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-black italic mb-16">Why Use the <span className="text-amber-400">Bus Portal?</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BenefitCard icon={<Shield size={24} />} title="Security" desc="Controlled access for authorized guardians only." />
            <BenefitCard icon={<Zap size={24} />} title="Precision" desc="Live ETA based on current route traffic data." />
            <BenefitCard icon={<Bell size={24} />} title="Alerts" desc="Immediate notice on any delays or route changes." />
            <BenefitCard icon={<History size={24} />} title="Reliability" desc="Verified daily history for student safety audits." />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [loading, setLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const triggerHomeLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="font-sans text-slate-900 bg-white">
      <Routes>
        <Route path="/" element={
          <LandingPage onOpenContact={() => setIsContactOpen(true)} onHomeClick={triggerHomeLoading} />
        } />
        <Route path="/auth" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/parent-journey" element={<ParentJourney />} />
        <Route path="/school-journey" element={<SchoolJourney />} /> 
        <Route path="/dashboard" element={<ProtectedRoute allowedRole="parent"><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/driverpanel" element={<ProtectedRoute allowedRole="driver"><DriverPanel /></ProtectedRoute>} />
        <Route path="/adminpanel" element={<ProtectedRoute allowedRole="admin"><AdminPanel /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}

// --- SUB-COMPONENTS ---
function StepCard({ step, title, desc }) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl relative group hover:border-amber-400 transition-all duration-300 hover:-translate-y-2">
      <div className="text-6xl font-black text-slate-100 group-hover:text-amber-50 transition-colors mb-6 absolute -top-4 right-8">{step}</div>
      <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white relative z-10">
        <Bus size={24} />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4 relative z-10">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium relative z-10">{desc}</p>
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