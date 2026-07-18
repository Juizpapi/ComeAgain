import mongoose from "mongoose";
import dotenv from "dotenv";
import mysql from "../config/mysql.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

dotenv.config();

async function migrateOrders() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("📖 Reading orders from MySQL...");
    const [orders] = await mysql.query("SELECT * FROM orders");

    console.log(`Found ${orders.length} orders`);

    for (const order of orders) {
      // Skip if already migrated
      const existing = await Order.findOne({
        legacyId: order.id,
      });

      if (existing) {
        console.log(`⏩ Skipping Order #${order.id}`);
        continue;
      }

      // Find MongoDB user
      const mongoUser = await User.findOne({
        legacyId: order.user_id,
      });

      if (!mongoUser) {
        console.log(
          `❌ User with legacyId ${order.user_id} not found`
        );
        continue;
      }

      let items = [];

      try {
        items = JSON.parse(order.items).map(item => ({
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
        }));
      } catch (err) {
        console.log(`⚠ Could not parse items for Order ${order.id}`);
      }

      await Order.create({
        legacyId: order.id,
        user: mongoUser._id,
        items,
        totalAmount: Number(order.total_amount),
        deliveryFee: Number(order.delivery_fee),
        paymentMethod: order.payment_method,
        status: order.status,
        createdAt: order.created_at,
        updatedAt: order.created_at,
      });

      console.log(`✅ Migrated Order #${order.id}`);
    }

    console.log("🎉 Orders migrated successfully!");

    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrateOrders();