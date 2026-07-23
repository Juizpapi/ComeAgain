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