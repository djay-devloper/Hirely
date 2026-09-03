import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('mongodb connected successfully');
    } catch (error) {
        throw new Error(`MongoDB connection failed: ${error.message}`);
    }
}
export default connectDB;