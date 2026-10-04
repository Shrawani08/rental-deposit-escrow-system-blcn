import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ShieldCheck, Home, Key, Scale, Wallet, ArrowRight, CheckCircle2, Lock, UserPlus, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const { usersList, loginWithPassword, loginAsRole, connectMetaMask, registerUser } = useWeb3();
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'login' | 'register'
  
  // Login Form state
  const [loginEmail, setLoginEmail] = useState('sarah@gmail.com');
  const [loginPassword, setLoginPassword] = useState('Password123!');
  const [loginError, setLoginError] = useState('');

  // Register Form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('tenant');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''));
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  // Password Strength Criteria Evaluation
  const hasMinLen = regPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(regPassword);
  const hasLower = /[a-z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(regPassword);
  
  const strengthScore = [hasMinLen, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const handlePasswordLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const res = loginWithPassword(loginEmail, loginPassword);
    if (res.success) {
      onClose();
    } else {
      setLoginError(res.message);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (strengthScore < 4) {
      alert("Password must satisfy at least 4 security guidelines!");
      return;
    }

    const newUser = registerUser({
      name: regName,
      email: regEmail,
      role: regRole,
      password: regPassword,
      address: regAddress
    });

    loginAsRole(newUser.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" /> RentSecure Smart Escrow Authentication
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Account Portal & Role Management
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Log in with secure password credentials or select a registered Landlord / Renter account
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'quick' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Profiles Directory
          </button>

          <button
            onClick={() => setActiveTab('login')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'login' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Secure Password Login
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'register' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            + Register New Role
          </button>
        </div>

        {/* TAB 1: QUICK PROFILES DIRECTORY */}
        {activeTab === 'quick' && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
              Available Landlord & Tenant User Profiles
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {usersList.map((user) => (
                <button
                  key={user.id}
                  onClick={() => { loginAsRole(user.id); onClose(); }}
                  className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 transition-all text-left flex items-center space-x-3 group"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {user.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{user.roleTitle}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Password: Password123!</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SECURE PASSWORD LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4 max-w-md mx-auto">
            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address / Username
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition"
            >
              Sign In to RentSecure Portal
            </button>
          </form>
        )}

        {/* TAB 3: REGISTER NEW ROLE & SECURE PASSWORD GUIDELINES */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 max-w-md mx-auto">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Account Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="tenant">Tenant / Renter</option>
                  <option value="landlord">Landlord / Property Owner</option>
                  <option value="arbitrator">Arbitrator Officer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="user@domain.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Password Field & Strength Indicator */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Set Secure Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />

              {/* Password Guidelines Meter */}
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Password Security Strength:</span>
                  <span className={strengthScore >= 4 ? 'text-emerald-400' : 'text-amber-400'}>
                    {strengthScore === 5 ? 'Strong (5/5)' : strengthScore >= 3 ? 'Medium (' + strengthScore + '/5)' : 'Weak (' + strengthScore + '/5)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-slate-400">
                  <span className={hasMinLen ? 'text-emerald-400 font-semibold' : ''}>✓ At least 8 chars</span>
                  <span className={hasUpper ? 'text-emerald-400 font-semibold' : ''}>✓ Uppercase [A-Z]</span>
                  <span className={hasLower ? 'text-emerald-400 font-semibold' : ''}>✓ Lowercase [a-z]</span>
                  <span className={hasNumber ? 'text-emerald-400 font-semibold' : ''}>✓ Number [0-9]</span>
                  <span className={hasSpecial ? 'text-emerald-400 font-semibold' : ''}>✓ Symbol (!@#$)</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition"
            >
              Create Account & Register Role
            </button>
          </form>
        )}

        {/* Footer MetaMask Connect */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Need Web3 hardware login?</span>
          <button
            onClick={() => { connectMetaMask(); onClose(); }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" /> MetaMask Login
          </button>
        </div>

      </div>
    </div>
  );
}
