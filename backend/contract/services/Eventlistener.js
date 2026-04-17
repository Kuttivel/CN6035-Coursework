import { Contract } from "ethers";
import Product from "../../models/product.js";
import Transaction from "../../models/transaction.js";
import { MNEEContractConfig } from "../mnee.js";

export function listenToEvents(fastify) {
    const { contract, provider } = fastify.ethers;
    const { mailservice } = fastify;

    contract.on(
        "ProductCreated",
        async (productId, seller, uri) => {
            console.log("ProductCreated event detected:", { productId, seller, uri });
            try {
                const product = await Product.findOneAndUpdate({ seller, imageCid: uri }, { productId: productId.toString(), active: true }, { new: true });
                await mailservice.sendProductCreationMail(product.email, seller, product);
            } catch (error) {
                fastify.log.error("Error handling ProductCreated event:", error);
                console.error("Error handling ProductCreated event:", error);
            }

        }
    );
    contract.on(
        "ProductPurchased",
        async (productId, txnId, uri) => {
            console.log("ProductPurchased event detected:", { productId, txnId, uri });
            try {
                const product = await Product.findOne({ productId });

                const transaction = await Transaction.findOneAndUpdate({ product, detailsCid: uri }, {
                    transactionId: txnId.toString(),
                    success: true
                }, { new: true });


                await mailservice.sendBuyerPurchaseMail(transaction.buyerEmail, product.email, product, transaction.quantity, transaction.price * transaction.quantity);
                await mailservice.sendSellerPurchaseMail(product.email, transaction.buyerEmail, product, transaction.quantity, transaction.price * transaction.quantity);
            } catch (error) {
                fastify.log.error("Error handling ProductPurchased event:", error);
                console.error("Error handling ProductPurchased event:", error);
            }
        }
    );
    contract.on(
        "TransactionCompleted",
        async (txnId) => {
            console.log("TransactionCompleted event detected:", { txnId });
            try {
                const transaction = await Transaction.findOne({
                    transactionId: txnId.toString(),
                }).populate("product");

                
                transaction.status = 'completed';
                await transaction.save();

                if (!transaction) return;

                await mailservice.sendSellerTransactionCompletionMail(
                    transaction.product.email,
                    transaction
                );
            } catch (error) {
                fastify.log.error("Error handling TransactionCompleted event:", error);
            }
        }
    );


    contract.on(
        "TransactionRefunded",
        async (txnId) => {
            console.log("TransactionRefunded event detected:", { txnId });
            try {
                const transaction = await Transaction.findOne({
                    transactionId: txnId.toString(),
                }).populate("product");
                
                transaction.status = 'refunded';
                await transaction.save();

                if (!transaction) return;

                await mailservice.sendBuyerTransactionRefundedMail(
                    transaction.buyerEmail,
                    transaction
                );
            } catch (error) {
                fastify.log.error("Error handling TransactionRefunded event:", error);
            }
        }
    );

    contract.on(
        "DisputeOpened",
        async (txnId) => {
            console.log("DisputeOpened event detected:", { txnId });
            try {
                const transaction = await Transaction.findOne({
                    transactionId: txnId.toString(),
                }).populate("product");

                transaction.status = 'disputed';
                await transaction.save();

                if (!transaction) return;

                await mailservice.sendBuyerDisputeOpenedMail(
                    transaction.buyerEmail,
                    transaction
                );

                await mailservice.sendSellerDisputeOpenedMail(
                    transaction.product.email,
                    transaction
                );
            } catch (error) {
                fastify.log.error("Error handling DisputeOpened event:", error);
            }
        }
    );

    contract.on(
        "DisputeResolved",
        async (txnId, buyerWon) => {
            console.log("DisputeResolved event detected:", { txnId, buyerWon });
            try {
                const transaction = await Transaction.findOne({
                    transactionId: txnId.toString(),
                }).populate("product");

                if (!transaction) return;

                await mailservice.sendBuyerDisputeResolvedMail(
                    transaction.buyerEmail,
                    transaction,
                    buyerWon
                );

                await mailservice.sendSellerDisputeResolvedMail(
                    transaction.product.email,
                    transaction,
                    buyerWon
                );
            } catch (error) {
                fastify.log.error("Error handling DisputeResolved event:", error);
            }
        }
    );

    contract.on(
        "ReviewSubmitted",
        async (productId, reviewer) => {
            console.log("ReviewSubmitted event detected:", { productId, reviewer });
            try {
                const product = await Product.findOne({
                    productId: productId.toString(),
                });

                if (!product) return;

                await mailservice.sendSellerReviewNotificationMail(
                    product.email,
                    product,
                    reviewer
                );
            } catch (error) {
                fastify.log.error("Error handling ReviewSubmitted event:", error);
            }
        }
    );

    // const contracts = new Contract(
    //     ...MNEEContractConfig,
    //     provider
    // );

    // contracts.on(
    //     "Transfer",
    //     async (from, to, value) => {
    //         console.log(from, to, value);
    //     }
    // );
}