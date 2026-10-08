import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { X, Building2, Coins, Calendar, UserCheck, ShieldCheck, User, AlertCircle } from 'lucide-react';

export default function CreateAgreementModal({ isOpen, onClose }) {
  const { createAgreement } = useWeb3();

  const [formData, setFormData] = useState({
    propertyAddress: 'Apartment 501, Horizon Towers, Whitefield',
    tenantAddress: '',
    arbitratorAddress: '',
    depositAmount: '1.5',
    monthlyRent: '0.4',
    durationDays: '365'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createAgreement(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to create the lease agreement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Lease Agreement</h3>
              <p className="text-xs text-slate-400">Deploy contract for a tenant with smart deposit escrow</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          
          {/* Property Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Property Details / Address
            </label>
            <input
              type="text"
              required
              value={formData.propertyAddress}
              onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              placeholder="e.g. Flat 302, Sunrise Apts"
            />
          </div>

          {/* Tenant wallet */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Tenant / Renter
            </label>
            <input
              type="text"
              required
              value={formData.tenantAddress}
              onChange={(e) => setFormData({ ...formData, tenantAddress: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              placeholder="0x... tenant MetaMask address"
            />
          </div>

          {/* Arbitrator Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Designated Arbitrator / Dispute Officer
            </label>
            <input
              type="text"
              value={formData.arbitratorAddress}
              onChange={(e) => setFormData({ ...formData, arbitratorAddress: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              placeholder="Optional arbitrator MetaMask address"
            />
          </div>

          {/* Deposit & Rent Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Security Deposit (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.depositAmount}
                  onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 transition"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">ETH</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Monthly Rent (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">ETH</span>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Lease Duration (Days)
            </label>
            <input
              type="number"
              required
              value={formData.durationDays}
              onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
            >
              {loading ? 'Deploying...' : 'Deploy Smart Contract Lease'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
