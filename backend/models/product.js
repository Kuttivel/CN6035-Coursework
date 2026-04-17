import { model, Schema } from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    seller: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageId: {
        type: String,
        unique: true,
        required: true
    },
    imageCid: {
        type: String,
        unique: true,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review",
    }],
    averageRating: {
        type: Number,
        default: 0,
    },
    ratingCount: {
        type: Number,
        default: 0,
    },
    active: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

productSchema.index({ active: 1, createdAt: 1 });
const Product = model("Product", productSchema);
// TODO: price range filter

export default Product;