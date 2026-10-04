# BlockEscrow — Blockchain-Based Rental Deposit Escrow & Dispute Settlement System

BlockEscrow is a decentralized Web3 application (DApp) that replaces traditional landlord-managed security deposits with smart contract escrows. It ensures transparent release, SHA-256 evidence integrity, damage claim negotiations, and binding arbitration.

---

## Features

1. **Smart Contract Escrow Vault (`RentalEscrow.sol`)**:
   - Holds tenant security deposit ETH securely.
   - Enforces a 7-stage state machine: `Created` → `Funded` → `Active` → `MoveOut` → `Settlement` → `Disputed` → `Closed`.
2. **Move-In & Move-Out SHA-256 Cryptographic Evidence**:
   - Stores inspection photos off-chain.
   - Pins SHA-256 cryptographic hashes on-chain for tamper-proof timestamped proof.
3. **Itemized Damage Claim & Counter-Offer Negotiations**:
   - Landlords file damage claims with reason & hash.
   - Tenants can accept deduction or submit a counter-offer to initiate arbitration.
4. **Arbitrator / Admin Court Dashboard**:
   - Arbitrator inspects side-by-side evidence hashes and photo records.
   - Arbitrator sets final payout distribution, automatically releasing funds.
5. **Multi-Role Simulator & MetaMask Support**:
   - Easily swap active roles (Landlord, Tenant, Arbitrator) in one click for quick testing/demoing.
   - Connect live MetaMask wallets via ethers.js v6.

---

## Quick Start & Running locally

### 1. Project Directory
```bash
cd C:\Users\admin\.gemini\antigravity\scratch\rental-escrow-dapp
```

### 2. Run Hardhat Smart Contract Unit Tests
```bash
npm run test
```

### 3. Run Development Web Server
```bash
npm run dev
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## Smart Contract Settlement Test Paths (Verified 100% Pass)
- **Case 1**: No damage claimed → 100% deposit returned to tenant immediately.
- **Case 2**: Agreed damage claim → Tenant accepts claim, funds split automatically.
- **Case 3**: Disputed claim → Tenant rejects claim, counter-offers, Arbitrator renders binding verdict.
