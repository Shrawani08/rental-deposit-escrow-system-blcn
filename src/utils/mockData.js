/**
 * RentSecure Multi-Tenant Role & Account Database
 */

export const INITIAL_USERS = [
  {
    id: "landlord_alex",
    role: "landlord",
    name: "Alex Rivera",
    roleTitle: "Property Owner / Landlord",
    email: "alex@rentsecure.io",
    password: "Password123!",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    badge: "Landlord (3 Properties)",
    properties: ["Apartment 204", "Villa 12", "Penthouse 901"],
    balance: "15.4 ETH"
  },
  {
    id: "tenant_sarah",
    role: "tenant",
    name: "Sarah Jenkins",
    roleTitle: "Tenant — Apartment 204",
    email: "sarah@gmail.com",
    password: "Password123!",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    badge: "Renter #1",
    assignedLandlord: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    balance: "5.8 ETH"
  },
  {
    id: "tenant_david",
    role: "tenant",
    name: "David Chen",
    roleTitle: "Tenant — Villa 12",
    email: "david@yahoo.com",
    password: "Password123!",
    address: "0x3C44CdD46573453471c619632151658e63634177",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    badge: "Renter #2",
    assignedLandlord: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    balance: "8.2 ETH"
  },
  {
    id: "tenant_priya",
    role: "tenant",
    name: "Priya Sharma",
    roleTitle: "Tenant — Penthouse 901",
    email: "priya@outlook.com",
    password: "Password123!",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    badge: "Renter #3",
    assignedLandlord: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    balance: "4.5 ETH"
  },
  {
    id: "arbitrator_marcus",
    role: "arbitrator",
    name: "Judge Marcus Vance",
    roleTitle: "Neutral Dispute Officer",
    email: "judge@rentsecure.org",
    password: "Password123!",
    address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    badge: "Dispute Arbitrator",
    balance: "25.0 ETH"
  }
];

export const USER_FRIENDLY_STATUS = {
  0: { label: "Waiting for Deposit", desc: "Agreement created. Waiting for tenant to fund deposit.", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  1: { label: "Deposit Locked in Escrow", desc: "Security deposit is safely locked in smart contract escrow.", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  2: { label: "Active Rental Period", desc: "Tenancy active. Move-in report confirmed on blockchain.", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  3: { label: "Move-Out Inspection Complete", desc: "Rental ended. Move-out report uploaded.", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  4: { label: "Deduction Requested", desc: "Landlord submitted a damage claim deduction.", bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
  5: { label: "Dispute Escalated", desc: "Claim rejected by tenant. Escalated to neutral arbitrator.", bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
  6: { label: "Escrow Settled & Closed", desc: "Deposit fully distributed to tenant and landlord.", bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30" }
};

export const INITIAL_AGREEMENTS = [
  {
    id: 1,
    propertyAddress: "Apartment 204, Green Heights, Bengaluru",
    landlord: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Alex Rivera
    tenant: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",  // Sarah Jenkins
    tenantName: "Sarah Jenkins",
    arbitrator: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    depositAmount: "1.0",
    monthlyRent: "0.2",
    durationDays: 365,
    startDate: Math.floor(Date.now() / 1000) - 86400 * 30,
    status: 4, // Deduction Requested
    moveInEvidenceHash: "0x8f4b1e7c93201a4f6d892b1049382e71c2a59f109284736152019c8372b10a9f",
    moveInPhotos: [
      { name: "Living Room Walls", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop", note: "Clean paint, no cracks" },
      { name: "Kitchen Sink", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop", note: "Pipes sealed, working faucet" }
    ],
    moveOutEvidenceHash: "0x3a91b2c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f80",
    moveOutPhotos: [
      { name: "Living Room Wall Scratch", url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop", note: "Plaster scratch near window" }
    ],
    claimAmount: "0.20",
    claimReason: "Plaster repair and repainting required for living room wall scratch.",
    claimEvidenceHash: "0x77ab12cd34ef567890ab12cd34ef567890ab12cd34ef567890ab12cd34ef5678",
    counterAmount: "0.08",
    counterReason: "Scratch was pre-existing near window frame. Counter-offering 0.08 ETH.",
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 30
  },
  {
    id: 2,
    propertyAddress: "Villa 12, Palm Residency, Mumbai",
    landlord: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Alex Rivera
    tenant: "0x3C44CdD46573453471c619632151658e63634177",  // David Chen
    tenantName: "David Chen",
    arbitrator: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    depositAmount: "2.0",
    monthlyRent: "0.5",
    durationDays: 180,
    startDate: Math.floor(Date.now() / 1000) - 86400 * 10,
    status: 2, // Active
    moveInEvidenceHash: "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    moveInPhotos: [
      { name: "Master Suite", url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=500&auto=format&fit=crop", note: "Polished floor and working lights" }
    ],
    moveOutEvidenceHash: "",
    moveOutPhotos: [],
    claimAmount: "0",
    claimReason: "",
    claimEvidenceHash: "",
    counterAmount: "0",
    counterReason: "",
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 10
  },
  {
    id: 3,
    propertyAddress: "Penthouse 901, Sky Towers, Gurgaon",
    landlord: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Alex Rivera
    tenant: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",  // Priya Sharma
    tenantName: "Priya Sharma",
    arbitrator: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    depositAmount: "1.8",
    monthlyRent: "0.45",
    durationDays: 365,
    startDate: 0,
    status: 0, // Waiting for deposit
    moveInEvidenceHash: "",
    moveInPhotos: [],
    moveOutEvidenceHash: "",
    moveOutPhotos: [],
    claimAmount: "0",
    claimReason: "",
    claimEvidenceHash: "",
    counterAmount: "0",
    counterReason: "",
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 2
  }
];
