import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, CheckCircle2, Facebook, Twitter, Hexagon } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState(''); // stores username or email
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#e8f7f5] font-sans overflow-x-auto p-4 relative">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#bcebe3] rounded-bl-full opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#dcf5f0] rounded-tr-full opacity-60 pointer-events-none"></div>

      <div className="w-[1000px] min-w-[1000px] bg-white rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] grid grid-cols-2 z-10 overflow-hidden relative" style={{ minHeight: '600px' }}>
        
        {/* Left Side: Illustration */}
        <div className="p-8 flex flex-col justify-center relative bg-white border-r border-gray-50 h-full">
          <div className="absolute top-8 left-8 flex items-center gap-2">
            <Hexagon className="text-[#3b82f6] fill-[#3b82f6]" size={28} />
            <span className="text-xl font-bold text-gray-800 tracking-tight">vmsapp</span>
          </div>
          <div className="w-full h-full flex flex-col items-center justify-center pt-16 pb-12">
            <img 
              src="/reception-illustration.png" 
              alt="Reception Illustration" 
              className="w-full max-w-[400px] object-contain"
              style={{ maxHeight: '350px' }}
            />
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-12 pr-16 flex flex-col justify-center bg-white h-full">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-3 font-sans">Welcome Back :)</h3>
            <p className="text-gray-500 text-xs leading-relaxed max-w-[320px]">
              To keep connected with us please login with your personal information by email address and password 🔔
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="relative bg-[#f8fafc] rounded-xl flex items-center border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
              <div className="pl-4 pr-3 text-gray-400">
                <Mail size={18} />
              </div>
              <div className="flex-1 py-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-0.5">Username or Email</label>
                <input 
                  type="text" 
                  placeholder="e.g. BT-123 or name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-gray-800 text-sm focus:outline-none placeholder-gray-300 font-medium"
                  required
                />
              </div>
              {email && (
                <div className="pr-4 text-green-500">
                  <CheckCircle2 size={18} />
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="relative bg-[#f8fafc] rounded-xl flex items-center border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
              <div className="pl-4 pr-3 text-gray-400">
                <Lock size={18} />
              </div>
              <div className="flex-1 py-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-0.5">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-gray-800 text-sm focus:outline-none placeholder-gray-300 font-medium"
                  required
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="w-4 h-4 rounded-full border-gray-300 appearance-none bg-[#f8fafc] border checked:bg-green-500 checked:border-transparent transition-all" 
                  />
                  {rememberMe && <CheckCircle2 size={12} className="absolute text-white pointer-events-none" />}
                </div>
                <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700 transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">Forgot Password?</button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-6 pt-4">
              <button type="submit" className="bg-[#3b82f6] hover:bg-blue-600 text-white py-3 px-8 rounded-full text-sm font-semibold shadow-md shadow-blue-500/20 transition-all">
                Login Now
              </button>
              <button type="button" className="text-gray-500 hover:text-gray-800 text-xs font-medium transition-colors">
                Create Account
              </button>
            </div>
          </form>

          {/* Social Login */}
          <div className="mt-8">
            <p className="text-[11px] text-gray-400 mb-3 font-medium uppercase tracking-wider">Or continue with</p>
            <div className="flex gap-3">
              <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-gray-300 hover:shadow-sm transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              <button className="w-8 h-8 rounded-full bg-[#1877f2] flex items-center justify-center text-white hover:bg-[#166fe5] shadow-sm transition-all">
                <Facebook size={14} className="fill-white" />
              </button>
              <button className="w-8 h-8 rounded-full bg-[#1da1f2] flex items-center justify-center text-white hover:bg-[#1a91da] shadow-sm transition-all">
                <Twitter size={14} className="fill-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

