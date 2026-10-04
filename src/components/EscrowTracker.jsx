import React from 'react';
import { USER_FRIENDLY_STATUS } from '../utils/mockData';
import { CheckCircle2, Clock, Home, Key, ShieldCheck, Scale, CheckCheck } from 'lucide-react';

const STEPS = [
  { status: 0, label: "Wait Deposit", icon: Key },
  { status: 1, label: "Deposit Escrowed", icon: ShieldCheck },
  { status: 2, label: "Active Rental", icon: Home },
  { status: 3, label: "Move-Out Inspection", icon: Clock },
  { status: 4, label: "Deduction Claim", icon: Clock },
  { status: 6, label: "Deposit Settled", icon: CheckCheck }
];

export default function EscrowTracker({ currentStatus }) {
  const currentInfo = USER_FRIENDLY_STATUS[currentStatus] || USER_FRIENDLY_STATUS[0];

  return (
    <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
      
      {/* Friendly Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${currentInfo.bg} ${currentInfo.text} ${currentInfo.border}`}>
            {currentInfo.label}
          </span>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          {currentInfo.desc}
        </p>
      </div>

      {/* Visual Stepper */}
      <div className="relative flex items-center justify-between px-2 pt-1">
        <div className="absolute left-4 right-4 top-4 h-1 bg-slate-800 z-0"></div>

        {STEPS.map((step) => {
          const isDone = currentStatus > step.status || currentStatus === 6;
          const isCurrent = currentStatus === step.status && currentStatus !== 6;
          const Icon = step.icon;

          let circleStyle = "bg-slate-900 border-slate-700 text-slate-500";
          if (isDone) circleStyle = "bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20";
          if (isCurrent) circleStyle = "bg-amber-400 border-amber-300 text-slate-950 font-bold animate-pulse shadow-md shadow-amber-400/20";

          return (
            <div key={step.status} className="relative z-10 flex flex-col items-center">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${circleStyle}`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className={`text-[10px] font-semibold mt-2 hidden sm:block ${isCurrent ? 'text-amber-400 font-bold' : isDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
