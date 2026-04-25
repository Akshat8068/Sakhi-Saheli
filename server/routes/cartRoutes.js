import express from "express"
import cartController from "../controllers/cartController.js"
import protect from "../middleware/authMiddleware.js"


const router = express.Router()

router.get("/", protect.forAuthUsers, cartController.getCart)

router.post("/", protect.forAuthUsers, cartController.addCart)

router.put("/", protect.forAuthUsers, cartController.updateCart)

router.post("/clear", protect.forAuthUsers, cartController.clearCart)

router.delete("/:productId", protect.forAuthUsers, cartController.removeCart)

export default router