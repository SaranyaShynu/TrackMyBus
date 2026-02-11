import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { User, Mail, Phone, Camera, Save, MapPin, Plus, Trash2, Baby } from 'lucide-react';
import axios from 'axios'; // Ensure axios is installed

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNo: "",
    address: "",
    children: [""] // Initial state with one empty child field
  });

  // 1. Fetch existing data from DB on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Ensure children is at least an empty array if not in DB
        setFormData({ ...res.data, children: res.data.children || [""] });
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    fetchProfile();
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Handle Dynamic Child Fields
  const handleChildChange = (index, value) => {
    const newChildren = [...formData.children];
    newChildren[index] = value;
    setFormData({ ...formData, children: newChildren });
  };

  const addChild = () => setFormData({ ...formData, children: [...formData.children, ""] });
  
  const removeChild = (index) => {
    const newChildren = formData.children.filter((_, i) => i !== index);
    setFormData({ ...formData, children: newChildren.length ? newChildren : [""] });
  };

  // 3. Save to DB
  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/user/profile', formData, {
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
          
          {/* Header */}
          <div className="bg-slate-900 p-12 text-center relative">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-amber-400 rounded-full border-4 border-white flex items-center justify-center mx-auto shadow-2xl">
                <User size={60} className="text-slate-900" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mt-4 italic uppercase tracking-tighter">
              Parent <span className="text-amber-400">Profile</span>
            </h1>
          </div>

          <div className="p-8 sm:p-12 space-y-8">
            <div className="grid gap-6">
              {/* Parent Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                  <div className="relative mt-2">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name="name" type="text" value={formData.name} onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:ring-2 focus:ring-amber-400 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Phone No</label>
                  <div className="relative mt-2">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name="mobileNo" type="text" value={formData.mobileNo} onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:ring-2 focus:ring-amber-400 outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pickup/Drop Address</label>
                <div className="relative mt-2">
                  <MapPin size={18} className="absolute left-4 top-4 text-slate-400" />
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="2"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:ring-2 focus:ring-amber-400 outline-none transition-all" />
                </div>
              </div>

              {/* Dynamic Children Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between ml-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Child Details (Siblings)</label>
                  <button onClick={addChild} className="text-amber-600 hover:text-amber-700 flex items-center gap-1 text-xs font-black uppercase">
                    <Plus size={14} /> Add Child
                  </button>
                </div>
                
                {formData.children.map((child, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <Baby size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Child's Name" 
                        value={child} 
                        onChange={(e) => handleChildChange(index, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:ring-2 focus:ring-amber-400 outline-none transition-all"
                      />
                    </div>
                    {formData.children.length > 1 && (
                      <button onClick={() => removeChild(index)} className="p-4 text-red-400 hover:bg-red-50 rounded-2xl transition-colors">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-amber-400 text-white hover:text-slate-900 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Saving..." : <><Save size={20} /> Update Profile</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}