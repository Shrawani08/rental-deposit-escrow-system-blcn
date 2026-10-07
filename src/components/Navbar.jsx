import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { shortenHash } from '../utils/hashUtils';
import { ShieldCheck, Plus, BookOpen, Wallet, Wifi, FileCode2 } from 'lucide-react';

export default function Navbar({ onOpenCreateModal, onOpenGuidelines }) {
  const { userAddress, accountRole, walletState, contractAddress, connectMetaMask } = useWeb3();
  const isSepolia = walletState.chainId === 11155111;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl tracking-tight text-white">RentSecure</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Sepolia DApp
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Smart Security Deposits & Multi-Tenant Lease Escrow</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button onClick={onOpenGuidelines} className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Guidelines & Safety</span>
          </button>

          {userAddress && (
            <button onClick={onOpenCreateModal} className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Create Lease
            </button>
          )}

          <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-[10px] font-bold uppercase tracking-wider">
            <Wifi className={`w-3.5 h-3.5 ${isSepolia ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span className={isSepolia ? 'text-emerald-400' : 'text-rose-400'}>{isSepolia ? 'Sepolia' : 'Wrong network'}</span>
          </div>

          <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-[10px] font-mono text-slate-400" title={contractAddress}>
            <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
            {shortenHash(contractAddress || 'Contract not configured')}
          </div>

          {userAddress ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline text-xs font-mono text-emerald-300">{shortenHash(userAddress)}</span>
            </div>
          ) : (
            <button onClick={connectMetaMask} className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Connect MetaMask
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
