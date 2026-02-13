import React, { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext'; // Import Theme hook

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { isDarkMode } = useTheme(); // Consume theme state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage("Success! Check your inbox for the reset link.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${
      isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
    }`}>
      <div className={`max-w-md w-full p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-transparent'
      }`}>
        
        {/* Design Element - subtle corner accent */}
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[4rem] opacity-20 ${
          isDarkMode ? 'bg-amber-500' : 'bg-amber-400'
        }`}></div>

        <button 
          onClick={() => navigate('/auth')}
          className={`mb-8 flex items-center gap-2 text-sm font-bold transition-colors ${
            isDarkMode ? 'text-slate-500 hover:text-amber-400' : 'text-slate-400 hover:text-slate-900'
          }`}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        <h2 className={`text-3xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Reset Password
        </h2>
        <p className={`mb-8 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Enter your registered email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-500" size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-none outline-none transition-all focus:ring-2 focus:ring-amber-400 font-bold ${
                isDarkMode 
                  ? 'bg-slate-800 text-white placeholder:text-slate-600' 
                  : 'bg-slate-50 text-slate-900'
              }`}
            />
          </div>

          <button 
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
              isDarkMode 
                ? 'bg-amber-400 text-slate-900 hover:bg-amber-300' 
                : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-900'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Sending..." : "Send Reset Link"} <Send size={18} />
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-2xl text-sm font-bold text-center transition-colors ${
            message.includes('Success') 
              ? (isDarkMode ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-green-50 text-green-600') 
              : (isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600')
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}