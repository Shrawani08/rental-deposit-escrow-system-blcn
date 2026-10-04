import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { USER_FRIENDLY_STATUS } from '../utils/mockData';
import { shortenHash } from '../utils/hashUtils';
import EscrowTracker from './EscrowTracker';
import EvidenceViewer from './EvidenceViewer';
import ClaimModal from './ClaimModal';
import ArbitratorPanel from './ArbitratorPanel';
import { Building2, Coins, Calendar, ShieldCheck, AlertTriangle, ChevronDown, ChevronUp, Eye, Scale, CheckCircle2, Key, ArrowRight, CornerDownRight } from 'lucide-react';

export default function AgreementCard({ agreement }) {
  const { accountRole, fundDeposit } = useWeb3();
  const [showEvidence, setShowEvidence] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showArbitratorPanel, setShowArbitratorPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusInfo = USER_FRIENDLY_STATUS[agreement.status] || USER_FRIENDLY_STATUS[0];

  const handleFund = async () => {
    setLoading(true);
    try {
      await fundDeposit(agreement.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 hover:border-slate-700 transition-all">
      
      {/* Property Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-slate-800 text-emerald-400 border border-slate-700/80 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-white">{agreement.propertyAddress}</h3>
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-slate-800 text-slate-400">
                Contract #{agreement.id}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Landlord: {shortenHash(agreement.landlord)} • Renter: {shortenHash(agreement.tenant)}
            </p>
          </div>
        </div>

        <div>
          <span className={`px-3.5 py-1.5 text-xs font-bold rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
            ● {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Visual State Machine Progress Bar */}
      <EscrowTracker currentStatus={agreement.status} />

      {/* Clean Financial Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Escrow Security Deposit</span>
          <span className="text-lg font-extrabold text-emerald-400">{agreement.depositAmount} ETH</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Monthly Rent</span>
          <span className="text-sm font-bold text-slate-200">{agreement.monthlyRent} ETH</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Lease Term</span>
          <span className="text-sm font-semibold text-slate-300">{agreement.durationDays} Days</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">On-Chain Integrity</span>
          <span className="text-xs font-mono text-purple-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> SHA-256 Verified
          </span>
        </div>
      </div>

      {/* Closed State Result Banner */}
      {agreement.status === 6 && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Security Deposit Released & Escrow Closed</h4>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Tenant Received: <span className="font-bold text-emerald-400">{agreement.tenantPayout} ETH</span> • Landlord Received: <span className="font-bold text-emerald-400">{agreement.landlordPayout} ETH</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Role Action Center */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        
        {/* Toggle Inspection Photos */}
        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-2"
        >
          <Eye className="w-4 h-4 text-slate-400" />
          {showEvidence ? "Hide Inspection Photos" : "Inspect Move-In / Out Photos"}
          {showEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Dynamic Action Buttons for Tenant & Landlord */}
        <div className="flex items-center gap-2">
          
          {/* Tenant Action 1: Pay Security Deposit */}
          {accountRole === 'tenant' && agreement.status === 0 && (
            <button
              onClick={handleFund}
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              {loading ? "Transferring to Escrow..." : `Pay Security Deposit (${agreement.depositAmount} ETH)`}
            </button>
          )}

          {/* Landlord Action 1: Request Damage Claim or Full Refund */}
          {accountRole === 'landlord' && (agreement.status === 2 || agreement.status === 3) && (
            <button
              onClick={() => setShowClaimModal(true)}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-lg shadow-orange-500/20 transition flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> Move-Out Damage / Refund Request
            </button>
          )}

          {/* Tenant Action 2: Review Damage Claim */}
          {accountRole === 'tenant' && agreement.status === 4 && (
            <button
              onClick={() => setShowClaimModal(true)}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> Respond to Landlord Deduction
            </button>
          )}

          {/* Landlord Action 2: Review Counter Offer */}
          {accountRole === 'landlord' && agreement.status === 5 && (
            <button
              onClick={() => setShowClaimModal(true)}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition flex items-center gap-2"
            >
              <CornerDownRight className="w-4 h-4" /> Review Tenant Counter Offer
            </button>
          )}

          {/* Optional Dispute Arbitration Court */}
          {agreement.status === 5 && (
            <button
              onClick={() => setShowArbitratorPanel(!showArbitratorPanel)}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition flex items-center gap-2"
            >
              <Scale className="w-4 h-4" /> Arbitrator Court
            </button>
          )}

        </div>

      </div>

      {/* Evidence Viewer Drawer */}
      {showEvidence && (
        <div className="pt-2 animate-fadeIn">
          <EvidenceViewer agreement={agreement} mode="view" />
        </div>
      )}

      {/* Arbitrator Panel Drawer */}
      {showArbitratorPanel && agreement.status === 5 && (
        <div className="pt-2 animate-fadeIn">
          <ArbitratorPanel agreement={agreement} />
        </div>
      )}

      {/* Claim Negotiation Modal */}
      <ClaimModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        agreement={agreement}
        role={accountRole}
      />

    </div>
  );
}
