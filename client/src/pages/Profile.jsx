import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Phone, Save, MapPin, Baby, ShieldCheck, Loader2, Search, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

// Fix for default Leaflet icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const homeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1239/1239525.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

// Helper to recenter map when fetching existing coordinates, searching, or using GPS
function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords[0] && coords[1]) {
            map.setView(coords, 16); 
        }
    }, [coords, map]);
    return null;
}

export default function Profile() {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobileNo: "",
        address: "",
        lat: null,
        lng: null,
        children: []
    });

    const token = localStorage.getItem('token');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    // --- 1. SEARCH BY TEXT ADDRESS ---
    const handleSearchAddress = async () => {
        if (!formData.address || formData.address.length < 5) {
            return alert("Please enter a more detailed address to search.");
        }

        setSearching(true);
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`
            );

            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                setFormData(prev => ({
                    ...prev,
                    lat: parseFloat(lat),
                    lng: parseFloat(lon)
                }));
            } else {
                alert("Location not found. Try adding a city name or landmark.");
            }
        } catch (err) {
            console.error("Geocoding error:", err);
            alert("Search service is temporarily unavailable.");
        } finally {
            setSearching(false);
        }
    };

    // --- 2. GET CURRENT GPS LOCATION ---
    const handleUseGPS = () => {
        if (!navigator.geolocation) {
            return alert("Geolocation is not supported by your browser.");
        }

        setSearching(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }));
                setSearching(false);
                alert("GPS Location Captured!");
            },
            (error) => {
                setSearching(false);
                alert("Unable to retrieve your location. Please check your browser permissions.");
            }
        );
    };

    // --- 3. MANUAL MAP CLICK ---
    function LocationMarker() {
        useMapEvents({
            click(e) {
                setFormData(prev => ({
                    ...prev,
                    lat: e.latlng.lat,
                    lng: e.latlng.lng
                }));
            },
        });
        return formData.lat ? <Marker position={[formData.lat, formData.lng]} icon={homeIcon} /> : null;
    }

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setFetching(true);
                const res = await axios.get('http://localhost:5000/api/auth/me', config);
                setFormData({
                    ...res.data,
                    children: res.data.children || []
                });
            } catch (err) {
                console.error("Error fetching profile", err);
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!formData.name || !formData.mobileNo) {
            return alert("Name and Mobile Number are required.");
        }
        if (!formData.lat || !formData.lng) {
            return alert("Please set your home location using GPS, Search, or clicking the Map.");
        }

        setLoading(true);
        try {
            await axios.put('http://localhost:5000/api/users/settings', formData, config);
            alert("Profile updated successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-amber-500" size={48} />
                    <p className="font-black uppercase italic tracking-widest text-slate-500">Loading Profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
            <Navbar />
            
            <div className="pt-32 pb-20 px-6">
                <div className={`max-w-3xl mx-auto rounded-[3.5rem] shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    
                    {/* Header */}
                    <div className="bg-slate-900 p-12 text-center relative">
                        <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl relative z-10">
                            <User size={40} className="text-slate-900" />
                        </div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white relative z-10">
                            Account <span className="text-amber-400">Settings</span>
                        </h1>
                    </div>

                    <div className="p-10 space-y-8">
                        {/* Name & Phone */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Full Name</label>
                                <input name="name" value={formData.name || ""} onChange={handleChange} className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} font-bold outline-none focus:ring-2 focus:ring-amber-500`} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Mobile Number</label>
                                <input name="mobileNo" value={formData.mobileNo || ""} onChange={handleChange} className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} font-bold outline-none focus:ring-2 focus:ring-amber-500`} />
                            </div>
                        </div>

                        {/* Address & GPS Actions */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Home Location</label>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input 
                                    name="address" 
                                    value={formData.address || ""} 
                                    onChange={handleChange} 
                                    placeholder="Enter address..."
                                    className={`flex-1 px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} font-bold outline-none focus:ring-2 focus:ring-amber-500`} 
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleSearchAddress} className="bg-slate-800 text-white px-5 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-700 transition-all"><Search size={18} /> FIND</button>
                                    <button onClick={handleUseGPS} className="bg-amber-400 text-slate-900 px-5 rounded-2xl font-black flex items-center gap-2 hover:bg-amber-300 transition-all"><Navigation size={18} /> GPS</button>
                                </div>
                            </div>

                            {/* Map View */}
                            <div className={`h-64 rounded-[2rem] overflow-hidden border-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                <MapContainer center={[formData.lat || 11.7491, formData.lng || 75.4890]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                                    <RecenterMap coords={[formData.lat, formData.lng]} />
                                    <LocationMarker />
                                </MapContainer>
                            </div>
                            <p className="text-[10px] text-center font-bold text-slate-400 uppercase italic">
                                {formData.lat ? `✅ Home Marked at: ${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)}` : "❌ Use Search, GPS, or tap map to mark home."}
                            </p>
                        </div>

                        {/* Students List */}
                        <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-amber-50/50 border-amber-100'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-black uppercase italic text-sm tracking-tight">Registered Students</h3>
                                <ShieldCheck className="text-amber-500" size={24} />
                            </div>
                            <div className="grid gap-3">
                                {formData.children.map((child, idx) => (
                                    <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-white shadow-sm'}`}>
                                        <Baby size={20} className="text-amber-500" />
                                        <div>
                                            <p className="font-black uppercase text-xs italic">{child.name}</p>
                                            <p className="text-[9px] font-bold text-slate-500">GRADE {child.grade}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Final Save Button */}
                        <button 
                            onClick={handleSave} 
                            disabled={loading || searching} 
                            className={`w-full py-5 rounded-2xl font-black uppercase italic tracking-tighter transition-all flex items-center justify-center gap-2 shadow-xl 
                                ${loading ? 'bg-slate-400' : 'bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-amber-500/20 active:scale-95'}`}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {loading ? "SAVING..." : "Save Profile & Home Location"}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}