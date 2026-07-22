import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../lib/api';
import "../styles/OrderHistory.css";

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await request("/orders/my-orders");

setOrders(response);
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
                    <p key={`${order._id}-${item.name}`}>
                      {item.name} x {item.quantity}
                      {item.addons?.length ? <small> Addons: {item.addons.join(', ')}</small> : null}
                    </p>
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
      </div>
    </div>
  );
}

export default OrderHistoryPage;
