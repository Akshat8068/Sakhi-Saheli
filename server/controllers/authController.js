import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


import User from "../models/userModel.js"
const registerUser = async (req, res) => {
    const { name, email, password, phone, address, isAdmin } = req.body;

    if (!name || !email || !password || !phone || !address) {
        return res.status(400).json({
            success: false,
            message: "Please fill all details"
        });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "User already exists"
        });
    }

    if (phone.length !== 10) {
        return res.status(400).json({
            success: false,
            message: "Invalid phone number"
        });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashpassword = bcrypt.hashSync(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashpassword,
        phone,
        address,
        isAdmin: isAdmin ?? false
    });

    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                credits: user.credits
            },
            tokens: {
                accessToken: generateAccessToken(user._id),
                refreshToken: generateRefreshToken(user._id)
            }
        }
    });
};



const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill all details"
        });
    }

    const user = await User.findOne({ email });

    if (user && bcrypt.compareSync(password, user.password)) {
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    isAdmin: user.isAdmin,
                    credits: user.credits
                },
                tokens: {
                    accessToken: generateAccessToken(user._id),
                    refreshToken: generateRefreshToken(user._id)
                }
            }
        });
    }

    return res.status(401).json({
        success: false,
        message: "Invalid credentials"
    });
};

const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d"
    });
};
const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: "Refresh token missing"
        });
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const newAccessToken = generateAccessToken(decoded.id);

        return res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });

    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "Invalid refresh token"
        });
    }
};
const authController = {
    loginUser, registerUser, refreshAccessToken
}

export default authController