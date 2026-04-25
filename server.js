import express from "express"
import colors from "colors"
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from "./server/config/dbConfig.js"
import dotenv from "dotenv"
// Local Routes
import cors from "cors"
import authRoutes from "./server/routes/authRoutes.js"
import orderRoutes from "./server/routes/orderRoutes.js"
import adminRoutes from "./server/routes/adminRoutes.js"
import productRoutes from "./server/routes/productRoutes.js"
import cartRoutes from "./server/routes/cartRoutes.js"
import couponRoutes from "./server/routes/couponRoutes.js"
import virtualTryOnRoutes from "./server/routes/virtualTryOnRoutes.js"
import errorHandler from "./server/middleware/errorHandler.js"
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const PORT = process.env.PORT || 5000

// connectDB
connectDB()


app.use(cors())

// Body Parsers - INCREASE LIMITS HERE
app.use(express.json({ limit: '100mb' })); // Increased from default 100kb
app.use(express.urlencoded({ limit: '100mb', extended: true }));



// authRoutes
app.use("/api/auth", authRoutes)

// order routes
app.use("/api/order", orderRoutes)

// admin routes
app.use("/api/admin", adminRoutes)

// product Routes
app.use("/api/products", productRoutes)

// cart Routes
app.use("/api/cart", cartRoutes)

// coupon routes
app.use("/api/coupon", couponRoutes)

// virtual Try On Routes

app.use("/api/virtual_tryon", virtualTryOnRoutes)


// Since this file is in /server, we go UP one level to reach the root, then into /client/dist
const buildPath = path.resolve(__dirname, '../client/dist');

// 5. Static File Serving & SPA Routing
if (process.env.NODE_ENV === "production") {
    // Serve static files from the build directory
    app.use(express.static(buildPath));

    // Express v5 requires a named parameter for wildcards (/*splat)
    app.get('/*splat', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'), (err) => {
            if (err) {
                // If index.html is missing, this provides a clearer error
                res.status(500).send("Build file index.html not found. Ensure you ran 'npm run build' in the client folder.");
            }
        });
    });
} else {
    app.get("/", (req, res) => {
        res.send("API is running... (Development Mode)");
    });
}
// Error Handler
app.use(errorHandler)
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`.bgBlue.black)
})