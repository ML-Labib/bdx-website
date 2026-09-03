
import mongoose from "mongoose";
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']); // Google & Cloudflare DNS

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    return false;
  }
};

export default connectDB;