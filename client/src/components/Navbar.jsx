import React from 'react'; // Removed unused useState
import { Bus, PhoneCall } from 'lucide-react';

// Added { onOpenDemo } to the function arguments
export default function Navbar({ onOpenDemo }) {
  const links = [
    { name: 'Home', id: 'home' },
    { name: 'About Us', id: 'about' },
    { name: 'How It Works', id: 'how-it-works' },
    { name: 'Benefits', id: 'benefits' },
    { name: 'Contact', id: 'contact' }
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bus className="text-amber-500" size={32} />
          <span className="text-2xl font-black text-slate-800 tracking-tighter">TrackMyBus</span>
        </div>
        
        <div className="hidden lg:flex gap-8">
          {links.map(link => (
            <a key={link.id} href={`#${link.id}`} className="text-slate-600 hover:text-amber-500 font-bold transition-all text-sm uppercase tracking-wider">
              {link.name}
            </a>
          ))}
        </div>

        {/* Added onClick handler here */}
        <button 
          onClick={onOpenDemo}
          className="bg-amber-500 hover:bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all group active:scale-95"
        >
          <PhoneCall size={18} />
          Request Demo
        </button>
      </div>
    </nav>
  );
}