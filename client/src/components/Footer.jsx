import React from 'react';
import { 
  Bus, 
  Mail, 
  Phone, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { isDarkMode } = useTheme();

  const socialLinks = [
    { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
    { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
    { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
    { icon: <Linkedin size={18} />, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer 
      id="contact" 
      className={`pt-24 pb-12 px-6 border-t transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-slate-950 border-slate-900' 
          : 'bg-white border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-16 mb-20">
          
          {/* Brand & Socials */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-amber-400 p-2 rounded-xl shadow-lg shadow-amber-500/10">
                <Bus size={24} className="text-slate-900" />
              </div>
              <span className={`text-2xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                TrackMy<span className="text-amber-500">Bus</span>
              </span>
            </div>
            <p className={`font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              The leading student transportation safety platform. Trusted by 500+ schools worldwide.
            </p>
            
            {/* SOCIAL MEDIA ICONS */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href}
                  aria-label={social.label}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-900 text-slate-500 hover:bg-amber-400 hover:text-slate-900' 
                      : 'bg-slate-100 text-slate-400 hover:bg-amber-400 hover:text-slate-900'
                  }`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className={`font-black mb-6 uppercase tracking-widest text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>Company</h4>
              <ul className={`space-y-4 font-bold text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                <li><a href="#about" className="hover:text-amber-500 transition-colors">About Us</a></li>
                <li><a href="#benefits" className="hover:text-amber-500 transition-colors">Benefits</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-black mb-6 uppercase tracking-widest text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>Support</h4>
              <ul className={`space-y-4 font-bold text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                <li><a href="#how-it-works" className="hover:text-amber-500 transition-colors">How it Works</a></li>
                <li><a href="#contact" className="hover:text-amber-500 transition-colors">Help Center</a></li>
              </ul>
            </div>
          </div>

          {/* Contact Box */}
          <div className={`p-8 rounded-[2rem] border transition-colors ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/20' 
              : 'bg-slate-50 border-slate-100'
          }`}>
            <h4 className={`font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Quick Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Mail size={20} className="text-amber-500" />
                <span className={`font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>hello@trackmybus.com</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone size={20} className="text-amber-500" />
                <span className={`font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>+1 (555) 000-BUSES</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-6 ${isDarkMode ? 'border-slate-900' : 'border-slate-100'}`}>
          <p className="text-slate-400 text-sm font-medium">© 2026 TrackMyBus Inc. All rights reserved.</p>
          <p className="text-slate-400 text-sm font-medium">Built with ❤️ for Student Safety</p>
        </div>
      </div>
    </footer>
  );
}