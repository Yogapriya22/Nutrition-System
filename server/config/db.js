import mongoose from "mongoose";
import dns from "dns";

// Some Windows networks/routers ship a DNS resolver that fails on the
// SRV lookups Atlas's "mongodb+srv://" URLs rely on, even though normal
// lookups (like nslookup) work fine. Pointing Node directly at Google's
// public DNS resolves this in almost all cases.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// connectDB() opens a connection to MongoDB using the URI from .env.
// We call this once when the server starts (see server.js).
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // If the DB is unreachable, there's no point running the server —
    // log the error clearly and exit so the failure is obvious immediately.
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
