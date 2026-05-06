import React, { useEffect, useState } from 'react';
import { Users, History, Calendar, TrendingUp, Clock, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    tomorrowLoad: 0,
    peakHour: '--',
    highDemandTime: '--',
    slotsRemaining: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, roomsRes, statsRes] = await Promise.all([
          axios.get('/api/visitors/logs'),
          axios.get('/api/rooms'),
          axios.get('/api/stats/dashboard')
        ]);
        setLogs(logsRes.data);
        setRooms(roomsRes.data);
        setDashboardStats(statsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Active Visitors', value: logs.filter(l => l.status === 'pending' || l.status === 'approved').length, icon: Users, color: '#6366f1' },
    { label: 'Today\'s Total', value: logs.length, icon: Activity, color: '#10b981' },
    { label: 'Available Rooms', value: rooms.filter(r => r.status === 'available').length, icon: Clock, color: '#06b6d4' },
    { label: 'Peak Hour', value: dashboardStats.peakHour, icon: TrendingUp, color: '#ec4899' },
  ];

  return (
    <div className="space-y-10">
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-5xl font-black text-white mb-2 tracking-tight">Platform <span className="text-indigo-500">Overview</span></h1>
            <p className="text-gray-500 font-medium">Real-time premise surveillance and access management dashboard</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl px-5 py-2.5 text-left">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Tomorrow's Load</p>
                <p className="text-sm font-bold text-white">{dashboardStats.tomorrowLoad} Scheduled Visits</p>
             </div>
             <button onClick={() => navigate('/register-visitor')} className="btn-glow flex items-center gap-2">
                Register New Visitor <ArrowRight size={18} />
             </button>
          </div>
        </div>

        <div className="stat-grid">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
                <stat.icon size={28} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-[0.65rem] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 glass-panel overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <ShieldCheck className="text-indigo-500" size={22} />
              Recent Authorizations
            </h2>
            <button className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors" onClick={() => navigate('/logs')}>
              View History
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Host</th>
                  <th>Check-In</th>
                  <th className="text-right">Security Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? logs.slice(0, 5).map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div className="font-bold text-white text-[0.95rem]">{log.visitorName || log.visitorId?.name}</div>
                      <div className="text-xs text-gray-500 font-medium">{log.visitorId?.phone || log.phone || '999-888-7776'}</div>
                    </td>
                    <td>
                      <div className="text-sm font-bold text-gray-300">{log.hostId?.name}</div>
                      <div className="text-[0.65rem] text-indigo-500/80 font-black uppercase tracking-wider">{log.hostId?.department}</div>
                    </td>
                    <td className="text-sm text-gray-400 font-medium">
                      {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="text-right">
                      <span className={`badge ${
                        log.status === 'pending' ? 'badge-pending' : 'badge-success'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-24 text-center">
                      <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">No Active Visitors</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-8">
          <div className="glass-panel p-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border-indigo-500/20">
             <div className="flex items-center gap-3 mb-4">
                <Clock className="text-indigo-400" size={20} />
                <h3 className="text-lg font-bold text-white">Tomorrow's Availability</h3>
             </div>
             <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                <span className="text-white font-bold">{dashboardStats.highDemandTime}:</span> High Demand<br/>
                <span className="text-indigo-400 font-bold italic">{dashboardStats.slotsRemaining} slots remaining for walk-ins.</span>
             </p>
             <button onClick={() => navigate('/status')} className="w-full py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest border border-indigo-500/20 rounded-xl transition-all">
                View Full Calendar
             </button>
          </div>

          <div className="glass-panel p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <Calendar className="text-purple-500" size={20} />
              Meeting Room Status
            </h3>
            <div className="space-y-4">
              {rooms.length > 0 ? rooms.slice(0, 4).map(room => (
                <div key={room._id} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{room.name}</span>
                    <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${
                      room.status === 'available' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {room.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[0.7rem] text-gray-500 font-medium">{room.location}</p>
                </div>
              )) : (
                <p className="text-gray-500 text-sm text-center py-4">No rooms defined</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
