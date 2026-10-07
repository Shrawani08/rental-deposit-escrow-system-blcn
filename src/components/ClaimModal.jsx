import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { X, AlertTriangle, ShieldAlert, CheckCircle2, Coins, CornerDownRight, AlertCircle } from 'lucide-react';

export default function ClaimModal({ isOpen, onClose, agreement, role }) {
  const { submitDamageClaim, acceptDamageClaim, rejectDamageClaim, acceptCounterOffer } = useWeb3();
  const [claimAmount, setClaimAmount] = useState('0.25');
  const [claimReason, setClaimReason] = useState('Plaster repair and repainting required for wall scratches');
  const [counterAmount, setCounterAmount] = useState('0.10');
  const [counterReason, setCounterReason] = useState('Damage existed prior to move-in. Counter-offering 0.10 ETH maximum.');
  const [isCountering, setIsCountering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !agreement) return null;

  const handleLandlordSubmitClaim = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await submitDamageClaim(agreement.id, claimAmount, claimReason);
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to submit the damage claim.');
    } finally {
      setLoading(false);
    }
  };

  const handleTenantAccept = async () => {
    setLoading(true);
    setError('');
    try {
      await acceptDamageClaim(agreement.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to accept the claim.');
    } finally {
      setLoading(false);
    }
  };

  const handleTenantCounter = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await rejectDamageClaim(agreement.id, counterAmount, counterReason);
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to submit the counter-offer.');
    } finally {
      setLoading(false);
    }
  };

  const handleLandlordAcceptCounter = async () => {
    setLoading(true);
    setError('');
    try {
      await acceptCounterOffer(agreement.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to accept the counter-offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {role === 'landlord' ? 'File Move-Out Damage Claim' : 'Review Landlord Damage Claim'}
              </h3>
              <p className="text-xs text-slate-400">Escrow Deposit: {agreement.depositAmount} ETH</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LANDLORD CLAIM SUBMISSION FORM */}
        {role === 'landlord' && (agreement.status === 3 || agreement.status === 2) && (
          <form onSubmit={handleLandlordSubmitClaim} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Claimed Deduction Amount (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  max={agreement.depositAmount}
                  required
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-orange-400 font-bold focus:outline-none focus:border-orange-500 transition"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">ETH</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter 0 to release 100% full deposit ({agreement.depositAmount} ETH) back to tenant.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Reason & Evidence Description
              </label>
              <textarea
                rows="3"
                required
                value={claimReason}
                onChange={(e) => setClaimReason(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition"
                placeholder="Describe damage found during inspection..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-lg shadow-orange-500/20 transition"
              >
                {loading ? 'Submitting...' : 'Submit Claim on Smart Contract'}
              </button>
            </div>
          </form>
        )}

        {/* TENANT REVIEW & NEGOTIATION FORM */}
        {role === 'tenant' && agreement.status === 4 && (
          <div className="space-y-5">
            
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Landlord Claim</span>
                <span className="text-base font-extrabold text-orange-300">{agreement.claimAmount} ETH</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                "{agreement.claimReason}"
              </p>
            </div>

            {!isCountering ? (
              <div className="space-y-3">
                <button
                  onClick={handleTenantAccept}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Accept Claim & Receive {(parseFloat(agreement.depositAmount) - parseFloat(agreement.claimAmount)).toFixed(4)} ETH Refund
                </button>

                <button
                  onClick={() => setIsCountering(true)}
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
                >
                  <CornerDownRight className="w-4 h-4 text-orange-400" /> Reject Claim & Submit Counter-Offer
                </button>
              </div>
            ) : (
              <form onSubmit={handleTenantCounter} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Counter-Offer Amount (ETH)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      max={agreement.claimAmount}
                      required
                      value={counterAmount}
                      onChange={(e) => setCounterAmount(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-amber-400 font-bold focus:outline-none focus:border-amber-500 transition"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">ETH</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Counter Justification
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={counterReason}
                    onChange={(e) => setCounterReason(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCountering(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Back to options
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition"
                  >
                    {loading ? 'Submitting Counter...' : 'Escalate to Dispute & Submit Counter'}
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* LANDLORD DISPUTE COUNTER REVIEW */}
        {role === 'landlord' && agreement.status === 5 && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Tenant Counter Offer</span>
                <span className="text-base font-extrabold text-rose-300">{agreement.counterAmount} ETH</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                "{agreement.counterReason}"
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleLandlordAcceptCounter}
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition"
              >
                Accept Tenant's Counter Offer ({agreement.counterAmount} ETH)
              </button>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-xs text-slate-400 text-center">
                Currently in <span className="text-rose-400 font-semibold">Disputed State</span>. If not accepted, designated Arbitrator will resolve final payout breakdown.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
