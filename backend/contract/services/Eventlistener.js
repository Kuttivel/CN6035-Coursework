import Product from "../../models/product.js";
import Transaction from "../../models/transaction.js";

export function listenToEvents(fastify) {
  const { contract } = fastify.ethers;
  const { mailservice } = fastify;

  contract.on("ProductCreated", async (productId, seller, uri) => {
    console.log("ProductCreated event detected:", { productId, seller, uri });

    try {
      const normalizedSeller = seller.toLowerCase();

      const product = await Product.findOneAndUpdate(
        {
          seller: normalizedSeller,
          imageCid: uri,
          active: false,
        },
        {
          active: true,
          seller: normalizedSeller,
          productId: productId.toString(),
        },
        {
          new: true,
          sort: { createdAt: -1 },
        }
      );

      if (!product) {
        fastify.log.error(
          `ProductCreated sync failed: no pending product found for seller ${normalizedSeller} and imageCid ${uri}`
        );
        return;
      }

      try {
        await mailservice.sendProductCreationMail(
          product.email,
          seller,
          product
        );
      } catch (mailError) {
        fastify.log.error("ProductCreated mail failed:", mailError);
      }
    } catch (error) {
      fastify.log.error("Error handling ProductCreated event:", error);
    }
  });

  contract.on("ProductPurchased", async (productId, txnId, uri) => {
    console.log("ProductPurchased event detected:", { productId, txnId, uri });

    try {
      const transaction = await Transaction.findOneAndUpdate(
        {
          detailsCid: uri,
          success: false,
        },
        {
          transactionId: txnId.toString(),
          success: true,
          status: "pending",
        },
        {
          new: true,
          sort: { createdAt: -1 },
        }
      ).populate("product");

      if (!transaction) {
        fastify.log.error(
          `ProductPurchased sync failed: no pending transaction found for detailsCid ${uri}`
        );
        return;
      }

      const product = transaction.product;

      if (!product) {
        fastify.log.error(
          `ProductPurchased sync failed: no populated product found for transaction ${txnId.toString()}`
        );
        return;
      }

      try {
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
      } catch (mailError) {
        fastify.log.error("ProductPurchased mail failed:", mailError);
      }
    } catch (error) {
      fastify.log.error("Error handling ProductPurchased event:", error);
    }
  });

  contract.on("TransactionCompleted", async (txnId) => {
    console.log("TransactionCompleted event detected:", { txnId });

    try {
      const transaction = await Transaction.findOne({
        transactionId: txnId.toString(),
      });

      if (!transaction) return;

      transaction.status = "completed";
      await transaction.save();
    } catch (error) {
      fastify.log.error("Error handling TransactionCompleted event:", error);
    }
  });

  contract.on("TransactionRefunded", async (txnId) => {
    console.log("TransactionRefunded event detected:", { txnId });

    try {
      const transaction = await Transaction.findOne({
        transactionId: txnId.toString(),
      });

      if (!transaction) return;

      transaction.status = "refunded";
      await transaction.save();
    } catch (error) {
      fastify.log.error("Error handling TransactionRefunded event:", error);
    }
  });

  contract.on("DisputeOpened", async (txnId) => {
    console.log("DisputeOpened event detected:", { txnId });

    try {
      const transaction = await Transaction.findOne({
        transactionId: txnId.toString(),
      });

      if (!transaction) return;

      transaction.status = "disputed";
      await transaction.save();
    } catch (error) {
      fastify.log.error("Error handling DisputeOpened event:", error);
    }
  });

  contract.on("DisputeResolved", async (txnId, buyerWon) => {
    console.log("DisputeResolved event detected:", { txnId, buyerWon });

    try {
      const transaction = await Transaction.findOne({
        transactionId: txnId.toString(),
      });

      if (!transaction) return;

      transaction.status = buyerWon ? "refunded" : "completed";
      await transaction.save();
    } catch (error) {
      fastify.log.error("Error handling DisputeResolved event:", error);
    }
  });

  contract.on("ReviewSubmitted", async (productId, reviewer) => {
    console.log("ReviewSubmitted event detected:", { productId, reviewer });

    try {
      const product = await Product.findOne({
        productId: productId.toString(),
      });

      if (!product) return;

      try {
        await mailservice.sendSellerReviewNotificationMail(
          product.email,
          product,
          reviewer
        );
      } catch (mailError) {
        fastify.log.error("ReviewSubmitted mail failed:", mailError);
      }
    } catch (error) {
      fastify.log.error("Error handling ReviewSubmitted event:", error);
    }
  });
}