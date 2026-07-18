import Food from "../models/Food.js";

// GET all foods
export const getFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ category: 1, name: 1 });

    res.json(foods);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET single food
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

// CREATE food
export const createFood = async (req, res) => {
  try {
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

// DELETE food
export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    res.json({
      message: "Food deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};