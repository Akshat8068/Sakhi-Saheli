import express from "express"
import protect from "../middleware/authMiddleware.js"
import { virtualTry } from "../controllers/virtualTryOnController.js"
import upload from "../middleware/fileUploadMiddleware.js"

const router = express.Router()

router.post("/", protect.forAuthUsers, upload.single('person_url'), virtualTry)

export default router