import mongoose from "mongoose"
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Entre Name"]

    },
    email: {
        type: String,
        required: [true, "Please Entre Email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please Entre Password"]
    },
    phone: {
        type: String,
        required: [true, "Please Entre Phone"],
        unique: true
    },
    address: {
        type: String,
        required: [true, "Please Entre Address"]
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    credits: {
        type: Number,
        required: true,
        default: 5
    }

}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema)
export default User