// createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user/User");

const MONGO_URI = process.env.MONGO_URI;

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const email = "admin@controlapp.com";
    const password = "Admin123!"; //
    const hashedPassword = await bcrypt.hash(password, 10);

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("❌ Admin already exists with this email");
      return;
    }

    const newAdmin = new User({
      name: "Admin User",
      email,
      password: { hashed: hashedPassword },
      roles: ["Admin"],
      active: true,
    });

    await newAdmin.save();
    console.log("✅ Admin user created successfully");
    console.log(`➡️ Email: ${email}`);
    console.log(`➡️ Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    process.exit(1);
  }
}

createAdmin();
