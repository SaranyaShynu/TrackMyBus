import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Mail, Phone, Save, MapPin, Baby, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

export default function Profile() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNo: "",
    address: "",
    children: [] 
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData(res.data);
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/user/settings', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className={`max-w-3xl mx-auto rounded-[3.5rem] shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          
          <div className="bg-slate-900 p-12 text-center">
            <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <User size={40} className="text-slate-900" />
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              Account <span className="text-amber-400">Settings</span>
            </h1>
          </div>

          <div className="p-10 space-y-10">
            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="name" value={formData.name} onChange={handleChange} className={`w-full pl-12 pr-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} font-bold outline-none focus:ring-2 focus:ring-amber-500`} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="mobileNo" value={formData.mobileNo} onChange={handleChange} className={`w-full pl-12 pr-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} font-bold outline-none focus:ring-2 focus:ring-amber-500`} />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Default Pickup Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea name="address" rows="2" value={formData.address} onChange={handleChange} className={`w-full pl-12 pr-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} font-bold outline-none focus:ring-2 focus:ring-amber-500`} />
              </div>
            </div>

            {/* Read-Only Children Section */}
            <div className={`p-8 rounded-[2.5rem] ${isDarkMode ? 'bg-slate-800/40' : 'bg-amber-50'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black uppercase italic text-sm">Registered Students</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Managed by School Administration</p>
                </div>
                <ShieldCheck className="text-amber-500" size={24} />
              </div>

              <div className="grid gap-4">
                {formData.children.length > 0 ? (
                  formData.children.map((child, idx) => (
                    <div key={idx} className={`flex items-center gap-4 p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-amber-100'}`}>
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Baby size={20} />
                      </div>
                      <div>
                        <p className="font-black uppercase text-xs italic tracking-tight">{child.name}</p>
                        <p className="text-[9px] font-bold text-slate-500">Grade: {child.grade} • Bus: {child.assignedBus?.busNo || 'Pending'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-black text-center text-slate-400 py-4 uppercase">No Students Linked to this Account</p>
                )}
              </div>
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full py-5 bg-amber-400 text-slate-900 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-amber-300 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/10">
              <Save size={20} /> {loading ? "Updating..." : "Save Profile Settings"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}