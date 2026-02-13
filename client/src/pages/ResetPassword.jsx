import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext'; // Import Theme hook

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const navigate = useNavigate();
  const { isDarkMode } = useTheme(); // Consume theme state

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords do not match");

    setStatus('loading');
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        setStatus('success');
        setTimeout(() => navigate('/auth'), 3000);
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${
      isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
    }`}>
      <div className={`max-w-md w-full p-10 rounded-[2.5rem] shadow-2xl text-center border transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-transparent'
      }`}>
        
        {status === 'success' ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center mb-6">
               <div className="p-4 bg-green-500/10 rounded-full">
                  <CheckCircle className="text-green-500" size={64} />
               </div>
            </div>
            <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               Password Updated!
            </h2>
            <p className="text-slate-500 mt-2 font-medium">Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <h2 className={`text-3xl font-black mb-2 italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               New <span className="text-amber-500">Password</span>
            </h2>
            <p className={`mb-8 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
               Enter a secure password for your account.
            </p>
            
            <form onSubmit={handleReset} className="space-y-4 text-left">
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-500" size={20} />
                <input 
                  type="password" 
                  placeholder="New Password" 
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${
                    isDarkMode 
                    ? 'bg-slate-800 border-transparent text-white focus:border-amber-400' 
                    : 'bg-slate-50 border-transparent text-slate-900 focus:border-amber-400'
                  }`}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-500" size={20} />
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${
                    isDarkMode 
                    ? 'bg-slate-800 border-transparent text-white focus:border-amber-400' 
                    : 'bg-slate-50 border-transparent text-slate-900 focus:border-amber-400'
                  }`}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-500 text-sm font-bold justify-center mt-2">
                  <AlertCircle size={16} />
                  <span>Link expired or invalid. Please try again.</span>
                </div>
              )}

              <button 
                className={`w-full py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                  isDarkMode 
                  ? 'bg-amber-400 text-slate-900 hover:bg-amber-300' 
                  : 'bg-slate-900 text-white hover:bg-amber-400 hover:text-slate-900'
                }`}
              >
                {status === 'loading' ? "Updating..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}