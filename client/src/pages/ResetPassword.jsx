import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function ResetPassword() {
  const { token } = useParams(); // Gets the token from the URL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState(''); // 'idle', 'loading', 'success', 'error'
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords do not match");

    setStatus('loading');
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        setStatus('success');
        setTimeout(() => navigate('/auth'), 3000); // Redirect to login after 3 seconds
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center">
        {status === 'success' ? (
          <div className="animate-bounce">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h2 className="text-2xl font-black">Password Updated!</h2>
            <p className="text-slate-500 mt-2">Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-black text-slate-900 mb-2">New Password</h2>
            <p className="text-slate-500 mb-8">Enter a secure password for your account.</p>
            
            <form onSubmit={handleReset} className="space-y-4 text-left">
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                <input 
                  type="password" 
                  placeholder="New Password" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-amber-400"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-amber-400"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-amber-500 hover:text-slate-900 transition-all">
                {status === 'loading' ? "Updating..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}