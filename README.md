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
5. **MetaMask + Sepolia access**:
   - Connect a real MetaMask wallet on Sepolia.
   - Permissions are derived from landlord, tenant, and arbitrator addresses stored in the contract.

---

## Quick Start & Running locally

### 1. Project Directory
```bash
cd rental-deposit-escrow-system-blcn
```

Install dependencies first:
```bash
npm install
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

## Live-only Sepolia setup

This application does not use demo accounts, localStorage, simulated agreements, or fake
transaction hashes. MetaMask, Sepolia, and the deployed contract are required.

To configure the live application:

1. Copy `.env.example` to `.env`.
2. Deploy the contract to Sepolia:
   ```bash
   npm run deploy:sepolia
   ```
3. Set `VITE_ESCROW_CONTRACT_ADDRESS` to the deployed address.
4. Restart Vite and connect MetaMask to Sepolia.

The frontend discovers agreements from `AgreementCreated` events and reads their current
state from the deployed contract. All actions require MetaMask confirmation and use real
Sepolia transaction hashes.

Use separate Sepolia test wallets for the landlord, tenant, and arbitrator roles. Never
commit `.env` or use a wallet containing real funds.

---

## Smart Contract Settlement Test Paths (Verified 100% Pass)
- **Case 1**: No damage claimed → 100% deposit returned to tenant immediately.
- **Case 2**: Agreed damage claim → Tenant accepts claim, funds split automatically.
- **Case 3**: Disputed claim → Tenant rejects claim, counter-offers, Arbitrator renders binding verdict.
