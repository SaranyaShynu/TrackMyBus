import React, { useState, useEffect } from 'react';
import { 
  Users, Bus, ShieldCheck, UserPlus, 
  Trash2, Plus, LayoutDashboard,
  Phone, Mail, Key, MapPin, AlertCircle,
  Settings, LogOut
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/AdminNavbar'; // Import your updated Navbar

export default function AdminPanel() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [staffForm, setStaffForm] = useState({
    name: '', email: '', password: '', mobileNo: '', role: 'driver', assignedBus: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [userRes, busRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/users', config),
        axios.get('http://localhost:5000/api/admin/buses', config)
      ]);
      setUsers(userRes.data);
      setBuses(busRes.data);
    } catch (err) {
      console.error("Data fetch error", err);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/admin/create-driver', staffForm, config);
      alert("Staff created successfully!");
      setStaffForm({ name: '', email: '', password: '', mobileNo: '', role: 'driver', assignedBus: '' });
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* 1. TOP NAVBAR */}
      <Navbar />

      <div className="flex pt-20"> {/* pt-20 accounts for Navbar height */}
        
        {/* 2. SIDEBAR */}
        <aside className={`w-72 fixed left-0 top-20 bottom-0 border-r transition-all duration-300 z-40 ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="p-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-8">Admin Menu</h3>
            <nav className="space-y-3">
              {[
                { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'staff', label: 'Add Staff', icon: UserPlus },
                { id: 'users', label: 'User List', icon: Users },
                { id: 'buses', label: 'Bus Fleet', icon: Bus },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${
                    activeTab === item.id 
                    ? 'bg-amber-500 text-slate-900 shadow-xl shadow-amber-500/30' 
                    : 'text-slate-500 hover:bg-slate-500/10'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-[11px] uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* 3. MAIN CONTENT */}
        <main className="flex-1 ml-72 p-12">
          
          {activeTab === 'overview' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
              <header>
                <h1 className="text-5xl font-black tracking-tighter uppercase italic">
                  Fleet <span className="text-amber-500">Control</span>
                </h1>
                <p className="text-slate-500 font-bold mt-2">Welcome back to the administrator hub.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard icon={Users} label="Users" value={users.length} color="blue" isDarkMode={isDarkMode} />
                <StatCard icon={ShieldCheck} label="Staff" value={users.filter(u => u.role !== 'parent').length} color="green" isDarkMode={isDarkMode} />
                <StatCard icon={Bus} label="Buses" value={buses.length} color="amber" isDarkMode={isDarkMode} />
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="max-w-4xl animate-in zoom-in-95">
              <h2 className="text-3xl font-black mb-10 italic uppercase">Manual <span className="text-amber-500">Staff Registration</span></h2>
              <form onSubmit={handleCreateStaff} className={`p-10 rounded-[3rem] border shadow-2xl ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputGroup label="Name" icon={Users} isDarkMode={isDarkMode} value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} required />
                  <InputGroup label="Phone" icon={Phone} isDarkMode={isDarkMode} value={staffForm.mobileNo} onChange={e => setStaffForm({...staffForm, mobileNo: e.target.value})} required />
                  <div className="md:col-span-2">
                    <InputGroup label="Email" icon={Mail} type="email" isDarkMode={isDarkMode} value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} required />
                  </div>
                  <InputGroup label="Password" icon={Key} type="password" isDarkMode={isDarkMode} value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} required />
                  
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Role</label>
                    <select value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} className={`p-4 rounded-2xl border-2 border-transparent outline-none focus:border-amber-500 font-bold ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <option value="driver">Driver</option>
                      <option value="assistant">Assistant</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Assign Bus</label>
                    <select required value={staffForm.assignedBus} onChange={e => setStaffForm({...staffForm, assignedBus: e.target.value})} className={`p-4 rounded-2xl border-2 border-transparent outline-none focus:border-amber-500 font-bold ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <option value="">-- Choose Bus --</option>
                      {buses.map(bus => (
                        <option key={bus._id} value={bus._id}>{bus.busNumber} | {bus.route}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button disabled={loading} className="w-full mt-10 bg-amber-500 text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl">
                  {loading ? "Processing..." : "Confirm & Create Account"}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-in fade-in duration-500">
               <h2 className="text-3xl font-black mb-10 italic uppercase">Directory <span className="text-amber-500">Lookup</span></h2>
               <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                 <table className="w-full text-left">
                   <thead className={isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}>
                     <tr>
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Member</th>
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Role</th>
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Contact</th>
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/10">
                     {users.map(u => (
                       <tr key={u._id} className="hover:bg-amber-500/5 transition-colors">
                         <td className="p-8 font-black">{u.name}</td>
                         <td className="p-8">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                             u.role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 
                             u.role === 'driver' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                           }`}>
                             {u.role}
                           </span>
                         </td>
                         <td className="p-8 text-sm text-slate-500 font-bold">{u.email}</td>
                         <td className="p-8 text-center">
                            <button onClick={() => handleDeleteUser(u._id)} className="p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"><Trash2 size={20}/></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// UI HELPERS
const StatCard = ({ icon: Icon, label, value, color, isDarkMode }) => (
  <div className={`p-8 rounded-[3rem] border flex items-center gap-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
    <div className={`p-6 rounded-3xl bg-${color}-500/10 text-${color}-500`}>
      <Icon size={36} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <h3 className="text-5xl font-black mt-1 tracking-tighter italic">{value}</h3>
    </div>
  </div>
);

const InputGroup = ({ label, icon: Icon, isDarkMode, ...props }) => (
  <div className="flex flex-col gap-3">
    <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors">
        <Icon size={22} />
      </div>
      <input {...props} className={`w-full pl-14 pr-6 py-5 rounded-[1.5rem] border-2 border-transparent outline-none transition-all font-bold ${isDarkMode ? 'bg-slate-800 focus:border-amber-500 text-white' : 'bg-slate-50 focus:border-amber-500 text-slate-900'}`} />
    </div>
  </div>
);