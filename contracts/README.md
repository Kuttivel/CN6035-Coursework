# 🔗 Rowmart Smart Contracts (Hardhat)

The **Rowmart smart contracts** power the core decentralized logic of the marketplace. They handle **product creation, purchases, escrow, and Transaction lifecycle management** in a trustless and transparent manner.

All contracts are developed, tested, and deployed using **Hardhat**.

## Table of Content
- [🔗 Rowmart Smart Contracts (Hardhat)](#-rowmart-smart-contracts-hardhat)
  - [Table of Content](#table-of-content)
  - [🧠 Contract Responsibilities](#-contract-responsibilities)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [⚙️ Environment Variables](#️-environment-variables)
  - [🚀 Getting Started](#-getting-started)
  - [🚢 Deployment](#-deployment)
  - [🟡 Mint Mock MNEE](#-mint-mock-mnee)
  - [🧪 Testing](#-testing)
  - [🔐 Security Considerations](#-security-considerations)


## 🧠 Contract Responsibilities

- Product listing & ownership  
- Secure on-chain purchases  
- Escrow handling  
- Transactiono lifecycle management  
- Event emission for backend  

## 🛠️ Tech Stack

- **Language:** [![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat&logo=solidity&logoColor=white)](https://soliditylang.org)    
- **Framework:** [![Hardhat](https://img.shields.io/badge/Hardhat-FF3C00?style=flat&logo=hardhat&logoColor=white)](https://hardhat.org)  
- **Libraries:** [![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-000?style=flat&logo=openzeppelin)](https://openzeppelin.com/)  
- **Network:** [![Ethereum (Sepolia Testnet)](https://img.shields.io/badge/Ethereum%20(Sepolia%20Testnet)-000?style=flat&logo=ethereum)](https://openzeppelin.com/)
  
## ⚙️ Environment Variables

Rename the .env.example file to .env in the contract directory and update the environment variables with the appropriate values.

## 🚀 Getting Started
1. Install dependencies
    ```
    cd contracts
    npm install
    ```

2. Compile contracts
   ```bash
    npx hardhat compile
    ```

3. Run tests 
    ```
    npx hardhat test
    ```
4. Start a local Hardhat node
    ```
    npx hardhat node
    ```
## 🚢 Deployment
1. Deploy the smart contracts to the desired network:
    ```bash
    # Local development network
    npx hardhat run scripts/deploy.ts --network localhost

    # Sepolia testnet
    npx hardhat run scripts/deploy.ts --network sepolia

    # Ethereum mainnet
    # (Uncomment the mainnet configuration in hardhat.config.ts first)
    npx hardhat run scripts/deploy.ts --network mainnet
    ```
2. Verify contract
    ```bash
    npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
    ```

## 🟡 Mint Mock MNEE
1. Add your wallet address to the `buyers` array in `scripts/mintMNEESepolia.ts`:
    ```js
    const buyer = [
        // YOUR_WALLET_ADDRESS
    ]
    ```
2. Run the minting script:
   1. Hardhat (local network)
    ```bash
    npx hardhat run scripts/mintMNEE.ts
    ```
   2. Sepolia testnet
    ```bash
    npx hardhat run scripts/mintMNEESepolia.ts
    ```

## 🧪 Testing

Unit tests cover:

- Product creation

- Purchases & escrow

- Order completion & disputes

- Uses Hardhat + Chai.

## 🔐 Security Considerations

- Uses OpenZeppelin guards

- Prevents re-entrancy

- Validates order states

- No admin custody of user funds

📜 License

MIT License
