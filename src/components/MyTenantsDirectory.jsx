import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { shortenHash } from '../utils/hashUtils';
import { Users, Home, Key, Mail, ShieldCheck, Plus, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function MyTenantsDirectory({ onOpenCreateContract }) {
  const { usersList, agreements, currentRoleObj } = useWeb3();

  // Find all tenants assigned to or linked with this landlord's properties
  const myTenants = usersList.filter(u => u.role === 'tenant');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      
      {/* Directory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Landlord Tenant Management Directory</h3>
            <p className="text-xs text-slate-400">View and manage multiple active tenants assigned to your rental properties</p>
          </div>
        </div>

        <button
          onClick={onOpenCreateContract}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Tenant / Lease Contract
        </button>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {myTenants.map((tenant) => {
          // Find contracts matching this tenant's address
          const tenantAgreements = agreements.filter(
            a => a.tenant.toLowerCase() === tenant.address.toLowerCase()
          );

          return (
            <div key={tenant.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
              
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={tenant.avatar}
                    alt={tenant.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 shadow-sm"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{tenant.name}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" /> {tenant.email}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Wallet Identity:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{shortenHash(tenant.address)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Assigned Lease:</span>
                    <span className="font-semibold text-white">{tenant.roleTitle.split('—')[1] || "Apartment Unit"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">
                  {tenantAgreements.length} Active Escrow Contract(s)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
                  Verified Tenant
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
