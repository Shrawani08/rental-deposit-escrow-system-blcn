import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { Scale, FileText } from 'lucide-react';
import EvidenceViewer from './EvidenceViewer';

const PAYOUT_SLIDER_STEPS = 10000n;

function formatWei(wei) {
  const [whole, fraction] = ethers.formatEther(wei).split('.');
  const trimmedFraction = fraction?.replace(/0+$/, '');
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
}

export default function ArbitratorPanel({ agreement }) {
  const { resolveDispute, transactionState } = useWeb3();
  const depositWei = ethers.parseEther(agreement.depositAmount || '0');
  const [tenantPayoutPercent, setTenantPayoutPercent] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tenantPayoutWei = depositWei * BigInt(tenantPayoutPercent) / PAYOUT_SLIDER_STEPS;
  const landlordPayoutWei = depositWei - tenantPayoutWei;
  const payoutIsValid = tenantPayoutWei >= 0n
    && landlordPayoutWei >= 0n
    && tenantPayoutWei + landlordPayoutWei === depositWei;
  const tenantPayout = formatWei(tenantPayoutWei);
  const landlordPayout = formatWei(landlordPayoutWei);
  const deposit = formatWei(depositWei);

  const handleResolve = async () => {
    if (!payoutIsValid) {
      setError('Sum of tenant and landlord payouts must equal the total deposit.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await resolveDispute(agreement.id, tenantPayoutWei, landlordPayoutWei);
    } catch (err) {
      setError(err.message || 'Dispute resolution failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Arbitrator Court & Binding Resolution</h3>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                Disputed Case #{agreement.id}
              </span>
            </div>
            <p className="text-xs text-slate-400">Examine cryptographic evidence hashes & execute smart contract distribution</p>
          </div>
        </div>
      </div>

      {/* Claims vs Counter Box */}
      {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Landlord Demand */}
        <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Landlord Claim Demand</span>
          <div className="text-xl font-extrabold text-orange-400 mb-2">{agreement.claimAmount} ETH</div>
          <p className="text-xs text-slate-300 italic">"{agreement.claimReason || 'No reason specified'}"</p>
        </div>

        {/* Tenant Counter */}
        <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tenant Counter Offer</span>
          <div className="text-xl font-extrabold text-amber-400 mb-2">{agreement.counterAmount} ETH</div>
          <p className="text-xs text-slate-300 italic">"{agreement.counterReason || 'No reason specified'}"</p>
        </div>

      </div>

      {/* Interactive Evidence Inspection */}
      <EvidenceViewer agreement={agreement} mode="view" />

      {/* Settlement Slider & Controls */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-purple-500/20 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" /> Arbitrator Verdict Breakdown (Escrow Total: {deposit} ETH)
        </h4>

        {/* Range Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-blue-400">Tenant Payout: {tenantPayout} ETH</span>
            <span className="text-emerald-400">Landlord Payout: {landlordPayout} ETH</span>
          </div>
          <input
            type="range"
            min="0"
            max={Number(PAYOUT_SLIDER_STEPS)}
            step="1"
            value={tenantPayoutPercent}
            onChange={event => setTenantPayoutPercent(Number(event.target.value))}
            className="w-full accent-purple-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
          />
          <p className="text-xs text-slate-300">
            {tenantPayout} ETH + {landlordPayout} ETH = {deposit} ETH
          </p>
          {!payoutIsValid && (
            <p className="text-xs text-rose-300">Tenant and landlord payouts must equal the escrow deposit.</p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleResolve}
          disabled={loading || transactionState.status === 'pending' || !payoutIsValid}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2"
        >
          <Scale className="w-4 h-4" />
          {loading || transactionState.status === 'pending' ? "Executing Binding Verdict..." : `Execute Binding Verdict on Smart Contract (${tenantPayout} ETH Tenant / ${landlordPayout} ETH Landlord)`}
        </button>
      </div>

    </div>
  );
}
