import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const Booking = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    hostId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    purpose: '',
    source: 'CALL'
  });
  const [hosts, setHosts] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const res = await axios.get('/api/hosts');
        setHosts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHosts();
  }, []);

  useEffect(() => {
    if (formData.hostId && formData.date) {
      const fetchSlots = async () => {
        try {
          const res = await axios.get(`/api/bookings/slots?hostId=${formData.hostId}&date=${formData.date}`);
          setAvailableSlots(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchSlots();
    }
  }, [formData.hostId, formData.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/bookings/create', formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      setFormData({ ...formData, name: '', phone: '', time: '', purpose: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="glass-card">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <Calendar className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold">Appointment Booking (via Call)</h1>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-8 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            Booking confirmed! WhatsApp notifications sent to host and visitor.
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Visitor Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-600" />
                <input 
                  type="text" 
                  className="pl-10"
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-600" />
                <input 
                  type="tel" 
                  className="pl-10"
                  required 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Purpose</label>
              <input 
                type="text" 
                required 
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Select Host</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                required
                value={formData.hostId}
                onChange={(e) => setFormData({...formData, hostId: e.target.value})}
              >
                <option value="">Choose Host...</option>
                {hosts.map(h => <option key={h._id} value={h._id}>{h.name} ({h.department})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Meeting Date</label>
              <input 
                type="date" 
                required 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Select Slot</label>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setFormData({...formData, time: slot})}
                    className={`p-2 text-xs rounded-lg border transition-all ${
                      formData.time === slot 
                        ? 'bg-indigo-500 border-indigo-400 text-white' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Clock className="w-3 h-3 inline mr-1 mb-0.5" />
                    {slot}
                  </button>
                ))}
              </div>
              {availableSlots.length === 0 && formData.hostId && (
                <p className="text-xs text-red-400 mt-2">No slots available for this date.</p>
              )}
            </div>
          </div>

          <div className="md:col-span-2 pt-4">
            <button type="submit" className="btn-primary w-full py-4 text-lg">
              Confirm & Send Notifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;
