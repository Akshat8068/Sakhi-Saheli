import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        unique: true,
        required: [true, "Please Type Coupon"]
    },
    couponDiscount: {
        type: Number,
        required: [true, "Please enter % Coupan Discount"]
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
})

const Coupan = mongoose.model("Coupon", couponSchema)

export default Coupan 