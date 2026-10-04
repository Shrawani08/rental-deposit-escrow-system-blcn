import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { shortenHash } from '../utils/hashUtils';
import { Terminal, CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';

export default function EventLogs() {
  const { eventLogs } = useWeb3();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Solidity Event Listener & Transaction Ledger</h3>
            <p className="text-xs text-slate-400">Live EVM event emission stream and cryptographic audit trail</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {eventLogs.length} Events Recorded
        </span>
      </div>

      {eventLogs.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs">
          No transactions or smart contract events recorded yet. Interact with agreements to stream logs.
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {eventLogs.map((log) => {
            let badgeBg = "bg-slate-800 text-slate-300 border-slate-700";
            if (log.type === 'success') badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
            if (log.type === 'warning') badgeBg = "bg-orange-500/10 text-orange-400 border-orange-500/30";
            if (log.type === 'danger') badgeBg = "bg-rose-500/10 text-rose-400 border-rose-500/30";

            return (
              <div key={log.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${badgeBg}`}>
                    {log.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">{log.details}</p>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 pt-1">
                  <span>TxHash:</span>
                  <span className="text-slate-400">{shortenHash(log.txHash, 10)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
