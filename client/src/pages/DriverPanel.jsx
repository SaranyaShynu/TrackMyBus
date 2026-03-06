import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, MapPin, Bus, LogOut, Navigation, 
  AlertCircle, Check, Users, Clock, Sun, Moon, Search, Siren, Radio
} from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Footer from '../components/Footer';

export default function DriverPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [driverDark, setDriverDark] = useState(true);
  const [driverData, setDriverData] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentCoords, setCurrentCoords] = useState(null);
  
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const token = localStorage.getItem('token');

  // Initialize Socket Connection
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('http://localhost:5000/api/auth/me', config);
        setDriverData(res.data);

        if (res.data.role === 'driver' && res.data.assignedBus?._id) {
          const busRes = await axios.get(`http://localhost:5000/api/bus/${res.data.assignedBus._id}/students`, config);
          
          const currentTime = new Date().getHours();
          const isEvening = currentTime >= 12;

          const studentList = busRes.data.map(s => {
            const gradeLevel = parseInt(s.grade) || 0;
            const isMainBuilding = s.grade?.toLowerCase().includes('kg') || (gradeLevel >= 1 && gradeLevel <= 4);
            const building = isMainBuilding ? "Main Building" : "West Building";

            const routeInfo = isEvening 
              ? `${building} ➔ Home (${s.stop || 'Default Stop'})` 
              : `Home (${s.stop || 'Default Stop'}) ➔ ${building}`;

            return {
              ...s,
              status: 'pending',
              displayRoute: routeInfo
            };
          });

          setStudents(studentList);
        }
        setLoading(false);
      } catch (err) {
        console.error("Profile fetch failed:", err);
        setLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  // GPS BROADCAST LOGIC
  const startJourney = () => {
    if (!navigator.geolocation) {
      return alert("Geolocation not supported by this browser.");
    }

    setIsBroadcasting(true);
    
    // Broadcast "Journey Started" to Parents
    sendNotification('START', "The bus has started the journey!");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });

        // Emit to Socket for Real-Time Parent View
        socketRef.current.emit('updateLocation', {
          busId: driverData.assignedBus._id,
          lat: latitude,
          lng: longitude,
          status: 'moving'
        });
      },
      (error) => console.error("GPS Error:", error),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );
  };

  const stopJourney = () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    setIsBroadcasting(false);
    sendNotification('END', "The bus has reached the destination.");
  };

  const sendNotification = async (type, customMessage) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // We send the request to a unified broadcast endpoint
      // The backend will handle routing this to Parents and/or Admins based on the 'type'
      await axios.post('http://localhost:5000/api/notifications/broadcast', {
        busId: driverData.assignedBus._id,
        driverName: driverData.name,
        message: customMessage,
        type: type, // 'START', 'DELAY', 'EMERGENCY', 'END'
        includeAdmin: ['DELAY', 'EMERGENCY'].includes(type) // Admin only cares about these two
      }, config);

      // UI Feedback for the Driver
      if (type === 'EMERGENCY') {
        alert("🚨 EMERGENCY ALERT SENT TO ADMIN AND PARENTS!");
      } else if (type === 'DELAY') {
        alert("Traffic delay reported to Admin and Parents.");
      }
      
    } catch (err) {
      console.error("Broadcast failed:", err);
      alert("Failed to send alert. Check connection.");
    }
  };

  const toggleStatus = (id) => {
    setStudents(prev => prev.map(s => {
      if (s._id !== id) return s;
      let nextStatus;
      if (!s.status || s.status === 'pending') nextStatus = 'present';
      else if (s.status === 'present') nextStatus = 'absent';
      else nextStatus = 'pending';
      return { ...s, status: nextStatus };
    }));
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const themeClass = driverDark ? "bg-slate-950 text-slate-200" : "bg-slate-50 text-slate-900";
  const cardClass = driverDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xl";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${themeClass}`}>
      
      {/* NAVBAR */}
      <nav className={`h-20 border-b flex items-center justify-between px-6 sticky top-0 z-[100] backdrop-blur-md ${driverDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsOpen(true)} className={`p-2.5 rounded-xl border ${driverDark ? 'border-slate-800 bg-slate-900 text-amber-500' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 p-1.5 rounded-lg"><Bus size={18} className="text-slate-950" /></div>
            <span className="font-black uppercase tracking-tighter text-lg italic">Driver<span className="text-amber-500">Portal</span></span>
          </div>
        </div>
        
        {isBroadcasting && (
          <div className="hidden md:flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full border border-red-500/20">
            <Radio size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Live Broadcasting</span>
          </div>
        )}

        <button onClick={() => setDriverDark(!driverDark)} className="p-2 opacity-50 hover:opacity-100">
          {driverDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>

      {/* MOBILE DRAWER */}
      <div className={`fixed inset-0 z-[200] transition-all ${isOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsOpen(false)} />
        <aside className={`relative w-80 h-full p-8 transition-transform duration-300 transform ${driverDark ? 'bg-slate-900' : 'bg-white'} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 opacity-50"><X size={24} /></button>
          <div className="mb-10 pt-4 text-center">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center text-slate-950 font-black text-2xl mb-4">
              {driverData?.name?.charAt(0) || "D"}
            </div>
            <h2 className="text-xl font-black italic">{driverData?.name || 'Driver'}</h2>
            <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest mt-1">Status: Active</p>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login' }} className="w-full flex items-center justify-center gap-4 px-5 py-4 bg-red-500/10 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all hover:bg-red-500 hover:text-white">
            <LogOut size={18} /> Exit System
          </button>
        </aside>
      </div>

      <main className="flex-1 pt-10 pb-12 px-6 max-w-7xl mx-auto w-full">
        {/* CONTROL HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">
              Control <span className="text-amber-500">Center.</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2 flex items-center gap-2">
              <Bus size={14} className="text-amber-500" />
              {driverData?.assignedBus
                ? `Bus: ${driverData.assignedBus.busNo} | Route: ${driverData.assignedBus.route}`
                : "No Bus Assigned - Contact Admin"}
            </p>
          </div>

          <button 
            onClick={isBroadcasting ? stopJourney : startJourney} 
            className={`px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-2xl ${isBroadcasting ? 'bg-red-600 text-white shadow-red-500/40' : 'bg-amber-500 text-slate-950 hover:scale-105 shadow-amber-500/20'}`}
          >
            {isBroadcasting ? <X size={20} /> : <Navigation size={20} />}
            {isBroadcasting ? 'End Trip' : 'Start Journey'}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            
            {/* SEARCH BOX */}
            <div className={`flex items-center gap-3 px-6 py-4 rounded-3xl border ${cardClass}`}>
              <Search size={20} className="text-slate-500" />
              <input 
                type="text" 
                placeholder="Search student name..." 
                className="bg-transparent border-none outline-none w-full font-bold text-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {students.length > 0 ? (
              <div className={`rounded-[2.5rem] border overflow-hidden ${cardClass}`}>
                <div className="p-8 border-b border-slate-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tighter"><Users className="text-amber-500" /> Checklist</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-green-500/30">
                      {students.filter(s => s.status === 'present').length} Present
                    </span>
                    <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-red-500/30">
                      {students.filter(s => s.status === 'absent').length} Absent
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-500/10">
                  {filteredStudents.map((student) => (
                    <div 
                      key={student._id} 
                      className={`p-6 flex items-center justify-between transition-all ${
                        student.status === 'present' ? 'bg-green-500/5' : 
                        student.status === 'absent' ? 'bg-red-500/5' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-black text-lg tracking-tight">{student.name}</p>
                          <span className="text-[10px] bg-slate-500/10 px-2 py-0.5 rounded text-slate-400 font-bold uppercase tracking-widest">G-{student.grade}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-amber-500 text-[11px] font-black uppercase flex items-center gap-1 italic">
                            <Navigation size={12} /> {student.displayRoute}
                          </p>
                          <p className="text-slate-500 text-xs font-bold flex items-center gap-1">
                            <MapPin size={12}/> Parent: {student.parentName || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => toggleStatus(student._id)} 
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl ${
                          student.status === 'present' ? 'bg-green-500 text-white shadow-green-500/20' : 
                          student.status === 'absent' ? 'bg-red-500 text-white shadow-red-500/20' : 
                          'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {student.status === 'present' ? <Check size={28} /> : 
                         student.status === 'absent' ? <X size={28} /> : 
                         <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`rounded-[2.5rem] border p-12 text-center space-y-4 border-dashed ${driverDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <Users size={32} className="mx-auto opacity-20" />
                <p className="font-black uppercase tracking-widest text-slate-500 text-xs italic">No students assigned to this route yet.</p>
              </div>
            )}
          </div>

          {/* SIDEBAR TOOLS */}
          <div className="space-y-6">
            {/* Traffic Delay Tool */}
            <div className="bg-amber-400 p-8 rounded-[2.5rem] shadow-xl text-slate-900">
              <AlertCircle size={32} className="mb-4" />
              <h3 className="text-2xl font-black italic mb-2 tracking-tighter uppercase leading-none">Traffic Alert?</h3>
              <p className="font-bold opacity-80 mb-6 leading-tight text-sm text-slate-800">Inform parents immediately if you are stuck in traffic or have a breakdown.</p>
              <button 
                onClick={() => sendNotification('DELAY', "The bus is experiencing a 15-minute traffic delay.")}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
              >
                Broadcast Delay
              </button>
            </div>

            {/* Emergency SOS Button */}
            <button 
              onClick={() => sendNotification('EMERGENCY', "EMERGENCY: The bus has stopped due to an issue. Please wait for further updates.")}
              className="w-full bg-red-600 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col items-center gap-4 hover:bg-red-700 transition-colors"
            >
              <Siren size={40} className="animate-bounce" />
              <div className="text-center">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Emergency SOS</h3>
                <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest">Alerts Admin & Parents</p>
              </div>
            </button>
            
            <div className={`p-6 rounded-[2rem] border ${cardClass} flex items-center gap-4`}>
              <div className="bg-amber-500/10 p-3 rounded-xl"><Clock className="text-amber-500" /></div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-40">System Time</p>
                <p className="font-black text-lg">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}