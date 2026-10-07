import React, { useState } from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import Navbar from './components/Navbar';
import AgreementCard from './components/AgreementCard';
import CreateAgreementModal from './components/CreateAgreementModal';
import SecurityGuidelinesModal from './components/SecurityGuidelinesModal';
import MyTenantsDirectory from './components/MyTenantsDirectory';
import EventLogs from './components/EventLogs';
import { Building2, ShieldCheck, Scale, AlertTriangle, Coins, Key, UserCheck, Home, ArrowRight, Users, BookOpen } from 'lucide-react';

function DashboardContent() {
  const { agreements, accountRole, userAddress, defaultArbitrator, appState, transactionState, connectMetaMask, contractAddress } = useWeb3();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('myRentals'); // 'myRentals' | 'tenantsDir' | 'pendingAction' | 'logs'

  // Total escrow stats
  const totalLocked = agreements
    .filter(a => a.status >= 1 && a.status < 6)
    .reduce((acc, a) => acc + parseFloat(a.depositAmount), 0)
    .toFixed(2);

  if (appState.status !== 'ready') {
    const stateDetails = {
      'metamask-unavailable': ['MetaMask is not installed', 'Install the MetaMask browser extension to connect to RentSecure.'],
      'wallet-disconnected': ['Connect your wallet', 'Connect MetaMask to continue to the Sepolia DApp.'],
      'wrong-network': ['Switch to Sepolia', appState.message],
      'contract-unavailable': ['Contract unavailable', appState.message],
      'transaction-failed': ['Wallet connection failed', appState.message]
    };
    const [title, message] = stateDetails[appState.status] || ['Connecting to RentSecure', appState.message];
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
          <div>
            <h1 className="text-2xl font-extrabold text-white">{title}</h1>
            <p className="text-sm text-slate-400 mt-2">{message}</p>
          </div>
          {appState.status === 'wallet-disconnected' && (
            <button onClick={connectMetaMask} className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm">
              Connect MetaMask
            </button>
          )}
          <div className="text-left text-xs text-slate-500 bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1">
            <p>Required network: Sepolia (chain ID 11155111)</p>
            <p>Contract: {contractAddress || 'Not configured'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter agreements using the connected wallet address
  const myAgreements = agreements.filter(a => {
    const address = userAddress.toLowerCase();
    return a.landlord.toLowerCase() === address
      || a.tenant.toLowerCase() === address
      || a.arbitrator.toLowerCase() === address;
  });

  const pendingActionAgreements = agreements.filter(a => {
    if (accountRole === 'tenant') return (a.tenant.toLowerCase() === userAddress.toLowerCase()) && (a.status === 0 || a.status === 4);
    if (accountRole === 'landlord') return (a.landlord.toLowerCase() === userAddress.toLowerCase()) && (a.status === 2 || a.status === 3 || a.status === 5);
    if (accountRole === 'arbitrator') return a.status === 5 && (
      a.arbitrator.toLowerCase() === userAddress.toLowerCase()
      || defaultArbitrator.toLowerCase() === userAddress.toLowerCase()
    );
    return false;
  });

  const displayedAgreements = activeTab === 'pendingAction' ? pendingActionAgreements : myAgreements;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Navbar */}
      <Navbar
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* User Role Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center shrink-0">
              <Key className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Connected wallet
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {accountRole}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                MetaMask account • <span className="text-slate-300 font-mono">{userAddress}</span>
              </p>
              </div>
            </div>

            {/* Quick Metrics & Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
                <Coins className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Escrow Total</span>
                  <span className="text-base font-extrabold text-emerald-400">{totalLocked} ETH</span>
                </div>
              </div>

              {transactionState.status !== 'idle' && (
                <div className={`px-4 py-3 rounded-2xl border text-xs font-bold ${
                  transactionState.status === 'failed' ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' :
                  transactionState.status === 'confirmed' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' :
                  'border-amber-500/30 bg-amber-500/10 text-amber-300'
                }`}>
                  {transactionState.message}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('myRentals')}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'myRentals' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" /> My Active Lease Contracts ({myAgreements.length})
            </button>

            {accountRole === 'landlord' && (
              <button
                onClick={() => setActiveTab('tenantsDir')}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'tenantsDir' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" /> My Tenants Directory
              </button>
            )}

            <button
              onClick={() => setActiveTab('pendingAction')}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'pendingAction' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> Action Required ({pendingActionAgreements.length})
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'logs' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Blockchain Event Stream
            </button>
          </div>

          <button
            onClick={() => setIsGuidelinesOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" /> RentSecure Guidelines
          </button>

        </div>

        {/* Tab Content Display */}
        {activeTab === 'logs' ? (
          <EventLogs />
        ) : activeTab === 'tenantsDir' ? (
          <MyTenantsDirectory onOpenCreateContract={() => setIsCreateModalOpen(true)} />
        ) : (
          <div className="space-y-6">
            {displayedAgreements.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-300">No Rental Contracts Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No agreements involving this connected wallet were found on Sepolia.
                </p>
              </div>
            ) : (
              displayedAgreements.map(ag => (
                <AgreementCard key={ag.id} agreement={ag} />
              ))
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        RentSecure • Decentralized Rental Security Deposit Escrow Platform
      </footer>

      {/* Modals */}
      <CreateAgreementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <SecurityGuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <DashboardContent />
    </Web3Provider>
  );
}
