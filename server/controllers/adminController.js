import fs from "node:fs"
import User from "../models/userModel.js"
import Order from "../models/orderModel.js"
import Review from "../models/reviewModel.js"
import Product from "../models/productModel.js"
import Coupan from "../models/couponModel.js"
import uploaderToCloudinary from "../middleware/cloudinaryMiddleware.js"

const getAllUsers = async (req, res) => {
    let users = await User.find()
    if (!users) {
        res.status(404)
        throw new Error("No users Found")
    }
    res.status(200).json({ success: true, message: "Users fetched successfully", data: { users } })
}

const updateUser = async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(req.params.uid, req.body, { new: true })
    if (!updatedUser) {
        res.status(409)
        throw new Error("User Not Updated")
    }
    res.status(200).json({ success: true, message: "User updated successfully", data: { user: updatedUser } })
}

const getAllProducts = async (req, res) => {
    let products = await Product.find()
    if (!products) {
        res.status(404)
        throw new Error("No Products Found")
    }
    res.status(200).json({ success: true, message: "Products fetched successfully", data: { products } })
}

const getAdminProduct = async (req, res) => {
    let product = await Product.findById(req.params.pid)
    if (!product) {
        res.status(404)
        throw new Error("No Product Found")
    }
    res.status(200).json({ success: true, message: "Product fetched successfully", data: { product } })
}

const addProducts = async (req, res) => {
    try {
        const { name, description, brand, originalPrice, salePrice } = req.body
        const categories = req.body.categories ? JSON.parse(req.body.categories) : null
        const colors = req.body.colors ? JSON.parse(req.body.colors) : null

        if (!name || !description || !brand || !categories || !originalPrice || !salePrice || !colors) {
            return res.status(409).json({ success: false, message: "Please fill all details including colors!" })
        }

        const processedColors = []
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i]
            let mainImagePath = ""
            if (req.files?.[`mainImage_${i}`]?.[0]) {
                const uploadResult = await uploaderToCloudinary(req.files[`mainImage_${i}`][0].path)
                mainImagePath = uploadResult.secure_url
                if (fs.existsSync(req.files[`mainImage_${i}`][0].path)) fs.unlinkSync(req.files[`mainImage_${i}`][0].path)
            }
            const imagesArray = []
            if (req.files?.[`images_${i}`]) {
                for (let img of req.files[`images_${i}`]) {
                    const uploadResult = await uploaderToCloudinary(img.path)
                    imagesArray.push(uploadResult.secure_url)
                    if (fs.existsSync(img.path)) fs.unlinkSync(img.path)
                }
            }
            processedColors.push({ colorName: color.colorName, mainImage: mainImagePath, images: imagesArray, sizes: color.sizes })
        }

        const product = await Product.create({
            name, description, brand, categories,
            originalPrice: Number(originalPrice),
            salePrice: Number(salePrice),
            colors: processedColors
        })
        res.status(201).json({ success: true, message: "Product added successfully", data: { product } })
    } catch (error) {
        if (req.files) Object.values(req.files).flat().forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path) })
        res.status(500).json({ success: false, message: "Product not created", error: error.message })
    }
}

const updateProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid)
        if (!product) return res.status(404).json({ success: false, message: "Product not found" })

        const { name, description, originalPrice, salePrice, brand } = req.body
        const categories = req.body.categories ? JSON.parse(req.body.categories) : null
        const colors = req.body.colors ? JSON.parse(req.body.colors) : null
        const updateData = {}

        if (name) updateData.name = name
        if (brand) updateData.brand = brand
        if (description) updateData.description = description
        if (categories) updateData.categories = categories
        if (originalPrice) updateData.originalPrice = Number(originalPrice)
        if (salePrice) updateData.salePrice = Number(salePrice)

        if (colors && colors.length > 0) {
            const processedColors = []
            for (let i = 0; i < colors.length; i++) {
                const color = colors[i]
                const existingColor = product.colors.find(c => c.colorName === color.colorName) || product.colors[i] || {}
                let mainImagePath = existingColor.mainImage || ""
                if (req.files?.[`mainImage_${i}`]?.[0]) {
                    const uploadResult = await uploaderToCloudinary(req.files[`mainImage_${i}`][0].path)
                    fs.unlinkSync(req.files[`mainImage_${i}`][0].path)
                    mainImagePath = uploadResult.secure_url
                }
                let imagesArray = existingColor.images || []
                if (req.files?.[`images_${i}`]) {
                    imagesArray = []
                    for (let img of req.files[`images_${i}`]) {
                        const uploadResult = await uploaderToCloudinary(img.path)
                        fs.unlinkSync(img.path)
                        imagesArray.push(uploadResult.secure_url)
                    }
                }
                processedColors.push({ colorName: color.colorName, mainImage: mainImagePath, images: imagesArray, sizes: color.sizes, _id: existingColor._id })
            }
            updateData.colors = processedColors
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, updateData, { new: true, runValidators: true })
        if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not updated" })
        res.status(200).json({ success: true, message: "Product updated successfully", data: { product: updatedProduct } })
    } catch (error) {
        if (req.files) Object.values(req.files).flat().forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path) })
        res.status(500).json({ success: false, message: "Product not updated", error: error.message })
    }
}

const updateOrder = async (req, res) => {
    const orderId = req.params.oid
    const { status } = req.body
    const myOrder = await Order.findById(orderId).populate('products.product').populate('user')
    if (!myOrder) { res.status(404); throw new Error("Order Not Found") }

    const updateStock = async (productId, updatedStock) => {
        await Product.findByIdAndUpdate(productId, { stock: updatedStock })
    }

    let updatedOrder
    if (status === "dispatched") {
        myOrder.products.forEach((item) => updateStock(item.product._id, item.product.stock - item.qty))
        updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "dispatched" }, { new: true }).populate("products.product").populate('coupon')
    } else if (status === "delivered") {
        updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "delivered" }, { new: true })
    } else {
        if (myOrder.status === "dispatched") { res.status(409); throw new Error("Order already Dispatched") }
        updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "cancelled" }, { new: true })
    }

    if (!updatedOrder) { res.status(409); throw new Error("Order Can't Be updated") }
    res.status(200).json({ success: true, message: "Order updated successfully", data: { order: updatedOrder } })
}

const getAllOrders = async (req, res) => {
    let orders = await Order.find().populate("products.product").populate("user")
    res.status(200).json({ success: true, message: "Orders fetched successfully", data: { orders: orders || [] } })
}

const getSingleOrder = async (req, res) => {
    const myOrder = await Order.findById(req.params.oid).populate('products').populate('user')
    if (!myOrder) { res.status(404); throw new Error("Order Not Found") }
    res.status(200).json({ success: true, message: "Order fetched successfully", data: { order: myOrder } })
}

const getAllReview = async (req, res) => {
    let reviews = await Review.find().populate('product').populate('user')
    if (!reviews) { res.status(404); throw new Error("No Reviews Here") }
    res.status(200).json({ success: true, message: "Reviews fetched successfully", data: { reviews } })
}

const createCoupon = async (req, res) => {
    const { couponCode, couponDiscount } = req.body
    if (!couponCode) { res.status(409); throw new Error("Please Type Coupon") }
    const newCoupon = await Coupan.create({ couponCode: couponCode.toUpperCase(), couponDiscount })
    if (!newCoupon) { res.status(409); throw new Error("Coupon Not created") }
    res.status(201).json({ success: true, message: "Coupon created successfully", data: { coupon: newCoupon } })
}

const allCoupon = async (req, res) => {
    let coupons = await Coupan.find()
    if (!coupons) { res.status(404); throw new Error("No Coupons Found") }
    res.status(200).json({ success: true, message: "Coupons fetched successfully", data: { coupons } })
}

const adminController = {
    getAllUsers, updateUser, getAdminProduct, getAllProducts,
    addProducts, updateProducts, updateOrder,
    getAllOrders, getSingleOrder, getAllReview,
    createCoupon, allCoupon
}

export default adminController
