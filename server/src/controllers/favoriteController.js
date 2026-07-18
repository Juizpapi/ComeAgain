import Favorite from "../models/Favorite.js";
import Food from "../models/Food.js";

// Toggle Favorite
export const toggleFavorite = async (req, res) => {
  try {
    const { foodId } = req.params;
    const userId = req.user._id;

    // Check if the food exists
    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({
        message: "Food not found.",
      });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      user: userId,
      food: foodId,
    });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);

      return res.json({
        favorited: false,
        message: "Removed from favorites.",
      });
    }

    await Favorite.create({
      user: userId,
      food: foodId,
    });

    res.json({
      favorited: true,
      message: "Added to favorites.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error.",
    });
  }
};


// Get Logged-in User Favorites
export const getFavorites = async (req, res) => {
  try {

    const favorites = await Favorite.find({
      user: req.user._id,
    }).populate("food");

    res.json(favorites);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error.",
    });

  }
};