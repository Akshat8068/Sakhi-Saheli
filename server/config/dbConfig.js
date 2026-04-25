import mongoose from "mongoose"


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`DB connection name ${conn.connection.name}`.bgGreen)

    } catch (error) {
        console.log(`DB Connection Failed ${error.message}`)

    }
}
export default connectDB