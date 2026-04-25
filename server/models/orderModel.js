import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            colorName: {
                type: String,
                required: true
            },
            colorMainImage: {
                type: String,
                required: true
            },
            size: {
                type: String,
                required: true,
                enum: ["S", "M", "L", "XL", "2XL", "3XL"]
            },
            qty: {
                type: Number,
                required: true,
                min: [1, "Quantity cannot be less than 1"],
                default: 1
            },
            _id: false // Prevents MongoDB from creating _id for subdocuments
        }
    ],
    TotalBillAmount: {
        type: Number,
        required: true
    },
    isDiscounted: {
        type: Boolean,
        required: true,
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon"
    },
    status: {
        type: String,
        enum: ["placed", "dispatched", "cancelled", "delivered"],
        default: "placed",
        required: true
    },
    shippingAddress: {
        type: String,
        required: [true, "Please Enter Shipping Address"]
    }
}, {
    timestamps: true
})

const Order = mongoose.model("Order", orderSchema)

export default Order