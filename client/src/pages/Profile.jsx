import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // Import Footer
import { User, Mail, Phone, Camera, Save, MapPin, Plus, Trash2, Baby } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext'; // Import Theme

export default function Profile() {
  const { isDarkMode } = useTheme(); // Consume Theme
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNo: "",
    address: "",
    children: [""] 
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData({ ...res.data, children: res.data.children || [""] });
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className={`max-w-2xl mx-auto rounded-[3rem] shadow-2xl overflow-hidden border transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800 shadow-black/40' : 'bg-white border-slate-100'
        }`}>
          
          {/* Header Section */}
          <div className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-900'} p-12 text-center relative`}>
            <div className="relative inline-block">
              <div className={`w-32 h-32 bg-amber-400 rounded-full border-4 flex items-center justify-center mx-auto shadow-2xl ${
                isDarkMode ? 'border-slate-700' : 'border-white'
              }`}>
                <User size={60} className="text-slate-900" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mt-4 italic uppercase tracking-tighter">
              Parent <span className="text-amber-400">Profile</span>
            </h1>
          </div>

          {/* Form Content */}
          <div className="p-8 sm:p-12 space-y-8">
            <div className="grid gap-6">
              
              {/* Name & Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                  <div className="relative mt-2">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input name="name" type="text" value={formData.name} onChange={handleChange}
                      className={`w-full border rounded-2xl py-4 pl-12 pr-4 font-bold outline-none transition-all focus:ring-2 focus:ring-amber-400 ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Phone No</label>
                  <div className="relative mt-2">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input name="mobileNo" type="text" value={formData.mobileNo} onChange={handleChange}
                      className={`w-full border rounded-2xl py-4 pl-12 pr-4 font-bold outline-none transition-all focus:ring-2 focus:ring-amber-400 ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`} />
                  </div>
                </div>
              </div>

              {/* Address Field */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pickup/Drop Address</label>
                <div className="relative mt-2">
                  <MapPin size={18} className="absolute left-4 top-4 text-slate-500" />
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="2"
                    className={`w-full border rounded-2xl py-4 pl-12 pr-4 font-bold outline-none transition-all focus:ring-2 focus:ring-amber-400 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`} />
                </div>
              </div>

              {/* Dynamic Children Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between ml-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Child Details (Siblings)</label>
                  <button onClick={addChild} className="text-amber-500 hover:text-amber-400 flex items-center gap-1 text-xs font-black uppercase transition-colors">
                    <Plus size={14} /> Add Child
                  </button>
                </div>
                
                {formData.children.map((child, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <Baby size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Child's Name" 
                        value={child} 
                        onChange={(e) => handleChildChange(index, e.target.value)}
                        className={`w-full border rounded-2xl py-4 pl-12 pr-4 font-bold outline-none transition-all focus:ring-2 focus:ring-amber-400 ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                    {formData.children.length > 1 && (
                      <button onClick={() => removeChild(index)} 
                        className={`p-4 rounded-2xl transition-colors ${
                          isDarkMode ? 'text-red-400 hover:bg-red-400/10' : 'text-red-400 hover:bg-red-50'
                        }`}>
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button 
              onClick={handleSave}
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50 ${
                isDarkMode 
                ? 'bg-amber-400 text-slate-900 hover:bg-amber-300' 
                : 'bg-slate-900 text-white hover:bg-amber-400 hover:text-slate-900 shadow-slate-200'
              }`}
            >
              {loading ? "Saving..." : <><Save size={20} /> Update Profile</>}
            </button>
          </div>
        </div>
      </div>

      <Footer /> {/* Footer Added Here */}
    </div>
  );
}