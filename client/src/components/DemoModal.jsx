import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';

export default function DemoModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 lg:p-12 overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900">
              <X size={24} />
            </button>

            <h2 className="text-3xl font-black text-slate-900 mb-2">Book a Demo</h2>
            <p className="text-slate-500 mb-8">See how TrackMyBus can secure your school's fleet.</p>

            <form className="space-y-4">
              <input type="text" placeholder="School Name" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-400 outline-none" />
              <input type="email" placeholder="Work Email" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-400 outline-none" />
              <select className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-400 outline-none text-slate-500">
                <option>Number of Buses</option>
                <option>1-10</option>
                <option>11-50</option>
                <option>50+</option>
              </select>
              <button className="w-full bg-amber-400 hover:bg-slate-900 text-slate-900 hover:text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3">
                Send Request <Send size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}