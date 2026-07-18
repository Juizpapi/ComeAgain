import mongoose from "mongoose";
import dotenv from "dotenv";
import mysql from "../config/mysql.js";
import Food from "../models/Food.js";

dotenv.config();

async function migrateFoods() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("📖 Reading foods from MySQL...");

    const [foods] = await mysql.query("SELECT * FROM foods");

    console.log(`Found ${foods.length} foods`);

    for (const food of foods) {
      const exists = await Food.findOne({ name: food.name });

      if (exists) {
        console.log(`⏩ Skipping ${food.name}`);
        continue;
      }

      let addons = [];

      // Convert old addons string to array if necessary
      if (food.addons && food.addons.trim() !== "") {
        addons = food.addons
          .split(",")
          .map(item => ({
            name: item.trim(),
            price: 0
          }));
      }

      await Food.create({
        name: food.name,
        category: food.category,
        price: Number(food.price),
        recommended: food.recommended || "",
        addons,
        available: true,
        image: "",
      });

      console.log(`✅ Migrated ${food.name}`);
    }

    console.log("🎉 Food migration complete!");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrateFoods();