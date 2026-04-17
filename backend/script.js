import mongoose from "mongoose";
// import { Contract } from "ethers";
// import { JsonRpcProvider } from "ethers";
// import { MarketplaceContractConfig } from "./contract/marketPlace.js";
import Product from "./models/product.js";
import Transaction from "./models/transaction.js";
import "dotenv/config"

import { createTransport } from "nodemailer";
import MailService from "./services/mailService.js";

mongoose.connect(process.env.MONGO_URI, {
    autoIndex: false,
    maxPoolSize: 10,
}).then(async () => {
    // const provider = new JsonRpcProvider();

    // const contract = new Contract(
    //     ...MarketplaceContractConfig,
    //     provider
    // );

    const transactions = await Transaction.findOne({ transactionId: 1});

    console.log(transactions)
    // transactions.forEach(async (transaction) => {
    //     try {
    // const onChainTransaction = await contract.transactions(transaction.transactionId);
    // console.log(`Updated transaction ${transaction.transactionId} with status ${onChainTransaction.status}`);
    //         console.log(onChainTransaction);
    //     } catch (err) {
    //         console.error(`Failed to update transaction ${transaction.transactionId}:`, err);
    //     }
    // });
    // const products = await Product.find({});

    // products.forEach(async (product) => {
        // console.log(product);
        //     try {
        //         const onChainProduct = await contract.products(product.productId);
        //         const sellerAddress = onChainProduct.seller;
        //         product.seller = sellerAddress;
        //         await product.save();
        //         console.log(`Updated product ${product.productId} with seller ${sellerAddress}`);
        //     } catch (err) {
        //         console.error(`Failed to update product ${product.productId}:`, err);
        //     }

        // process.exit(0);
    // });

}).catch((err) => {
    process.exit(1);
});


const res = await fetch("https://rowmart.onrender.com/send-mail");
const data = await res.json();
console.log(data);
