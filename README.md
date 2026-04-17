# <img src="assets/logo.png" alt="Homepage" width="30"> Rowmart

![Rowmart Banner](assets/preview/homepage.jpg)

Rowmart is a decentralized Web3 marketplace that enables creators and sellers to list products, while buyers securely make purchases using the **`MNEE stablecoin`** through blockchain-powered smart contracts. It combines a modern Web2 user experience with trustless Web3 payments, escrow, and dispute-friendly workflows.

Rowmart is designed to be secure, transparent, and creator-friendly, eliminating unnecessary intermediaries while still delivering a smooth and intuitive user experience.

## Table of Content
- [ Rowmart](#-rowmart)
  - [Table of Content](#table-of-content)
  - [🌐 Live Demo \& Resources](#-live-demo--resources)
  - [🖼️ Preview](#️-preview)
  - [🧠 How Rowmart Works](#-how-rowmart-works)
  - [🏗️ Project Architecture](#️-project-architecture)
  - [🧩 Core Components](#-core-components)
    - [🖥️ Frontend](#️-frontend)
    - [🔗 Smart Contracts](#-smart-contracts)
    - [⚙️ Backend](#️-backend)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [🚀 Getting Started](#-getting-started)
  - [📚 Documentation](#-documentation)
  - [🤝 Contributing](#-contributing)
- [📜 License](#-license)

## 🌐 Live Demo & Resources

[![Demo Website](https://img.shields.io/badge/Demo-Website-blue?style=for-the-badge)](https://rowmart.vercel.app)  
[![Smart Contracts](https://img.shields.io/badge/Contracts-Sepolia%20Testnet-orange?style=for-the-badge)](http://sepolia.etherscan.io/address/0x92CA87E1C9b1FbcB18039FEd44Ab7c490AF9C844)  
[![Smart Contracts](https://img.shields.io/badge/Contracts-MNEE%20MAINNET-springgreen?style=for-the-badge)](https://etherscan.io/address/0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF#code)  
[![Smart Contracts](https://img.shields.io/badge/Contracts-MOCKMNEE%20TESTNET-orange?style=for-the-badge)](http://sepolia.etherscan.io/address/0x6247E28B65fFDd7e75823F0b580919dB8B01B0c6)  
<!-- [![YouTube Demo](https://img.shields.io/badge/Video-Demo-red?style=for-the-badge)](https://youtube.com/watch?v=YOUR_VIDEO_ID)   -->

⚠️ **Note:** This project is currently deployed on **testnet** for development and testing purposes. Refer to frontend [README](/frontend/README.md#-wallet-configuration) on how to get sepolia ETH and mockMNEE token.


## 🖼️ Preview

| Homepage | Product Page | Buy Product| Orders & Escrow | 
|----------|--------------|------------|----------------|
| ![Homepage](/assets/preview/homepage.jpg) | ![Sell Product](/assets/preview/sell-product.jpg) | ![Orders](/assets/preview/buy-product.jpg) |![Orders](/assets/preview/orders.jpg) |


<!-- ## 🎥 Video Demo

[![Watch the demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://youtube.com/watch?v=YOUR_VIDEO_ID) -->

---

## 🧠 How Rowmart Works

1. Sellers list products **on-chain**  
2. Buyers purchase using their **wallet**  
3. Funds are held securely via **smart contracts**  
4. Backend synchronizes **blockchain events**  
5. **Disputes** can be resolved transparently  
6. Sellers receive **payouts** after successful completion  

---

## 🏗️ Project Architecture
```bash
rowmart/
├── frontend/ # Web application (UI / UX)
├── backend/ # API & off-chain services
├── contracts/ # Smart contracts (Hardhat)
└── README.md
```


---

## 🧩 Core Components

### 🖥️ Frontend
- Web3-enabled marketplace UI  
- Wallet connection & transaction signing  
- Product listings, orders, ratings, and reviews  
- Built for speed and usability  

### 🔗 Smart Contracts
- Written in **Solidity** using Hardhat  
- Handles:  
  - Product creation  
  - Purchasing & escrow  
  - Order lifecycle  

### ⚙️ Backend
- Off-chain logic & API services  
- Email notifications  
- Improves performance and UX  

---

## 🛠️ Tech Stack

**Frontend**  
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org)  
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=FFD62E)](https://vitejs.dev)  
[![Tailwind](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)  
[![Wagmi](https://img.shields.io/badge/Wagmi-222?style=flat&logo=wagmi)](https://wagmi.sh/)  
[![Viem.js](https://img.shields.io/badge/Viem.js-000?style=flat&logo=viem)](http://viem.sh/docs/)

**Backend**  
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)  
[![Fastify](https://img.shields.io/badge/Fastify-20232A?style=flat&logo=fastify&logoColor=white)](https://www.fastify.io/)  
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com)  
[![Ethers.js](https://img.shields.io/badge/Ethers.js-222?style=flat&logo=ethers)](https://docs.ethers.io/)

**Smart Contracts**  
[![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat&logo=solidity&logoColor=white)](https://soliditylang.org)  
[![Hardhat](https://img.shields.io/badge/Hardhat-FF3C00?style=flat&logo=hardhat&logoColor=white)](https://hardhat.org)  
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-000?style=flat)](https://openzeppelin.com/)

---

## 🚀 Getting Started

```bash
git clone https://github.com/GoldenThrust/rowmart
cd rowmart

npm run dev:server
npm run dev:client
```
> Each folder contains its own setup instructions.

## 📚 Documentation

- Frontend documentation → [frontend/README.md](/frontend/README.md)

- Backend documentation → [backend/README.md](/backend/README.md)

- Smart contract documentation → [contracts/README.md](/contracts/README.md)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome:

1. Fork the repository

2. Create a new branch

3. Commit your changes

4. Open a pull request

# 📜 License

This project is licensed under the MIT License.