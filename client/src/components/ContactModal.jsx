import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Clock, Send, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function ContactModal({ isOpen, onClose }) {
  const form = useRef();
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'success'
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('Late Bus');

  const handleSendInquiry = (e) => {
    e.preventDefault();
    if (!message) return;

    setStatus('sending');

    // --- CONFIGURATION ---
    const SERVICE_ID = 'service_o1mkrfa'; 
    const TEMPLATE_ID = 'template_w9hgtu7';
    const PUBLIC_KEY = 'yONGqMIp5n80bWVmM';

    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
      .then(() => {
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
          onClose();
        }, 2500);
      }, (error) => {
        console.error('FAILED...', error.text);
        alert("Email failed to send. Please use the 'Call Now' option.");
        setStatus('idle');
      });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-start justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto pt-20 pb-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative"
        >
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10">
            <X size={20} className="text-slate-400" />
          </button>

          <div className="p-8 sm:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                <Phone size={24} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 italic">Transport <span className="text-amber-500">Desk.</span></h2>
            </div>

            {status === 'success' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                <div className="flex justify-center mb-4 text-green-500">
                  <CheckCircle size={64} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Message Sent!</h3>
                <p className="text-slate-500 mt-2 font-medium">The dispatcher has been notified.</p>
              </motion.div>
            ) : (
              <>
                {/* --- CALL SECTION --- */}
                <div className="mb-8">
                  <a 
                    href="tel:+15550123456" 
                    className="flex items-center justify-between p-5 bg-slate-900 text-white rounded-2xl hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white/10 p-2 rounded-lg text-amber-400">
                        <Phone size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">Tap to Call Hotline</p>
                        <p className="text-lg font-black tracking-tight">(555) 012-3456</p>
                      </div>
                    </div>
                    <div className="bg-amber-400 p-2 rounded-full text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Send size={16} />
                    </div>
                  </a>
                </div>

                {/* --- EMAIL FORM --- */}
                <form ref={form} onSubmit={handleSendInquiry} className="space-y-4">
                  {/* Subject Dropdown - Matches {{subject}} in EmailJS */}
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Inquiry Type</label>
                    <div className="relative mt-2">
                      <select 
                        name="subject" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl appearance-none outline-none focus:ring-2 focus:ring-amber-400 font-bold text-slate-700"
                      >
                        <option value="Late Bus">🚌 Bus is Late</option>
                        <option value="Lost Item">🎒 Lost Item</option>
                        <option value="Route Change">🗺️ Route Change</option>
                        <option value="Safety Issue">⚠️ Safety Issue</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Message Field - Matches {{message}} in EmailJS */}
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                    <textarea 
                      name="message"
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full mt-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-400 outline-none text-sm font-medium min-h-[100px]"
                      placeholder="Enter student name and details..."
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={status === 'sending'}
                    className={`w-full py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${status === 'sending' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-amber-500 hover:text-slate-900'}`}
                  >
                    {status === 'sending' ? "Sending Email..." : (
                      <>Send Email to Dispatch <Send size={18} /></>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hours: 7am - 6pm</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle size={14} className="text-red-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Emergency: (555) 999-0000</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}