import { Contract } from "ethers";
import { MarketplaceContractConfig } from "../marketPlace.js";

export async function getTransactionCount(fastify) {
  const transactionCount = await fastify.ethers.contract.transactionCount();

  return transactionCount;
}
