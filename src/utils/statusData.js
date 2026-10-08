export const USER_FRIENDLY_STATUS = {
  0: { label: 'Waiting for Deposit', desc: 'Agreement created. Waiting for tenant to fund deposit.', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  1: { label: 'Deposit Locked in Escrow', desc: 'Security deposit is safely locked in smart contract escrow.', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  2: { label: 'Active Rental Period', desc: 'Tenancy active. Move-in report confirmed on blockchain.', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  3: { label: 'Move-Out Inspection Complete', desc: 'Rental ended. Move-out report uploaded.', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  4: { label: 'Deduction Requested', desc: 'Landlord submitted a damage claim deduction.', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  5: { label: 'Dispute Escalated', desc: 'Claim rejected by tenant. Escalated to neutral arbitrator.', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  6: { label: 'Escrow Settled & Closed', desc: 'Deposit fully distributed to tenant and landlord.', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' }
};
