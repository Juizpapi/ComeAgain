import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../lib/api';
import "../styles/AdminOrdersPage.css";

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      const response = await request("/orders");

      const statusOrder = {
        Pending: 1,
        Preparing: 2,
        "Out for Delivery": 3,
        Delivered: 4,
        Cancelled: 5,
      };

      response.sort((a, b) => {
        return statusOrder[a.status] - statusOrder[b.status];
      });

      setOrders(response);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await request(
        `/orders/${orderId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        }
      );

      setMessage("Order status updated.");

      setTimeout(() => {
        setMessage("");
      }, 3000);

      await loadOrders();

    } catch (error) {
      console.error(error);
      setMessage(error.message || "Unable to update status.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(
      "Delete this order permanently?\n\nThis action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await request(`/orders/${orderId}`, {
        method: "DELETE",
      });

      setOrders((current) =>
        current.filter((order) => order._id !== orderId)
      );

      setMessage("Order deleted successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error(error);
      setMessage(error.message || "Unable to delete order.");
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    preparing: orders.filter(o => o.status === "Preparing").length,
    delivery: orders.filter(o => o.status === "Out for Delivery").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
    cancelled: orders.filter(o => o.status === "Cancelled").length,
  };

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter(order => order.status === filter);

  return (

    <div className="admin-orders-page">

      <header className="admin-orders-header">

        <div>

          <p className="admin-orders-eyebrow">
            Admin Orders
          </p>

          <h1>
            Manage incoming requests
          </h1>

          <div className="admin-orders-stats">

            <div className="admin-orders-stat-card">
              <h2>{stats.total}</h2>
              <p>Total Orders</p>
            </div>

            <div className="admin-orders-stat-card pending">
              <h2>{stats.pending}</h2>
              <p>Pending</p>
            </div>

            <div className="admin-orders-stat-card preparing">
              <h2>{stats.preparing}</h2>
              <p>Preparing</p>
            </div>

            <div className="admin-orders-stat-card delivery">
              <h2>{stats.delivery}</h2>
              <p>Out for Delivery</p>
            </div>

            <div className="admin-orders-stat-card delivered">
              <h2>{stats.delivered}</h2>
              <p>Delivered</p>
            </div>

            <div className="admin-orders-stat-card cancelled">
              <h2>{stats.cancelled}</h2>
              <p>Cancelled</p>
            </div>

          </div>

          <div className="admin-orders-filters">

            <button
              className={filter === "All" ? "active" : ""}
              onClick={() => setFilter("All")}
            >
              All
            </button>

            <button
              className={filter === "Pending" ? "active" : ""}
              onClick={() => setFilter("Pending")}
            >
              Pending
            </button>

            <button
              className={filter === "Preparing" ? "active" : ""}
              onClick={() => setFilter("Preparing")}
            >
              Preparing
            </button>

            <button
              className={filter === "Out for Delivery" ? "active" : ""}
              onClick={() => setFilter("Out for Delivery")}
            >
              Out for Delivery
            </button>

            <button
              className={filter === "Delivered" ? "active" : ""}
              onClick={() => setFilter("Delivered")}
            >
              Delivered
            </button>

            <button
              className={filter === "Cancelled" ? "active" : ""}
              onClick={() => setFilter("Cancelled")}
            >
              Cancelled
            </button>

          </div>

        </div>

        <Link
          to="/"
          className="admin-orders-btn"
        >
          Back Home
        </Link>

      </header>

      <section className="admin-orders-list">

        {message && (

          <div className="admin-orders-toast">

            ✅ {message}

          </div>

        )}

        {filteredOrders.map((order) => (

          <article
            key={order._id}
            className={`admin-orders-card ${order.status.replace(/\s/g, "-").toLowerCase()}`}
          >

            <div>

              <h3>
                Order #{order._id.slice(-6)}
              </h3>

              <p>
                Customer: {order.user?.username}
              </p>

              <p>

                Status:

                <span
                  className={`admin-orders-status ${order.status.replace(/\s+/g, "-").toLowerCase()}`}
                >

                  {order.status}

                </span>

              </p>

            </div>

            <div>

              <p>

                Total: ₦{Number(order.totalAmount || 0).toLocaleString()}

              </p>

              <div className="admin-orders-actions">

                {order.status === "Pending" && (
                  <>
                    <button
                      className="admin-orders-btn"
                      onClick={() =>
                        handleStatusChange(order._id, "Preparing")
                      }
                    >
                      Preparing
                    </button>

                    <button
                      className="admin-orders-btn"
                      onClick={() =>
                        handleStatusChange(order._id, "Out for Delivery")
                      }
                    >
                      Out for Delivery
                    </button>

                    <button
                      className="admin-orders-btn"
                      onClick={() =>
                        handleStatusChange(order._id, "Delivered")
                      }
                    >
                      Delivered
                    </button>

                    <button
                      className="admin-orders-btn-danger"
                      onClick={() =>
                        handleStatusChange(order._id, "Cancelled")
                      }
                    >
                      Cancel
                    </button>
                  </>
                )}

                {order.status === "Preparing" && (
                  <>
                    <button
                      className="admin-orders-btn"
                      onClick={() =>
                        handleStatusChange(order._id, "Out for Delivery")
                      }
                    >
                      Out for Delivery
                    </button>

                    <button
                      className="admin-orders-btn"
                      onClick={() =>
                        handleStatusChange(order._id, "Delivered")
                      }
                    >
                      Delivered
                    </button>

                    <button
                    className="admin-orders-btn-danger"
                      
                      onClick={() =>
                        handleStatusChange(order._id, "Cancelled")
                      }
                    >
                      Cancel
                    </button>
                  </>
                )}

                {order.status === "Out for Delivery" && (
                  <button
                    className="admin-orders-btn"
                    onClick={() =>
                      handleStatusChange(order._id, "Delivered")
                    }
                  >
                    Delivered
                  </button>
                )}

                {order.status === "Delivered" && (
                  <>
                    <span className="admin-orders-completed">
                      ✅ Completed
                    </span>

                    <button
                      className="admin-orders-btn-danger"
                      onClick={() =>
                        handleDeleteOrder(order._id)
                      }
                    >
                      🗑 Delete
                    </button>
                  </>
                )}

                {order.status === "Cancelled" && (
                  <>
                    <span className="admin-orders-cancelled">
                      ❌ Cancelled
                    </span>

                    <button
                      className="admin-orders-btn-danger"
                      onClick={() =>
                        handleDeleteOrder(order._id)
                      }
                    >
                      🗑 Delete
                    </button>
                  </>
                )}

              </div>

            </div>

          </article>

        ))}

      </section>

    </div>

  );
}

export default AdminOrdersPage;