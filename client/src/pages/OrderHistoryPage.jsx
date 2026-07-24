import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../lib/api';
import ReviewFormModal from "../components/ReviewFormModal";
import "../styles/OrderHistory.css";

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
const [rating, setRating] = useState(5);
const [comment, setComment] = useState("");
const [reviewLoading, setReviewLoading] = useState(false);
const [reviewedItems, setReviewedItems] = useState({});

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await request("/orders/my-orders");

   setOrders(response);
   checkReviews(response);

      } catch (error) {
        console.warn(error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const toggleDetails = (id) => {
  setExpandedOrders((current) =>
    current.includes(id)
      ? current.filter((orderId) => orderId !== id)
      : [...current, id]
  );
};

const submitReview = async ({ rating, comment }) => {
  try {

    setReviewLoading(true);


    await request("/reviews", {
      method: "POST",
      body: JSON.stringify({
        food: selectedReviewItem.item.food,
        order: selectedReviewItem.orderId,
        rating,
        comment,
      }),
    });


alert("Review submitted successfully");


setReviewedItems((current) => ({
  ...current,
  [`${selectedReviewItem.item.food}-${selectedReviewItem.orderId}`]: true,
}));


setSelectedReviewItem(null);

  } catch (error) {

    alert(
      error.message || "Failed to submit review"
    );

  } finally {

    setReviewLoading(false);

  }
};


const checkReviews = async (orders) => {
  try {

    const checked = {};


    for (const order of orders) {

      if (order.status !== "Delivered") continue;


      for (const item of order.items || []) {

        const response = await request(
          `/reviews/check/${item.food}/${order._id}`
        );


        checked[`${item.food}-${order._id}`] =
          response.reviewed;

      }

    }


    setReviewedItems(checked);


  } catch (error) {

    console.error(
      "Failed checking reviews",
      error
    );

  }
};

  return (
 <div className="history-page">
  <div className="history-container">
    <div className="history-nav">

        <Link to="/" className="nav-btn">
🏠 Home
</Link>

        <span>|</span>

<Link to="/order" className="nav-btn">
🍽 Order Food
</Link>

        <span>|</span>

<Link to="/cart" className="nav-btn">
🛒 Cart
</Link>
    </div>

   <h1 className="history-heading">
My Orders
</h1>

        {loading ? <div className="history-empty">Loading orders...</div> : null}
        {!loading && orders.length === 0 ? <div className="history-empty">You have not placed any orders yet.</div> : null}

        {orders.map((order) => (
<article
  key={order._id}
  className={`history-card status-border-${String(order.status || "").toLowerCase().replace(/\s+/g, "-")}`}
>

            <h3 className="history-order-title"> Order #{order._id.slice(-6)}</h3>
            <div className="history-details">
              <div>
                <strong>Items:</strong>

<div className="history-items">
  {(order.items || []).map((item) => (
    <div
      key={`${order._id}-${item.food}`}
      className="history-item-row"
    >

      <p>
        {item.name} x {item.quantity}

        {item.addons?.length ? (
          <small>
            {" "}Addons: {item.addons.join(', ')}
          </small>
        ) : null}
      </p>


{order.status === "Delivered" && (
  reviewedItems[`${item.food}-${order._id}`] ? (

    <button
      className="order-btn"
      disabled
    >
      ✅ Reviewed
    </button>

  ) : (

    <button
      className="order-btn"
      onClick={() =>
        setSelectedReviewItem({
          orderId: order._id,
          item,
        })
      }
    >
      ⭐ Review {item.name}
    </button>

  )
)}

    </div>
  ))}
</div>
              </div>
<div>

  <strong>Grand Total:</strong> ₦{Number(order.totalAmount || 0).toLocaleString()}
  <br />

  <strong>Status:</strong>

  <span className={`history-status status-${String(order.status || "").toLowerCase().replace(/\s+/g, "-")}`}>
    {order.status}
  </span>

  <br />

<strong>Payment:</strong>{" "}
{order.paymentMethod === "COD"
  ? "Cash on Delivery"
  : order.paymentMethod === "Online"
  ? "Online Payment"
  : "Not selected"}

<br />


<button
  className="details-btn"
  onClick={() => toggleDetails(order._id)}
>
  {expandedOrders.includes(order._id)
    ? "▲ Less Details"
    : "▼ More Details"}
</button>

{expandedOrders.includes(order._id) && (
  <div className="extra-details">

    <strong>Payment Status:</strong>{" "}
    {order.paymentStatus || "Pending"}

    <br />

    <strong>Delivery Address:</strong>{" "}
    {order.deliveryAddress || "Not provided"}

    <br />

    <strong>Phone Number:</strong>{" "}
    {order.phoneNumber || "Not provided"}

    <br />

    <strong>Date:</strong>{" "}
    {order.createdAt
      ? new Date(order.createdAt).toLocaleString()
      : "Pending"}

  </div>
)}

</div>
            </div>
          </article>
        ))}

        <Link className="nav-btn" to="/">
    Back Home
</Link>

<ReviewFormModal
  item={selectedReviewItem?.item}
  loading={reviewLoading}
  onSubmit={submitReview}
  onClose={() => setSelectedReviewItem(null)}
/>
      </div>
    </div>
  );
}

export default OrderHistoryPage;
