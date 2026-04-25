import mongoose from "mongoose";

// Schema for size + stock per color
const sizeSchema = new mongoose.Schema({
    size: {
        type: String,
        enum: ["S", "M", "L", "XL", "2XL", "3XL"],
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    }
});

// Schema for color + images + sizes
const colorSchema = new mongoose.Schema({
    colorName: { type: String, required: true },    // red, purple, navy etc.
    mainImage: { type: String, default: "" },       // VTON image optional
    images: [{ type: String }],                     // catalog / model / sample images
    sizes: [sizeSchema]                             // per size stock
});

// Main Product Schema
const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },

        // multi category
        categories: [{ type: String, required: true }], // men, women, kids etc.
        brand: {
            type: String,
            required: true
        },
        originalPrice: { type: Number, required: true },
        salePrice: { type: Number, required: true },

        // colors array
        colors: [colorSchema],

        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;