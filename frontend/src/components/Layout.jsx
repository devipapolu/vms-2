import React from 'react';
import { Users, History, UserPlus, LogOut, Search, Bell, Calendar, Command } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Admin', role: 'Receptionist' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { icon: Users, label: 'Overview', path: '/dashboard' },
    { icon: UserPlus, label: 'Registration', path: '/register-visitor' },
    { icon: Calendar, label: 'Bookings', path: '/booking' },
    { icon: Bell, label: 'Status', path: '/status' },
    { icon: History, label: 'Audit Logs', path: '/logs' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Premium Sidebar */}
      <aside className="sidebar flex flex-col">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Command size={24} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">VMS<span className="text-indigo-500">.</span></span>
        </div>

        <nav className="flex-1 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button 
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-indigo-400' : 'group-hover:text-white'} />
                <span className="font-bold text-[0.95rem]">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_var(--primary-glow)]"></div>}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="main-content flex-1 flex flex-col">
        <header className="flex justify-between items-center mb-10">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search platform..." 
              className="input-field pl-12 w-[400px] border-white/5 focus:w-[450px]" 
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <p className="text-sm font-bold text-white tracking-tight">{user.name}</p>
              <p className="text-[0.7rem] text-indigo-400 font-black uppercase tracking-[0.1em]">{user.role}</p>
            </div>
            <div className="w-11 h-11 bg-gradient-to-tr from-gray-800 to-gray-700 rounded-2xl border border-white/10 flex items-center justify-center text-white font-bold shadow-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="animate-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
