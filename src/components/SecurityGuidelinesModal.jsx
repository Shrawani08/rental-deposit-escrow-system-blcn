import React from 'react';
import { ShieldCheck, Lock, Key, FileCheck, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function SecurityGuidelinesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">RentSecure Guidelines & Safety Policy</h3>
              <p className="text-xs text-slate-400">Security deposit standards & cryptographic proof policy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guidelines Items */}
        <div className="space-y-4 text-xs text-slate-300">
          
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <h4 className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
              <Lock className="w-4 h-4" /> 1. Immutable Smart Contract Escrow
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Security deposits are deposited directly into an EVM smart contract vault. Neither landlord nor tenant can unilaterally withdraw funds during active tenancy without meeting release criteria.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <h4 className="font-bold text-blue-400 flex items-center gap-2 text-sm">
              <FileCheck className="w-4 h-4" /> 2. SHA-256 Evidence Integrity Proof
            </h4>
            <p className="text-slate-300 leading-relaxed">
              All move-in and move-out inspection photos are cryptographically hashed using SHA-256 off-chain. The resulting hash is immutably recorded on-chain, proving photos existed in that exact form at move-in.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <h4 className="font-bold text-purple-400 flex items-center gap-2 text-sm">
              <Key className="w-4 h-4" /> 3. Account & Password Protection Guidelines
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pt-1">
              <li>Use passwords with at least 8 characters, including numbers & symbols.</li>
              <li>Never share your private Web3 wallet keys or seed phrases with anyone.</li>
              <li>Verify landlord and tenant Ethereum addresses before deploying contracts.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <h4 className="font-bold text-amber-400 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4" /> 4. Dispute Resolution Procedure
            </h4>
            <p className="text-slate-300 leading-relaxed">
              If a tenant rejects a move-out damage claim, the case automatically escalates to the designated neutral Arbitrator, who evaluates side-by-side SHA-256 evidence to issue a binding final payout.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition"
          >
            I Understand & Agree to Guidelines
          </button>
        </div>

      </div>
    </div>
  );
}
