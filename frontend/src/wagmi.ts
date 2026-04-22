import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, webSocket } from "wagmi";
import {
  mainnet,
  sepolia,
  hardhat,
  arbitrum,
  base,
  optimism,
  polygon,
} from "wagmi/chains";

export const rpc = (url?: string) => {
  if (!url || !url.trim()) {
    return http();
  }

  if (url.startsWith("ws://") || url.startsWith("wss://")) {
    return webSocket(url);
  }

  return http(url);
};

const appUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://rowmart.app";

export const config = getDefaultConfig({
  appName: "Row Mart",
  appIcon: "/logo.png",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  appUrl,
  appDescription:
    "Rowmart is a decentralized marketplace that connects creators, sellers and buyers using smart contracts. It features a modern frontend, a secure backend API, and Ethereum smart contracts for trustless product listing, purchasing, and dispute handling.",
  chains: [hardhat, mainnet, arbitrum, base, optimism, polygon, sepolia],
  transports: {
    [mainnet.id]: rpc(import.meta.env.VITE_RPC_MAINNET),
    [arbitrum.id]: rpc(import.meta.env.VITE_RPC_ARBITRUM),
    [optimism.id]: rpc(import.meta.env.VITE_RPC_OPTIMISM),
    [polygon.id]: rpc(import.meta.env.VITE_RPC_POLYGON),
    [base.id]: rpc(import.meta.env.VITE_RPC_BASE),
    [sepolia.id]: rpc(import.meta.env.VITE_RPC_SEPOLIA),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
