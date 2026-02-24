import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus, User, MapPin, Navigation, Clock, PhoneOutgoing } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import { useTheme } from '../context/ThemeContext';

// Custom Bus Icon
const busIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords[0] !== 0) map.flyTo(coords, 14, { animate: true });
    }, [coords, map]);
    return null;
}

export default function Dashboard() {
    const [selectedBus, setSelectedBus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const { isDarkMode } = useTheme();

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // Using the /me route which populates assignedBus
                const res = await axios.get('http://localhost:5000/api/auth/me', config);
                
                if (res.data.assignedBus) {
                    setSelectedBus(res.data.assignedBus);
                }
                setLoading(false);
            } catch (err) {
                console.error("Dashboard fetch failed", err);
                setLoading(false);
            }
        };

        if (token) fetchDashboardData();
    }, [token]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
        </div>
    );

    if (!selectedBus) return (
        <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white'}`}>
            <Navbar onOpenDemo={() => setIsContactOpen(true)} />
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <Bus size={64} className="text-slate-700 mb-4 opacity-20" />
                <h2 className="text-2xl font-black italic uppercase">Access Denied</h2>
                <p className="text-slate-500 max-w-md mt-2 font-bold uppercase text-[10px] tracking-widest">
                    No bus is currently linked to your account. Please contact the administrator.
                </p>
            </div>
            <Footer />
        </div>
    );

    // Matching your Schema: selectedBus.currentLocation.lat / lng
    const busCoords = [selectedBus.currentLocation?.lat || 11.7491, selectedBus.currentLocation?.lng || 75.4890];

    return (
        <div className={`flex flex-col min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <Navbar onOpenDemo={() => setIsContactOpen(true)} />

            <div className="flex flex-1 pt-20">
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                    <div className="max-w-6xl mx-auto space-y-8">
                        
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${selectedBus.status === 'active' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                        {selectedBus.status}
                                    </span>
                                    <span className="bg-slate-500/10 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                        {selectedBus.schoolBuilding}
                                    </span>
                                </div>
                                <h1 className={`text-6xl font-black tracking-tighter uppercase italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    Route <span className="text-amber-500">{selectedBus.busNo}</span>
                                </h1>
                                <p className={`font-bold flex items-center gap-2 mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <Navigation size={18} className="text-amber-500" /> Currently serving {selectedBus.route}
                                </p>
                            </div>
                        </header>

                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className={`lg:col-span-2 h-[550px] rounded-[3.5rem] overflow-hidden border-8 relative z-0 ${isDarkMode ? 'border-slate-800' : 'border-white shadow-2xl'}`}>
                                <MapContainer center={busCoords} zoom={14} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                                    <Marker position={busCoords} icon={busIcon}>
                                        <Popup><strong>{selectedBus.busNo}</strong><br/>{selectedBus.status}</Popup>
                                    </Marker>
                                    <RecenterMap coords={busCoords} />
                                </MapContainer>
                            </div>

                            <div className="space-y-6">
                                <div className={`p-10 rounded-[3.5rem] shadow-xl border-b-[12px] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                                    <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-50/10 text-amber-500">
                                        <User size={20} />
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em]">Vehicle Info</h3>
                                    </div>
                                    
                                    <div className="space-y-8">
                                        <div className="relative pl-6 border-l-2 border-amber-400">
                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Driver Contact</p>
                                            <p className={`text-2xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {selectedBus.driverPhone || "N/A"}
                                            </p>
                                        </div>
                                        <div className="relative pl-6 border-l-2 border-slate-700">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Route</p>
                                            <p className={`text-2xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {selectedBus.route}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`mt-10 p-6 rounded-3xl border flex items-center gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="text-amber-500"><Clock size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operation Mode</p>
                                            <p className={`font-black uppercase italic ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {selectedBus.status}
                                            </p>
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