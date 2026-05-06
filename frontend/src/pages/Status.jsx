import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, UserX, RefreshCcw, Clock, CheckCircle2, XCircle, QrCode } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DEMO_HOSTS = [
  { _id: 'h1', name: 'MD Sir', department: 'Management', role: 'host' },
  { _id: 'h2', name: 'Senior Manager', department: 'Operations', role: 'host' },
  { _id: 'h3', name: 'HR Head', department: 'Human Resources', role: 'host' },
];

const DEMO_PENDING = [
  {
    _id: 'log1', visitorName: 'Ravi Kumar', purpose: 'Business Discussion',
    status: 'pending', checkInTime: new Date().toISOString(),
    hostId: { _id: 'h1', name: 'MD Sir', department: 'Management' }
  },
  {
    _id: 'log2', visitorName: 'Priya Sharma', purpose: 'Job Interview',
    status: 'pending', checkInTime: new Date().toISOString(),
    hostId: { _id: 'h3', name: 'HR Head', department: 'Human Resources' }
  }
];

const Status = () => {
  const [hosts, setHosts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [pendingVisitors, setPendingVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [generatedQR, setGeneratedQR] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState({}); // { logId: roomId }
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch hosts
      let hostsData = [];
      try {
        const res = await axios.get('/api/hosts');
        hostsData = await Promise.all(res.data.map(async (host) => {
          try {
            const statusRes = await axios.get(`/api/hosts/status/${host._id}`);
            return { ...host, liveStatus: statusRes.data.status, activeVisit: statusRes.data.activeVisit };
          } catch { return { ...host, liveStatus: 'ONLINE', activeVisit: null }; }
        }));
      } catch {
        hostsData = DEMO_HOSTS.map(h => ({ ...h, liveStatus: h._id === 'h1' ? 'BUSY' : 'ONLINE', activeVisit: null }));
      }
      setHosts(hostsData);

      // Fetch rooms
      try {
        const roomsRes = await axios.get('/api/rooms');
        setRooms(roomsRes.data);
      } catch {
        setRooms([
          { _id: 'r1', name: 'Conference Room A', status: 'available' },
          { _id: 'r2', name: 'Meeting Cabin 101', status: 'occupied' },
          { _id: 'r3', name: 'MD Cabin Private', status: 'available' },
        ]);
      }

      // Fetch visitors
      try {
        const logsRes = await axios.get('/api/visitors/logs');
        const pending = logsRes.data.filter(l => l.status === 'pending' || l.status === 'approved');
        setPendingVisitors(pending);
      } catch {
        setPendingVisitors(DEMO_PENDING);
      }
    } catch (err) {
      setHosts(DEMO_HOSTS.map(h => ({ ...h, liveStatus: 'ONLINE', activeVisit: null })));
      setPendingVisitors(DEMO_PENDING);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (logId, visitorName) => {
    const roomId = selectedRooms[logId];
    if (!roomId) {
      alert("Please select a meeting room first!");
      return;
    }

    const roomObj = rooms.find(r => r._id === roomId);
    setActionLoading(logId + '_approve');
    try {
      const res = await axios.post('/api/visitors/approve', { 
        logId, 
        roomId, 
        roomName: roomObj?.name 
      });
      setGeneratedQR({ logId, qrToken: res.data.qrToken, visitorName, roomName: roomObj?.name });
      await fetchData();
    } catch {
      const mockToken = `DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      setGeneratedQR({ logId, qrToken: mockToken, visitorName, roomName: roomObj?.name });
      setPendingVisitors(prev => prev.filter(v => v._id !== logId));
    }
    setActionLoading(null);
  };

  const handleReject = async (logId) => {
    setActionLoading(logId + '_reject');
    try {
      await axios.post('/api/visitors/reject', { logId });
      await fetchData();
    } catch {
      setPendingVisitors(prev => prev.filter(v => v._id !== logId));
    }
    setActionLoading(null);
  };

  const formatTime = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Host Availability</h1>
          <p className="text-gray-400 text-sm">Real-time status of MD and Senior Staff</p>
        </div>
        <button onClick={fetchData} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5">
          <RefreshCcw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Host Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hosts.map((host) => (
          <div key={host._id} className="glass-card flex flex-col items-center text-center relative overflow-hidden">
            {/* Status glow */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${host.liveStatus === 'ONLINE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mt-4 mb-3 ${
              host.liveStatus === 'ONLINE' ? 'bg-emerald-500/10 ring-2 ring-emerald-500/20' : 'bg-amber-500/10 ring-2 ring-amber-500/20'
            }`}>
              {host.liveStatus === 'ONLINE'
                ? <UserCheck className="w-8 h-8 text-emerald-400" />
                : <UserX className="w-8 h-8 text-amber-400" />
              }
            </div>

            <h2 className="text-lg font-bold text-white">{host.name}</h2>
            <p className="text-indigo-400 text-xs font-semibold mb-3">{host.department}</p>

            <div className={`px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 ${
              host.liveStatus === 'ONLINE'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${host.liveStatus === 'ONLINE' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              {host.liveStatus === 'ONLINE' ? 'Available' : 'In Meeting'}
            </div>
          </div>
        ))}

        {hosts.length === 0 && !loading && (
          <div className="col-span-3 text-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <ShieldCheck className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No hosts found in system</p>
          </div>
        )}
      </div>

      {/* Generated QR Alert */}
      {generatedQR && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <QrCode className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-400 font-bold">✅ Access Pass Generated for <span className="text-white">{generatedQR.visitorName}</span></p>
              <p className="text-gray-400 text-xs mt-0.5">QR Token: <span className="font-mono text-emerald-300">{generatedQR.qrToken?.substring(0, 20)}…</span></p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/visitor-pass/${generatedQR.qrToken}`)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-xl transition-all flex-shrink-0"
          >
            View QR Pass
          </button>
        </div>
      )}

      {/* Pending Visitors Queue */}
      <div>
        <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          Visitor Queue
          {pendingVisitors.length > 0 && (
            <span className="ml-2 px-2.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">
              {pendingVisitors.length} waiting
            </span>
          )}
        </h2>

        {pendingVisitors.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <CheckCircle2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No pending visitors</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingVisitors.map((visitor) => (
              <div key={visitor._id} className="glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 flex-shrink-0">
                    <span className="text-indigo-400 font-black text-sm">
                      {(visitor.visitorName || visitor.visitorId?.name || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-white">{visitor.visitorName || visitor.visitorId?.name || 'Unknown'}</p>
                    <p className="text-gray-500 text-xs">{visitor.purpose}</p>
                    <p className="text-indigo-400 text-xs mt-0.5">
                      → {visitor.hostId?.name || 'Unknown Host'} · {visitor.hostId?.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:ml-auto">
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(visitor.checkInTime)}
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                    visitor.status === 'approved'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  }`}>
                    {visitor.status.toUpperCase()}
                  </span>

                  {visitor.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {/* Room Selection */}
                      <select
                        value={selectedRooms[visitor._id] || ''}
                        onChange={(e) => setSelectedRooms({ ...selectedRooms, [visitor._id]: e.target.value })}
                        className="bg-white/5 border border-white/10 text-gray-300 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-indigo-500/50 transition-all min-w-[160px] [color-scheme:dark]"
                      >
                        <option value="" className="bg-[#1e293b] text-white">Select Meeting Room</option>
                        {rooms.map(room => (
                          <option key={room._id} value={room._id} disabled={room.status !== 'available'} className="bg-[#1e293b] text-white">
                            {room.name} ({room.status === 'available' ? 'Available' : 'Occupied'})
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(visitor._id, visitor.visitorName || visitor.visitorId?.name)}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20 transition-all disabled:opacity-50"
                        >
                          {actionLoading === visitor._id + '_approve'
                            ? <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                            : <CheckCircle2 className="w-3.5 h-3.5" />
                          }
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(visitor._id)}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 transition-all disabled:opacity-50"
                        >
                          {actionLoading === visitor._id + '_reject'
                            ? <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            : <XCircle className="w-3.5 h-3.5" />
                          }
                          Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {visitor.status === 'approved' && (
                    <button
                      onClick={() => navigate(`/visitor-pass/${visitor.qrToken}`)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 text-xs font-bold rounded-xl border border-indigo-500/20 transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      View Pass
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Status;
