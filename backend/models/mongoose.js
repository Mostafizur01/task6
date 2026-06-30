import mongoose from 'mongoose';

const connectionbd = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://mdmostafizurrahman704_db_user:jtROiUDOBfK7Cyi6@cluster0.qa63ggl.mongodb.net/?appName=Cluster0';
        await mongoose.connect(mongoUri);
        console.log('mongodb is connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

export default connectionbd;