import { model, Schema } from "mongoose";

const reviewSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },
        reviewer: {
            type: String,
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 500,
            required: true,
        },
    },
    { timestamps: true }
);

/**
 * Prevent the same reviewer from rating the same product twice
 */
reviewSchema.index({ reviewer: 1, product: 1 }, { unique: true });

const Review = model("Review", reviewSchema);
export default Review;
