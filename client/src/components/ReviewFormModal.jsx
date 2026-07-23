import { useState } from "react";

function ReviewFormModal({
  item,
  loading,
  onSubmit,
  onClose,
}) {

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");


  if (!item) return null;


  const handleSubmit = () => {

    onSubmit({
      rating,
      comment,
    });

  };


  return (
    <div className="review-overlay">

      <div className="review-modal">


        <button
          className="review-close"
          onClick={onClose}
        >
          ✕
        </button>


        <h2>
          Review {item.name}
        </h2>


        <div className="rating-select">

          <p>
            Your rating:
          </p>

          {[1,2,3,4,5].map((star)=>(
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={
                star <= rating
                ? "star active"
                : "star"
              }
            >
              ⭐
            </button>
          ))}

        </div>


        <textarea
          placeholder="Tell us about your meal..."
          value={comment}
          onChange={(e)=>setComment(e.target.value)}
          maxLength={1000}
        />


        <button
          className="submit-review-btn"
          onClick={handleSubmit}
          disabled={loading}
        >

          {loading
            ? "Submitting..."
            : "Submit Review"
          }

        </button>


      </div>

    </div>
  );
}


export default ReviewFormModal;