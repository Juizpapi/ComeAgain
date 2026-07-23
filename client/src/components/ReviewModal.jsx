function ReviewModal({
  food,
  reviews,
  loading,
  onClose,
}) {

  if (!food) return null;


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
          {food.name} Reviews
        </h2>


        {loading ? (
          <p>
            Loading reviews...
          </p>
        ) : reviews.length === 0 ? (

          <p>
            No reviews yet.
          </p>

        ) : (

          reviews.map((review)=>(
            <div
              key={review._id}
              className="review-card"
            >

              <div>
                ⭐ {review.rating}/5
              </div>


              <p>
                {review.comment}
              </p>


              <small>
                {review.user?.username || "Customer"}
              </small>

            </div>
          ))

        )}

      </div>

    </div>
  );
}


export default ReviewModal;