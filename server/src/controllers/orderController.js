import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {

    const {
      customer,
      email,
      phoneNumber,
      items,
      totalAmount,
      location,
      deliveryAddress,
      deliveryFee,
      paymentType,
    } = req.body;


    const order = await Order.create({

      user: req.user.id,

      customer,
      email,
      phoneNumber,

      items,
      totalAmount,

      location,
      deliveryAddress,
      deliveryFee,

      paymentMethod:
        paymentType === "cash"
          ? "COD"
          : "Online",

    });


    res.status(201).json(order);

  } catch (error) {

    console.log("CREATE ORDER ERROR:");
    console.log(error);

    res.status(400).json({
      message: error.message,
    });

  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "username email")
      .sort({
        createdAt: -1,
      });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};