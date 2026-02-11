import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import { 
  BarChart3, Bus, Users, ShieldCheck, 
  Settings, Trash2, Edit3, Plus 
} from 'lucide-react';

export default function AdminPanel() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const stats = [
    { label: "Active Buses", value: "12", icon: <Bus/>, color: "bg-blue-500" },
    { label: "Total Students", value: "450", icon: <Users/>, color: "bg-green-500" },
    { label: "Security Alerts", value: "0", icon: <ShieldCheck/>, color: "bg-purple-500" },
  ];

  const fleet = [
    { id: 'B1', no: 'BUS-01', driver: 'Mukundan P.', route: 'Dharmadam', status: 'Live' },
    { id: 'B2', no: 'BUS-02', driver: 'Sajith V.', route: 'Parassinikadavu', status: 'Offline' },
    { id: 'B3', no: 'BUS-03', driver: 'Rameshan', route: 'Kuthuparamba', status: 'Live' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar onOpenDemo={() => setIsContactOpen(true)} onHomeClick={() => {}} />

      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black italic text-slate-900 uppercase">Fleet <span className="text-amber-500">Command.</span></h1>
            <p className="text-slate-500 font-bold text-xs tracking-[0.2em] mt-2 uppercase">Central Management System</p>
          </div>
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg shadow-slate-200">
            <Plus size={16}/> Add New Bus
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center gap-6 group hover:border-amber-400 transition-all cursor-default">
              <div className={`${s.color} text-white p-4 rounded-2xl shadow-lg`}>{s.icon}</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <p className="text-3xl font-black text-slate-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Fleet Management Table */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-black italic flex items-center gap-2">
              <BarChart3 className="text-amber-500" /> Active Fleet
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                  <th className="px-8 py-4">Bus ID</th>
                  <th className="px-8 py-4">Driver</th>
                  <th className="px-8 py-4">Route</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {fleet.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-6 font-black text-slate-900">{bus.no}</td>
                    <td className="px-8 py-6 font-bold text-slate-600">{bus.driver}</td>
                    <td className="px-8 py-6 font-bold text-slate-600">{bus.route}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        bus.status === 'Live' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {bus.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"><Edit3 size={18}/></button>
                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}