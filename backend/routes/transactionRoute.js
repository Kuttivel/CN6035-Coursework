import { getTransactionCount } from "../contract/services/getTransactionCount.js";
import Product from "../models/product.js";
import Transaction from "../models/transaction.js";
import { createTransactionSchema, deleteTransactionSchema, getTransactionSchema, getTransactionsSchema, updateTransactionSchema } from "../schemas/transaction.schema.js";

export default async function transactionRoute(fastify) {
    const { pinata } = fastify;
    // ---------------- CREATE Transaction ----------------
    fastify.post(
        "/create-transaction",
        { schema: createTransactionSchema },
        async (request, reply) => {
            try {
                const fields = request.body;
                const transactionCount = await getTransactionCount(fastify);

                // Upload to Pinata
                const { id, cid } = await pinata.upload.public.json(fields);

                const product = await Product.findById(fields.productId);
                if (!product) {
                    return reply.status(404).send({ message: "Product not found" });
                }

                // Save to MongoDB
                const transaction = await Transaction.create({
                    ...fields,
                    product,
                    detailsId: id,
                    detailsCid: cid,
                    transactionId: (transactionCount + 1n).toString(),
                    success: false
                });

                return reply.send({ success: true, transaction });
            } catch (err) {
                request.log.error(err);
                return reply.status(500).send({ message: "Failed to create transaction: " + err.message });
            }
        }
    );

    // ---------------- UPDATE TRANSACTION ----------------
    fastify.put(
        "/update-transaction",
        { schema: updateTransactionSchema },
        async (request, reply) => {
            try {
                const { id, ...fields } = request.body;
                const updatedTransaction = await Transaction.findByIdAndUpdate(id, fields, { new: true });

                return reply.send({ success: true, transaction: updatedTransaction });
            } catch (err) {
                request.log.error(err);
                return reply.status(500).send({ message: "Failed to update transaction" });
            }
        }
    );

    // ---------------- GET TRANSACTIONS WITH PAGINATION ----------------
    fastify.get(
        "/get-transactions",
        { schema: getTransactionsSchema },
        async (request, reply) => {
            try {
                const {
                    page = 1,
                    limit = 10,
                    address,
                    status,
                    isSeller,
                    success,
                } = request.query;

                const pageNum = Number(page);
                const limitNum = Number(limit);

                const query = { success };

                if (status) {
                    query.status = status;
                }

                if (address) {
                    if (isSeller === true || isSeller === "true") {
                        query.seller = address;
                    } else if (isSeller === false || isSeller === "false") {
                        query.buyer = address;
                    } else {
                        query.$or = [{ seller: address }, { buyer: address }];
                    }
                }

                const [transactions, total] = await Promise.all([
                    Transaction.find(query)
                        .skip((pageNum - 1) * limitNum)
                        .limit(limitNum)
                        .sort({ createdAt: -1 }).populate('product'),
                    Transaction.countDocuments(query),
                ]);

                return reply.send({
                    success: true,
                    meta: {
                        total,
                        page: pageNum,
                        limit: limitNum,
                        totalPages: Math.ceil(total / limitNum),
                    },
                    transactions,
                });
            } catch (err) {
                request.log.error(err);

                return reply
                    .status(500)
                    .send({ success: false, message: "Failed to get transactions" });
            }
        }
    );

    // ---------------- GET SINGLE TRANSACTION ----------------
    fastify.get(
        "/get-transaction",
        { schema: getTransactionSchema },
        async (request, reply) => {
            try {
                const { transactionId, id } = request.query;

                const result = await Transaction.findOne(id ? { _id: id } : { transactionId });

                return reply.send({ success: true, data: result });
            } catch (err) {
                request.log.error(err);
                return reply.status(500).send({ message: "Failed to get transaction" });
            }
        }
    );

    // ---------------- DELETE TRANSACTION ----------------
    fastify.delete(
        "/delete-transaction",
        { schema: deleteTransactionSchema },
        async (request, reply) => {
            try {
                const { id } = request.body;

                // Delete from Mongo
                const deletedTransaction = await Transaction.findByIdAndDelete(id);

                if (!deletedTransaction) {
                    return reply.status(404).send({
                        success: false,
                        message: "Transaction not found"
                    });
                }

                // Delete from Pinata
                await pinata.files.public.delete([deletedTransaction.detailsId]);

                return reply.send({ success: true, message: "Transaction deleted successfully" });
            } catch (err) {
                request.log.error(err);
                return reply.status(500).send({ message: "Failed to delete transaction" });
            }
        }
    );
}
