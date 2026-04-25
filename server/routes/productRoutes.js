import express from "express"
import productContoller from "../controllers/productController.js"
import reviewRoutes from "./reviewRoutes.js"

const router = express.Router({ mergeParams: true })

router.get("/", productContoller.getProducts)
router.get("/:pid", productContoller.getProduct)

// Add  product  take params Pid
const addproduct = (req, res, next) => {
    req.product = req.params.pid

    next()
}
router.use("/:pid/review", addproduct, reviewRoutes)

export default router