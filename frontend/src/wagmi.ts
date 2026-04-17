import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { 
  // createConfig,
   http, webSocket } from "wagmi";
import {
  mainnet,
  sepolia,
  hardhat,
  arbitrum,
  base,
  optimism,
  polygon,
} from "wagmi/chains";
// import { metaMask, injected, walletConnect, gemini } from "wagmi/connectors";
// import {
//   metaMask,
//   gemini,
//   walletConnect,
//   // coinbaseWallet,
//   // injected,
//   // porto,
//   // safe,
//   // baseAccount,
// } from "wagmi/connectors";

export const rpc = (url?: string) => {
  if (!url || !url.trim()) {
    return http();
  }

  if (url.startsWith("ws://") || url.startsWith("wss://") || url === "http://127.0.0.1:8545") {
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
    [hardhat.id]: rpc("http://127.0.0.1:8545"),
  },
})

// export const config = createConfig({
//   ...defaultConfig,
//   // appName: "Row Mart",
//   // appIcon: "/logo.png",
//   // projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
//   // appUrl,
//   // appDescription:
//   // "Rowmart is a decentralized marketplace that connects creators, sellers and buyers using smart contracts. It features a modern frontend, a secure backend API, and Ethereum smart contracts for trustless product listing, purchasing, and dispute handling.",
//   connectors: [
//     injected(),
//     walletConnect({
//       projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
//       metadata: {
//         name: "RowMart",
//         description: "RowMart Web3 Marketplace",
//         url: appUrl,
//         icons: ["/logo.png"],
//       },
//     }),
//     gemini({
//       appMetadata: {
//         name: "RowMart",
//         url: appUrl,
//         icon: "/logo.png",
//       },
//     }),
//   ],
//   chains: [hardhat, mainnet, arbitrum, base, optimism, polygon, sepolia],
//   transports: {
//     [mainnet.id]: rpc(import.meta.env.VITE_RPC_MAINNET),
//     [arbitrum.id]: rpc(import.meta.env.VITE_RPC_ARBITRUM),
//     [optimism.id]: rpc(import.meta.env.VITE_RPC_OPTIMISM),
//     [polygon.id]: rpc(import.meta.env.VITE_RPC_POLYGON),
//     [base.id]: rpc(import.meta.env.VITE_RPC_BASE),
//     [sepolia.id]: rpc(import.meta.env.VITE_RPC_SEPOLIA),
//     [hardhat.id]: rpc("http://127.0.0.1:8545"),
//   },
// });


declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
