import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME;

    // Validate environment variables
    if (!email || !password || !name) {
      throw new Error(
        "ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_NAME must be defined in .env"
      );
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("⚠️ Admin user already exists.");
      return;
    }

    // Create admin
    const admin = new User({
      name,
      email,
      password,
      role: "admin",
    });

    await admin.save();

    console.log("✅ Admin user created successfully.");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exitCode = 1;
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
  }
};

seedAdmin();