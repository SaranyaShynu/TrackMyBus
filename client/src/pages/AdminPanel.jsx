import React, { useState, useEffect } from 'react';
import {
  Users, Bus, ShieldCheck, UserPlus, Edit2, Trash2, LayoutDashboard,
  School, Moon, Sun, LogOut, ChevronRight, Hash, Navigation, Mail, Phone, Key
} from 'lucide-react';
import axios from 'axios';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');

  // --- ISOLATED THEME: Does not affect other users ---
  const [adminDark, setAdminDark] = useState(() => {
    const saved = localStorage.getItem('admin-private-theme');
    return saved ? JSON.parse(saved) : true;
  });

  const [users, setUsers] = useState([]);
  const [buses, setBuses] = useState([]);
 // const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);

  // Form States
  const [busForm, setBusForm] = useState({ busNo: '', route: '', capacity: '', schoolBuilding: 'Building A' });
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', mobileNo: '', role: 'driver', assignedBus: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    localStorage.setItem('admin-private-theme', JSON.stringify(adminDark));
  }, [adminDark]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [uRes, bRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/all-users', config),
        axios.get('http://localhost:5000/api/admin/buses', config)
      ]);
      setUsers(uRes.data || []);
      setBuses(bRes.data || []);
    } catch (err) { console.error("Database sync error", err); }
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post('http://localhost:5000/api/admin/add-bus', busForm, config);

      alert(`Bus ${busForm.busNo} added to ${busForm.schoolBuilding}`);
      setBusForm({ busNo: '', route: '', schoolBuilding: 'Building A' });
      fetchData();
    } catch (err) {
      alert("Error adding bus. Check if Plate No is unique.");
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();

    if (!staffForm.assignedBus) {
      alert("Please assign a bus so the driver has a route and building!");
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/admin/create-driver', staffForm, config);

      alert(`Success! ${staffForm.name} is now assigned to the selected route.`);
      setStaffForm({ name: '', email: '', password: '', mobileNo: '', role: 'driver', assignedBus: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  }

 /* const openEditModal = (user) => {
    setEditingUser({
      id: user._id,
      name: user.name,
      assignedBus: user.assignedBus?._id || ''
    })
    setShowModal(true);
  }   */

  const openUserEdit = (user) => {
  setEditingUser({
    id: user._id,
    name: user.name,
    email: user.email,
    mobileNo: user.mobileNo,
    role: user.role,
    assignedBus: user.assignedBus?._id || ''
  });
  setShowModal('user');
};

const openBusEdit = (bus) => {
  setEditingBus({
    id: bus._id,
    busNo: bus.busNo,
    route: bus.route,
    schoolBuilding: bus.schoolBuilding
  });
  setShowModal('bus');
};

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/admin/user/${editingUser.id}`, editingUser, config);
      alert("Staff Details Updated");
      setShowModal(null);
      fetchData();
    } catch (err) {
      alert("Update failed");
    }
  }

  const handleUpdateBus = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/admin/bus/${editingBus.id}`, editingBus, config);
      alert("Bus Details Updated");
      setShowModal(null);
      fetchData();
    } catch (err) { alert("Update failed"); }
  };

  const handleDeleteUser = async (id) => {
    if(!window.confirm("Delete this user?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/admin/user/${id}`, config);
      fetchData();
    } catch (err) { alert("Delete failed"); }
  };

  // Theme logic
  const theme = adminDark ? "bg-slate-950 text-slate-200 border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200";
  const card = adminDark ? "bg-slate-900 border-slate-800 shadow-2xl" : "bg-white border-slate-200 shadow-sm";
  const input = adminDark ? "bg-slate-800 text-white border-transparent" : "bg-slate-100 text-slate-900 border-slate-200";

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme}`}>

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

      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside className={`w-72 border-r p-6 hidden lg:block ${adminDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="space-y-1.5">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'add-bus', label: 'Add New Bus', icon: Bus },
              { id: 'add-staff', label: 'Add Driver/Staff', icon: UserPlus },
              { id: 'users', label: 'User Directory', icon: Users },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:bg-slate-500/10'}`}>
                <div className="flex items-center gap-3"><item.icon size={18} /> {item.label}</div>
                {activeTab === item.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 p-10 overflow-y-auto">

          {/* DASHBOARD TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard label="Total Users" value={users.length} icon={Users} color="blue" dark={adminDark} />
              <StatCard label="Total Fleet" value={buses.length} icon={Bus} color="amber" dark={adminDark} />
              <StatCard label="Locations" value="02" icon={School} color="green" dark={adminDark} />
            </div>
          )}

          {/* ADD BUS TAB */}
          {activeTab === 'add-bus' && (
            <div className={`max-w-2xl mx-auto p-10 rounded-[2.5rem] border ${card}`}>
              <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter">Register <span className="text-amber-500">New Vehicle</span></h2>
              <form onSubmit={handleAddBus} className="space-y-5">
                <InputGroup label="Plate Number" icon={Hash} value={busForm.busNo} onChange={e => setBusForm({ ...busForm, busNo: e.target.value.toUpperCase() })} placeholder="XX-00-XX-0000" dark={adminDark} />
                <InputGroup label="Route Name" icon={Navigation} value={busForm.route} onChange={e => setBusForm({ ...busForm, route: e.target.value })} dark={adminDark} />
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Assigned Building</label>
                  <select value={busForm.schoolBuilding} onChange={e => setBusForm({ ...busForm, schoolBuilding: e.target.value })} className={`w-full p-5 rounded-2xl border-2 font-bold outline-none ${input}`}>
                    <option value="Building A">Main Campus (Building A)</option>
                    <option value="Building B">West Wing (Building B)</option>
                  </select>
                </div>
                <button className="w-full bg-amber-500 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-amber-500/20">Add Bus to Fleet</button>
              </form>
            </div>
          )}

          {/* ADD STAFF TAB */}
          {activeTab === 'add-staff' && (
            <div className={`max-w-3xl mx-auto p-10 rounded-[2.5rem] border ${card}`}>
              <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter text-blue-500">Staff <span className={adminDark ? 'text-white' : 'text-slate-900'}>Registration</span></h2>
              <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Full Name" icon={Users} value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} dark={adminDark} />
                <InputGroup label="Email" icon={Mail} value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} dark={adminDark} />
                <InputGroup label="Mobile" icon={Phone} value={staffForm.mobileNo} onChange={e => setStaffForm({ ...staffForm, mobileNo: e.target.value })} dark={adminDark} />
                <InputGroup label="Password" icon={Key} type="password" value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} dark={adminDark} />
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Assign Bus & Route</label>
                  <select
                    value={staffForm.assignedBus}
                    onChange={e => setStaffForm({ ...staffForm, assignedBus: e.target.value })}
                    className={`w-full p-5 rounded-2xl border-2 font-bold outline-none ${input}`}
                  >
                    <option value="">-- Select Bus (This sets the Route & Building) --</option>
                    {buses.map(b => (
                      <option key={b._id} value={b._id}>
                        {b.busNo} | Route: {b.route} | {b.schoolBuilding}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="md:col-span-2 bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">Create Staff Account</button>
              </form>
            </div>
          )}

          {/* USER DIRECTORY TAB */}
{activeTab === 'users' && (
  <div className={`rounded-[2.5rem] border overflow-hidden ${card}`}>
    <table className="w-full text-left border-collapse">
      <thead className={adminDark ? 'bg-slate-800/50' : 'bg-slate-100'}>
        <tr>
          <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Name / Email</th>
          <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Role</th>
          <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Assignment</th>
          <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-500/10">
        {users.map((u) => (
          <tr key={u._id} className="hover:bg-slate-500/5 transition-colors group">
            {/* User Info */}
            <td className="p-6">
              <div className="font-bold text-sm tracking-tight">{u.name}</div>
              <div className="text-[10px] opacity-50 uppercase font-black mt-0.5">{u.email}</div>
            </td>

            {/* Role Badge */}
            <td className="p-6">
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                u.role === 'admin' 
                ? 'bg-purple-500/10 text-purple-500' 
                : 'bg-blue-500/10 text-blue-500'
              }`}>
                {u.role}
              </span>
            </td>

            {/* Bus Assignment */}
            <td className="p-6">
              {u.assignedBus ? (
                <div className="flex flex-col">
                  <span className="font-bold text-xs">{u.assignedBus.busNo}</span>
                  <span className="text-[9px] opacity-40 uppercase font-bold">{u.assignedBus.schoolBuilding || 'Main'}</span>
                </div>
              ) : (
                <span className="text-[10px] font-black uppercase text-slate-500/40 italic">Not Assigned</span>
              )}
            </td>

            {/* Actions */}
            <td className="p-6">
              <div className="flex justify-end items-center gap-2">
                <button
                  onClick={() => openEditModal(u)}
                  className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-all duration-200 group-hover:scale-110"
                  title="Edit Assignment"
                >
                  <Edit2 size={16} />
                </button>
                
                <button 
                  onClick={() => handleDeleteUser(u._id)}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                  title="Delete User"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    
    {/* Empty State */}
    {users.length === 0 && (
      <div className="p-20 text-center">
        <Users className="mx-auto opacity-10 mb-4" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">No users found in database</p>
      </div>
    )}
  </div>
)}
        </main>
      </div>

      <footer className={`h-14 border-t flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ${adminDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
        System OS &copy; 2026 | Fleet Management Hub
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-8 rounded-[2rem] border ${adminDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'}`}>
            <h2 className="text-xl font-black mb-6 uppercase italic tracking-tighter">
              Assign Bus to <span className="text-amber-500">{editingUser.name}</span>
            </h2>

            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Select Vehicle</label>
                <select
                  value={editingUser.assignedBus}
                  onChange={e => setEditingUser({ ...editingUser, assignedBus: e.target.value })}
                  className={`w-full p-5 rounded-2xl border-2 font-bold outline-none ${adminDark ? 'bg-slate-800 border-transparent text-white' : 'bg-slate-100 border-slate-200'}`}
                >
                  <option value="">-- No Bus Assigned --</option>
                  {buses.map(b => (
                    <option key={b._id} value={b._id}>{b.busNo} ({b.schoolBuilding})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-amber-500 text-slate-950 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]">Save Changes</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] opacity-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
const StatCard = ({ label, value, icon: Icon, color, dark }) => (
  <div className={`p-8 rounded-[2.5rem] border flex items-center gap-6 ${dark ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-black' : 'bg-white border-slate-200 shadow-sm'}`}>
    <div className={`p-5 rounded-2xl bg-${color}-500/10 text-${color}-500`}><Icon size={28} /></div>
    <div>
      <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{label}</p>
      <h3 className="text-4xl font-black italic tracking-tighter">{value}</h3>
    </div>
  </div>
);

const InputGroup = ({ label, icon: Icon, dark, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{label}</label>
    <div className="relative">
      <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
      <input {...props} className={`w-full pl-14 pr-6 py-5 rounded-2xl border-2 font-bold transition-all focus:border-amber-500 outline-none ${dark ? 'bg-slate-800 border-transparent text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`} />
    </div>
  </div>
);