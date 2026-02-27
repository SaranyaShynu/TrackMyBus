import React, { useState, useEffect } from 'react';
import {
  Users, Bus, ShieldCheck, UserPlus, Edit2, Trash2, LayoutDashboard,
  School, Moon, Sun, LogOut, ChevronRight, Hash, Navigation, Mail, Phone, Key, Search, Eye, X, GraduationCap
} from 'lucide-react';
import axios from 'axios';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');

  // --- THEME ---
  const [adminDark, setAdminDark] = useState(() => {
    const saved = localStorage.getItem('admin-private-theme');
    return saved ? JSON.parse(saved) : true;
  });

  const [users, setUsers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editingBus, setEditingBus] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null); 
  const [viewingParent, setViewingParent] = useState(null); 
  const [showModal, setShowModal] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [liveFleet, setLiveFleet] = useState([]);

  // Search States
  const [busSearchQuery, setBusSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Form States
  const [busForm, setBusForm] = useState({ busNo: '', route: '', schoolBuilding: 'Building A', driver: '', assistant: '' });
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', mobileNo: '', role: 'driver' });
  const [studentForm, setStudentForm] = useState({ name: '', rollNumber: '', grade: '', parentEmail: '', assignedBus: '', bloodGroup: '' });

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

  // --- HANDLERS ---
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/admin/register', staffForm, config);
      alert(`${staffForm.role.toUpperCase()} ${staffForm.name} added successfully!`);
      setStaffForm({ name: '', email: '', password: '', mobileNo: '', role: 'driver' });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || "Staff registration failed"); }
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/admin/add-bus', busForm, config);
      alert(`Bus ${busForm.busNo} added.`);
      setBusForm({ busNo: '', route: '', schoolBuilding: 'Building A', driver: '', assistant: '' });
      fetchData();
    } catch (err) { alert("Error adding bus."); }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/admin/add-student', studentForm, config);
      alert(`Student ${studentForm.name} added!`);
      setStudentForm({ name: '', rollNumber: '', grade: '', parentEmail: '', assignedBus: '', bloodGroup: '' });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || "Failed to add student."); }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/admin/parent/${editingStudent.parentId}/student/${editingStudent._id}`, editingStudent, config);
      setShowModal(null);
      fetchData();
    } catch (err) { alert("Update failed."); }
  };

  const handleDeleteStudent = async (parentId, studentId) => {
    if (!window.confirm("Delete this student permanently?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/admin/parent/${parentId}/student/${studentId}`, config);
      fetchData();
    } catch (err) { alert("Delete failed"); }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Note: mapping 'id' to the backend expected param
      await axios.put(`http://localhost:5000/api/admin/user/${editingUser.id}`, editingUser, config);
      setShowModal(null);
      fetchData();
    } catch (err) { alert("Update failed."); }
  };

  const handleUpdateBus = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/admin/bus/${editingBus.id}`, editingBus, config);
      setShowModal(null);
      fetchData();
    } catch (err) { alert("Update failed"); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/user/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) { alert("Delete failed"); }
  };

  const handleDeleteBus = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/bus/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) { alert("Delete failed"); }
  };

  const openUserEdit = (user) => {
    setEditingUser({ 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      mobileNo: user.mobileNo, 
      role: user.role 
    });
    setShowModal('user');
  };

  const openBusEdit = (bus) => {
    setEditingBus({ 
      id: bus._id, 
      busNo: bus.busNo, 
      route: bus.route, 
      schoolBuilding: bus.schoolBuilding, 
      driver: bus.driver?._id || bus.driver || '', 
      assistant: bus.assistant?._id || bus.assistant || '' 
    });
    setShowModal('bus');
  };

  const openStudentEdit = (parent, student) => {
    setEditingStudent({ ...student, parentId: parent._id });
    setShowModal('student-edit');
  };

  // --- FILTERING ---
  const filteredBuses = buses.filter(b => b.busNo.toLowerCase().includes(busSearchQuery.toLowerCase()));
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase()));
  
  const drivers = users.filter(u => {if (u.role !== 'driver') return false;
    const isCurrentlyAssignedToThisBus = editingBus && u.assignedBus === editingBus.id;
  
  return !u.assignedBus || isCurrentlyAssignedToThisBus;
});
  const assistants = users.filter(u => {
  if (u.role !== 'assistant') return false;
  const isCurrentlyAssignedToThisBus = editingBus && u._id === editingBus.assistant;
  return !u.assignedBus || isCurrentlyAssignedToThisBus;
});

  const allStudents = users.filter(u => u.role === 'parent').flatMap(p => 
    (p.children || []).map(c => ({ ...c, parentName: p.name, parentId: p._id }))
  ).filter(s => s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()));

  // Styles
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

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`w-72 border-r p-6 hidden lg:block ${adminDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="space-y-1.5">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'add-student', label: 'Enroll Student', icon: School },
              { id: 'student-list', label: 'Student Directory', icon: GraduationCap },
              { id: 'add-bus', label: 'Add New Bus', icon: Bus },
              { id: 'bus-list', label: 'Bus Directory', icon: Navigation },
              { id: 'add-staff', label: 'Add Staff', icon: UserPlus },
              { id: 'users', label: 'User Directory', icon: Users },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-500/10'}`}>
                <div className="flex items-center gap-3"><item.icon size={18} /> {item.label}</div>
                {activeTab === item.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-10 overflow-y-auto">

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <StatCard label="Total Users" value={users.length} icon={Users} color="blue" dark={adminDark} />
              <StatCard label="Total Students" value={allStudents.length} icon={GraduationCap} color="purple" dark={adminDark} />
              <StatCard label="Total Fleet" value={buses.length} icon={Bus} color="amber" dark={adminDark} />
              <StatCard label="Locations" value="02" icon={School} color="green" dark={adminDark} />
            </div>
          )}

          {/* ADD STUDENT */}
          {activeTab === 'add-student' && (
            <div className={`max-w-3xl mx-auto p-10 rounded-[2.5rem] border ${card}`}>
              <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter text-amber-500">Student <span className={adminDark ? 'text-white' : 'text-slate-900'}>Enrollment</span></h2>
              <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InputGroup label="Parent Email" icon={Mail} value={studentForm.parentEmail} onChange={e => setStudentForm({ ...studentForm, parentEmail: e.target.value })} placeholder="Registered parent email..." dark={adminDark} />
                </div>
                <InputGroup label="Student Name" icon={Users} value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} dark={adminDark} />
                <InputGroup label="Roll Number" icon={Hash} value={studentForm.rollNumber} onChange={e => setStudentForm({ ...studentForm, rollNumber: e.target.value })} dark={adminDark} />
                <InputGroup label="Grade/Class" icon={Navigation} value={studentForm.grade} onChange={e => setStudentForm({ ...studentForm, grade: e.target.value })} dark={adminDark} />
                <InputGroup label="Blood Group" icon={ShieldCheck} value={studentForm.bloodGroup} onChange={e => setStudentForm({ ...studentForm, bloodGroup: e.target.value })} dark={adminDark} />
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Assign Bus & Route</label>
                  <select value={studentForm.assignedBus} onChange={e => setStudentForm({ ...studentForm, assignedBus: e.target.value })} className={`w-full p-5 rounded-2xl border-2 font-bold outline-none ${input}`} required>
                    <option value="">-- Select Vehicle & Route --</option>
                    {buses.map(b => <option key={b._id} value={b._id}>{b.busNo} — {b.route}</option>)}
                  </select>
                </div>
                <button className="md:col-span-2 bg-amber-500 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest">Register Student</button>
              </form>
            </div>
          )}

          {/* STUDENT DIRECTORY */}
          {activeTab === 'student-list' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black italic uppercase">Student <span className="text-amber-500">Directory</span></h2>
                <div className="relative w-80">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" placeholder="Search students..." value={studentSearchQuery} onChange={(e) => setStudentSearchQuery(e.target.value)} className={`w-full pl-14 pr-6 py-4 rounded-2xl border-2 font-bold outline-none ${input}`} />
                </div>
              </div>
              <div className={`rounded-[2.5rem] border overflow-hidden ${card}`}>
                <table className="w-full text-left">
                  <thead className={adminDark ? 'bg-slate-800/50' : 'bg-slate-100'}>
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500">Student Info</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500">Parent</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500">Bus / Route</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-500/10">
                    {allStudents.map(student => (
                      <tr key={student._id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="p-6">
                          <div className="font-bold">{student.name}</div>
                          <div className="text-[10px] opacity-50 uppercase font-black">Roll: {student.rollNumber} | Grade: {student.grade}</div>
                        </td>
                        <td className="p-6 text-sm font-medium">{student.parentName}</td>
                        <td className="p-6">
                           <div className="font-bold text-xs text-amber-500">{student.assignedBus?.busNo || 'Not Assigned'}</div>
                           <div className="text-[9px] opacity-50">{student.assignedBus?.route || 'No Route'}</div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openStudentEdit({_id: student.parentId}, student)} className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteStudent(student.parentId, student._id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-500"><Trash2 size={16} /></button>
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
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black italic uppercase">Fleet <span className="text-amber-500">Directory</span></h2>
                <div className="relative w-80">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" placeholder="Search buses..." value={busSearchQuery} onChange={(e) => setBusSearchQuery(e.target.value)} className={`w-full pl-14 pr-6 py-4 rounded-2xl border-2 font-bold outline-none ${input}`} />
                </div>
              </div>
              <div className={`rounded-[2.5rem] border overflow-hidden ${card}`}>
                <table className="w-full text-left">
                  <thead className={adminDark ? 'bg-slate-800/50' : 'bg-slate-100'}>
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Bus Details</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Assigned Crew</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-500/10">
                    {filteredBuses.map(bus => (
                      <tr key={bus._id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="p-6">
                          <div className="font-black italic text-amber-500">{bus.busNo}</div>
                          <div className="text-[10px] opacity-50 uppercase font-black">{bus.route} | {bus.schoolBuilding}</div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col gap-1">
                            <div className="text-[10px] font-bold">

                              <span className="text-blue-500 uppercase text-[8px]">Driver:</span> {bus.driver?.name || (typeof bus.driver === 'string' ? 'ID: '+bus.driver.substring(18) : 'Unassigned')}
                            </div>
                            <div className="text-[10px] font-bold">
                              <span className="text-purple-500 uppercase text-[8px]">Asst:</span> {bus.assistant?.name || (typeof bus.assistant === 'string' ? 'ID: '+bus.assistant.substring(18) : 'Unassigned')}
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openBusEdit(bus)} className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteBus(bus._id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-500"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADD BUS */}
          {activeTab === 'add-bus' && (
            <div className={`max-w-3xl mx-auto p-10 rounded-[2.5rem] border ${card}`}>
              <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter">New <span className="text-amber-500">Vehicle Assignment</span></h2>
              <form onSubmit={handleAddBus} className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <InputGroup label="Plate Number" icon={Hash} value={busForm.busNo} onChange={e => setBusForm({ ...busForm, busNo: e.target.value.toUpperCase() })} dark={adminDark} required />
                  <InputGroup label="Route Name" icon={Navigation} value={busForm.route} onChange={e => setBusForm({ ...busForm, route: e.target.value })} dark={adminDark} required />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Location</label>
                  <select value={busForm.schoolBuilding} onChange={e => setBusForm({ ...busForm, schoolBuilding: e.target.value })} className={`w-full p-5 rounded-2xl border-2 font-bold outline-none ${input}`}>
                    <option value="Building A">Main Campus (Building A)</option>
                    <option value="Building B">West Wing (Building B)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Assign Driver</label>
                    <select value={busForm.driver} onChange={e => setBusForm({ ...busForm, driver: e.target.value })} className={`w-full p-5 rounded-2xl border-2 font-bold outline-none ${input}`}>
                      <option value="">Select Driver</option>
                      {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Assign Assistant</label>
                    <select value={busForm.assistant} onChange={e => setBusForm({ ...busForm, assistant: e.target.value })} className={`w-full p-5 rounded-2xl border-2 font-bold outline-none ${input}`}>
                      <option value="">Select Assistant</option>
                      {assistants.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>

                <button className="w-full bg-amber-500 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest">Register & Assign Fleet Unit</button>
              </form>
            </div>
          )}

          {/* ADD STAFF */}
          {activeTab === 'add-staff' && (
            <div className={`max-w-3xl mx-auto p-10 rounded-[2.5rem] border ${card}`}>
              <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter text-blue-500">Staff <span className={adminDark ? 'text-white' : 'text-slate-900'}>Onboarding</span></h2>
              <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Full Name" icon={Users} value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} dark={adminDark} required />
                <InputGroup label="Email Address" icon={Mail} value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} dark={adminDark} type="email" required />
                <InputGroup label="Mobile Number" icon={Phone} value={staffForm.mobileNo} onChange={e => setStaffForm({ ...staffForm, mobileNo: e.target.value })} dark={adminDark} required />
                <InputGroup label="Access Password" icon={Key} value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} dark={adminDark} type="password" required />
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Designation Role</label>
                  <select value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })} className={`w-full p-5 rounded-2xl border-2 font-bold outline-none ${input}`}>
                    <option value="driver">Driver (Bus Captain)</option>
                    <option value="assistant">Assistant (Conductor)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <button className="md:col-span-2 bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest">Create Staff Account</button>
              </form>
            </div>
          )}

          {/* USER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">User <span className="text-blue-500">Directory</span></h2>
                <div className="relative w-80">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" placeholder="Search directory..." value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} className={`w-full pl-14 pr-6 py-4 rounded-2xl border-2 font-bold outline-none ${input}`} />
                </div>
              </div>
              <div className={`rounded-[2.5rem] border overflow-hidden ${card}`}>
                <table className="w-full text-left">
                  <thead className={adminDark ? 'bg-slate-800/50' : 'bg-slate-100'}>
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Identity</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Role</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Assignments</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-500/10">
                    {filteredUsers.map(u => (
                      <tr key={u._id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="p-6">
                          <div className="font-bold text-sm tracking-tight">{u.name}</div>
                          <div className="text-[10px] opacity-50 uppercase font-black">{u.email}</div>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : u.role === 'assistant' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-6">
                          {(u.role === 'driver' || u.role === 'assistant') ? (
                            u.assignedBus ? <span className="font-bold text-xs text-amber-500">{u.assignedBus.busNo || u.assignedBus}</span> : <span className="text-[10px] opacity-30 italic">No Bus</span>
                          ) : u.role === 'parent' ? (
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${u.children?.length > 0 ? 'bg-blue-500 text-white' : 'bg-slate-500/10 text-slate-500'}`}>
                                {u.children?.length || 0}
                              </div>
                              <button onClick={() => { setViewingParent(u); setShowModal('view-students'); }} className="flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase hover:underline">
                                <Eye size={12}/> View Students
                              </button>
                            </div>
                          ) : <span className="text-[10px] opacity-20">---</span>}
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
        </main>
      </div>

      {/* MODALS */}
      
      {/* 1. STUDENT EDIT MODAL */}
      {showModal === 'student-edit' && editingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-8 rounded-[2.5rem] border ${card}`}>
            <h2 className="text-xl font-black mb-6 uppercase italic tracking-tighter">Edit <span className="text-amber-500">Student</span></h2>
            <form onSubmit={handleUpdateStudent} className="space-y-5">
              <InputGroup label="Student Name" icon={Users} value={editingStudent.name} onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })} dark={adminDark} />
              <InputGroup label="Grade" icon={Navigation} value={editingStudent.grade} onChange={e => setEditingStudent({ ...editingStudent, grade: e.target.value })} dark={adminDark} />
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Change Bus Assignment</label>
                <select 
                  value={editingStudent.assignedBus?._id || editingStudent.assignedBus || ''} 
                  onChange={e => setEditingStudent({ ...editingStudent, assignedBus: e.target.value })} 
                  className={`w-full p-5 rounded-2xl border-2 font-bold outline-none ${input}`}
                >
                  <option value="">-- No Bus --</option>
                  {buses.map(b => <option key={b._id} value={b._id}>{b.busNo} — {b.route}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-amber-500 text-slate-950 py-4 rounded-xl font-black uppercase text-[10px]">Save Changes</button>
                <button type="button" onClick={() => setShowModal(null)} className="px-6 py-4 rounded-xl font-black uppercase text-[10px] opacity-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. BUS EDIT MODAL */}
      {showModal === 'bus' && editingBus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg p-8 rounded-[2.5rem] border ${card}`}>
            <h2 className="text-xl font-black mb-6 uppercase italic tracking-tighter">Edit <span className="text-amber-500">Vehicle</span></h2>
            <form onSubmit={handleUpdateBus} className="space-y-4">
              <InputGroup label="Plate No" icon={Hash} value={editingBus.busNo} onChange={e => setEditingBus({...editingBus, busNo: e.target.value})} dark={adminDark} />
              <InputGroup label="Route" icon={Navigation} value={editingBus.route} onChange={e => setEditingBus({...editingBus, route: e.target.value})} dark={adminDark} />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Driver</label>
                  <select value={editingBus.driver} onChange={e => setEditingBus({...editingBus, driver: e.target.value})} className={`w-full p-4 rounded-xl border-2 font-bold outline-none ${input}`}>
                    <option value="">Select Driver</option>
                    {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Assistant</label>
                  <select value={editingBus.assistant} onChange={e => setEditingBus({...editingBus, assistant: e.target.value})} className={`w-full p-4 rounded-xl border-2 font-bold outline-none ${input}`}>
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

      {/* 3. USER EDIT MODAL (New) */}
      {showModal === 'user' && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-8 rounded-[2.5rem] border ${card}`}>
            <h2 className="text-xl font-black mb-6 uppercase italic tracking-tighter">Edit <span className="text-blue-500">User</span></h2>
            <form onSubmit={handleUpdateUser} className="space-y-5">
              <InputGroup label="Name" icon={Users} value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} dark={adminDark} />
              <InputGroup label="Email" icon={Mail} value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} dark={adminDark} />
              <InputGroup label="Mobile" icon={Phone} value={editingUser.mobileNo} onChange={e => setEditingUser({ ...editingUser, mobileNo: e.target.value })} dark={adminDark} />
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">User Role</label>
                <select 
                  value={editingUser.role} 
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })} 
                  className={`w-full p-5 rounded-2xl border-2 font-bold outline-none ${input}`}
                >
                  <option value="driver">Driver</option>
                  <option value="assistant">Assistant</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[10px]">Save User</button>
                <button type="button" onClick={() => setShowModal(null)} className="px-6 py-4 rounded-xl font-black uppercase text-[10px] opacity-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. VIEW STUDENTS MODAL */}
      {showModal === 'view-students' && viewingParent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg p-8 rounded-[2.5rem] border ${card}`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Students of <span className="text-blue-500">{viewingParent.name}</span></h2>
              <button onClick={() => setShowModal(null)} className="p-2 bg-slate-800 rounded-full hover:bg-red-500 transition-colors"><X size={20} className="text-white"/></button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {viewingParent.children?.map(child => (
                <div key={child._id} className={`p-5 rounded-2xl border flex justify-between items-center ${adminDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <p className="font-black text-sm">{child.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{child.grade} | {child.rollNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openStudentEdit(viewingParent, child)} className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><Edit2 size={14}/></button>
                    <button onClick={() => handleDeleteStudent(viewingParent._id, child._id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className={`h-14 border-t flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ${adminDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
        System OS &copy; 2026 | Fleet Management Hub
      </footer>
    </div>
  );
}

// Sub-components
const StatCard = ({ label, value, icon: Icon, color, dark }) => (
  <div className={`p-8 rounded-[2.5rem] border flex items-center gap-6 ${dark ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'}`}>
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