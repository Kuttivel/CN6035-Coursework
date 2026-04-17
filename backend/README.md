# ⚙️ Rowmart Backend

The **Rowmart backend** provides off-chain services that support the decentralized marketplace. It handles metadata storage, email notifications, and synchronizes blockchain events to improve performance and user experience.

While payments and escrow are fully handled on-chain, the backend acts as a reliable bridge between **Web2 and Web3**.

## Table of Content
- [⚙️ Rowmart Backend](#️-rowmart-backend)
  - [Table of Content](#table-of-content)
  - [🧠 Responsibilities](#-responsibilities)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [⚙️ Environment Variables](#️-environment-variables)
  - [🚀 Getting Started](#-getting-started)
  - [🔄 Blockchain Event Listener](#-blockchain-event-listener)
  - [📜 License](#-license)
  

## 🧠 Responsibilities

- Product metadata management  

- Email notifications  
- Blockchain event listeners  
- Dispute & order status support  
- API for frontend consumption  

---

## 🛠️ Tech Stack

- **Runtime:** [![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)   
- **Framework:** [![Fastify](https://img.shields.io/badge/Fastify-20232A?style=flat&logo=fastify&logoColor=white)](https://www.fastify.io/)  
- **Database:** [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com)  
- **Blockchain:** [![Ethers.js](https://img.shields.io/badge/Ethers.js-222?style=flat&logo=ethers)](https://docs.ethers.io/)  
- **Email:** [![Nodemailer](https://img.shields.io/badge/Nodemailer-222?style=flat&logo=gmail)](https://nodemailer.com/)  


## ⚙️ Environment Variables

Rename the `.env.example` file to `.env` in the backend directory and update the environment variables with the appropriate values.

## 🚀 Getting Started
```bash
cd backend
npm install
npm run dev
```


The server will start on: http://localhost:3000

## 🔄 Blockchain Event Listener

The backend listens to smart contract events such as:

- ProductCreated
- ProductPurchased
- TransactionCompleted
- TransactionRefunded
- ReviewSubmitted
- DisputeOpened
- DisputeResolved

🔐 Security Notes

- Sensitive actions are validated against on-chain state

- Backend never controls user funds


## 📜 License

MIT License