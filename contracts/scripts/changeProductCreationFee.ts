import { ethers, formatEther, parseEther } from "ethers";
import "dotenv/config";
import process from "process";
import Marketplace from "./data/Marketplace.json";

const { abi } = Marketplace;
// const provider = new ethers.JsonRpcProvider();
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

const deployer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!, provider);

const contract = new ethers.Contract(
  process.env.MARKETPLACE_ADDRESS!,
  abi,
  deployer
);

const owner = await contract.owner();
console.log("Owner:", owner);
console.log("Caller:", deployer.address);

const newFee = parseEther("1");
await contract.setCreateProductFee(newFee);
const productFee = await contract.createProductFee();
console.log(formatEther(productFee));
