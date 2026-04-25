import Product from "../models/productModel.js"

const getProducts = async (req, res) => {
    let products = await Product.find()
    if (!products) {
        res.status(404)
        throw new Error("No Products Found");
    }
    res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: { products }
    })
}

const getProduct = async (req, res) => {
    let product = await Product.findById(req.params.pid)
    if (!product) {
        res.status(404)
        throw new Error("No Product Found");
    }
    res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        data: { product }
    })
}

const productContoller = { getProduct, getProducts }

export default productContoller
