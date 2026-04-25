import Cart from "../models/cartModel.js"
import Coupan from "../models/couponModel.js"
import Order from "../models/orderModel.js"
import Product from "../models/productModel.js"

const placeOrder = async (req, res) => {
    const userId = req.user._id
    const { shippingAddress } = req.body

    if (!shippingAddress) {
        res.status(409)
        throw new Error("Please Enter Shipping Address");
    }

    let couponCode = await Coupan.findOne({ couponCode: req.body?.coupon })

    const cart = await Cart.findOne({ user: userId }).populate('products.product');
    if (!cart) {
        res.status(404)
        throw new Error("Cart not found")
    }

    let totalBill = cart.products.reduce((acc, item) => acc + item.product.salePrice * item.qty, 0)
    totalBill = couponCode ? totalBill - totalBill * couponCode.couponDiscount / 100 : totalBill

    const orderProducts = cart.products.map(item => ({
        product: item.product._id,
        colorName: item.colorName,
        colorMainImage: item.colorMainImage,
        size: item.size,
        qty: item.qty
    }));

    const order = new Order({
        user: userId,
        products: orderProducts,
        TotalBillAmount: totalBill,
        isDiscounted: couponCode ? true : false,
        coupon: couponCode ? couponCode._id : null,
        shippingAddress
    })

    await order.save()
    if (!order) {
        res.status(409)
        throw new Error("Order Not placed");
    }

    await cart.deleteOne();

    res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: { order }
    })
}

const cancelOrder = async (req, res) => {
    const orderId = req.params.oid
    const myOrder = await Order.findById(orderId).populate('products.product').populate('user')

    if (!myOrder) {
        res.status(404)
        throw new Error("Order Not Found");
    }

    if (myOrder.status === "placed") {
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "cancelled" }, { new: true })
        if (!updatedOrder) {
            res.status(409)
            throw new Error("Order Can't Be cancelled");
        }
        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: { order: updatedOrder }
        })
    } else {
        res.status(409)
        throw new Error("Order Can't Be cancelled");
    }
}

const getOrders = async (req, res) => {
    const userId = req.user._id
    const myOrders = await Order.find({ user: userId }).populate('products.product').populate('user')

    if (!myOrders) {
        res.status(404)
        throw new Error("Orders Not Found");
    }

    res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        data: { orders: myOrders }
    })
}

const getOrder = async (req, res) => {
    const orderId = req.params.oid
    const myOrder = await Order.findById(orderId).populate('products.product').populate('user')

    if (!myOrder) {
        res.status(404)
        throw new Error("Order Not Found");
    }

    res.status(200).json({
        success: true,
        message: "Order fetched successfully",
        data: { order: myOrder }
    })
}

const orderController = { placeOrder, cancelOrder, getOrders, getOrder }

export default orderController
