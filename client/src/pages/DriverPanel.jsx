import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import { motion } from 'framer-motion';
import { Bus, MapPin, Users, Check, X, Navigation, AlertCircle } from 'lucide-react';

export default function DriverPanel() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [students, setStudents] = useState([
    { id: 1, name: 'Aswin K.', stop: 'Dharmadam', present: false },
    { id: 2, name: 'Meera R.', stop: 'Thalassery Stand', present: false },
    { id: 3, name: 'Rohan P.', stop: 'Muzhappilangad', present: false },
  ]);

  const toggleAttendance = (id) => {
    setStudents(students.map(s => s.id === id ? { ...s, present: !s.present } : s));
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar onOpenDemo={() => setIsContactOpen(true)} onHomeClick={() => {}} />

      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black italic text-slate-900">DRIVER <span className="text-amber-500">PORTAL.</span></h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
              <Bus size={14} className="text-amber-500"/> Bus No: K-12 | Route: Dharmadam-Thalassery
            </p>
          </div>

          <button 
            onClick={() => setIsBroadcasting(!isBroadcasting)}
            className={`px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl ${
              isBroadcasting ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-900'
            }`}
          >
            {isBroadcasting ? <X size={20}/> : <Navigation size={20}/>}
            {isBroadcasting ? 'Stop GPS Broadcast' : 'Start Journey'}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Attendance Checklist */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Users className="text-amber-500" /> Student Checklist
              </h2>
              <span className="bg-slate-100 px-4 py-1 rounded-full text-xs font-black text-slate-500">
                {students.filter(s => s.present).length} / {students.length} ON BOARD
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {students.map((student) => (
                <div key={student.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-black text-slate-900 text-lg">{student.name}</p>
                    <p className="text-slate-400 text-sm font-bold flex items-center gap-1">
                      <MapPin size={12}/> {student.stop}
                    </p>
                  </div>
                  <button 
                    onClick={() => toggleAttendance(student.id)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      student.present ? 'bg-green-500 text-white rotate-[360deg]' : 'bg-slate-100 text-slate-300'
                    }`}
                  >
                    <Check size={24} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency/Status Card */}
          <div className="space-y-6">
            <div className="bg-amber-400 p-8 rounded-[2.5rem] shadow-xl text-slate-900">
              <AlertCircle size={32} className="mb-4" />
              <h3 className="text-2xl font-black italic mb-2">Notice a Delay?</h3>
              <p className="font-bold opacity-80 mb-6 leading-tight text-sm">Inform parents immediately if you are stuck in traffic or have a breakdown.</p>
              <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:scale-105 transition-transform">
                Broadcast Delay
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}