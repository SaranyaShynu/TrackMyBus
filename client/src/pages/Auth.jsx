import React, { useState } from 'react';
import { Mail, Lock, User, Bus, ArrowRight, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

export default function Auth() {
  const { isDarkMode } = useTheme(); // Consume theme
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    mobileNo: '' 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRedirection = (user) => {
    if (user.role === 'admin') {
      navigate('/adminpanel');
    } else if (user.role === 'driver') {
      navigate('/driver-panel');
    } else {
      navigate('/dashboard'); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`http://localhost:5000${endpoint}`, formData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        handleRedirection(res.data.user);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${
      isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
    }`}>
      <div className={`max-w-5xl w-full flex rounded-[3rem] shadow-2xl overflow-hidden min-h-[700px] border transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-transparent'
      }`}>
        
        {/* School Branding - Left Side */}
        <div className={`hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden ${
          isDarkMode ? 'bg-slate-800' : 'bg-amber-400'
        }`}>
          <img 
            src="https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&q=80&w=1000" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
            alt="School Bus"
          />
          <div className="relative z-10 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Bus size={32} className={isDarkMode ? 'text-amber-400' : 'text-slate-900'} />
            <span className={`text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              TrackMyBus
            </span>
          </div>
          <div className="relative z-10">
            <h2 className={`text-5xl font-black leading-tight mb-6 italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Your Child's <br/> Safety is <span className={`underline underline-offset-8 ${isDarkMode ? 'decoration-amber-400' : 'decoration-white'}`}>Our Priority.</span>
            </h2>
            <div className={`backdrop-blur-md border p-6 rounded-[2rem] inline-block max-w-sm ${
              isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/20 border-white/30'
            }`}>
              <p className={`font-bold leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                Welcome to our official transportation portal. Log in to monitor journeys in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Portal Login - Right Side */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <button onClick={() => navigate('/')} className="mb-8 text-slate-400 hover:text-amber-500 flex items-center gap-2 text-sm font-bold transition-all group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Website
            </button>

            <h2 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {isLogin ? "Official Portal" : "Join the Fleet"}
            </h2>
            <p className="text-slate-500 mb-10 font-medium italic">Role-Based Secure Access</p>

            {/* Google Login remains theme-aware via library */}
            <div className="w-full flex justify-center py-2 mb-2">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const details = jwtDecode(credentialResponse.credential);
                  try {
                    const res = await axios.post('http://localhost:5000/api/auth/google-login', {
                      name: details.name, email: details.email, googleId: details.sub
                    });
                    if (res.data.success) {
                      localStorage.setItem('token', res.data.token);
                      localStorage.setItem('user', JSON.stringify(res.data.user));
                      handleRedirection(res.data.user);
                    }
                  } catch (err) { console.error(err); }
                }}
                theme={isDarkMode ? "filled_black" : "outline"}
                shape="pill" width="350px"
              />
            </div>

            <div className="relative flex items-center my-8">
              <div className={`flex-grow border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">or use credentials</span>
              <div className={`flex-grow border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}></div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="relative group">
                    <User className="absolute left-4 top-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input name="name" type="text" placeholder="Full Name" required value={formData.name} onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent focus:border-amber-400 outline-none transition-all font-semibold ${
                        isDarkMode ? 'bg-slate-800 text-white placeholder:text-slate-600' : 'bg-slate-50 text-slate-900'
                      }`} 
                    />
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input name="mobileNo" type="tel" placeholder="Mobile Number" required value={formData.mobileNo} onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent focus:border-amber-400 outline-none transition-all font-semibold ${
                        isDarkMode ? 'bg-slate-800 text-white placeholder:text-slate-600' : 'bg-slate-50 text-slate-900'
                      }`} 
                    />
                  </div>
                </>
              )}
              
              <div className="relative group">
                <Mail className="absolute left-4 top-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
                <input name="email" type="email" placeholder="Email Address" required value={formData.email} onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent focus:border-amber-400 outline-none transition-all font-semibold ${
                    isDarkMode ? 'bg-slate-800 text-white placeholder:text-slate-600' : 'bg-slate-50 text-slate-900'
                  }`} 
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
                <input name="password" type="password" placeholder="Password" required value={formData.password} onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent focus:border-amber-400 outline-none transition-all font-semibold ${
                    isDarkMode ? 'bg-slate-800 text-white placeholder:text-slate-600' : 'bg-slate-50 text-slate-900'
                  }`} 
                />
              </div>

              {/* Forgot Password Link */}
              {isLogin && (
                <div className="flex justify-end px-2">
                  <button 
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs font-bold text-slate-500 hover:text-amber-500 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading} 
                className={`w-full mt-4 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                  isDarkMode 
                  ? 'bg-amber-400 text-slate-900 hover:bg-amber-300' 
                  : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-900 shadow-slate-200'
                }`}>
                {loading ? "Verifying..." : (isLogin ? "Sign In" : "Create Account")} <ArrowRight size={20} />
              </button>
            </form>

            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="w-full mt-6 text-slate-500 font-bold text-sm hover:text-amber-500 transition-colors"
            >
              {isLogin ? "New to the system? Register here" : "Already have access? Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}