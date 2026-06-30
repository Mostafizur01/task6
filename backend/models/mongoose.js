import mongoose from "mongoose";

const connectionbd = async () => {
    try {
        await mongoose.connect('mongodb+srv://mdmostafizurrahman704_db_user:jtROiUDOBfK7Cyi6@cluster0.qa63ggl.mongodb.net/?appName=Cluster0')
        console.log('mongodb is connected')
    } catch (error) {
        console.error('MongoDB connection error:', error)
    }
}

export default connectionbd