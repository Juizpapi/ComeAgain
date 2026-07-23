import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },

    reviewedAt: {
  type: Date,
  default: Date.now,
},
  },
  {
    timestamps: true,
  }
);

reviewSchema.index(
  {
    user: 1,
    food: 1,
    order: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model("Review", reviewSchema);