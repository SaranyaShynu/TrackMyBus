import React, { useState } from 'react';
import { Mail, Lock, User, Bus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-5xl w-full flex bg-white rounded-[3rem] shadow-2xl overflow-hidden m-4 min-h-[600px]">
        
        {/* Left Side: Branding (Visible on Desktop) */}
        <div className="hidden lg:flex lg:w-1/2 bg-amber-400 p-12 flex-col justify-between relative">
          <div className="flex items-center gap-2 text-slate-900 cursor-pointer" onClick={() => navigate('/')}>
            <Bus size={32} />
            <span className="text-2xl font-black">TrackMyBus</span>
          </div>
          
          <div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight mb-4 italic">
              Real-time Safety <br/> At Your Fingertips.
            </h2>
            <p className="text-slate-800 font-medium">The most trusted student tracking platform in the region.</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-amber-500/30 to-transparent"></div>
        </div>

        {/* Right Side: Form Content */}
        <div className="w-full lg:w-1/2 p-10 md:p-16">
          <div className="max-w-md mx-auto">
            {/* Back Button */}
            <button 
              onClick={() => navigate('/')}
              className="mb-8 text-slate-400 hover:text-slate-900 flex items-center gap-2 text-sm font-bold transition-colors"
            >
              ← Back to Website
            </button>

            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </h2>
            <p className="text-slate-500 mb-8 font-medium">
              {isLogin ? "Access your real-time tracking dashboard." : "Sign up to start tracking your student's bus."}
            </p>

           <GoogleLogin
  onSuccess={async (credentialResponse) => {
    // 1. Decode the Google Token to get user details
    const details = jwtDecode(credentialResponse.credential);
    console.log("Google User:", details);

    try {
      // 2. Send details to your Backend
      const res = await axios.post('http://localhost:5000/api/auth/google-login', {
        name: details.name,
        email: details.email,
        googleId: details.sub, // 'sub' is the unique Google ID
        photo: details.picture
      });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token); // Save our own JWT
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Login Failed", err);
    }
  }}
  onError={() => {
    console.log('Login Failed');
  }}
  useOneTap
  shape="pill"
/>

            {/* DIVIDER */}
            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs font-black uppercase tracking-widest">or email</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-4 text-slate-400" size={20} />
                  <input type="text" placeholder="Full Name" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-400 outline-none transition-all" />
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
                <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-400 outline-none transition-all" />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                <input type="password" placeholder="Password" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-400 outline-none transition-all" />
              </div>

              <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg shadow-slate-200">
                {isLogin ? "Sign In" : "Get Started"} <ArrowRight size={20} />
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-slate-500 font-bold hover:text-amber-500 transition-colors"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}