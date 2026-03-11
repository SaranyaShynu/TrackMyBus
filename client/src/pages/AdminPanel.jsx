import React, { useState, useEffect } from 'react';
import {
  Users, Bus, ShieldCheck, UserPlus, Edit2, Trash2, LayoutDashboard,
  School, Moon, Sun, LogOut, ChevronRight, Hash, Navigation, Mail,
  Phone, Key, Search, Eye, X, GraduationCap
} from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');

const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Or use a local SVG
  iconSize: [45, 45],
  iconAnchor: [22, 45],
});

// Component to auto-center map when bus moves
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView([coords.lat, coords.lng], map.getZoom());
  }, [coords]);
  return null;
}

// --- SUB-COMPONENTS ---
const StatCard = ({ label, value, icon: Icon, color, dark }) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-purple-500/10 text-purple-500',
    green: 'bg-green-500/10 text-green-500',
    amber: 'bg-amber-500/10 text-amber-500'
  };
  return (
    <div className={`p-8 rounded-[2.5rem] border flex items-center gap-6 transition-transform hover:scale-[1.02] ${dark ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className={`p-5 rounded-2xl ${colors[color] || colors.blue}`}><Icon size={28} /></div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{label}</p>
        <h3 className="text-4xl font-black italic tracking-tighter">{value}</h3>
      </div>
    </div>
  );
};

const InputGroup = ({ label, icon: Icon, dark, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{label}</label>
    <div className="relative">
      <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
      <input {...props} className={`w-full pl-14 pr-6 py-5 rounded-2xl border-2 font-bold transition-all focus:border-amber-500 outline-none ${dark ? 'bg-slate-800 border-transparent text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`} />
    </div>
  </div>
);

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminDark, setAdminDark] = useState(() => JSON.parse(localStorage.getItem('admin-private-theme') || 'true'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data States
  const [users, setUsers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [liveFleet, setLiveFleet] = useState([]);

  // Interaction States
  const [showModal, setShowModal] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingBus, setEditingBus] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingParent, setViewingParent] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);

  // Search States
  const [busSearchQuery, setBusSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Form States
  const [busForm, setBusForm] = useState({ busNo: '', route: '', schoolBuilding: 'Building A', driver: '', assistant: '', capacity: 40 });
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', mobileNo: '', role: 'driver' });
  const [studentForm, setStudentForm] = useState({ name: '', rollNumber: '', grade: '', parentEmail: '', assignedBus: '', bloodGroup: '' });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('admin-private-theme', JSON.stringify(adminDark));
  }, [adminDark]);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    socket.emit('joinAdminRoom');

    socket.on('fleetUpdate', (data) => {
      setLiveFleet(prev => prev.map(bus =>
        bus._id === data.busId
          ? { ...bus, currentLocation: { lat: data.lat, lng: data.lng }, lastUpdate: new Date().toLocaleTimeString() }
          : bus
      ));
    });

    return () => {
      socket.off('fleetUpdate');
    };
  }, []);

  useEffect(() => {
    if (buses.length > 0) {
      setLiveFleet(buses);
      const interval = setInterval(() => {
        setLiveFleet(prev => prev.map(bus => ({
          ...bus,
          currentLocation: {
            lat: (bus.currentLocation?.lat || 11.7491) + (Math.random() - 0.5) * 0.0002,
            lng: (bus.currentLocation?.lng || 75.4890) + (Math.random() - 0.5) * 0.0002,
          },
          lastUpdate: new Date().toLocaleTimeString()
        })));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [buses]);

  const fetchData = async () => {
    try {
      const [uRes, bRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/all-users', config),
        axios.get('http://localhost:5000/api/admin/buses', config)
      ]);
      setUsers(uRes.data || []);
      setBuses(bRes.data || []);
    } catch (err) { console.error("Database sync error", err); }
  };

  // --- HANDLERS ---
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/register', staffForm, config);
      alert(`Staff added successfully!`);
      setStaffForm({ name: '', email: '', password: '', mobileNo: '', role: 'driver' });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || "Registration failed"); }
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/add-bus', busForm, config);
      alert("Bus added.");
      setBusForm({ busNo: '', route: '', schoolBuilding: 'Building A', driver: '', assistant: '', capacity: 40 });
      fetchData();
    } catch (err) { alert("Error adding bus."); }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/add-student', studentForm, config);
      alert("Student enrolled!");
      setStudentForm({ name: '', rollNumber: '', grade: '', parentEmail: '', assignedBus: '', bloodGroup: '' });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || "Failed to add student."); }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      // Prepare the payload to match the Backend Schema
      const payload = {
        name: editingStudent.name,
        grade: editingStudent.grade,
        rollNumber: editingStudent.rollNumber,
        bloodGroup: editingStudent.bloodGroup, // The backend handles the nesting
        // Extract only the ID string for the bus
        assignedBus: typeof editingStudent.assignedBus === 'object'
          ? editingStudent.assignedBus?._id
          : editingStudent.assignedBus
      };

      await axios.put(
        `http://localhost:5000/api/admin/parent/${editingStudent.parentId}/student/${editingStudent._id}`,
        payload,
        config
      );

      setShowModal(null);
      fetchData(); // This refreshes the directory and Parent View
      alert("Student updated successfully!");
    } catch (err) {
      console.error("Update Error:", err);
      alert(err.response?.data?.message || "Update failed.");
    }
  };
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/admin/user/${editingUser.id}`, editingUser, config);
      setShowModal(null);
      fetchData();
    } catch (err) { alert("Update failed."); }
  };

  const handleUpdateBus = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/admin/bus/${editingBus.id}`, editingBus, config);
      setShowModal(null);
      fetchData();
    } catch (err) { alert("Update failed"); }
  };

  const handleDeleteUser = async (id) => { if (window.confirm("Delete user?")) { await axios.delete(`http://localhost:5000/api/admin/user/${id}`, config); fetchData(); } };
  const handleDeleteBus = async (id) => { if (window.confirm("Delete bus?")) { await axios.delete(`http://localhost:5000/api/admin/bus/${id}`, config); fetchData(); } };
  const handleDeleteStudent = async (pId, sId) => { if (window.confirm("Delete student?")) { await axios.delete(`http://localhost:5000/api/admin/parent/${pId}/student/${sId}`, config); fetchData(); } };

  const openUserEdit = (u) => { setEditingUser({ id: u._id, name: u.name, email: u.email, mobileNo: u.mobileNo, role: u.role }); setShowModal('user'); };
  const openBusEdit = (b) => { setEditingBus({ id: b._id, busNo: b.busNo, route: b.route, schoolBuilding: b.schoolBuilding, driver: b.driver?._id || '', assistant: b.assistant?._id || '', capacity: b.capacity || 40 }); setShowModal('bus'); };
  const openStudentEdit = (pId, s) => { setEditingStudent({ ...s, parentId: pId }); setShowModal('student-edit'); };

  // --- DATA FILTERING ---
  const allStudents = users
    .filter(u => u.role === 'parent')
    .flatMap(p => (p.children || []).map(c => ({ ...c, name: c.name || 'Loading...', parentName: p.name, parentId: p._id })))
    // Add (s.name || '') to prevent the crash
    .filter(s => (s.name || '').toLowerCase().includes(studentSearchQuery.toLowerCase()));

  const filteredBuses = buses.filter(b =>
    (b.busNo || '').toLowerCase().includes(busSearchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase())
  );
  const drivers = users.filter(u => u.role === 'driver' && (!u.assignedBus || (editingBus && u.assignedBus === editingBus.id)));
  const assistants = users.filter(u => u.role === 'assistant' && (!u.assignedBus || (editingBus && u.assignedBus === editingBus.id)));

  // --- THEME ---
  const theme = adminDark ? "bg-slate-950 text-slate-200 border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200";
  const card = adminDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm";
  const input = adminDark ? "bg-slate-800 text-white border-transparent" : "bg-slate-100 text-slate-900 border-slate-200";

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 font-sans ${theme}`}>

      {/* NAVBAR */}
      <nav className={`h-20 border-b flex items-center justify-between px-8 sticky top-0 z-50 backdrop-blur-md ${adminDark ? 'bg-slate-950/80' : 'bg-white/80'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-xl"><ShieldCheck size={24} className="text-slate-950" /></div>
          <span className="font-black uppercase tracking-tighter text-xl italic">Control<span className="text-amber-500">Center</span></span>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={() => setAdminDark(!adminDark)} className={`p-2.5 rounded-xl border ${adminDark ? 'border-slate-800 bg-slate-900 text-amber-400' : 'border-slate-200 bg-white text-slate-600'}`}>
            {adminDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login' }} className="bg-red-500/10 text-red-500 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`w-72 border-r p-6 hidden lg:block ${adminDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="space-y-1.5">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'add-student', label: 'Enroll Student', icon: School },
              { id: 'student-list', label: 'Students', icon: GraduationCap },
              { id: 'add-bus', label: 'New Bus', icon: Bus },
              { id: 'bus-list', label: 'Fleet', icon: Navigation },
              { id: 'add-staff', label: 'Add Staff', icon: UserPlus },
              { id: 'users', label: 'Users', icon: Users },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:bg-slate-500/10'}`}>
                <div className="flex items-center gap-3"><item.icon size={18} /> {item.label}</div>
                {activeTab === item.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-10 overflow-y-auto custom-scrollbar">

          {/* DASHBOARD OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Users" value={users.length} icon={Users} color="blue" dark={adminDark} />
                <StatCard label="Students" value={allStudents.length} icon={GraduationCap} color="purple" dark={adminDark} />
                <StatCard label="Fleet Units" value={buses.length} icon={Bus} color="amber" dark={adminDark} />
                <StatCard label="Live Signals" value={liveFleet.length} icon={Navigation} color="green" dark={adminDark} />
              </div>

              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div> Live Fleet Monitor
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {liveFleet.map(bus => (
                  <div key={bus._id} className={`p-6 rounded-[2.5rem] border-2 ${card} hover:border-amber-500 transition-all`}>
                    <div className="flex justify-between mb-4">
                      <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-500"><Bus size={24} /></div>
                      <span className="text-[9px] font-mono opacity-50">{bus.lastUpdate}</span>
                    </div>
                    <h4 className="text-2xl font-black italic tracking-tighter uppercase">Bus <span className="text-amber-500">{bus.busNo}</span></h4>
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-6">{bus.route}</p>
                    <div className={`p-4 rounded-2xl flex justify-between ${adminDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                      <div><p className="text-[8px] font-black opacity-50 uppercase">LAT</p><p className="font-mono text-xs">{bus.currentLocation?.lat.toFixed(4)}</p></div>
                      <div className="text-right"><p className="text-[8px] font-black opacity-50 uppercase">LNG</p><p className="font-mono text-xs">{bus.currentLocation?.lng.toFixed(4)}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADD STUDENT */}
          {activeTab === 'add-student' && (
            <div className={`max-w-3xl mx-auto p-10 rounded-[2.5rem] border ${card} animate-in slide-in-from-bottom-4`}>
              <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter text-amber-500">Student <span className={adminDark ? 'text-white' : 'text-slate-900'}>Enrollment</span></h2>
              <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InputGroup label="Parent Email" icon={Mail} value={studentForm.parentEmail} onChange={e => setStudentForm({ ...studentForm, parentEmail: e.target.value })} placeholder="Email used for parent account..." dark={adminDark} required />
                </div>
                <InputGroup label="Student Name" icon={Users} value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} dark={adminDark} required />
                <InputGroup label="Roll Number" icon={Hash} value={studentForm.rollNumber} onChange={e => setStudentForm({ ...studentForm, rollNumber: e.target.value })} dark={adminDark} required />
                <InputGroup label="Grade/Class" icon={Navigation} value={studentForm.grade} onChange={e => setStudentForm({ ...studentForm, grade: e.target.value })} dark={adminDark} required />
                <InputGroup label="Blood Group" icon={ShieldCheck} value={studentForm.bloodGroup} onChange={e => setStudentForm({ ...studentForm, bloodGroup: e.target.value })} dark={adminDark} />
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Assign Bus Route</label>
                  <select value={studentForm.assignedBus} onChange={e => setStudentForm({ ...studentForm, assignedBus: e.target.value })} className={`w-full p-5 rounded-2xl border-2 font-bold outline-none ${input}`} required>
                    <option value="">-- Select Vehicle --</option>
                    {buses.map(b => <option key={b._id} value={b._id}>{b.busNo} — {b.route}</option>)}
                  </select>
                </div>
                <button className="md:col-span-2 bg-amber-500 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-400 transition-all">Register Student</button>
              </form>
            </div>
          )}

          {/* STUDENT DIRECTORY */}
          {activeTab === 'student-list' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black italic uppercase">Student <span className="text-amber-500">Directory</span></h2>
                <div className="relative w-80">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" placeholder="Search students..." onChange={(e) => setStudentSearchQuery(e.target.value)} className={`w-full pl-14 pr-6 py-4 rounded-2xl border-2 font-bold outline-none ${input}`} />
                </div>
              </div>
              <div className={`rounded-[2.5rem] border overflow-hidden ${card}`}>
                <table className="w-full text-left">
                  <thead className={adminDark ? 'bg-slate-800/50' : 'bg-slate-100'}>
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500">Info</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500">Parent</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500">Bus</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-500/10">
                    {allStudents.map(s => (
                      <tr key={s._id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="p-6"><div className="font-bold">{s.name}</div><div className="text-[10px] opacity-50 uppercase font-black">Roll: {s.rollNumber} | {s.grade}</div></td>
                        <td className="p-6 text-sm font-medium">{s.parentName}</td>
                        <td className="p-6 text-xs font-bold text-amber-500">{s.assignedBus?.busNo || 'Not Assigned'}</td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openStudentEdit(s.parentId, s)} className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteStudent(s.parentId, s._id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BUS LIST */}
          {activeTab === 'bus-list' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black italic uppercase">
                  Fleet <span className="text-amber-500">Inventory</span>
                </h2>
                <div className="relative w-80">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search Bus No..."
                    onChange={(e) => setBusSearchQuery(e.target.value)}
                    className={`w-full pl-14 pr-6 py-4 rounded-2xl border-2 font-bold outline-none ${input}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBuses.map(bus => {
                  const passengers = allStudents.filter(s => s.assignedBus?._id === bus._id || s.assignedBus === bus._id);
                  const capacity = bus.capacity || 40;
                  const rate = (passengers.length / capacity) * 100;

                  // Logic to get names or show "Unassigned"
                  const driverName = bus.driver?.name || "Unassigned";
                  const assistantName = bus.assistant?.name || "Unassigned";

                  return (
                    <div key={bus._id} className={`p-8 rounded-[2.5rem] border-2 ${card} transition-all hover:border-amber-500 flex flex-col justify-between`}>
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="bg-amber-500 p-3 rounded-2xl text-slate-950"><Bus size={24} /></div>
                          <div className="text-right">
                            <p className="text-[10px] font-black opacity-50 uppercase">Occupancy</p>
                            <p className={`text-sm font-black ${rate > 90 ? 'text-red-500' : 'text-amber-500'}`}>
                              {passengers.length} / {capacity}
                            </p>
                          </div>
                        </div>

                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                          Bus <span className="text-amber-500">{bus.busNo}</span>
                        </h3>
                        <p className="text-[10px] font-black uppercase text-slate-500 mb-4">{bus.route}</p>

                        {/* STAFF SECTION ADDED HERE */}
                        <div className="grid grid-cols-2 gap-2 mb-6 border-y border-slate-500/10 py-4">
                          <div>
                            <p className="text-[8px] font-black uppercase text-slate-400">Driver</p>
                            <p className={`text-[11px] font-bold truncate ${bus.driver ? 'text-slate-200' : 'text-red-500/70 italic'}`}>
                              {driverName}
                            </p>
                          </div>
                          <div className="border-l border-slate-500/10 pl-3">
                            <p className="text-[8px] font-black uppercase text-slate-400">Assistant</p>
                            <p className={`text-[11px] font-bold truncate ${bus.assistant ? 'text-slate-200' : 'text-red-500/70 italic'}`}>
                              {assistantName}
                            </p>
                          </div>
                        </div>

                        <div className="w-full h-2.5 bg-slate-500/10 rounded-full mb-8 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${rate > 90 ? 'bg-red-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(rate, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-500/10">
                        <button
                          onClick={() => { setSelectedBus(bus); setShowModal('view-passengers'); }}
                          className="text-[10px] font-black uppercase text-blue-500 hover:underline flex items-center gap-1"
                        >
                          <Eye size={14} /> Passengers
                        </button>

                        <button
                          onClick={() => { setSelectedBus(bus); setShowModal('live-track'); }}
                          className="text-[10px] font-black uppercase text-amber-500 hover:underline flex items-center gap-1"
                        >
                          <Navigation size={14} /> Live Track
                        </button>

                        <div className="flex gap-2">
                          <button onClick={() => openBusEdit(bus)} className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteBus(bus._id)} className="p-2 rounded-xl bg-red-500/10 text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* USER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black italic uppercase">User <span className="text-blue-500">Directory</span></h2>
                <div className="relative w-80">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" placeholder="Search name/email..." onChange={(e) => setUserSearchQuery(e.target.value)} className={`w-full pl-14 pr-6 py-4 rounded-2xl border-2 font-bold outline-none ${input}`} />
                </div>
              </div>
              <div className={`rounded-[2.5rem] border overflow-hidden ${card}`}>
                <table className="w-full text-left">
                  <thead className={adminDark ? 'bg-slate-800/50' : 'bg-slate-100'}>
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500">Identity</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500">Role</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500">Assignment</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-500/10">
                    {filteredUsers.map(u => (
                      <tr key={u._id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="p-6"><div className="font-bold">{u.name}</div><div className="text-[10px] opacity-50 font-black uppercase">{u.email}</div></td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>{u.role}</span>
                        </td>
                        <td className="p-6">
                          {u.role === 'parent' ? (
                            <button onClick={() => { setViewingParent(u); setShowModal('view-students'); }} className="text-[10px] font-black text-blue-500 flex items-center gap-2">
                              <Eye size={12} /> {u.children?.length || 0} Students
                            </button>
                          ) : (u.assignedBus ? <span className="text-xs font-bold text-amber-500">{u.assignedBus?.busNo || 'Assigned'}</span> : <span className="opacity-20 italic text-xs">None</span>)}
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openUserEdit(u)} className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteUser(u._id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-500"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADD BUS TAB */}
          {activeTab === 'add-bus' && (
            <div className={`max-w-2xl mx-auto p-10 rounded-[2.5rem] border ${card}`}>
              <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter">New <span className="text-amber-500">Vehicle</span></h2>
              <form onSubmit={handleAddBus} className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <InputGroup label="Plate Number" icon={Hash} value={busForm.busNo} onChange={e => setBusForm({ ...busForm, busNo: e.target.value.toUpperCase() })} dark={adminDark} required />
                  <InputGroup label="Capacity" icon={Users} type="number" value={busForm.capacity} onChange={e => setBusForm({ ...busForm, capacity: e.target.value })} dark={adminDark} required />
                </div>
                <InputGroup label="Route Name" icon={Navigation} value={busForm.route} onChange={e => setBusForm({ ...busForm, route: e.target.value })} dark={adminDark} required />
                <button className="w-full bg-amber-500 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest">Register Fleet Unit</button>
              </form>
            </div>
          )}

          {/* ADD STAFF TAB */}
          {activeTab === 'add-staff' && (
            <div className={`max-w-3xl mx-auto p-10 rounded-[2.5rem] border ${card}`}>
              <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter text-blue-500">Staff <span className={adminDark ? 'text-white' : 'text-slate-900'}>Onboarding</span></h2>
              <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Name" icon={Users} value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} dark={adminDark} required />
                <InputGroup label="Email" icon={Mail} type="email" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} dark={adminDark} required />
                <InputGroup label="Mobile" icon={Phone} value={staffForm.mobileNo} onChange={e => setStaffForm({ ...staffForm, mobileNo: e.target.value })} dark={adminDark} required />
                <InputGroup label="Password" icon={Key} type="password" value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} dark={adminDark} required />
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Role</label>
                  <select value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })} className={`w-full p-5 rounded-2xl border-2 font-bold outline-none ${input}`}>
                    <option value="driver">Driver (Bus Captain)</option>
                    <option value="assistant">Assistant (Conductor)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <button className="md:col-span-2 bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest">Create Account</button>
              </form>
            </div>
          )}

          {/* LIVE TRACKING VIEW (When a bus card is clicked) */}
          {selectedBus && (
            <div className={`fixed inset-0 z- flex flex-col ${adminDark ? 'bg-slate-950' : 'bg-white'}`}>
              <div className="h-20 border-b flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedBus(null)} className="p-2 rounded-xl hover:bg-slate-500/10">
                    <X size={24} />
                  </button>
                  <h2 className="text-xl font-black italic uppercase">
                    Tracking Bus <span className="text-amber-500">{selectedBus.busNo}</span>
                  </h2>
                </div>
                <div className="flex gap-4 items-center">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase bg-green-500/10 text-green-500 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Signal
                  </span>
                </div>
              </div>

              <div className="flex-1 relative bg-slate-800">
                {/* MAP PLACEHOLDER - Replace with <MapContainer> if using Leaflet */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-black uppercase tracking-widest text-sm">
                  <div className="text-center">
                    <Navigation size={48} className="mx-auto mb-4 animate-bounce text-amber-500" />
                    Rendering Real-Time Map...<br />
                    <span className="text-xs opacity-50">
                      Coordinates: {selectedBus.currentLocation?.lat.toFixed(4)}, {selectedBus.currentLocation?.lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* INFO OVERLAY */}
                <div className={`absolute bottom-10 left-10 p-6 rounded-[2rem] border-2 shadow-2xl w-80 ${card}`}>
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Current Route</p>
                  <p className="font-bold mb-4">{selectedBus.route}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-500/5 rounded-xl">
                      <p className="text-[8px] font-black opacity-50 uppercase">Speed</p>
                      <p className="font-mono font-bold text-amber-500">42 km/h</p>
                    </div>
                    <div className="p-3 bg-slate-500/5 rounded-xl">
                      <p className="text-[8px] font-black opacity-50 uppercase">Next Stop</p>
                      <p className="font-bold text-xs truncate">Main Terminal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- MODALS SECTION --- */}

      {/* 1. PASSENGER LIST MODAL */}
      {showModal === 'view-passengers' && selectedBus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className={`w-full max-w-2xl p-8 rounded-[3rem] border-2 animate-in zoom-in-95 ${card}`}>
            <div className="flex justify-between items-center mb-8">
              <div><h3 className="text-2xl font-black italic uppercase tracking-tighter">Bus <span className="text-amber-500">{selectedBus.busNo}</span></h3><p className="text-[10px] font-black opacity-50 uppercase tracking-widest">Active Passengers</p></div>
              <button onClick={() => setShowModal(null)} className="p-3 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all"><X size={24} /></button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {allStudents.filter(s => s.assignedBus?._id === selectedBus._id || s.assignedBus === selectedBus._id).map((st, idx) => (
                <div key={st._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black">{idx + 1}</div>
                    <div><p className="font-bold">{st.name}</p><p className="text-[10px] opacity-50 font-black uppercase">{st.rollNumber} • {st.grade}</p></div>
                  </div>
                  <div className="text-right"><p className="text-[10px] font-black opacity-50 uppercase">Parent</p><p className="text-xs font-bold">{st.parentName}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. USER EDIT MODAL */}
      {showModal === 'user' && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-8 rounded-[2.5rem] border ${card}`}>
            <h2 className="text-xl font-black mb-6 uppercase italic tracking-tighter">Edit <span className="text-blue-500">User</span></h2>
            <form onSubmit={handleUpdateUser} className="space-y-5">
              <InputGroup label="Name" icon={Users} value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} dark={adminDark} />
              <InputGroup label="Email" icon={Mail} value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} dark={adminDark} />
              <InputGroup label="Mobile" icon={Phone} value={editingUser.mobileNo} onChange={e => setEditingUser({ ...editingUser, mobileNo: e.target.value })} dark={adminDark} />
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[10px]">Save User</button>
                <button type="button" onClick={() => setShowModal(null)} className="px-6 py-4 rounded-xl font-black uppercase text-[10px] opacity-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. STUDENT EDIT MODAL */}
      {showModal === 'student-edit' && editingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-8 rounded-[2.5rem] border ${card}`}>
            <h2 className="text-xl font-black mb-6 uppercase italic tracking-tighter">
              Edit <span className="text-amber-500">Student</span>
            </h2>
            <form onSubmit={handleUpdateStudent} className="space-y-5">
              <InputGroup
                label="Student Name"
                icon={Users}
                value={editingStudent.name || ''}
                onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                dark={adminDark}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputGroup
                  label="Grade"
                  icon={Navigation}
                  value={editingStudent.grade || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, grade: e.target.value })}
                  dark={adminDark}
                />
                <InputGroup
                  label="Blood Group"
                  icon={ShieldCheck}
                  value={editingStudent.bloodGroup || editingStudent.medicalInfo?.bloodGroup || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, bloodGroup: e.target.value })}
                  dark={adminDark}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Bus Assignment</label>
                <select
                  // This line ensures it stays synced even if assignedBus is an object or ID
                  value={editingStudent.assignedBus?._id || editingStudent.assignedBus || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, assignedBus: e.target.value })}
                  className={`w-full p-5 rounded-2xl border-2 font-bold outline-none ${input}`}
                >
                  <option value="">-- No Bus --</option>
                  {buses.map(b => (
                    <option key={b._id} value={b._id}>{b.busNo} — {b.route}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-amber-500 text-slate-950 py-4 rounded-xl font-black uppercase text-[10px]">
                  Save Changes
                </button>
                <button type="button" onClick={() => setShowModal(null)} className="px-6 py-4 rounded-xl font-black uppercase text-[10px] opacity-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 4. BUS EDIT MODAL */}
      {showModal === 'bus' && editingBus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg p-8 rounded-[2.5rem] border ${card}`}>
            <h2 className="text-xl font-black mb-6 uppercase italic tracking-tighter">Edit <span className="text-amber-500">Vehicle</span></h2>
            <form onSubmit={handleUpdateBus} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Plate No" icon={Hash} value={editingBus.busNo} onChange={e => setEditingBus({ ...editingBus, busNo: e.target.value })} dark={adminDark} />
                <InputGroup label="Capacity" icon={Users} type="number" value={editingBus.capacity} onChange={e => setEditingBus({ ...editingBus, capacity: e.target.value })} dark={adminDark} />
              </div>
              <InputGroup label="Route" icon={Navigation} value={editingBus.route} onChange={e => setEditingBus({ ...editingBus, route: e.target.value })} dark={adminDark} />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black uppercase opacity-50 ml-2">Driver</label>
                  <select value={editingBus.driver} onChange={e => setEditingBus({ ...editingBus, driver: e.target.value })} className={`w-full p-4 rounded-xl border-2 font-bold outline-none ${input}`}>
                    <option value="">Select Driver</option>
                    {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase opacity-50 ml-2">Assistant</label>
                  <select value={editingBus.assistant} onChange={e => setEditingBus({ ...editingBus, assistant: e.target.value })} className={`w-full p-4 rounded-xl border-2 font-bold outline-none ${input}`}>
                    <option value="">Select Assistant</option>
                    {assistants.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-amber-500 text-slate-950 py-4 rounded-xl font-black uppercase text-[10px]">Update Fleet</button>
                <button type="button" onClick={() => setShowModal(null)} className="px-6 py-4 rounded-xl font-black uppercase text-[10px] opacity-50">Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. VIEW STUDENTS (FOR PARENTS) */}
      {showModal === 'view-students' && viewingParent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg p-8 rounded-[2.5rem] border ${card}`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Students of <span className="text-blue-500">{viewingParent.name}</span></h2>
              <button onClick={() => setShowModal(null)} className="p-2 bg-slate-800 rounded-full hover:bg-red-500 transition-colors"><X size={20} className="text-white" /></button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {viewingParent.children?.map(child => (
                <div key={child._id} className={`p-5 rounded-2xl border flex justify-between items-center ${adminDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div><p className="font-black text-sm">{child.name}</p><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{child.grade} | {child.rollNumber}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => openStudentEdit(viewingParent._id, child)} className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><Edit2 size={14} /></button>
                    <button onClick={() => handleDeleteStudent(viewingParent._id, child._id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. LIVE MAP TRACKING MODAL */}
      {selectedBus && showModal === 'live-track' && (
       <div className="fixed inset-0 z- flex flex-col bg-slate-950 animate-in fade-in duration-300">
          {/* Tracking Header */}
          <div className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setSelectedBus(null); setShowModal(null); }}
                className="p-3 bg-slate-800 rounded-2xl hover:bg-amber-500 hover:text-slate-950 transition-all"
              >
                <X size={20} />
              </button>
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter">
                  Tracking <span className="text-amber-500">Bus {selectedBus.busNo}</span>
                </h2>
                <p className="text-[10px] font-black text-slate-500 uppercase">{selectedBus.route}</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-500 uppercase">Live Coordinates</p>
                <p className="font-mono text-xs text-amber-500">
                  {selectedBus.currentLocation?.lat.toFixed(5)}, {selectedBus.currentLocation?.lng.toFixed(5)}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-green-500/10 px-4 rounded-xl border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black text-green-500 uppercase">Active Signal</span>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 relative">
            <MapContainer
              center={[selectedBus.currentLocation?.lat || 11.7491, selectedBus.currentLocation?.lng || 75.4890]}
              zoom={16}
              className="h-full w-full"
              zoomControl={false}
            >
              <TileLayer
                url={adminDark
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                attribution='&copy; OpenStreetMap contributors'
              />

              {selectedBus.currentLocation && (
                <>
                  <Marker position={[selectedBus.currentLocation.lat, selectedBus.currentLocation.lng]} icon={busIcon}>
                    <Popup className="font-sans">
                      <div className="font-black uppercase text-xs">Bus {selectedBus.busNo}</div>
                      <div className="text-[10px] uppercase text-slate-500">{selectedBus.route}</div>
                    </Popup>
                  </Marker>
                  <RecenterMap coords={selectedBus.currentLocation} />
                </>
              )}
            </MapContainer>

            {/* Floating Info Overlay */}
            <div className="absolute top-6 left-6 z- w-72 space-y-4">
              <div className={`p-6 rounded-[2.5rem] border-2 shadow-2xl ${card}`}>
                <div className="flex justify-between items-end mb-4">
                  <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl"><Navigation size={20} /></div>
                  <div className="text-right">
                    <p className="text-[8px] font-black opacity-50 uppercase">Speed</p>
                    <h4 className="text-2xl font-black italic text-amber-500">45 <span className="text-[10px]">km/h</span></h4>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="opacity-40">Status</span>
                    <span className="text-green-500">On Schedule</span>
                  </div>
                  <div className="w-full h-1 bg-slate-500/10 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-amber-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className={`h-14 border-t flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ${adminDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
        System OS &copy; 2026 | Fleet Management Hub
      </footer>
    </div>
  );
}