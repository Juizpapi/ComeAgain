import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaXTwitter, FaPhone, FaEnvelope } from "react-icons/fa6";
import ChatWidget from '../components/ChatWidget';

const slides = [
  { src: '/images/african-dish.png', alt: 'nigerian dish' },
  { src: '/images/spaghetti.png', alt: 'spaghetti' },
  { src: '/images/fried-rice-chicken.png', alt: 'fried rice' },
  { src: '/images/jollof-rice-meat.png', alt: 'jollof rice' },
  { src: '/images/egusi.png', alt: 'egusi soup' },
];

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem('comeagain_user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function getCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem('comeagain_cart') || '[]');
    return cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
  } catch {
    return 0;
  }
}

function HomePage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [cartCount, setCartCount] = useState(getCartCount);
  const [showProfile, setShowProfile] = useState(false);
  const [homepageReviews, setHomepageReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  
  // Unreviewed delivered order popup state
  const [unreviewedOrder, setUnreviewedOrder] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    if (showProfile) {
      const timer = setTimeout(() => {
        const dropdown = document.querySelector(".ca-dropdown");
        if (dropdown) {
          dropdown.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [showProfile]);

  const user = getStoredUser();
  const isAdmin = user?.role === 'admin' || user?.username === 'admin';

  // Check for delivered orders that have not been reviewed or dismissed yet
  useEffect(() => {
    const checkUnreviewedDeliveredOrders = async () => {
      const token = localStorage.getItem('comeagain_token');
      if (!user || !token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;
        const orders = await response.json();

        if (Array.isArray(orders)) {
          // Retrieve list of order IDs already dismissed by the user
          let dismissedOrderIds = [];
          try {
            dismissedOrderIds = JSON.parse(localStorage.getItem('dismissed_review_order_ids') || '[]');
          } catch {
            dismissedOrderIds = [];
          }

          // Find a delivered order that hasn't been reviewed AND hasn't been dismissed yet
          const pendingReview = orders.find((ord) => {
            const statusStr = (ord.status || ord.orderStatus || '').toLowerCase();
            const isDelivered = statusStr === 'delivered' || statusStr === 'completed';
            const notReviewed = !ord.isReviewed;
            const notDismissed = !dismissedOrderIds.includes(ord._id);
            return isDelivered && notReviewed && notDismissed;
          });

          if (pendingReview) {
            setUnreviewedOrder(pendingReview);
            setShowReviewPopup(true);
          }
        }
      } catch (err) {
        console.error('Error checking unreviewed orders:', err);
      }
    };

    checkUnreviewedDeliveredOrders();
  }, []);

  const dismissReviewPopup = (orderId) => {
    if (orderId) {
      try {
        const existing = JSON.parse(localStorage.getItem('dismissed_review_order_ids') || '[]');
        if (!existing.includes(orderId)) {
          existing.push(orderId);
          localStorage.setItem('dismissed_review_order_ids', JSON.stringify(existing));
        }
      } catch (err) {
        console.error('Failed to save dismissed order ID:', err);
      }
    }
    setShowReviewPopup(false);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % slides.length);
    }, 5000);

    const refreshCartCount = () => setCartCount(getCartCount());
    window.addEventListener('storage', refreshCartCount);
    window.addEventListener('comeagain-cart-change', refreshCartCount);

    const closeProfile = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", closeProfile);

    return () => {
      document.removeEventListener("mousedown", closeProfile);
      window.clearInterval(timer);
      window.removeEventListener('storage', refreshCartCount);
      window.removeEventListener('comeagain-cart-change', refreshCartCount);
    };
  }, []);

  const loadHomepageReviews = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reviews`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        const topReviews = [...data]
          .sort((a, b) => {
            if (b.rating !== a.rating) {
              return b.rating - a.rating;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
          })
          .slice(0, 4);

        setHomepageReviews(topReviews);
      }
    } catch (error) {
      console.log("Review loading error:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadHomepageReviews();
  }, []);

  return (
    <div className="legacy-page">
      <header className="modern-header">
        <div className="brand">
          <img
            src="/images/logo.png"
            alt="Come Again Restaurant"
            className="restaurant-logo"
          />
          <div>
            <h1>COME AGAIN</h1>
            <p>Restaurant</p>
          </div>
        </div>

        <div className="header-text">
          <h2>Our Food Is Sensational</h2>
          <p>Fresh Nigerian Meals Delivered Hot & Fast</p>
        </div>

        <div className="header-actions">
          {user && (
            <Link to="/cart" className="header-cart-btn">
              🛒
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="header-cart-badge">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <div className="ca-profile-menu" ref={profileRef}>
            {user ? (
              <>
                <button
                  className="ca-profile-btn"
                  onClick={() => setShowProfile(!showProfile)}
                >
                  <div className="ca-avatar">
                    {user.avatar ? (
                      <img
                        src={
                          user.avatar.startsWith("http")
                            ? user.avatar
                            : `${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads/${user.avatar}`
                        }
                        alt={user.username}
                        className="ca-avatar-img"
                      />
                    ) : (
                      (user.username || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <span>{user.username}</span>
                  <span className="ca-arrow">▼</span>
                </button>

                {showProfile && (
                  <div className="ca-dropdown">
                    <button
                      type="button"
                      className="ca-dropdown-close"
                      onClick={() => setShowProfile(false)}
                      aria-label="Close menu"
                    >
                      ✕
                    </button>

                    <div className="ca-user-info">
                      <div className="ca-avatar large">
                        {user.avatar ? (
                          <img
                            src={
                              user.avatar.startsWith("http")
                                ? user.avatar
                                : `${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads/${user.avatar}`
                            }
                            alt={user.username}
                            className="ca-avatar-img"
                          />
                        ) : (
                          (user.username || "U").charAt(0).toUpperCase()
                        )}
                      </div>
                      <h3>{user.username}</h3>
                      <p>{user.email}</p>
                    </div>

                    <Link to="/profile" className="ca-item">
                      👤 Profile
                    </Link>

                    <Link to="/favorites" className="ca-item">
                      ❤️ Favorites
                    </Link>

                    <Link to="/order-history" className="ca-item">
                      📦 My Orders
                    </Link>

                    <hr className="ca-divider" />

                    {isAdmin && (
                      <>
                        <Link to="/admin/orders" className="ca-item">
                          ⚙ Admin Orders
                        </Link>
                        <Link to="/admin/foods" className="ca-item">
                          🍲 Manage Foods
                        </Link>
                        <Link to="/admin/chat" className="ca-item">
                          💬 Customer Chat
                        </Link>
                      </>
                    )}

                    <hr className="ca-divider" />

                    <button
                      className="ca-item logout"
                      onClick={() => {
                        localStorage.removeItem("comeagain_user");
                        localStorage.removeItem("comeagain_token");
                        localStorage.removeItem("comeagain_cart");
                        localStorage.removeItem("comeagain_checkout_location");
                        window.location.href = "/";
                      }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="ca-auth-buttons">
                <Link to="/login" className="order-btn">
                  Login
                </Link>
                <Link to="/register" className="order-btn admin-link">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-small">Welcome to</p>
            <h1>COME AGAIN RESTAURANT</h1>
            <p className="hero-tagline">Our Food is Sensational...</p>
            <h3>Fresh Nigerian Meals Delivered Hot & Fast</h3>
            <p>
              Enjoy delicious Nigerian dishes prepared with fresh ingredients and delivered right to your doorstep.
            </p>

            <div className="hero-buttons">
              <Link to="/order" className="nav-btn">
                📖 View Menu
              </Link>
            </div>
          </div>

          <div className="hero-image">
            <img
              src={slides[slideIndex].src}
              alt={slides[slideIndex].alt}
            />

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSlideIndex(index)}
                  aria-label={`Slide ${index + 1}`}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: slideIndex === index ? '#e65100' : '#ccc',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🚚</div>
          <h3>Fast Delivery</h3>
          <p>Quick delivery anywhere within Lagos.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🍲</div>
          <h3>Fresh Meals</h3>
          <p>Prepared fresh every day using quality ingredients.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💳</div>
          <h3>Secure Payment</h3>
          <p>Pay safely with Paystack or Cash on Delivery.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⭐</div>
          <h3>Great Taste</h3>
          <p>Delicious Nigerian meals you'll always come back for.</p>
        </div>
      </section>

      <section className="gallery-section">
        <h2>Popular Dishes</h2>
        <div className="food-gallery">
          <div className="food-item">
            <img src="/images/jollof-rice-meat.png" alt="Jollof Rice" />
            <h3>Jollof Rice</h3>
            <Link to="/order" className="nav-btn">
              Order Now
            </Link>
          </div>

          <div className="food-item">
            <img src="/images/fried-rice-chicken.png" alt="Fried Rice" />
            <h3>Fried Rice</h3>
            <Link to="/order" className="nav-btn">
              Order Now
            </Link>
          </div>

          <div className="food-item">
            <img src="/images/spaghetti.png" alt="Spaghetti" />
            <h3>Spaghetti</h3>
            <Link to="/order" className="nav-btn">
              Order Now
            </Link>
          </div>

          <div className="food-item">
            <img src="/images/egusi.png" alt="Egusi Soup" />
            <h3>Egusi Soup</h3>
            <Link to="/order" className="nav-btn">
              Order Now
            </Link>
          </div>
        </div>
      </section>

      <section className="why-us">
        <h2>Why Choose Come Again Restaurant?</h2>

        <div className="why-grid">
          <div className="why-box">
            <div className="feature-icon">🥗</div>
            <h3>Fresh Ingredients</h3>
            <p>Every meal is prepared fresh using carefully selected ingredients.</p>
          </div>

          <div className="why-box">
            <div className="feature-icon">🚚</div>
            <h3>Fast Delivery</h3>
            <p>We deliver hot meals quickly across Lagos.</p>
          </div>

          <div className="why-box">
            <div className="feature-icon">👨‍🍳</div>
            <h3>Experienced Chefs</h3>
            <p>Delicious Nigerian meals cooked by experienced chefs.</p>
          </div>

          <div className="why-box">
            <div className="feature-icon">💳</div>
            <h3>Easy Payment</h3>
            <p>Pay online with Paystack or choose Cash on Delivery.</p>
          </div>
        </div>
      </section>

      <section className="reviews-section">
        <h2>What Our Customers Say</h2>

        <div className="reviews-container">
          {loadingReviews ? (
            <p>Loading customer reviews...</p>
          ) : homepageReviews.length === 0 ? (
            <p>No customer reviews yet.</p>
          ) : (
            homepageReviews.map((review) => {
              const avatarSrc = review.user?.avatar
                ? review.user.avatar.startsWith("http")
                  ? review.user.avatar
                  : `${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads/${review.user.avatar.replace(/^\/?(uploads\/)?/, '')}`
                : null;

              return (
                <div className="review-card" key={review._id}>
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={review.user?.username || "Customer"}
                      className="customer-review-avatar"
                    />
                  ) : (
                    <div className="customer-review-letter">
                      {review.user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}

                  <div className="stars">
                    {"⭐".repeat(review.rating)}
                  </div>

                  <p>"{review.comment}"</p>

                  <h4>- {review.user?.username}</h4>

                  <p className="review-food-name">
                    Ordered: {review.food?.name}
                  </p>

                  <p className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="map-section">
        <h2>Find Us</h2>

        <p>Visit Come Again Restaurant or order online for fast delivery.</p>

        <div className="map-container">
          <iframe
            title="Come Again Restaurant Location"
            src="https://www.openstreetmap.org/export/embed.html?bbox=3.1436%2C6.3750%2C3.5436%2C6.6750&layer=mapnik&marker=6.5244%2C3.3792"
            width="100%"
            height="450"
            style={{ border: 0 }}
            loading="lazy"
          ></iframe>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-card">
          <div className="contact-left">
            <h2>📍 Contact Us</h2>

            <p>
              <strong>Address</strong><br />
              343 Arabambi Close, Lagos, Nigeria
            </p>

            <p>
              <strong>Email</strong><br />
              <a
                href="mailto:Miknelandex@gmail.com"
                title="Email Miknelandex@gmail.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#ff5722',
                  color: '#fff',
                  fontSize: '18px',
                  marginTop: '4px'
                }}
              >
                <FaEnvelope />
              </a>
            </p>

            <p>
              <strong>Call Us</strong><br />
              <a
                href="tel:+2347040313437"
                title="Call +2347040313437"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#ff5722',
                  color: '#fff',
                  fontSize: '18px',
                  marginTop: '4px'
                }}
              >
                <FaPhone />
              </a>
            </p>
          </div>

          <div className="contact-right">
            <h2>Follow Us</h2>

            <p>
              Follow us for new meals, discounts and daily specials.
            </p>

            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                <FaFacebookF />
              </a>

              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <FaInstagram />
              </a>

              <a href="https://x.com" target="_blank" rel="noreferrer">
                <FaXTwitter />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="modern-footer">
        <h2>COME AGAIN RESTAURANT</h2>
        <p>Our Food is Sensational... Come Again Soon.</p>
        <small>© 2026 Come Again Restaurant. All Rights Reserved.</small>
      </footer>

      {/* Delivered Order Unreviewed Pop-up Modal */}
      {showReviewPopup && unreviewedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '420px',
            width: '100%',
            padding: '28px 24px',
            textAlign: 'center',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>🍲</div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#222', fontWeight: '700' }}>
              How was your meal?
            </h2>
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Your order <strong>#{unreviewedOrder._id?.substring(0, 8)}</strong> has been delivered! We’d love to hear your thoughts on your food.
            </p>

            {/* List ordered items if available */}
            {unreviewedOrder.items && unreviewedOrder.items.length > 0 && (
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#444',
                maxHeight: '90px',
                overflowY: 'auto',
                border: '1px solid #eee'
              }}>
                {unreviewedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ margin: '4px 0', fontWeight: '500' }}>
                    • {item.food?.name || item.name || 'Delicious Dish'} (x{item.quantity})
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => dismissReviewPopup(unreviewedOrder._id)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Maybe Later
              </button>

              <Link
                to="/order-history"
                onClick={() => dismissReviewPopup(unreviewedOrder._id)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ff5722',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '14px',
                  textDecoration: 'none',
                  flex: 1,
                  display: 'inline-block'
                }}
              >
                Leave Review ⭐
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Live Chat Widget */}
      <ChatWidget user={user} />
    </div>
  );
}

export default HomePage;