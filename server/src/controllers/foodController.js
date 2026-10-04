import Food from "../models/Food.js";
import Review from "../models/Review.js";

// GET all active foods (filters out soft-deleted items by default)
export const getFoods = async (req, res) => {
  try {
    let matchStage = { isDeleted: { $ne: true } };

    if (req.query.includeDeleted === "true") {
      matchStage = {};
    } else if (req.query.deletedOnly === "true") {
      matchStage = { isDeleted: true };
    }

    const foods = await Food.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "food",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: {
            $round: [
              {
                $avg: "$reviews.rating",
              },
              1,
            ],
          },
          totalReviews: {
            $size: "$reviews",
          },
        },
      },
      {
        $project: {           reviews: 0,         },       },       {$sort: {
          category: 1,
          name: 1,
        },
      },
    ]);

    res.json(foods);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET single food (returns document even if soft-deleted, so past orders can view it)
export const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    res.json(food);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE or RESTORE food (preserves original _id if restoring)
export const createFood = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if food with this name already exists in database
    const existingFood = await Food.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingFood) {
      // If it was soft-deleted, reactivate it and keep its ORIGINAL _id!
      if (existingFood.isDeleted) {
        existingFood.set({
          ...req.body,
          isDeleted: false,
        });
        await existingFood.save();
        return res.status(200).json(existingFood);
      }

      return res.status(400).json({
        message: "A food item with this name already exists.",
      });
    }

    const food = await Food.create(req.body);
    res.status(201).json(food);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// UPDATE food
export const updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    res.json(food);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// DELETE food (Soft delete by default; permanent delete if ?permanent=true)
export const deleteFood = async (req, res) => {
  try {
    if (req.query.permanent === "true") {
      const food = await Food.findByIdAndDelete(req.params.id);

      if (!food) {
        return res.status(404).json({
          message: "Food not found",
        });
      }

      return res.json({
        message: "Food permanently deleted from database",
      });
    }

    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    res.json({
      message: "Food moved to trash successfully",
      food,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};