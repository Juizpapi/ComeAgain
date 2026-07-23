import Review from "../models/Review.js";
import Order from "../models/Order.js";


// CREATE REVIEW
export const createReview = async (req, res) => {
  try {

    const {
      food,
      order,
      rating,
      comment,
    } = req.body;


    const existingOrder = await Order.findOne({
      _id: order,
      user: req.user.id,
      status: "Delivered",
      "items.food": food,
    });


    if (!existingOrder) {
      return res.status(403).json({
        message: "You can only review delivered meals you purchased."
      });
    }


    const review = await Review.create({

      user: req.user.id,

      food,

      order,

      rating,

      comment,

      isVerifiedPurchase: true,

    });


    res.status(201).json(review);


}catch(error){

    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this meal.",
      });
    }

    res.status(400).json({
      message: error.message,
    });

}
};

// CHECK IF USER ALREADY REVIEWED THIS FOOD IN THIS ORDER
export const checkReview = async (req, res) => {
  try {

    const { foodId, orderId } = req.params;

    const review = await Review.findOne({
      user: req.user.id,
      food: foodId,
      order: orderId,
    });

    res.json({
      reviewed: !!review,
      review,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// GET FOOD REVIEWS
export const getFoodReviews = async(req,res)=>{

  try{

    const reviews = await Review.find({
      food:req.params.foodId
    })
    .populate("user","username avatar")
    .sort({
      createdAt:-1
    });


    res.json(reviews);


  }catch(error){

    res.status(500).json({
      message:error.message
    });

  }

};


export const getMyReviews = async (req,res)=>{
  try{

    const reviews = await Review.find({
      user:req.user.id
    })
    .select("food order");


    res.json(reviews);


  }catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};


// GET REVIEW REMINDERS
export const getReviewReminders = async (req, res) => {
  try {

    const threeHoursAgo = new Date(
      Date.now() - 3 * 60 * 60 * 1000
    );


    const orders = await Order.find({
      user: req.user.id,
      status: "Delivered",
      deliveredAt: {
        $lte: threeHoursAgo,
      },
    });


    const reminders = [];


    for (const order of orders) {

      for (const item of order.items) {


        const alreadyReviewed = await Review.findOne({
          user: req.user.id,
          food: item.food,
          order: order._id,
        });


        if (!alreadyReviewed) {

          reminders.push({
            food: item.food,
            name: item.name,
            order: order._id,
            deliveredAt: order.deliveredAt,
          });

        }

      }

    }


    res.json(reminders);


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};




export const getAllReviews = async (req,res)=>{
  try{

    const reviews = await Review.find()
      .populate("user","username avatar")
      .populate("food","name")
      .sort({
        createdAt:-1
      })
      .limit(6);


    res.json(reviews);


  }catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};