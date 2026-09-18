import mongoose from 'mongoose';

declare global {
  var _mongooseConn: typeof mongoose | null;
}

let cached = global._mongooseConn;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached && mongoose.connection.readyState === 1) return cached;
  const uri = process.env.MONGODB_URI || 'mongodb://locusAdmin:Locus2026SecurePass%21@46.101.134.38:27019/locus?authSource=admin';
  cached = await mongoose.connect(uri, {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });
  global._mongooseConn = cached;
  return cached;
}

export default connectDB;
