import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus, User, Users, Clock, ChevronRight, LayoutDashboard, MapPin, AlertTriangle, Navigation } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import { useTheme } from '../context/ThemeContext';

const busIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

const homeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1239/1239525.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords && coords[0] !== 0) map.flyTo(coords, 14, { animate: true });
    }, [coords, map]);
    return null;
}

export default function Dashboard() {
    const [userData, setUserData] = useState(null);
    const [activeStudent, setActiveStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [liveCoords, setLiveCoords] = useState([11.7491, 75.4890]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [distance, setDistance] = useState(null);
    const [history, setHistory] = useState([]);
    const { isDarkMode } = useTheme();

    // Calculate Distance (Haversine Formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(2);
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUserData(res.data);

                if (res.data.children && res.data.children.length > 0) {
                    const defaultChild = res.data.children[0];
                    setActiveStudent(defaultChild);
                    const bus = defaultChild.assignedBus;
                    if (bus?.currentLocation) {
                        setLiveCoords([bus.currentLocation.lat, bus.currentLocation.lng]);
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    useEffect(() => {
        const busId = activeStudent?.assignedBus?._id;
        if (!busId) return;

        const socket = io('http://localhost:5000');
        socket.on('fleetUpdate', (data) => {
            if (busId === data.busId) {
                setLiveCoords([data.lat, data.lng]);
            }
        });
        return () => socket.disconnect();
    }, [activeStudent?.assignedBus?._id]);

    // Update Distance whenever bus moves or student changes
    useEffect(() => {
        if (userData?.lat && liveCoords) {
            const d = calculateDistance(liveCoords[0], liveCoords[1], userData.lat, userData.lng);
            setDistance(d);
        }
    }, [liveCoords, userData, activeStudent]);

    useEffect(() => {
  const fetchHistory = async () => {
    const res = await axios.get('http://localhost:5000/api/notifications/history', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setHistory(res.data);
  };
  fetchHistory();
}, []);

return (
  <div className="mt-8">
    <h3 className="text-xl font-bold mb-4 italic uppercase">Notification <span className="text-amber-500">History</span></h3>
    <div className="space-y-3">
      {history.map(notif => (
        <div key={notif._id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-4">
          <div className={`p-2 rounded-lg ${notif.type === 'EMERGENCY' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200">{notif.message}</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-black">
              {new Date(notif.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-amber-500"></div>
        </div>
    );

    const bus = activeStudent?.assignedBus;

    return (
        <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
            <Navbar onOpenDemo={() => setIsContactOpen(true)} />

            <div className="flex flex-1 pt-20">
                {/* SIDEBAR */}
                <aside className={`w-80 border-r hidden lg:flex flex-col p-6 space-y-4 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-2 mb-6 px-2">
                        <LayoutDashboard size={16} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student List</span>
                    </div>

                    <div className="space-y-3">
                        {userData?.children?.length > 0 ? (
                            userData.children.map((child) => (
                                <button
                                    key={child._id}
                                    onClick={() => {
                                        setActiveStudent(child);
                                        if (child.assignedBus?.currentLocation) {
                                            setLiveCoords([
                                                child.assignedBus.currentLocation.lat,
                                                child.assignedBus.currentLocation.lng
                                            ]);
                                        }
                                    }}
                                    className={`w-full p-5 rounded-[2rem] flex items-center justify-between transition-all border ${activeStudent?._id === child._id
                                            ? 'bg-amber-500 border-amber-500 text-slate-900 shadow-lg shadow-amber-500/20'
                                            : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
                                        }`}
                                >
                                    <div>
                                        <p className="font-black text-sm uppercase italic tracking-tighter">{child.name}</p>
                                        <p className="text-[10px] opacity-50 font-bold">Grade {child.grade}</p>
                                    </div>
                                    <ChevronRight size={14} className={activeStudent?._id === child._id ? 'text-slate-900' : 'opacity-20'} />
                                </button>
                            ))
                        ) : (
                            <p className="text-[10px] text-center text-slate-500 uppercase font-black py-10">No Students Found</p>
                        )}
                    </div>
                </aside>

                {/* MAIN MAP AREA */}
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                    {!bus ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Bus size={64} className="opacity-10 mb-4" />
                            <h2 className="text-xl font-black uppercase italic">No Bus Link</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase max-w-xs mt-2">
                                {activeStudent ? `Student ${activeStudent.name} is registered, but no bus has been assigned yet.` : "Select a student from the sidebar."}
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto space-y-8">
                            <header className="flex flex-col md:flex-row justify-between items-end gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Live GPS
                                        </span>
                                        <span className={`${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-600'} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 shadow-sm`}>
                                            <Clock size={12} /> {currentTime.toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">
                                        Bus <span className="text-amber-500">{bus.busNo}</span>
                                    </h1>
                                </div>

                                {/* Distance Badge */}
                                <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xl min-w-[200px]`}>
                                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Distance to Home</p>
                                    <p className="text-3xl font-black italic text-amber-500 uppercase">{distance || "---"} <span className="text-sm">KM</span></p>
                                </div>
                            </header>

                            <div className="grid xl:grid-cols-3 gap-8">
                                <div className={`xl:col-span-2 h-[550px] rounded-[3.5rem] overflow-hidden border-8 relative z-0 ${isDarkMode ? 'border-slate-800 shadow-2xl shadow-black/50' : 'border-white shadow-2xl'}`}>
                                    <MapContainer center={liveCoords} zoom={15} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                                        
                                        {/* Home Marker */}
                                        {userData?.lat && (
                                            <Marker position={[userData.lat, userData.lng]} icon={homeIcon}>
                                                <Popup><p className="font-bold uppercase italic text-xs">Your Home</p></Popup>
                                            </Marker>
                                        )}

                                        <Marker position={liveCoords} icon={busIcon} />
                                        <RecenterMap coords={liveCoords} />
                                    </MapContainer>

                                    {/* Proximity Overlay Alert */}
                                    {distance && distance < 1.0 && (
                                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-amber-500 text-slate-900 px-8 py-4 rounded-full font-black uppercase italic flex items-center gap-3 shadow-2xl animate-bounce">
                                            <Navigation size={20} className="animate-pulse" />
                                            Bus is arriving soon! (Under 1KM)
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className={`p-10 rounded-[3.5rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white shadow-xl'}`}>
                                        <div className="mb-8 pb-4 border-b border-white/5">
                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Active Student</p>
                                            <p className="text-3xl font-black italic uppercase tracking-tighter">{activeStudent.name}</p>
                                            <p className="text-xs font-bold text-slate-500">Route: {bus.route}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><User size={20} /></div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-500 uppercase">Driver</p>
                                                        <p className="font-black italic text-sm">{bus.driver?.name || "Pending..."}</p>
                                                        <p className="text-xs font-bold text-amber-500 mt-1">{bus.driver?.mobileNo || "Contact Not Shared"}</p>
                                                    </div>
                                                </div>
                                                <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl"><Users size={20} /></div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-500 uppercase">Assistant</p>
                                                        <p className="font-black italic text-sm">{bus.assistant?.name || "Pending..."}</p>
                                                        <p className="text-xs font-bold text-amber-500 mt-1">{bus.assistant?.mobileNo || "Contact Not Shared"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            </div>
                                            
                                            {/* Status Updates Section */}
                                            <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                                    <AlertTriangle size={12} className="text-amber-500" /> Notifications
                                                </h3>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold text-green-500 uppercase">● Bus started trip</p>
                                                    {distance && distance < 1 && (
                                                        <p className="text-[10px] font-black text-amber-500 uppercase animate-pulse">● Near pickup point</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <Footer />
            <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
        </div>
    );
}