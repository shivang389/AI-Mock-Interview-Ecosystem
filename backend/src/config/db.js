import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 50, // Allows handling high-level concurrent loads smoothly
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    };

    const connString = process.env.MONGODB_URI || 'mongodb://localhost:27017/amie_db';
    await mongoose.connect(connString, options);
    console.log('🚀 MongoDB Atlas Layered Cluster Connected.');
  } catch (error) {
    console.error(`❌ Connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;