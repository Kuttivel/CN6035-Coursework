import { model, Schema } from "mongoose";

const transactionSchema = new Schema({
    transactionId: {
        type: String,
        required: true
    },
    buyer: {
        type: String,
        required: true,
    },
    seller: {
        type: String,
        required: true,
    },
    buyerEmail: {
        type: String,
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    detailsId: {
        type: String,
        unique: true,
        required: true
    },
    detailsCid: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "disputed", "completed", "refunded"]
    },
    success: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
transactionSchema.index({ success: 1, createdAt: 1 });

const Transaction = model("Transaction", transactionSchema);

export default Transaction;