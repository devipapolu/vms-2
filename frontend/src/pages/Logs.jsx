import React, { useEffect, useState } from 'react';
import { FileText, Search, Filter, Download } from 'lucide-react';
import axios from 'axios';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/api/visitors/logs');
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.visitorId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.visitorId?.phone.includes(searchTerm)
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Visit History</h1>
          <p className="text-gray-400">Comprehensive logs of all visitor interactions</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-sm hover:bg-white/10">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            className="pl-12 m-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-3 bg-white/5 rounded-lg border border-white/10">
          <Filter className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4">Visitor Details</th>
              <th className="px-6 py-4">Host</th>
              <th className="px-6 py-4">Purpose</th>
              <th className="px-6 py-4">Check-In</th>
              <th className="px-6 py-4">Check-Out</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredLogs.map((log) => (
              <tr key={log._id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold">{log.visitorId?.name}</div>
                  <div className="text-xs text-indigo-400">{log.visitorId?.phone}</div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="font-medium text-gray-200">{log.hostId?.name}</div>
                  <div className="text-xs text-gray-500">{log.hostId?.department}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">{log.purpose}</td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(log.checkInTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {log.checkOutTime ? new Date(log.checkOutTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    log.status === 'completed' ? 'bg-indigo-500/20 text-indigo-400' :
                    log.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-green-500/20 text-green-500'
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">No records found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
