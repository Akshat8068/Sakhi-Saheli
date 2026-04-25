import Order from "../models/orderModel.js";
import Review from "../models/reviewModel.js"

const getAllReviews = async (req, res) => {
    const productId = req.product
    let reviews = await Review.find({ product: productId }).populate("user")
    if (!reviews) {
        res.status(404)
        throw new Error("No Reviews Found");
    }
    res.status(200).json({
        success: true,
        message: "Reviews fetched successfully",
        data: { reviews }
    })
}

const getReview = async (req, res) => {
    let review = await Review.findById(req.params.rid)
    if (!review) {
        res.status(404)
        throw new Error("Review Not Found");
    }
    res.status(200).json({
        success: true,
        message: "Review fetched successfully",
        data: { review }
    })
}

const addReview = async (req, res) => {
    const userId = req.user._id
    const productId = req.product
    const { rating, text } = req.body

    if (!rating || !text) {
        res.status(400)
        throw new Error("Please fill all details");
    }

    let orders = await Order.find({ user: userId }).populate("products.product")
    let orderHistory = orders.flatMap((order) => order.products || [])
    let productExist = orderHistory.filter((product) => product.product.toString() === productId)

    const review = new Review({
        user: userId,
        product: productId,
        rating,
        text,
        isVerifedBuyer: productExist.length !== 0
    })

    await review.save()
    await review.populate("user")
    await review.populate('product')

    if (!review) {
        res.status(409)
        throw new Error("Review Not Saved");
    }

    res.status(201).json({
        success: true,
        message: "Review added successfully",
        data: { review }
    })
}

const reviewController = { getAllReviews, addReview, getReview }

export default reviewController
