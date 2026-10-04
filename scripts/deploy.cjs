const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying RentalEscrow contract...");
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const RentalEscrow = await ethers.getContractFactory("RentalEscrow");
  const escrow = await RentalEscrow.deploy();

  await escrow.waitForDeployment();
  const address = await escrow.getAddress();

  console.log("=========================================");
  console.log("RentalEscrow deployed to:", address);
  console.log("Default Arbitrator (Admin):", deployer.address);
  console.log("=========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
