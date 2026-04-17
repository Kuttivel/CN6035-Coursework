import { TemplateEngine } from "./template-engine.js";

export default class MailService {
    constructor(mailer, appName = "Rowmart") {
        this.mailer = mailer;
        this.appName = appName;
    }

    /* -----------------------------
       PRODUCT CREATION (SELLER)
    ------------------------------ */
    async sendProductCreationMail(to,
        sellerName,
        product) {
        const html = await TemplateEngine.render("product-created", {
            PLATFORM_NAME: this.appName,
            SELLER_NAME: sellerName,
            PRODUCT_NAME: product.name,
            PRODUCT_ID: product.productId,
            PRODUCT_PRICE: product.price,
            PRODUCT_QUANTITY: product.quantity,
            CURRENCY: "MNEE",
            CREATED_DATE: new Date(product.createdAt).toLocaleString(),
        });

        await this.mailer.sendMail({
            to,
            subject: "Your product has been listed",
            html,
        });
    }

    /* -----------------------------
       PRODUCT PURCHASE (BUYER)
    ------------------------------ */
    async sendBuyerPurchaseMail(
        to,
        sellerEmail,
        product,
        quantity,
        totalPrice) {
        const html = await TemplateEngine.render("purchase-buyer", {
            PLATFORM_NAME: this.appName,
            PRODUCT_NAME: product.name,
            PURCHASE_QUANTITY: quantity,
            TOTAL_PRICE: totalPrice,
            CURRENCY: "MNEE",
            SELLER_EMAIL: sellerEmail,
            PURCHASE_DATE: new Date().toLocaleString(),
        });

        await this.mailer.sendMail({
            to,
            subject: "Purchase confirmation",
            html,
        });
    }

    /* -----------------------------
       PRODUCT PURCHASE (SELLER)
    ------------------------------ */
    async sendSellerPurchaseMail(
        to,
        buyerEmail,
        product,
        quantity,
        totalPrice) {
        const html = await TemplateEngine.render("purchase-seller", {
            PLATFORM_NAME: this.appName,
            PRODUCT_NAME: product.name,
            PURCHASE_QUANTITY: quantity,
            TOTAL_PRICE: totalPrice,
            CURRENCY: "MNEE",
            BUYER_EMAIL: buyerEmail,
            PURCHASE_DATE: new Date().toLocaleString(),
        });

        await this.mailer.sendMail({
            to,
            subject: "Your product has been purchased",
            html,
        });
    }

    /* -----------------------------
   TRANSACTION COMPLETED (SELLER)
------------------------------ */
    async sendSellerTransactionCompletionMail(to, transaction) {
        const html = await TemplateEngine.render("transaction-completed-seller", {
            PLATFORM_NAME: this.appName,
            TRANSACTION_ID: transaction.transactionId,
            PRODUCT_NAME: transaction.product.name,
            AMOUNT: transaction.price * transaction.quantity,
            CURRENCY: "MNEE",
            COMPLETION_DATE: new Date().toLocaleString(),
        });

        await this.mailer.sendMail({
            to,
            subject: "Funds released for completed transaction",
            html,
        });
    }


    /* -----------------------------
       TRANSACTION REFUNDED (BUYER)
    ------------------------------ */
    async sendBuyerTransactionRefundedMail(to, transaction) {
        const html = await TemplateEngine.render("transaction-refunded-buyer", {
            PLATFORM_NAME: this.appName,
            TRANSACTION_ID: transaction.transactionId,
            PRODUCT_NAME: transaction.product.name,
            REFUND_AMOUNT: transaction.price * transaction.quantity,
            CURRENCY: "MNEE",
            REFUND_DATE: new Date().toLocaleString(),
        });

        await this.mailer.sendMail({
            to,
            subject: "Your refund has been processed",
            html,
        });
    }

    /* -----------------------------
       DISPUTE OPENED (BUYER)
    ------------------------------ */
    async sendBuyerDisputeOpenedMail(to, transaction) {
        const html = await TemplateEngine.render("dispute-opened-buyer", {
            PLATFORM_NAME: this.appName,
            TRANSACTION_ID: transaction.transactionId,
            PRODUCT_NAME: transaction.product.name,
            OPENED_DATE: new Date().toLocaleString(),
        });

        await this.mailer.sendMail({
            to,
            subject: "Dispute opened successfully",
            html,
        });
    }


    /* -----------------------------
       DISPUTE OPENED (SELLER)
    ------------------------------ */
    async sendSellerDisputeOpenedMail(to, transaction) {
        const html = await TemplateEngine.render("dispute-opened-seller", {
            PLATFORM_NAME: this.appName,
            TRANSACTION_ID: transaction.transactionId,
            PRODUCT_NAME: transaction.product.name,
            BUYER_EMAIL: transaction.buyerEmail,
            OPENED_DATE: new Date().toLocaleString(),
        });

        await this.mailer.sendMail({
            to,
            subject: "A dispute has been opened on your product",
            html,
        });
    }


    /* -----------------------------
       DISPUTE RESOLVED (BUYER)
    ------------------------------ */
    async sendBuyerDisputeResolvedMail(to, transaction, buyerWon) {
        const html = await TemplateEngine.render("dispute-resolved-buyer", {
            PLATFORM_NAME: this.appName,
            TRANSACTION_ID: transaction.transactionId,
            PRODUCT_NAME: transaction.product.name,
            OUTCOME: buyerWon ? "You won the dispute" : "Seller won the dispute",
            RESOLVED_DATE: new Date().toLocaleString(),
        });

        await this.mailer.sendMail({
            to,
            subject: "Dispute resolved",
            html,
        });
    }


    /* -----------------------------
       DISPUTE RESOLVED (SELLER)
    ------------------------------ */
    async sendSellerDisputeResolvedMail(to, transaction, buyerWon) {
        const html = await TemplateEngine.render("dispute-resolved-seller", {
            PLATFORM_NAME: this.appName,
            TRANSACTION_ID: transaction.transactionId,
            PRODUCT_NAME: transaction.product.name,
            OUTCOME: buyerWon ? "Buyer won the dispute" : "You won the dispute",
            RESOLVED_DATE: new Date().toLocaleString(),
        });

        await this.mailer.sendMail({
            to,
            subject: "Dispute resolved",
            html,
        });
    }


    /* -----------------------------
       REVIEW SUBMITTED (SELLER)
    ------------------------------ */
    async sendSellerReviewNotificationMail(to, product, reviewer) {
        const html = await TemplateEngine.render("review-submitted-seller", {
            PLATFORM_NAME: this.appName,
            PRODUCT_NAME: product.name,
            REVIEWER_ADDRESS: reviewer,
            REVIEW_DATE: new Date().toLocaleString(),
        });

        await this.mailer.sendMail({
            to,
            subject: "A new review has been submitted",
            html,
        });
    }
}
