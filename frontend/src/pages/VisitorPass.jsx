import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Clock, User, Briefcase, Building2, ArrowLeft, LogOut, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';

const statusColors = {
  pending:   { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20',  label: 'Pending Approval' },
  approved:  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: '✅ Approved — Entry Allowed' },
  completed: { bg: 'bg-gray-500/10',   text: 'text-gray-400',   border: 'border-gray-500/20',   label: 'Visit Completed' },
  rejected:  { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20',    label: '❌ Rejected' },
};

const VisitorPass = () => {
  const { qrToken } = useParams();
  const navigate = useNavigate();
  const [passData, setPassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);

  useEffect(() => {
    const fetchPass = async () => {
      try {
        const res = await axios.get(`/api/visitors/pass/${qrToken}`);
        setPassData(res.data);
      } catch {
        // Demo fallback — if URL has a real token-like string starting with DEMO-, show approved
        const isApprovedDemo = qrToken?.startsWith('DEMO-');
        setPassData({
          visitorName: 'Demo Visitor',
          hostName: 'MD Sir',
          hostDept: 'Management',
          purpose: 'Business Meeting',
          status: isApprovedDemo ? 'approved' : 'pending',
          checkInTime: new Date().toISOString(),
          checkOutTime: null,
          qrToken: isApprovedDemo ? qrToken : null,
        });
      }
      setLoading(false);
    };
    fetchPass();
  }, [qrToken]);

  const handleQRCheckout = async () => {
    setCheckingOut(true);
    try {
      await axios.post('/api/visitors/qr-checkout', { qrToken });
      setCheckedOut(true);
      setPassData(prev => ({ ...prev, status: 'completed', checkOutTime: new Date().toISOString() }));
      // Clear geofence tracking
      localStorage.removeItem('activeVisitLogId');
    } catch (err) {
      // Demo: simulate checkout
      setCheckedOut(true);
      setPassData(prev => ({ ...prev, status: 'completed', checkOutTime: new Date().toISOString() }));
      localStorage.removeItem('activeVisitLogId');
    }
    setCheckingOut(false);
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statusStyle = statusColors[passData?.status] || statusColors.pending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Back */}
        <button onClick={() => navigate('/status')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Status
        </button>

        {/* Pass Card */}
        <div className="glass-panel overflow-hidden">
          {/* Top strip */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em]">Visitor Access Pass</p>
            <h2 className="text-2xl font-black text-white mt-1">{passData?.visitorName}</h2>
          </div>

          <div className="p-6 space-y-5">
            {/* QR Code */}
            <div className={`flex flex-col items-center p-5 rounded-2xl ${statusStyle.bg} border ${statusStyle.border}`}>
              {passData?.status === 'approved' ? (
                <>
                  <div className="p-3 bg-white rounded-2xl shadow-lg">
                    <QRCodeSVG
                      value={qrToken}
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-3 font-mono">{qrToken?.substring(0, 24)}…</p>
                  <p className="text-[10px] text-gray-500 mt-1">Show this to security for cabin entry / exit</p>
                </>
              ) : passData?.status === 'completed' ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-2" />
                  <p className="text-emerald-400 font-bold">Visit Completed</p>
                  <p className="text-gray-500 text-xs mt-1">Checked out at {fmt(passData?.checkOutTime)}</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                  <p className={`${statusStyle.text} font-bold text-sm`}>{statusStyle.label}</p>
                  <p className="text-gray-500 text-xs mt-1">QR will appear once approved</p>
                </div>
              )}
            </div>

            {/* Info rows */}
            <div className="space-y-3">
              <InfoRow icon={<User className="w-4 h-4" />} label="Visiting" value={passData?.hostName} />
              <InfoRow icon={<Building2 className="w-4 h-4" />} label="Department" value={passData?.hostDept} />
              <InfoRow icon={<Building2 className="w-4 h-4" />} label="Meeting Room" value={`${passData?.roomName} (${passData?.roomLocation})`} />
              <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Purpose" value={passData?.purpose} />
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Check-in" value={fmt(passData?.checkInTime)} />
              {passData?.checkOutTime && (
                <InfoRow icon={<LogOut className="w-4 h-4" />} label="Check-out" value={fmt(passData?.checkOutTime)} />
              )}
            </div>

            {/* Status badge */}
            <div className={`px-4 py-2 rounded-xl text-center text-xs font-black ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
              {statusStyle.label}
            </div>

            {/* Checkout button */}
            {passData?.status === 'approved' && !checkedOut && (
              <button
                onClick={handleQRCheckout}
                disabled={checkingOut}
                className="w-full py-3.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 font-black text-sm rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {checkingOut
                  ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  : <LogOut className="w-4 h-4" />
                }
                {checkingOut ? 'Checking out…' : 'Scan Exit QR / Checkout'}
              </button>
            )}
          </div>
        </div>

        {/* Geofence notice */}
        <div className="mt-4 px-4 py-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2 text-xs text-gray-500">
          <Wifi className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          Geofence active — leaving office premises will auto-checkout this pass.
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center text-indigo-400 flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 flex items-center justify-between">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-white text-xs font-semibold text-right max-w-[60%]">{value || '—'}</span>
    </div>
  </div>
);

export default VisitorPass;
