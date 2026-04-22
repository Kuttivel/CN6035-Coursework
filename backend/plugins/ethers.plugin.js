import fp from "fastify-plugin";
import { Contract, JsonRpcProvider, WebSocketProvider } from "ethers";
import { listenToEvents } from "../contract/services/Eventlistener.js";
import { MarketplaceContractConfig } from "../contract/marketPlace.js";

const ethersPlugin = fp(async function (fastify, opts) {
  try {
    const rpcUrl = opts.rpcUrl;

    if (!rpcUrl) {
      throw new Error("RPC_URL is missing in backend/.env");
    }

    const isWebSocketUrl =
      rpcUrl.startsWith("ws://") || rpcUrl.startsWith("wss://");

    const provider = isWebSocketUrl
      ? new WebSocketProvider(rpcUrl)
      : new JsonRpcProvider(rpcUrl);

    await provider.getBlockNumber();

    const contract = new Contract(...MarketplaceContractConfig, provider);

    fastify.decorate("ethers", { provider, contract });

    listenToEvents(fastify);

    fastify.log.info("Ethers provider connected");

    fastify.addHook("onClose", async () => {
      if (typeof provider.destroy === "function") {
        provider.destroy();
      }
    });
  } catch (error) {
    fastify.log.error("Failed to connect ethers provider:", error);
    fastify.close();
  }
});

export default ethersPlugin;
