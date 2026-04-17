import { ethers } from "ethers";
import "dotenv/config";
import process from "process";

// --- 1. Connect to Sepolia ---
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

const deployer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!, provider);

// --- 3. Other accounts ---
const buyers = [
  "0x2bf9C7c4Fd923380E0a76F4230aD7AF5ED862778",
  "0x7F03099652874d86e28d85F74e3BF49F7cf6E066",
  "0xB893561AD891f88f7Bd9Cf547939448e0d53e67f",
  "0x58f4c6fc86E21A7200e65Dade832822C51c5116f",
  // YOUR_WALLET_ADDRESS
];

// --- 4. Get contract instance ---
const Token = new ethers.Contract(
  process.env.MNEE_ADDRESS!,
  [
    "function mint(address to, uint256 amount) external",
    "function balanceOf(address account) view returns (uint256)",
  ],
  deployer
);


// --- 5. Mint tokens ---
for (const address of buyers) {
  const balanceBefore = await Token.balanceOf(address);
  console.log("Address balance before", balanceBefore.toString());
  const tx = await Token.mint(address, ethers.parseEther("1000"));
  await tx.wait();
  const balance = await Token.balanceOf(address);
  console.log("Address balance after", balance);
  console.log(
    `Minted 1000 tokens to ${address}, balance now: ${ethers.formatEther(
      balance
    )}`
  );
}
