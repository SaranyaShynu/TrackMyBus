import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus, User, MapPin, Navigation, PhoneOutgoing, LayoutDashboard, Clock, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import { useTheme } from '../context/ThemeContext';

const thalasseryFleet = [
  { busNo: "BUS-01", route: "Dharmadam", driver: "P. Mukundan", dMob: "+91 43170 12345", assistant: "Reji K.", aMob: "+91 05741 54321", status: "On Time", students: 18, coords: [11.7761, 75.4674], landmark: "Brennan College" },
  { busNo: "BUS-02", route: "Kolassery", driver: "Suresh Babu", dMob: "+91 39070 22334", assistant: "Vineeth M.", aMob: "+91 33370 44332", status: "On Time", students: 14, coords: [11.7654, 75.5122], landmark: "Kolassery Junction" },
  { busNo: "BUS-03", route: "Manekkara", driver: "K. Gangadharan", dMob: "+91 11270 33445", assistant: "Shaji P.", aMob: "+91 18970 55443", status: "5 mins Delay", students: 22, coords: [11.7289, 75.5531], landmark: "Manekkara School" },
  { busNo: "BUS-04", route: "Koppalam", driver: "Ratheesh V.", dMob: "+91 57270 66778", assistant: "Anas T.", aMob: "+91 03170 88776", status: "On Time", students: 10, coords: [11.7441, 75.4852], landmark: "Koppalam Junction" },
  { busNo: "BUS-05", route: "Temple Gate", driver: "Pradeepan K.", dMob: "+91 17670 11223", assistant: "Sumesh R.", aMob: "+91 47670 33221", status: "On Time", students: 12, coords: [11.7380, 75.4947], landmark: "Jagannath Temple" },
  { busNo: "BUS-06", route: "Pinarayi", driver: "Vijayan T.", dMob: "+91 25770 99001", assistant: "Binu C.", aMob: "+91 39070 11009", status: "Heavy Traffic", students: 19, coords: [11.8025, 75.5186], landmark: "Pinarayi Town" },
  { busNo: "BUS-07", route: "Chonadam", driver: "Manoj Kumar", dMob: "+91 55370 77889", assistant: "Deepak S.", aMob: "+91 57270 99887", status: "On Time", students: 15, coords: [11.7612, 75.4884], landmark: "Chonadam Bypass" },
];

const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, 14, { animate: true });
  }, [coords, map]);
  return null;
}

export default function Dashboard() {
  const [selectedBus, setSelectedBus] = useState(thalasseryFleet[0]);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const { isDarkMode } = useTheme();

  const getStatusColor = (status) => {
    if (status === "On Time") return "text-green-500 bg-green-500/10";
    if (status.includes("Delay")) return "text-amber-500 bg-amber-500/10";
    return "text-red-500 bg-red-500/10";
  };

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Navbar onOpenDemo={() => setIsContactOpen(true)} onHomeClick={() => {}} />

      <div className="flex flex-1 pt-20">
        {/* SIDEBAR */}
        <aside className={`w-72 border-r hidden lg:flex flex-col sticky top-20 h-[calc(100vh-80px)] transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="p-6 border-b border-slate-50/10">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Fleet</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {thalasseryFleet.map((bus) => (
              <button
                key={bus.busNo}
                onClick={() => setSelectedBus(bus)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${
                  selectedBus.busNo === bus.busNo 
                    ? "border-amber-400 bg-amber-400/5 shadow-sm" 
                    : `border-transparent hover:${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bus size={18} className={selectedBus.busNo === bus.busNo ? "text-amber-500" : "text-slate-400"} />
                  <div className="text-left">
                    <p className={`font-black italic text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{bus.busNo}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{bus.route}</p>
                  </div>
                </div>
                {selectedBus.busNo === bus.busNo && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN VIEW */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* HEADER AREA */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(selectedBus.status)}`}>
                     {selectedBus.status}
                   </span>
                </div>
                <h1 className={`text-6xl font-black tracking-tighter uppercase italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                   Track <span className="text-amber-500">{selectedBus.busNo}</span>
                </h1>
                <p className={`font-bold flex items-center gap-2 mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <MapPin size={18} className="text-amber-500" /> Currently navigating {selectedBus.route}
                </p>
              </div>

              <div className="flex gap-4">
                 <div className={`p-4 rounded-3xl text-center border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase">On Board</p>
                    <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedBus.students}</p>
                 </div>
              </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* INTERACTIVE MAP */}
              <div className={`lg:col-span-2 h-[550px] rounded-[3.5rem] overflow-hidden border-8 shadow-2xl relative z-0 transition-all ${
                isDarkMode ? 'border-slate-800 shadow-amber-900/10' : 'border-white shadow-slate-200'
              }`}>
                <MapContainer center={selectedBus.coords} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer 
                    url={isDarkMode 
                      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    }
                  />
                  <Marker position={selectedBus.coords} icon={busIcon}>
                    <Popup className="font-bold">
                      <div className="text-center">
                        <p className="m-0 font-black">{selectedBus.busNo}</p>
                        <p className="m-0 text-amber-600 uppercase text-[10px]">{selectedBus.status}</p>
                      </div>
                    </Popup>
                  </Marker>
                  <RecenterMap coords={selectedBus.coords} />
                </MapContainer>
                
                {/* FLOATING STATUS CARD */}
                <div className="absolute bottom-8 left-8 right-8 z-[1000]">
                  <div className={`backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl flex flex-wrap items-center justify-between gap-4 border ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/90 border-white'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-400 p-4 rounded-2xl text-slate-900 animate-bounce-slow">
                        <Navigation size={24} />
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Last Seen Near</p>
                        <p className={`text-xl font-black italic tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                          {selectedBus.landmark}
                        </p>
                      </div>
                    </div>
                  
                  </div>
                </div>
              </div>

              {/* PERSONNEL & STATS */}
              <div className="space-y-6">
                <div className={`p-10 rounded-[3.5rem] shadow-xl transition-all border-b-[12px] ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}>
                  <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-50/10">
                    <User className="text-amber-500" size={20} />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Crew Details</h3>
                  </div>
                  
                  <div className="space-y-10">
                    <div className="relative pl-6 border-l-2 border-amber-400">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Lead Driver</p>
                      <p className={`text-2xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {selectedBus.driver}
                      </p>
                      <p className="text-md font-bold text-slate-500 mt-1">{selectedBus.dMob}</p>
                    </div>

                    <div className="relative pl-6 border-l-2 border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Route Assistant</p>
                      <p className={`text-2xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {selectedBus.assistant}
                      </p>
                      <p className="text-md font-bold text-slate-500 mt-1">{selectedBus.aMob}</p>
                    </div>
                  </div>

                  <div className={`mt-12 p-6 rounded-3xl border flex items-center gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                     <div className="text-amber-500"><Clock size={20} /></div>
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase">Estimated Arrival</p>
                        <p className={`font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>12:45 PM (Approx)</p>
                     </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      <Footer />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}