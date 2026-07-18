import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";

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
const profileRef = useRef(null);


  const user = getStoredUser();
  const isAdmin = user?.role === 'admin' || user?.username === 'admin';

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
    console.log(
  "Home page sees:",
  localStorage.getItem("comeagain_cart")
);
  }, []);

  const changeSlide = (direction) => {
    setSlideIndex((current) => (current + direction + slides.length) % slides.length);
  };

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

    <p>
      Fresh Nigerian Meals Delivered Hot & Fast
    </p>

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

  <div
    className="ca-profile-menu"
    ref={profileRef}
  >

  {user ? (
  <>
      <button
        className="ca-profile-btn"
        onClick={() => setShowProfile(!showProfile)}
      >
<div className="ca-avatar">

  {user.avatar ? (

    <img
      src={`http://localhost:5000/uploads/${user.avatar}`}
      alt={user.username}
      className="ca-avatar-img"
    />

  ) : (

    (user.username || "U").charAt(0).toUpperCase()

  )}

</div>

        <span>
          {user.username}
        </span>

        <span className="ca-arrow">
          ▼
        </span>
      </button>

      {showProfile && (

        <div className="ca-dropdown">

          <div className="ca-user-info">

<div className="ca-avatar large">

  {user.avatar ? (

    <img
      src={`http://localhost:5000/uploads/${user.avatar}`}
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
<Link
  to="/profile"
  className="ca-item"
>
  👤 Profile
</Link>

<Link
  to="/favorites"
  className="ca-item"
>
  ❤️ Favorites
</Link>


          <Link
            to="/order-history"
            className="ca-item"
          >
            📦 My Orders
          </Link>

<hr className="ca-divider" />

          {isAdmin && (
            <>
              <Link
                to="/admin/orders"
                className="ca-item"
              >
                ⚙ Admin Orders
              </Link>

              <Link
                to="/admin/foods"
                className="ca-item"
              >
                🍲 Manage Foods
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

              window.location.href="/";

            }}
          >
            🚪 Logout
          </button>

        </div>

      )}

    

  </>

) : (

    <div className="ca-auth-buttons">

      <Link
        to="/login"
        className="order-btn"
      >
        Login
      </Link>

      <Link
        to="/register"
        className="order-btn admin-link"
      >
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

      <p className="hero-small">
        Welcome to
      </p>

      <h1>COME AGAIN RESTAURANT</h1>

      <p className="hero-tagline">
        Our Food is Sensational...
      </p>

      <h3>
        Fresh Nigerian Meals Delivered Hot & Fast
      </h3>

      <p>
        Enjoy delicious Nigerian dishes prepared with fresh ingredients and delivered right to your doorstep.
      </p>

<div className="hero-buttons">
  <Link to="/order" className="nav-btn">
    🍽️ Order Now
  </Link>

  <Link to="/order" className="nav-btn">
    📖 View Menu
  </Link>
</div>

    </div>

    <div className="hero-image">

      <img
        src="/images/african-dish.png"
        alt="Come Again Restaurant"
      />

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
            🍽️
            <h3>Fresh Ingredients</h3>
            <p>
                Every meal is prepared fresh using carefully selected ingredients.
            </p>
        </div>

        <div className="why-box">
            🚚
            <h3>Fast Delivery</h3>
            <p>
                We deliver hot meals quickly across Lagos.
            </p>
        </div>

        <div className="why-box">
            👨‍🍳
            <h3>Experienced Chefs</h3>
            <p>
                Delicious Nigerian meals cooked by experienced chefs.
            </p>
        </div>

        <div className="why-box">
            💳
            <h3>Easy Payment</h3>
            <p>
                Pay online with Paystack or choose Cash on Delivery.
            </p>
        </div>

    </div>

</section>

<section className="reviews-section">

  <h2>What Our Customers Say</h2>

  <div className="reviews-container">

    <div className="review-card">
      <div className="stars">★★★★★</div>

      <p>
        "The Jollof Rice was absolutely delicious! Delivery was very fast
        and the food arrived hot."
      </p>

      <h4>- Sarah A.</h4>
    </div>

    <div className="review-card">
      <div className="stars">★★★★★</div>

      <p>
        "Best Nigerian restaurant I've ordered from. Fresh meals and
        excellent customer service."
      </p>

      <h4>- David O.</h4>
    </div>

    <div className="review-card">
      <div className="stars">★★★★★</div>

      <p>
        "Their Egusi Soup is amazing! I'll definitely keep ordering again."
      </p>

      <h4>- Chioma E.</h4>
    </div>

  </div>

</section>

<section className="map-section">

  <h2>Find Us</h2>

  <p>
    Visit Come Again Restaurant or order online for fast delivery.
  </p>

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

      <p><strong>Address</strong><br />
      343 Arabambi Close, Lagos, Nigeria</p>

      <p><strong>Email</strong><br />
      <a href="mailto:comeagainfoods@gmail.com">
        comeagainfoods@gmail.com
      </a></p>

      <p><strong>Phone</strong><br />
      <a href="tel:+2341234567890">
        +234 123 456 7890
      </a></p>

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

    <p>
       Our Food is Sensational... Come Again Soon.
    </p>

    <small>
        © 2026 Come Again Restaurant. All Rights Reserved.
    </small>

</footer>
    </div>
  );
}

export default HomePage;
