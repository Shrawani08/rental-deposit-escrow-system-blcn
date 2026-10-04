const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RentalEscrow Smart Contract Suite", function () {
  let RentalEscrow;
  let escrowContract;
  let landlord, tenant, arbitrator, stranger;
  const depositAmount = ethers.parseEther("1.0");
  const monthlyRent = ethers.parseEther("0.3");
  const durationDays = 365;
  const propertyAddress = "Apartment 204, Green Heights";

  beforeEach(async function () {
    [landlord, tenant, arbitrator, stranger] = await ethers.getSigners();
    RentalEscrow = await ethers.getContractFactory("RentalEscrow");
    escrowContract = await RentalEscrow.deploy();
    await escrowContract.waitForDeployment();
  });

  it("Should create a rental agreement with Created status", async function () {
    const tx = await escrowContract.connect(landlord).createAgreement(
      tenant.address,
      arbitrator.address,
      depositAmount,
      monthlyRent,
      durationDays,
      propertyAddress
    );
    await tx.wait();

    const ag = await escrowContract.getAgreement(1);
    expect(ag.id).to.equal(1);
    expect(ag.landlord).to.equal(landlord.address);
    expect(ag.tenant).to.equal(tenant.address);
    expect(ag.arbitrator).to.equal(arbitrator.address);
    expect(ag.depositAmount).to.equal(depositAmount);
    expect(ag.status).to.equal(0); // Created
  });

  it("Case 1: No Damage Claim -> Immediate 100% Refund to Tenant", async function () {
    // 1. Create Agreement
    await escrowContract.connect(landlord).createAgreement(
      tenant.address,
      arbitrator.address,
      depositAmount,
      monthlyRent,
      durationDays,
      propertyAddress
    );

    // 2. Fund Deposit (Tenant)
    await escrowContract.connect(tenant).fundDeposit(1, { value: depositAmount });
    let ag = await escrowContract.getAgreement(1);
    expect(ag.status).to.equal(1); // Funded

    // 3. Confirm Move-In Evidence
    await escrowContract.connect(tenant).confirmMoveIn(1, "hash_move_in_123");
    ag = await escrowContract.getAgreement(1);
    expect(ag.status).to.equal(2); // Active

    // 4. Confirm Move-Out Evidence
    await escrowContract.connect(landlord).confirmMoveOut(1, "hash_move_out_456");
    ag = await escrowContract.getAgreement(1);
    expect(ag.status).to.equal(3); // MoveOut

    // 5. Submit 0 damage claim
    const initialTenantBalance = await ethers.provider.getBalance(tenant.address);
    const tx = await escrowContract.connect(landlord).submitDamageClaim(1, 0, "No damage noticed", "");
    await tx.wait();

    ag = await escrowContract.getAgreement(1);
    expect(ag.status).to.equal(6); // Closed
    expect(ag.tenantPayout).to.equal(depositAmount);
    expect(ag.landlordPayout).to.equal(0);

    const finalTenantBalance = await ethers.provider.getBalance(tenant.address);
    expect(finalTenantBalance).to.be.closeTo(
      initialTenantBalance + depositAmount,
      ethers.parseEther("0.01") // Allow gas tolerance
    );
  });

  it("Case 2: Agreed Damage Claim -> Deduct & Distribute", async function () {
    const claimAmount = ethers.parseEther("0.2"); // 0.2 ETH claim out of 1.0 ETH

    await escrowContract.connect(landlord).createAgreement(
      tenant.address,
      arbitrator.address,
      depositAmount,
      monthlyRent,
      durationDays,
      propertyAddress
    );
    await escrowContract.connect(tenant).fundDeposit(1, { value: depositAmount });
    await escrowContract.connect(tenant).confirmMoveIn(1, "hash_move_in_123");
    await escrowContract.connect(landlord).confirmMoveOut(1, "hash_move_out_456");

    // Landlord submits claim of 0.2 ETH for wall repair
    await escrowContract.connect(landlord).submitDamageClaim(1, claimAmount, "Wall repair", "hash_wall_damage");
    let ag = await escrowContract.getAgreement(1);
    expect(ag.status).to.equal(4); // Settlement

    // Tenant accepts claim
    await escrowContract.connect(tenant).acceptDamageClaim(1);
    ag = await escrowContract.getAgreement(1);
    expect(ag.status).to.equal(6); // Closed
    expect(ag.landlordPayout).to.equal(claimAmount);
    expect(ag.tenantPayout).to.equal(depositAmount - claimAmount);
  });

  it("Case 3: Rejected Claim -> Dispute -> Arbitrator Resolution", async function () {
    const claimAmount = ethers.parseEther("0.4");
    const counterAmount = ethers.parseEther("0.1");

    await escrowContract.connect(landlord).createAgreement(
      tenant.address,
      arbitrator.address,
      depositAmount,
      monthlyRent,
      durationDays,
      propertyAddress
    );
    await escrowContract.connect(tenant).fundDeposit(1, { value: depositAmount });
    await escrowContract.connect(tenant).confirmMoveIn(1, "hash_move_in_123");
    await escrowContract.connect(landlord).confirmMoveOut(1, "hash_move_out_456");

    // Landlord claims 0.4 ETH
    await escrowContract.connect(landlord).submitDamageClaim(1, claimAmount, "Scratched flooring", "hash_flooring");

    // Tenant rejects claim and counter-offers 0.1 ETH
    await escrowContract.connect(tenant).rejectClaim(1, counterAmount, "Wear and tear only");
    let ag = await escrowContract.getAgreement(1);
    expect(ag.status).to.equal(5); // Disputed

    // Arbitrator resolves dispute: Tenant gets 0.75 ETH, Landlord gets 0.25 ETH
    const finalTenantPayout = ethers.parseEther("0.75");
    const finalLandlordPayout = ethers.parseEther("0.25");

    await escrowContract.connect(arbitrator).resolveDispute(1, finalTenantPayout, finalLandlordPayout);

    ag = await escrowContract.getAgreement(1);
    expect(ag.status).to.equal(6); // Closed
    expect(ag.tenantPayout).to.equal(finalTenantPayout);
    expect(ag.landlordPayout).to.equal(finalLandlordPayout);
  });
});
