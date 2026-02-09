import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus, User, MapPin, Navigation, ShieldCheck, PhoneOutgoing } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';

// 1. DEFINE THE DATA (This fixes your ReferenceError)
const thalasseryFleet = [
  { busNo: "BUS-01", route: "Dharmadam", driver: "P. Mukundan", dMob: "+91 98470 12345", assistant: "Reji K.", aMob: "+91 98470 54321", status: "On Time", students: 18, coords: [11.7761, 75.4674], landmark: "Brennan College" },
  { busNo: "BUS-02", route: "Kolassery", driver: "Suresh Babu", dMob: "+91 98470 22334", assistant: "Vineeth M.", aMob: "+91 98470 44332", status: "On Time", students: 14, coords: [11.7654, 75.5122], landmark: "Kolassery Junction" },
  { busNo: "BUS-03", route: "Manekkara", driver: "K. Gangadharan", dMob: "+91 98470 33445", assistant: "Shaji P.", aMob: "+91 98470 55443", status: "5 mins Delay", students: 22, coords: [11.7289, 75.5531], landmark: "Manekkara School" },
  { busNo: "BUS-04", route: "Koppalam", driver: "Ratheesh V.", dMob: "+91 98470 66778", assistant: "Anas T.", aMob: "+91 98470 88776", status: "On Time", students: 10, coords: [11.7441, 75.4852], landmark: "Koppalam Junction" },
  { busNo: "BUS-05", route: "Temple Gate", driver: "Pradeepan K.", dMob: "+91 98470 11223", assistant: "Sumesh R.", aMob: "+91 98470 33221", status: "On Time", students: 12, coords: [11.7380, 75.4947], landmark: "Jagannath Temple" },
  { busNo: "BUS-06", route: "Pinarayi", driver: "Vijayan T.", dMob: "+91 98470 99001", assistant: "Binu C.", aMob: "+91 98470 11009", status: "Heavy Traffic", students: 19, coords: [11.8025, 75.5186], landmark: "Pinarayi Town" },
  { busNo: "BUS-07", route: "Chonadam", driver: "Manoj Kumar", dMob: "+91 98470 77889", assistant: "Deepak S.", aMob: "+91 98470 99887", status: "On Time", students: 15, coords: [11.7612, 75.4884], landmark: "Chonadam Bypass" },
];

// Custom Bus Icon
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Map Recenter Logic
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar onOpenDemo={() => setIsContactOpen(true)} onHomeClick={() => {}} />

      <div className="flex flex-1 pt-20">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-20 h-[calc(100vh-80px)]">
          <div className="p-6 border-b border-slate-50 uppercase text-[10px] font-black text-slate-400 tracking-widest">Select Bus</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {thalasseryFleet.map((bus) => (
              <button
                key={bus.busNo}
                onClick={() => setSelectedBus(bus)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all border-2 ${
                  selectedBus.busNo === bus.busNo ? "border-amber-400 bg-amber-50 shadow-sm" : "border-transparent hover:bg-slate-50"
                }`}
              >
                <Bus size={18} className={selectedBus.busNo === bus.busNo ? "text-amber-500" : "text-slate-400"} />
                <span className="font-black italic text-slate-900">{bus.busNo}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN VIEW */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
                  Bus <span className="text-amber-500">{selectedBus.busNo}</span>
                </h1>
                <p className="text-slate-500 font-bold flex items-center gap-2 mt-1 underline decoration-amber-200">
                  <MapPin size={16} /> Route: {selectedBus.route}
                </p>
              </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* OPENSTREETMAP */}
              <div className="lg:col-span-2 h-[500px] rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl relative z-0">
                <MapContainer center={selectedBus.coords} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={selectedBus.coords} icon={busIcon}>
                    <Popup className="font-bold">{selectedBus.busNo} - {selectedBus.route}</Popup>
                  </Marker>
                  <RecenterMap coords={selectedBus.coords} />
                </MapContainer>
                
                <div className="absolute bottom-6 left-6 right-6 z-[1000]">
                  <div className="bg-white/95 backdrop-blur-md p-5 rounded-[2rem] shadow-xl flex items-center gap-4 border border-white">
                    <div className="bg-amber-400 p-3 rounded-2xl text-slate-900"><Navigation size={20} /></div>
                    <span className="font-black text-slate-800 tracking-tight">Current Stop: <span className="text-amber-600 uppercase italic">{selectedBus.landmark}</span></span>
                  </div>
                </div>
              </div>

              {/* PERSONNEL DETAILS */}
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border-b-[10px] border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Crew Details</h3>
                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] font-black text-amber-500 uppercase">Driver</p>
                      <p className="text-xl font-black text-slate-900 italic tracking-tighter">{selectedBus.driver}</p>
                      <p className="text-md font-bold text-slate-500">{selectedBus.dMob}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Assistant</p>
                      <p className="text-xl font-black text-slate-900 italic tracking-tighter">{selectedBus.assistant}</p>
                      <p className="text-md font-bold text-slate-500">{selectedBus.aMob}</p>
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