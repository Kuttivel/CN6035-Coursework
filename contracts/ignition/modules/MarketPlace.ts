import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "ethers";

const MarketplaceModule = buildModule("MarketplaceModule", (m) => {
  // Accounts (Runtime Values)
  const deployer = m.getAccount(0);
  // const feeRecipient = m.getAccount(1);
  // const arbitrator = m.getAccount(2);
  // const seller = m.getAccount(3);
  // const buyer = m.getAccount(4);
  // const other = m.getAccount(5);

  // Deploy MockMNEE
  const token = m.contract("MockMNEE");

  const amount = ethers.parseEther("1000");

  // Mint tokens
  m.call(token, "mint", [deployer, amount]);

  const marketplace = m.contract("Marketplace");

  // Initialize Marketplace
  m.call(marketplace, "initialize", [
    token,
    deployer,
    deployer,
  ]);

  return {
    token,
    marketplace,
  };
});

export default MarketplaceModule;
