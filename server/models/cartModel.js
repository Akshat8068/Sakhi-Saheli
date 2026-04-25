import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true
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
            _id: false
        }
    ]
}, {
    timestamps: true
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;