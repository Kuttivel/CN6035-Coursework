import { Contract } from "ethers";
import { MarketplaceContractConfig } from "../marketPlace.js";

export async function getProductCount(fastify) {
  const productCount = await fastify.ethers.contract.productCount();

  return productCount;
}
