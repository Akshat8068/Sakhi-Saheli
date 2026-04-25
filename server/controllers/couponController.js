import Coupan from "../models/couponModel.js";

const applyCoupon = async (req, res) => {
    const { couponCode } = req.body

    if (!couponCode) {
        res.status(409)
        throw new Error("Please Enter Coupon");
    }

    let coupon = await Coupan.findOne({ couponCode: couponCode })

    if (!coupon) {
        res.status(404)
        throw new Error("Invalid Coupon");
    }

    res.status(200).json({
        success: true,
        message: "Coupon applied successfully",
        data: { coupon }
    })
}

const couponController = { applyCoupon }

export default couponController
