import React, { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        {/* Design Element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400 rounded-bl-[4rem] opacity-20"></div>

        <button 
          onClick={() => navigate('/auth')}
          className="mb-8 text-slate-400 hover:text-slate-900 flex items-center gap-2 text-sm font-bold transition-colors"
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        <h2 className="text-3xl font-black text-slate-900 mb-2">Reset Password</h2>
        <p className="text-slate-500 mb-8 font-medium">
          Enter your registered email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-400 outline-none transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"} <Send size={18} />
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-2xl text-sm font-bold text-center ${
            message.includes('Success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}