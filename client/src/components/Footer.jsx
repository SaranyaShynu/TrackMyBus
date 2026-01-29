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

export default function Footer() {
  const socialLinks = [
    { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
    { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
    { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
    { icon: <Linkedin size={18} />, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer id="contact" className="bg-white pt-24 pb-12 border-t border-slate-100 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-16 mb-20">
          
          {/* Brand & Socials */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-amber-400 p-2 rounded-xl shadow-lg shadow-amber-100">
                <Bus size={24} className="text-slate-900" />
              </div>
              <span className="text-2xl font-black text-slate-900">TrackMyBus</span>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed">
              The leading student transportation safety platform. Trusted by 500+ schools worldwide.
            </p>
            
            {/* SOCIAL MEDIA ICONS HERE */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-amber-400 hover:text-slate-900 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 text-slate-500 font-bold text-sm">
                <li><a href="#about" className="hover:text-amber-500 transition-colors">About Us</a></li>
                <li><a href="#benefits" className="hover:text-amber-500 transition-colors">Benefits</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Support</h4>
              <ul className="space-y-4 text-slate-500 font-bold text-sm">
                <li><a href="#how-it-works" className="hover:text-amber-500 transition-colors">How it Works</a></li>
                <li><a href="#contact" className="hover:text-amber-500 transition-colors">Help Center</a></li>
              </ul>
            </div>
          </div>

          {/* Contact Box */}
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
            <h4 className="font-black text-slate-900 mb-6">Quick Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-slate-600">
                <Mail size={20} className="text-amber-500" />
                <span className="font-bold text-sm">hello@trackmybus.com</span>
              </div>
              <div className="flex items-center gap-4 text-slate-600">
                <Phone size={20} className="text-amber-500" />
                <span className="font-bold text-sm">+1 (555) 000-BUSES</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm font-medium">© 2026 TrackMyBus Inc. All rights reserved.</p>
          <p className="text-slate-400 text-sm font-medium">Built with ❤️ for Student Safety</p>
        </div>
      </div>
    </footer>
  );
}