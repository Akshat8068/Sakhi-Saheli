import express from "express"
import couponController from "../controllers/couponController.js"
import protect from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/", couponController.applyCoupon)


export default router