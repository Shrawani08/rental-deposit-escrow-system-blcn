import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { shortenHash } from '../utils/hashUtils';
import { Users, Plus, FileText } from 'lucide-react';

export default function MyTenantsDirectory({ onOpenCreateContract }) {
  const { agreements } = useWeb3();
  const tenants = [...new Map(agreements.map(agreement => [agreement.tenant.toLowerCase(), agreement])).values()];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Tenant & Lease Directory</h3>
            <p className="text-xs text-slate-400">Tenant identities and agreements read from Sepolia</p>
          </div>
        </div>
        <button onClick={onOpenCreateContract} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Lease Contract
        </button>
      </div>

      {tenants.length === 0 ? (
        <p className="text-center py-10 text-xs text-slate-500">No tenant agreements have been created by this wallet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tenants.map(agreement => {
            const tenantAgreements = agreements.filter(item => item.tenant.toLowerCase() === agreement.tenant.toLowerCase());
            return (
              <div key={agreement.tenant} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Tenant wallet</h4>
                  <p className="text-xs font-mono text-emerald-400 mt-1">{shortenHash(agreement.tenant, 8)}</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between text-slate-400"><span>Contracts</span><span className="text-white font-semibold">{tenantAgreements.length}</span></div>
                  <div className="flex justify-between text-slate-400"><span>Latest property</span><span className="text-white text-right max-w-[60%] truncate">{agreement.propertyAddress}</span></div>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1"><FileText className="w-3 h-3" /> On-chain directory entry</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
