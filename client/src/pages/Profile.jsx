import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Mail, Phone, Save, MapPin, Baby, ShieldCheck, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

export default function Profile() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // New state for initial load
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNo: "",
    address: "",
    children: [] 
  });

  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await axios.get('http://localhost:5000/api/auth/me', config);
        
        // Ensure children is always an array to prevent .map() errors
        setFormData({
          ...res.data,
          children: res.data.children || []
        });
      } catch (err) {
        console.error("Error fetching profile", err);
        // If 500 error occurs, we still stop the fetching state
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.mobileNo) {
        return alert("Name and Mobile Number are required.");
    }

    setLoading(true);
    try {
      await axios.put('http://localhost:5000/api/user/settings', formData, config);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // 1. Loading State UI
  if (fetching) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-amber-500" size={48} />
          <p className="font-black uppercase italic tracking-widest text-slate-500">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className={`max-w-3xl mx-auto rounded-[3.5rem] shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          
          <div className="bg-slate-900 p-12 text-center relative">
             {/* Decorative Background Element */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                <h1 className="text-9xl font-black text-white -rotate-12 translate-y-10">PROFILE</h1>
            </div>

            <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl relative z-10">
              <User size={40} className="text-slate-900" />
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white relative z-10">
              Account <span className="text-amber-400">Settings</span>
            </h1>
          </div>

          <div className="p-10 space-y-10">
            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    name="name" 
                    value={formData.name || ""} 
                    onChange={handleChange} 
                    placeholder="Enter your name"
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all`} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    name="mobileNo" 
                    value={formData.mobileNo || ""} 
                    onChange={handleChange} 
                    placeholder="e.g. +1 234 567 890"
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all`} 
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Default Pickup Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea 
                  name="address" 
                  rows="2" 
                  value={formData.address || ""} 
                  onChange={handleChange} 
                  placeholder="Enter your home address for the bus driver"
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all`} 
                />
              </div>
            </div>

            {/* Read-Only Children Section */}
            <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-amber-50/50 border-amber-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black uppercase italic text-sm tracking-tight">Registered Students</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Contact Admin to make changes</p>
                </div>
                <ShieldCheck className="text-amber-500" size={24} />
              </div>

              <div className="grid gap-4">
                {formData.children && formData.children.length > 0 ? (
                  formData.children.map((child, idx) => (
                    <div key={idx} className={`flex items-center gap-4 p-5 rounded-2xl border transform hover:scale-[1.02] transition-transform ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-white shadow-sm'}`}>
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Baby size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-black uppercase text-xs italic tracking-tight">{child.name}</p>
                        <p className="text-[9px] font-bold text-slate-500">
                           GRADE {child.grade} • BUS {child.assignedBus?.busNo || 'NOT ASSIGNED'}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${child.status === 'on-bus' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'}`}>
                        {child.status || 'Home'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-3xl">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">No Linked Students Found</p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Verify your email with the School Office</p>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleSave} 
              disabled={loading} 
              className={`w-full py-5 rounded-2xl font-black uppercase italic tracking-tighter transition-all flex items-center justify-center gap-2 shadow-xl 
                ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-amber-500/20'}`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? "SAVING CHANGES..." : "Save Profile Settings"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}