import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus, User, Users, Clock, ChevronRight, LayoutDashboard, MapPin, AlertTriangle, Navigation, AlertCircle } from 'lucide-react';
import { requestForToken, onMessageListener } from '../utils/firebase';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import { useTheme } from '../context/ThemeContext';

// Professional Custom Icons
const busIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [45, 45],
    iconAnchor: [22, 45],
    popupAnchor: [0, -40]
});

const homeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1239/1239525.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35]
});

function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords && coords[0] !== 0) {
            map.flyTo(coords, 15, { animate: true, duration: 1.5 });
        }
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

    const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(2);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Initial Data Fetch
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return setLoading(false);

                const res = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUserData(res.data);

                if (res.data.children && res.data.children.length > 0) {
                    const defaultChild = res.data.children[0];
                    setActiveStudent(defaultChild);
                    
                    if (defaultChild.assignedBus?.currentLocation) {
                        setLiveCoords([
                            defaultChild.assignedBus.currentLocation.lat, 
                            defaultChild.assignedBus.currentLocation.lng
                        ]);
                    }
                }

                const histRes = await axios.get('http://localhost:5000/api/notifications/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(histRes.data.history || histRes.data);

                if (res.data._id) requestForToken(res.data._id);

                setLoading(false);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Socket.io Integration
    useEffect(() => {
        if (!activeStudent?._id || !activeStudent?.assignedBus?._id) return;

        const busId = activeStudent.assignedBus._id;
        const studentId = activeStudent._id;
        const socket = io('http://localhost:5000');

        socket.emit('joinBusRoom', busId);
        socket.emit('joinStudentRoom', studentId);

        socket.on('fleetUpdate', (data) => {
            if (busId === data.busId) {
                setLiveCoords([data.lat, data.lng]);
            }
        });

        socket.on('notification', (data) => {
            // Real-time toast for proximity or delays
            toast.success(data.message, {
                icon: data.type === 'NEAR_HOME' ? '🏠' : '🚌',
                style: { 
                    borderRadius: '15px', 
                    background: isDarkMode ? '#0f172a' : '#fff', 
                    color: isDarkMode ? '#fff' : '#1e293b',
                    border: '2px solid #f59e0b',
                    fontWeight: 'bold'
                },
                duration: 6000
            });

            // Add to history state immediately
            setHistory(prev => [{
                _id: Date.now(),
                message: data.message,
                type: data.type,
                createdAt: new Date().toISOString()
            }, ...prev]);
        });

        return () => socket.disconnect();
    }, [activeStudent?._id, activeStudent?.assignedBus?._id, isDarkMode]);

    // Live Distance Calculation
    useEffect(() => {
        // Use student's specific stop location if available, otherwise fallback to user home
        const targetLat = activeStudent?.stopLocation?.coordinates?.lat || userData?.lat;
        const targetLng = activeStudent?.stopLocation?.coordinates?.lng || userData?.lng;

        if (targetLat && liveCoords) {
            const d = calculateDistance(liveCoords[0], liveCoords[1], targetLat, targetLng);
            setDistance(d);
        }
    }, [liveCoords, activeStudent, userData, calculateDistance]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
        </div>
    );

    const bus = activeStudent?.assignedBus;

    return (
        <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
            <Toaster position="top-right" />
            <Navbar onOpenDemo={() => setIsContactOpen(true)} />

            <div className="flex flex-1 pt-20">
                {/* SIDEBAR - Student Selector */}
                <aside className={`w-80 border-r hidden lg:flex flex-col p-6 space-y-4 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-2 mb-6 px-2">
                        <Users size={18} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Your Children</span>
                    </div>

                    <div className="space-y-3">
                        {userData?.children?.map((child) => (
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
                                    : isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-amber-500/50' : 'bg-slate-50 border-slate-100 hover:border-amber-500/50'
                                }`}
                            >
                                <div className="text-left">
                                    <p className="font-black text-sm uppercase italic tracking-tighter">{child.name}</p>
                                    <p className="text-[10px] opacity-60 font-bold">Grade {child.grade}</p>
                                </div>
                                <ChevronRight size={16} className={activeStudent?._id === child._id ? 'text-slate-900' : 'opacity-20'} />
                            </button>
                        ))}
                    </div>
                </aside>

                <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                    {!bus ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Bus size={80} className="opacity-10 mb-4 animate-pulse" />
                            <h2 className="text-2xl font-black uppercase italic">No Active Route</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase max-w-xs mt-2">
                                {activeStudent ? `${activeStudent.name}'s bus is not currently on a live trip.` : "Select a student to begin tracking."}
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto space-y-8">
                            {/* Dashboard Header */}
                            <header className="flex flex-col md:flex-row justify-between items-end gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Live Tracking
                                        </span>
                                        <span className={`${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-600'} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 shadow-sm`}>
                                            <Clock size={12} /> {currentTime.toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                                        Bus <span className="text-amber-500">{bus.busNo}</span>
                                    </h1>
                                </div>

                                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xl min-w-[220px]`}>
                                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Estimated Distance</p>
                                    <p className="text-4xl font-black italic text-amber-500 uppercase">
                                        {distance || "---"} <span className="text-lg">KM</span>
                                    </p>
                                </div>
                            </header>

                            <div className="grid xl:grid-cols-3 gap-8">
                                {/* Map Section */}
                                <div className={`xl:col-span-2 h-[550px] rounded-[3.5rem] overflow-hidden border-8 relative z-0 ${isDarkMode ? 'border-slate-800 shadow-2xl' : 'border-white shadow-2xl'}`}>
                                    <MapContainer center={liveCoords} zoom={15} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                                        
                                        {/* Student Stop / Home Marker */}
                                        {(activeStudent?.stopLocation?.coordinates?.lat || userData?.lat) && (
                                            <Marker position={[activeStudent?.stopLocation?.coordinates?.lat || userData.lat, activeStudent?.stopLocation?.coordinates?.lng || userData.lng]} icon={homeIcon}>
                                                <Popup><p className="font-bold uppercase italic text-xs">{activeStudent.name}'s Stop</p></Popup>
                                            </Marker>
                                        )}

                                        {/* Bus Marker */}
                                        <Marker position={liveCoords} icon={busIcon}>
                                            <Popup><p className="font-bold uppercase text-xs">Bus {bus.busNo}</p></Popup>
                                        </Marker>
                                        
                                        <RecenterMap coords={liveCoords} />
                                    </MapContainer>

                                    {/* Proximity Overlay */}
                                    {distance && parseFloat(distance) < 0.8 && (
                                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-amber-500 text-slate-900 px-8 py-4 rounded-full font-black uppercase italic flex items-center gap-3 shadow-2xl animate-bounce">
                                            <Navigation size={20} className="animate-pulse" />
                                            Arriving Soon!
                                        </div>
                                    )}
                                </div>

                                {/* Information Panels */}
                                <div className="space-y-6">
                                    <div className={`p-10 rounded-[3.5rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white shadow-xl'}`}>
                                        <div className="mb-8 pb-4 border-b border-white/5">
                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Student Profile</p>
                                            <p className="text-3xl font-black italic uppercase tracking-tighter">{activeStudent.name}</p>
                                            <p className="text-xs font-bold text-slate-500 uppercase">Route: {bus.route || 'Not Specified'}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><User size={20} /></div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-500 uppercase">Primary Driver</p>
                                                        <p className="font-black italic text-sm">{bus.driver?.name || "Assigning..."}</p>
                                                        <p className="text-xs font-bold text-amber-500 mt-0.5">{bus.driver?.mobileNo}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl"><Users size={20} /></div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-500 uppercase">Route Assistant</p>
                                                        <p className="font-black italic text-sm">{bus.assistant?.name || "Assigning..."}</p>
                                                        <p className="text-xs font-bold text-amber-500 mt-0.5">{bus.assistant?.mobileNo}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notification History Section */}
                            <div className="mt-12">
                                <h3 className="text-xl font-bold mb-6 italic uppercase flex items-center gap-2">
                                    <AlertTriangle size={20} className="text-amber-500" />
                                    Recent <span className="text-amber-500">Alerts</span>
                                </h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {history.length === 0 ? (
                                        <div className="col-span-full py-10 text-center opacity-30">
                                            <p className="text-sm font-black uppercase italic">No recent activity logged</p>
                                        </div>
                                    ) : (
                                        history.slice(0, 6).map(notif => (
                                            <div key={notif._id} className={`p-5 rounded-3xl border flex items-start gap-4 transition-transform hover:scale-[1.02] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                                <div className={`p-2.5 rounded-xl ${notif.type === 'DELAY' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                                    <AlertCircle size={20} />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-black italic leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{notif.message}</p>
                                                    <p className="text-[10px] text-slate-500 mt-2 uppercase font-black tracking-widest">
                                                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
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