import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate favorites
favoriteSchema.index(
  { user: 1, food: 1 },
  { unique: true }
);

export default mongoose.model("Favorite", favoriteSchema);