import React, { useState, useEffect } from 'react';
import { 
  Users, Bus, ShieldCheck, UserPlus, 
  Trash2, Plus, LogOut, LayoutDashboard,
  Phone, Mail, Key
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function AdminPanel() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [driverForm, setDriverForm] = useState({
    name: '', email: '', password: '', mobileNo: '', assignedBus: '', role: 'driver'
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [userRes, busRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/users', config),
        axios.get('http://localhost:5000/api/admin/buses', config) // Ensure you have this route
      ]);
      setUsers(userRes.data);
      setBuses(busRes.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/admin/create-driver', driverForm, config);
      alert("Staff Member Created Successfully!");
      setDriverForm({ name: '', email: '', password: '', mobileNo: '', assignedBus: '', role: 'driver' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating driver");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) { alert("Delete failed"); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar */}
      <aside className={`w-64 border-r p-6 flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <Bus className="text-amber-500" size={30} />
            <h1 className="text-xl font-black tracking-tighter">ADMIN HUB</h1>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'staff', label: 'Manage Staff', icon: UserPlus },
              { id: 'buses', label: 'Buses', icon: Bus },
              { id: 'users', label: 'All Users', icon: Users },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === item.id 
                  ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' 
                  : 'hover:bg-slate-800/10'
                }`}
              >
                <item.icon size={20} /> {item.label}
              </button>
            ))}
          </nav>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <header>
              <h2 className="text-3xl font-black">System Overview</h2>
              <p className="text-slate-500">Real-time stats of your transport fleet.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard icon={Users} label="Total Users" value={users.length} color="blue" isDarkMode={isDarkMode} />
              <StatCard icon={ShieldCheck} label="Drivers" value={users.filter(u => u.role === 'driver').length} color="green" isDarkMode={isDarkMode} />
              <StatCard icon={Bus} label="Active Buses" value={buses.length} color="amber" isDarkMode={isDarkMode} />
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-black mb-6">Register New Staff</h2>
            <form onSubmit={handleCreateDriver} className={`p-8 rounded-[2rem] shadow-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Full Name" icon={Users} value={driverForm.name} 
                  onChange={e => setDriverForm({...driverForm, name: e.target.value})} isDarkMode={isDarkMode} />
                <InputGroup label="Mobile Number" icon={Phone} value={driverForm.mobileNo}
                  onChange={e => setDriverForm({...driverForm, mobileNo: e.target.value})} isDarkMode={isDarkMode} />
                <div className="col-span-2">
                  <InputGroup label="Email Address" icon={Mail} type="email" value={driverForm.email}
                    onChange={e => setDriverForm({...driverForm, email: e.target.value})} isDarkMode={isDarkMode} />
                </div>
                <InputGroup label="Set Password" icon={Key} type="password" value={driverForm.password}
                  onChange={e => setDriverForm({...driverForm, password: e.target.value})} isDarkMode={isDarkMode} />
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase text-slate-500 ml-2">Assign Bus</label>
                  <select 
                    className={`p-4 rounded-2xl outline-none border-2 border-transparent focus:border-amber-500 font-bold ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
                    value={driverForm.assignedBus}
                    onChange={e => setDriverForm({...driverForm, assignedBus: e.target.value})}
                  >
                    <option value="">No Bus Assigned</option>
                    {buses.map(bus => (
                      <option key={bus._id} value={bus._id}>{bus.busNumber} - {bus.route}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button disabled={loading} className="w-full mt-8 bg-amber-500 text-slate-900 py-4 rounded-2xl font-black hover:bg-amber-400 transition-all shadow-lg active:scale-95">
                {loading ? "Processing..." : "Register Staff Member"}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
             <h2 className="text-3xl font-black">User Directory</h2>
             <div className={`rounded-[2rem] border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
               <table className="w-full text-left">
                 <thead className={isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}>
                   <tr>
                     <th className="p-5">User</th>
                     <th className="p-5">Role</th>
                     <th className="p-5">Contact</th>
                     <th className="p-5">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800/10">
                   {users.map(u => (
                     <tr key={u._id} className="hover:bg-slate-500/5 transition-colors">
                       <td className="p-5 font-bold">{u.name}</td>
                       <td className="p-5">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                           u.role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 
                           u.role === 'driver' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                         }`}>
                           {u.role}
                         </span>
                       </td>
                       <td className="p-5 text-slate-500 text-sm">{u.email}</td>
                       <td className="p-5">
                         <button onClick={() => deleteUser(u._id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all">
                           <Trash2 size={18} />
                         </button>
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
  );
}

// Sub-components for cleaner code
const StatCard = ({ icon: Icon, label, value, color, isDarkMode }) => (
  <div className={`p-6 rounded-[2rem] border flex items-center gap-5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
    <div className={`p-4 rounded-2xl bg-${color}-500/10 text-${color}-500`}>
      <Icon size={30} />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-black">{value}</h3>
    </div>
  </div>
);

const InputGroup = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-black uppercase text-slate-500 ml-2">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-4 top-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
      <input {...props} className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent focus:border-amber-500 outline-none transition-all font-bold ${props.isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`} />
    </div>
  </div>
);