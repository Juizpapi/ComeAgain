import mongoose from "mongoose";
import mysql from "../config/mysql.js";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function migrateUsers() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("📖 Reading users from MySQL...");
    const [users] = await mysql.query("SELECT * FROM users");

    console.log(`Found ${users.length} users`);

    for (const user of users) {
      // Skip if already migrated
      const exists = await User.findOne({ email: user.email });

      if (exists) {
        console.log(`⏩ Skipping ${user.email} (already exists)`);
        continue;
      }

      // Convert PHP bcrypt hash ($2y$) to Node bcrypt ($2b$)
      const passwordHash = user.password.replace("$2y$", "$2b$");

      const newUser = new User({
        legacyId: user.id,
        username: user.username,
        email: user.email,
        password: passwordHash,
        role: user.role,
        token: user.token,
        is_confirmed: Boolean(user.is_confirmed),
        createdAt: user.created_at,
        updatedAt: user.created_at,
      });

      await newUser.save();

      console.log(`✅ Migrated: ${user.email}`);
    }

    console.log("🎉 User migration completed!");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrateUsers();