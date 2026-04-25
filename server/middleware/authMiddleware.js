import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const forAuthUsers = async (req, res, next) => {

    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            let token = req.headers.authorization.split(" ")[1]
            let decode = jwt.verify(token, process.env.JWT_SECRET)
            let user = await User.findById(decode.id).select("-password")
            req.user = user

            next()
        }
        else {
            res.status(400)
            throw new Error("Unauthorized Access : Valid Token Needed");
        }
    } catch (error) {
        res.status(400)
        throw new Error("Unauthorized Access : ");

    }

}
const forAdmin = async (req, res, next) => {

    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            let token = req.headers.authorization.split(" ")[1]
            let decode = jwt.verify(token, process.env.JWT_SECRET)
            let user = await User.findById(decode.id).select("-password")

            if (user.isAdmin) {
                req.user = user
                next()
            }
            else {
                res.status(400)
                throw new Error("Unauthorized Access : Admin access only")
            }
        }
        else {
            res.status(400)
            throw new Error("Unauthorized Access : Valid Token Needed");
        }
    } catch (error) {
        res.status(400)
        throw new Error("Unauthorized Access : ");

    }

}

const protect = { forAuthUsers, forAdmin }

export default protect