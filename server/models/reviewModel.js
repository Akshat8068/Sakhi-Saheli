import mongoose from "mongoose";

const reviewModel = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Please Add Review"]
    },
    text: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 1,
        required: true
    },
    isVerifedBuyer: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
})

const Review = mongoose.model("Review", reviewModel)

export default Review