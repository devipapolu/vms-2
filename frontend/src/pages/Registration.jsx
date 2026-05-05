import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, User, ScanFace, CheckCircle, AlertCircle, Clock, ArrowRight, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    purpose: '',
    hostId: ''
  });
  const [hosts, setHosts] = useState([]);
  const [hostStatus, setHostStatus] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

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

  const handleHostChange = async (e) => {
    const hostId = e.target.value;
    setFormData({ ...formData, hostId });
    if (hostId) {
      try {
        const res = await axios.get(`/api/hosts/status/${hostId}`);
        setHostStatus(res.data.status);
      } catch (err) {
        console.error(err);
      }
    } else {
      setHostStatus(null);
    }
  };

  const startCamera = async () => {
    setIsCapturing(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const captureAndVerify = async () => {
    setIsVerifying(true);
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 320, 240);
    
    // Stop camera
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    setIsCapturing(false);

    // AI Verification Flow (Simulated)
    setTimeout(() => {
      const isMatch = Math.random() > 0.7;
      if (isMatch) {
        setMatchResult('MATCH');
        setFormData(prev => ({ ...prev, name: 'John Doe (Verified)', phone: '9876543210' }));
      } else {
        setMatchResult('NEW');
      }
      setIsVerifying(false);
    }, 1500);
  };

  const [submitted, setSubmitted] = useState(null); // { visitorName, hostName, logId }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/visitors/register', formData);
      const logId = res.data.visitLog._id;
      localStorage.setItem('activeVisitLogId', logId);
      const hostName = hosts.find(h => h._id === formData.hostId)?.name || 'Host';
      setSubmitted({ visitorName: formData.name, hostName, logId });
    } catch (err) {
      // Demo fallback (no MongoDB)
      const hostName = hosts.find(h => h._id === formData.hostId)?.name || 'MD Sir';
      setSubmitted({ visitorName: formData.name, hostName, logId: 'demo-' + Date.now() });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto">

      {/* ── PENDING CONFIRMATION SCREEN ─────────────────────────────── */}
      {submitted && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="glass-panel p-12 max-w-lg w-full relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10"></div>

            {/* Icon */}
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
              <Clock size={36} className="text-amber-400" />
            </div>

            <h2 className="text-2xl font-black text-white mb-2">Request Submitted</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              <span className="text-white font-semibold">{submitted.visitorName}</span>'s visit request has been sent to{' '}
              <span className="text-indigo-400 font-semibold">{submitted.hostName}</span>.
            </p>

            {/* Status box */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-6 py-4 mb-6 text-left space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                PENDING HOST APPROVAL
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                QR Access Pass will be generated <span className="text-white font-semibold">only after the host approves</span> this request.
                If rejected, no QR pass will be issued.
              </p>
            </div>

            {/* Flow visual */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-8">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400">Registered ✓</span>
              <span className="text-gray-700">→</span>
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 animate-pulse">Awaiting Approval</span>
              <span className="text-gray-700">→</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-600">QR Pass</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/status')}
                className="flex-1 btn-glow py-3.5 text-xs font-black uppercase tracking-widest"
              >
                Check Status / Approve
              </button>
              <button
                onClick={() => { setSubmitted(null); setFormData({ name:'', phone:'', email:'', purpose:'', hostId:'' }); setMatchResult(null); }}
                className="px-5 py-3.5 bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold rounded-xl border border-white/5 transition-all"
              >
                New Visitor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN FORM ──────────────────────────────────────────────────── */}
      {!submitted && (
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-4">
          <UserPlus size={40} className="text-indigo-500" />
          Visitor <span className="text-indigo-500">Identity Panel</span>
        </h1>
        <p className="text-gray-500 font-medium">Neural face processing and digital check-in terminal</p>
      </div>
      )}

      {!submitted && (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Face Scan Area */}
        <div className="lg:col-span-2 glass-panel p-8 flex flex-col items-center">
          <div className="w-full aspect-square bg-gray-950 rounded-[2.5rem] overflow-hidden border-2 border-dashed border-white/5 relative flex items-center justify-center">
            {isCapturing ? (
              <video ref={videoRef} autoPlay className="w-full h-full object-cover scale-x-[-1]" />
            ) : (
              <canvas ref={canvasRef} width="320" height="240" className={`w-full h-full object-cover ${!matchResult ? 'hidden' : ''}`} />
            )}
            
            {!isCapturing && !matchResult && (
              <div className="text-center p-10">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ScanFace size={40} className="text-gray-700" />
                </div>
                <p className="text-gray-600 font-black uppercase tracking-[0.2em] text-xs">Neural Scan Pending</p>
              </div>
            )}

            {isVerifying && (
              <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-indigo-400 font-black uppercase tracking-[0.2em] text-xs animate-pulse">Analyzing Biometrics...</p>
              </div>
            )}

            {matchResult && (
              <div className={`absolute top-6 right-6 px-4 py-2 rounded-full text-[0.65rem] font-black tracking-widest uppercase flex items-center gap-2 z-10 ${
                matchResult === 'MATCH' ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'
              }`}>
                {matchResult === 'MATCH' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {matchResult === 'MATCH' ? 'Match Identified' : 'New Identity'}
              </div>
            )}
            
            {/* Corner Deco */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-500/50"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-500/50"></div>
          </div>

          <div className="mt-8 w-full">
            {!isCapturing ? (
              <button type="button" onClick={startCamera} className="btn-glow w-full py-4 text-xs uppercase font-black tracking-[0.15em] flex items-center justify-center gap-3">
                <Camera size={18} /> Initialize Scanner
              </button>
            ) : (
              <button type="button" onClick={captureAndVerify} className="btn-glow w-full py-4 bg-indigo-600 text-xs uppercase font-black tracking-[0.15em] flex items-center justify-center gap-3">
                <ScanFace size={18} /> Capture Frame
              </button>
            )}
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-3 glass-panel p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[0.65rem] font-black text-gray-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field pl-12"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[0.65rem] font-black text-gray-500 uppercase tracking-widest ml-1">Primary Contact</label>
                <input 
                  type="tel" 
                  required 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="input-field"
                  placeholder="+91 00000 00000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[0.65rem] font-black text-gray-500 uppercase tracking-widest ml-1">Visit Justification</label>
              <textarea 
                required 
                rows="3"
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                className="input-field resize-none"
                placeholder="Brief description of your visit purpose..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[0.65rem] font-black text-gray-500 uppercase tracking-widest ml-1">Authorized Host</label>
                <select 
                  className="input-field cursor-pointer"
                  required
                  value={formData.hostId}
                  onChange={handleHostChange}
                >
                  <option value="" disabled className="bg-gray-950">Select Host Officer...</option>
                  {hosts.map(h => <option key={h._id} value={h._id} className="bg-gray-950">{h.name} • {h.department}</option>)}
                </select>
              </div>
              
              {hostStatus && (
                <div className={`p-3.5 rounded-2xl flex items-center gap-3 border ${
                  hostStatus === 'ONLINE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${hostStatus === 'ONLINE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  <span className="text-[0.65rem] font-black uppercase tracking-[0.1em]">Host Status: {hostStatus}</span>
                </div>
              )}
            </div>

            <button type="submit" className="btn-glow w-full py-5 text-sm uppercase font-black tracking-widest flex items-center justify-center gap-3 mt-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
              Confirm Identity & Check-In <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
      )} {/* end !submitted */}
    </div>
  );
};

export default Registration;
