import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { shortenHash } from '../utils/hashUtils';
import { ShieldCheck, Lock, LogOut, UserCheck, Plus, RefreshCw, ChevronDown, BookOpen, Key, Users } from 'lucide-react';

export default function Navbar({ onOpenCreateModal, onOpenLoginModal, onOpenGuidelines }) {
  const { currentUserObj, isLoggedIn, logout, userAddress, resetDemo, accountRole } = useWeb3();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* RentSecure Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl tracking-tight text-white">RentSecure</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Escrow Standard
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Smart Security Deposits & Multi-Tenant Lease Escrow
            </p>
          </div>
        </div>

        {/* Action Controls & User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Security Guidelines Button */}
          <button
            onClick={onOpenGuidelines}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Guidelines & Safety</span>
          </button>

          {/* Create Agreement Action for Landlord */}
          {accountRole === 'landlord' && (
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Lease
            </button>
          )}

          {/* Active Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 p-1.5 pr-3 rounded-2xl border border-slate-800 transition"
            >
              <img
                src={currentUserObj.avatar}
                alt={currentUserObj.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-700"
              />
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  {currentUserObj.name}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {currentUserObj.badge}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
                <div className="p-3 border-b border-slate-800">
                  <p className="text-xs font-bold text-white">{currentUserObj.name}</p>
                  <p className="text-[11px] text-slate-400">{currentUserObj.email}</p>
                  <p className="text-[10px] font-mono text-emerald-400 mt-1">{shortenHash(userAddress)}</p>
                </div>

                <button
                  onClick={() => { setShowProfileMenu(false); onOpenLoginModal(); }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Switch / Register Role
                </button>

                <button
                  onClick={() => { setShowProfileMenu(false); resetDemo(); }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400" /> Reset Demo Baseline
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
