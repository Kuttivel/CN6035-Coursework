import fp from "fastify-plugin";
import { listenToEvents } from "../contract/services/Eventlistener.js";
import { Contract, WebSocketProvider } from "ethers";
import { JsonRpcProvider } from "ethers";
import { MarketplaceContractConfig } from "../contract/marketPlace.js";

const ethersPlugin = fp(async function (fastify, opts) {
    try {
        let provider;
        if (opts.rpcUrl.startsWith("ws://") || opts.rpcUrl.startsWith("wss://") || opts.rpcUrl === "http://127.0.0.1:8545") {
            provider = new WebSocketProvider(opts.rpcUrl);
        } else {
            provider = new JsonRpcProvider(opts.rpcUrl);
        }

        // Verify connection
        await provider.getBlockNumber();

        const contract = new Contract(
            ...MarketplaceContractConfig,
            provider
        );

        fastify.decorate("ethers", { provider, contract });

        listenToEvents(fastify);

        fastify.log.info("Ethers provider connected");

        fastify.addHook("onClose", async () => {
            if (provider.destroy) {
                provider.destroy();
            }
        });
    } catch (err) {
        fastify.close();
    }
});

export default ethersPlugin;