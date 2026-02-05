import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Bus, Clock, MapPin, ShieldCheck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix for default Leaflet icon not showing
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function Dashboard() {
  const navigate = useNavigate();
  const [busLocation, setBusLocation] = useState([28.6139, 77.2090]); // Default (New Delhi)
  const [busStatus, setBusStatus] = useState("Moving");

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth' , { replace : true });
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <div className="w-80 bg-white shadow-2xl z-20 flex flex-col p-6">
        <div className="flex items-center gap-2 text-slate-900 mb-10">
          <Bus className="text-amber-500" size={32} />
          <span className="text-2xl font-black">TrackMyBus</span>
        </div>

        <div className="space-y-6 flex-1">
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-black text-slate-900 text-lg">{busStatus}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Clock size={20}/></div>
              <div>
                <p className="text-sm font-bold text-slate-900">Estimated Arrival</p>
                <p className="text-sm text-slate-500">12 mins away</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><MapPin size={20}/></div>
              <div>
                <p className="text-sm font-bold text-slate-900">Next Stop</p>
                <p className="text-sm text-slate-500">Oxford Street Square</p>
              </div>
            </div>
          </div>

          <div className="mt-10 p-4 bg-amber-500 rounded-[2rem] text-slate-900">
            <div className="flex items-center gap-2 mb-2 font-black">
              <ShieldCheck size={20} /> Safety Guard ON
            </div>
            <p className="text-xs font-medium opacity-80">You will receive an alert when the bus is 500m away from your stop.</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center justify-center gap-2 py-4 text-slate-400 font-bold hover:text-red-500 transition-colors"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* --- MAIN MAP SECTION --- */}
      <div className="flex-1 relative">
        <MapContainer 
          center={busLocation} 
          zoom={15} 
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <Marker position={busLocation}>
            <Popup>
              🚌 School Bus #402 <br /> Status: {busStatus}
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating Map Controls */}
        <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
          <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Driver Details</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
              <div>
                <p className="text-sm font-bold">Rajesh Kumar</p>
                <p className="text-[10px] text-green-500 font-bold">Verified Driver</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}