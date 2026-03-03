import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus, User, Users, Clock, ChevronRight, LayoutDashboard, MapPin } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import { useTheme } from '../context/ThemeContext';

const busIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize:[40,40],
    iconAnchor:[20,40],
});

function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords && coords !== 0) map.flyTo(coords, 14, { animate: true });
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
    const { isDarkMode } = useTheme();

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
        // Manually trigger a map jump when switching siblings
        if (child.assignedBus?.currentLocation) {
            setLiveCoords([
                child.assignedBus.currentLocation.lat, 
                child.assignedBus.currentLocation.lng
            ]);
        }
    }}
    className={`w-full p-5 rounded-[2rem] ...`}
>
                                    <div>
                                        <p className="font-black text-sm uppercase italic tracking-tighter">{child.name}</p>
                                        <p className="text-[10px] opacity-50 font-bold">Grade {child.grade}</p>
                                    </div>
                                    <ChevronRight size={14} className={activeStudent?._id === child._id ? 'text-amber-500' : 'opacity-20'} />
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
                            <h2 className="text-xl font-black uppercase italic italic">No Bus Link</h2>
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
                            </header>

                            <div className="grid xl:grid-cols-3 gap-8">
                                <div className={`xl:col-span-2 h-[550px] rounded-[3.5rem] overflow-hidden border-8 relative z-0 ${isDarkMode ? 'border-slate-800 shadow-2xl shadow-black/50' : 'border-white shadow-2xl'}`}>
                                    <MapContainer center={liveCoords} zoom={15} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                                        <Marker position={liveCoords} icon={busIcon} />
                                        <RecenterMap coords={liveCoords} />
                                    </MapContainer>
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