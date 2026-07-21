import axios from "axios";
import Order from "../models/Order.js";

export const initializePayment = async (req, res) => {
  try {
    const { email, items, location } = req.body;

    // Calculate total
    const addonPrices = {
      Plantain: 200,
      Salad: 150,
      Chicken: 500,
      Turkey: 800,
      Meat: 600,
      Pomo: 400,
    };

    const deliveryFees = {
      agege: 1000,
      ajeromi: 800,
      alimosho: 1000,
      ikeja: 1200,
      surulere: 1200,
      yaba: 1300,
    };

    const subtotal = items.reduce((sum, item) => {
      const addonsTotal = (item.addons || []).reduce(
        (a, addon) => a + (addonPrices[addon] || 0),
        0
      );

      return (
        sum +
        (Number(item.price) + addonsTotal) *
          Number(item.quantity)
      );
    }, 0);


    const total = subtotal + (deliveryFees[location] || 0);


    const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: total * 100,

           callback_url: "https://come-again.vercel.app/checkout",
 
        metadata: {
          userId: req.user.id,
          items,
          location,
          total,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );


    res.json({
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });


  } catch (error) {
    console.error(error.response?.data || error);

    res.status(500).json({
      message: "Unable to initialize payment.",
    });
  }
};



// VERIFY PAYMENT

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;


    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );


    const payment = response.data.data;


    if (payment.status !== "success") {
      return res.status(400).json({
        ok: false,
        message: "Payment not successful.",
      });
    }



    // Prevent duplicate orders
    const existingOrder = await Order.findOne({
      paymentReference: reference,
    });


    if (existingOrder) {
      return res.json({
        ok: true,
        message: "Order already exists.",
        order: existingOrder,
      });
    }



    const metadata = payment.metadata;


    const order = await Order.create({

      user: metadata.userId,


      items: metadata.items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        addons: item.addons || [],
      })),


      totalAmount: metadata.total,

      deliveryFee: 0,

      paymentMethod: "Online",

      paymentStatus: "Paid",

      paymentReference: reference,

      status: "Pending",

    });



    res.json({
      ok: true,
      order,
    });


  } catch (error) {

    console.error(error.response?.data || error);


    res.status(500).json({
      ok: false,
      message: "Payment verification failed.",
    });

  }
};