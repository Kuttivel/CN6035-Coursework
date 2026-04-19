import Product from "../../models/product.js";
import Transaction from "../../models/transaction.js";

export function listenToEvents(fastify) {
  const { contract } = fastify.ethers;
  const { mailservice } = fastify;

  contract.on("ProductCreated", async (productId, seller, uri) => {
    console.log("ProductCreated event detected:", { productId, seller, uri });

    try {
      const product = await Product.findOneAndUpdate(
        { productId: productId.toString() },
        {
          active: true,
          seller: seller.toLowerCase(),
          imageCid: uri,
        },
        { new: true }
      );

      if (!product) {
        fastify.log.error(
          `ProductCreated sync failed: no product found for productId ${productId.toString()}`
        );
        return;
      }

      await mailservice.sendProductCreationMail(
        product.email,
        seller,
        product
      );
    } catch (error) {
      fastify.log.error("Error handling ProductCreated event:", error);
      console.error("Error handling ProductCreated event:", error);
    }
  });

  contract.on("ProductPurchased", async (productId, txnId, uri) => {
    console.log("ProductPurchased event detected:", { productId, txnId, uri });

    try {
      const product = await Product.findOne({
        productId: productId.toString(),
      });

      if (!product) {
        fastify.log.error(
          `ProductPurchased sync failed: no product found for productId ${productId.toString()}`
        );
        return;
      }

      const transaction = await Transaction.findOneAndUpdate(
        {
          product,
          detailsCid: uri,
        },
        {
          transactionId: txnId.toString(),
          success: true,
        },
        { new: true }
      );

      if (!transaction) {
        fastify.log.error(
          `ProductPurchased sync failed: no transaction found for txnId ${txnId.toString()}`
        );
        return;
      }

      await mailservice.sendBuyerPurchaseMail(
        transaction.buyerEmail,
        product.email,
        product,
        transaction.quantity,
        transaction.price * transaction.quantity
      );

      await mailservice.sendSellerPurchaseMail(
        product.email,
        transaction.buyerEmail,
        product,
        transaction.quantity,
        transaction.price * transaction.quantity
      );
    } catch (error) {
      fastify.log.error("Error handling ProductPurchased event:", error);
      console.error("Error handling ProductPurchased event:", error);
    }
  });

  contract.on("TransactionCompleted", async (txnId) => {
    console.log("TransactionCompleted event detected:", { txnId });

    try {
      const transaction = await Transaction.findOne({
        transactionId: txnId.toString(),
      }).populate("product");

      if (!transaction) {
        fastify.log.error(
          `TransactionCompleted sync failed: no transaction found for txnId ${txnId.toString()}`
        );
        return;
      }

      transaction.status = "completed";
      await transaction.save();

      await mailservice.sendSellerTransactionCompletionMail(
        transaction.product.email,
        transaction
      );
    } catch (error) {
      fastify.log.error("Error handling TransactionCompleted event:", error);
      console.error("Error handling TransactionCompleted event:", error);
    }
  });

  contract.on("TransactionRefunded", async (txnId) => {
    console.log("TransactionRefunded event detected:", { txnId });

    try {
      const transaction = await Transaction.findOne({
        transactionId: txnId.toString(),
      }).populate("product");

      if (!transaction) {
        fastify.log.error(
          `TransactionRefunded sync failed: no transaction found for txnId ${txnId.toString()}`
        );
        return;
      }

      transaction.status = "refunded";
      await transaction.save();

      await mailservice.sendBuyerTransactionRefundedMail(
        transaction.buyerEmail,
        transaction
      );
    } catch (error) {
      fastify.log.error("Error handling TransactionRefunded event:", error);
      console.error("Error handling TransactionRefunded event:", error);
    }
  });

  contract.on("DisputeOpened", async (txnId) => {
    console.log("DisputeOpened event detected:", { txnId });

    try {
      const transaction = await Transaction.findOne({
        transactionId: txnId.toString(),
      }).populate("product");

      if (!transaction) {
        fastify.log.error(
          `DisputeOpened sync failed: no transaction found for txnId ${txnId.toString()}`
        );
        return;
      }

      transaction.status = "disputed";
      await transaction.save();

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
      console.error("Error handling DisputeOpened event:", error);
    }
  });

  contract.on("DisputeResolved", async (txnId, buyerWon) => {
    console.log("DisputeResolved event detected:", { txnId, buyerWon });

    try {
      const transaction = await Transaction.findOne({
        transactionId: txnId.toString(),
      }).populate("product");

      if (!transaction) {
        fastify.log.error(
          `DisputeResolved sync failed: no transaction found for txnId ${txnId.toString()}`
        );
        return;
      }

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
      console.error("Error handling DisputeResolved event:", error);
    }
  });

  contract.on("ReviewSubmitted", async (productId, reviewer) => {
    console.log("ReviewSubmitted event detected:", { productId, reviewer });

    try {
      const product = await Product.findOne({
        productId: productId.toString(),
      });

      if (!product) {
        fastify.log.error(
          `ReviewSubmitted sync failed: no product found for productId ${productId.toString()}`
        );
        return;
      }

      await mailservice.sendSellerReviewNotificationMail(
        product.email,
        product,
        reviewer
      );
    } catch (error) {
      fastify.log.error("Error handling ReviewSubmitted event:", error);
      console.error("Error handling ReviewSubmitted event:", error);
    }
  });
}