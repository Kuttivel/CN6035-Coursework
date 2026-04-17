# 🖥️ Rowmart Frontend

The **Rowmart frontend** is a Web3-enabled marketplace interface that allows users to browse products, connect their wallets, purchase items, and manage orders seamlessly. It is optimized for **performance, usability, and smooth blockchain interactions**.

## Table of Content
- [🖥️ Rowmart Frontend](#️-rowmart-frontend)
  - [Table of Content](#table-of-content)
  - [🌐 Live Demo](#-live-demo)
  - [🖼️ UI Preview](#️-ui-preview)
  - [✨ Features](#-features)
  - [🧠 How the Frontend Works](#-how-the-frontend-works)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [⚙️ Environment Variables](#️-environment-variables)
  - [🚀 Getting Started](#-getting-started)
  - [🔐 Wallet Configuration](#-wallet-configuration)
    - [Local Development (Hardhat Network)](#local-development-hardhat-network)
    - [Sepolia Testnet](#sepolia-testnet)
  - [🧩 Notes](#-notes)
  - [📜 License](#-license)


## 🌐 Live Demo

[![Demo Website](https://img.shields.io/badge/Demo-Website-blue?style=for-the-badge)](https://rowmart.vercel.app)  
<!-- - **YouTube Demo:** [Watch Demo](https://youtube.com/watch?v=YOUR_VIDEO_ID)   -->


## 🖼️ UI Preview

| Homepage | Product Page | Buy Product| Orders & Escrow | 
|----------|--------------|------------|----------------|
| ![Homepage](/assets/preview/homepage.jpg) | ![Sell Product](/assets/preview/sell-product.jpg) | ![Orders](/assets/preview/buy-product.jpg) |![Orders](/assets/preview/orders.jpg) |


## ✨ Features

- Wallet connection (**MetaMask** | **Coinbase** | **Rainbow** | **WalletConnect**)  
- Product listing & browsing  
- Secure **on-chain purchases**  
- Order tracking & escrow status  
- Ratings & reviews system  
- Responsive and modern UI  
- Testnet support (**Sepolia**)  


## 🧠 How the Frontend Works

1. User connects their wallet  
2. Products are fetched from **backend + blockchain**  
3. Purchases are signed via wallet  
4. Smart contract events update UI **in real-time**  
5. Backend syncs **metadata and notifications**  


## 🛠️ Tech Stack

**Framework:** [![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org)[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=FFD62E)](https://vitejs.dev)    
**Styling:** [![Tailwind](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)  
**Web3:** [![Wagmi](https://img.shields.io/badge/Wagmi-222?style=flat&logo=wagmi)](https://wagmi.sh/)[![Viem.js](https://img.shields.io/badge/Viem.js-111?style=flat)](http://viem.sh/docs/)   
**HTTP Client:** [![Axios](https://img.shields.io/badge/Axios-202?style=flat&logo=axios)](https://axios-http.com/docs/)


## ⚙️ Environment Variables
Rename the `.env.example` file to `.env` in the frontend directory and update the environment variables with the appropriate values.


## 🚀 Getting Started
```bash
cd frontend
npm install
npm run dev
```

> The app will be available at: http://localhost:5173 

## 🔐 Wallet Configuration
### Local Development (Hardhat Network)
- Ensure your wallet contains **Hardhat ETH**.
- You can obtain this by importing one of the test accounts displayed when you run: `npx hardhat node` in the contracts directory.

If you are using the mock MNEE contract for testing, refer to the contracts [README](/contracts/README.md#-mint-mock-mnee) for instructions on how to mint mock MNEE tokens.

### Sepolia Testnet
- Ensure your wallet contains Sepolia ETH.

- You can obtain Sepolia ETH from the [Google Cloud Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia).

If you are using the mock MNEE contract for testing, refer to the contracts [README](/contracts/README.md#-mint-mock-mnee) for instructions on how to mint mock MNEE tokens.


## 🧩 Notes

- This frontend depends on the backend API for metadata

- Smart contract must be deployed for full functionality

## 📜 License

MIT License
