import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../lib/api';
import ReviewModal from "../components/ReviewModal";
import "../styles/OrderPage.css";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("comeagain_user"));
  } catch {
    return null;
  }
}



const addonPrices = {
  Plantain: 200,
  Salad: 150,
  Chicken: 500,
  Turkey: 800,
  Meat: 600,
  Pomo: 400,
};

const fallbackMenu = [
  { id: 1, name: 'Jollof Rice', price: 2500, category: 'Rice', recommended: 'With chicken, vegetables and plantain' },
  { id: 2, name: 'Fried Rice', price: 2800, category: 'Rice', recommended: 'With chicken and salad' },
  { id: 3, name: 'White Rice', price: 2200, category: 'Rice', recommended: 'With stew and meat' },
  { id: 4, name: 'Coconut Rice', price: 3000, category: 'Rice', recommended: 'Rich coconut flavor' },
  { id: 5, name: 'Jollof Spaghetti', price: 2200, category: 'Spaghetti', recommended: 'Best served hot' },
  { id: 6, name: 'Fried Spaghetti', price: 2400, category: 'Spaghetti', recommended: 'With mixed vegetables' },
  { id: 7, name: 'Egusi Soup', price: 2500, category: 'Soup', recommended: 'Native soup favorite' },
  { id: 8, name: 'Vegetable Soup', price: 2500, category: 'Soup', recommended: 'Fresh vegetables and assorted meat' },
  { id: 9, name: 'Ewedu Soup', price: 1800, category: 'Soup', recommended: 'Smooth and traditional' },
  { id: 10, name: 'Afang Soup', price: 3000, category: 'Soup', recommended: 'Rich native soup' },
  { id: 11, name: 'Eba', price: 800, category: 'Swallow', recommended: 'Served with rich soup' },
  { id: 12, name: 'Fufu', price: 800, category: 'Swallow', recommended: 'Soft and filling' },
  { id: 13, name: 'Semo', price: 900, category: 'Swallow', recommended: 'Perfect with egusi soup' },
  { id: 14, name: 'Wheat', price: 1000, category: 'Swallow', recommended: 'Light swallow option' },
  { id: 15, name: 'Goat Meat Pepper Soup', price: 3500, category: 'Pepper Soup', recommended: 'Spicy and hot' },
  { id: 16, name: 'Fish Pepper Soup', price: 3200, category: 'Pepper Soup', recommended: 'Fresh fish pepper soup' },
];

function getCartCount(cart) {
  return cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
}

function getStoredCart() {
  try {
    return JSON.parse(localStorage.getItem('comeagain_cart') || '[]');
  } catch {
    return [];
  }
}

function groupMenu(items) {
  return items.reduce((groups, item) => {
    const category = item.category || 'Menu';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});
}

function OrderPage() {
  const [menuItems, setMenuItems] = useState(fallbackMenu);
  const [loading, setLoading] = useState(true);

  const [favorites, setFavorites] = useState([]);
const [favoriteLoading, setFavoriteLoading] = useState(false);
const [favoriteToast, setFavoriteToast] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(() => getCartCount(getStoredCart()));
  const [toastVisible, setToastVisible] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});
  const [selectedReviewFood, setSelectedReviewFood] = useState(null);
  const [foodReviews, setFoodReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const user = getStoredUser();

const isAdmin =
  user?.role === "admin" ||
  user?.username === "admin";

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const response = await request("/foods");

if (Array.isArray(response)) {
  setMenuItems(response);
}
      } catch (error) {
        console.warn('Using local menu because the API menu did not load.', error);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();

   if (user) {
  request("/favorites")
    .then((data) => {
      setFavorites(
        data.map((favorite) => favorite.food._id)
      );
    })
    .catch(console.error);
}

  }, []);

  const filteredGroups = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filteredItems = query
      ? menuItems.filter((item) => {
        console.log("Favorite Toast:", favoriteToast);
          return (
            item.name.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            (item.recommended || '').toLowerCase().includes(query)
          );
        })
      : menuItems;

    return Object.entries(groupMenu(filteredItems));
  }, [menuItems, searchTerm]);

  const toggleAddon = (foodId, addonName) => {
    setSelectedAddons((current) => {
      const existing = current[foodId] || [];
      const nextAddons = existing.includes(addonName)
        ? existing.filter((addon) => addon !== addonName)
        : [...existing, addonName];

      return { ...current, [foodId]: nextAddons };
    });
  };

  const addToCart = (food) => {
   

  const foodId = food._id || food.id;

  const quantity = Number(quantities[foodId] || 1);
  const addons = selectedAddons[foodId] || [];

  const storedCart = getStoredCart();

  const existing = storedCart.find(
    (entry) =>
      entry.id === foodId &&
      JSON.stringify(entry.addons || []) === JSON.stringify(addons)
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
storedCart.push({
  food: foodId,
  foodId: foodId,
  id: foodId,
  name: food.name,
  price: Number(food.price),
  quantity,
  addons,
});
  }

  localStorage.setItem("comeagain_cart", JSON.stringify(storedCart));

  

  setCartCount(getCartCount(storedCart));
  window.dispatchEvent(new Event("comeagain-cart-change"));
  setToastVisible(true);
  window.setTimeout(() => setToastVisible(false), 2000);
};

const openReviews = async (food) => {
  try {

    setReviewLoading(true);

    const reviews = await request(
      `/reviews/food/${food._id}`
    );

    setFoodReviews(reviews);
    setSelectedReviewFood(food);

  } catch (error) {

    console.error("Failed to load reviews", error);

  } finally {

    setReviewLoading(false);

  }
};

const toggleFavorite = async (foodId) => {
  try {

    setFavoriteLoading(true);

    const data = await request(`/favorites/${foodId}`, {
      method: "POST",
    });
    

if (data.favorited) {

  setFavorites((prev) =>
    [...new Set([...prev, foodId])]
  );

  setFavoriteToast("❤️ Added to Favorites");

} else {

  setFavorites((prev) =>
    prev.filter((id) => id !== foodId)
  );

  setFavoriteToast("🤍 Removed from Favorites");

}

setTimeout(() => {
  setFavoriteToast("");
}, 2000);

  } catch (err) {

    console.error(err);

  } finally {

    setFavoriteLoading(false);

  }
};
console.log("Favorite Toast:", favoriteToast);
  return (
    <div className="page-shell order-page">
<header className="order-hero">

    <div className="order-brand">

        <h1 className="hero-title">
            COME AGAIN RESTAURANT
        </h1>

        <p className="hero-text">
            Our food is sensational...
            <strong> COME~AGAIN </strong>
            soon!
        </p>

    </div>

    <nav className="modern-nav">

              <Link to="/" className="nav-btn">
            🏠 Home
        </Link>

        <Link to="/cart" className="nav-btn">
            🛒 Cart
            <span className="nav-badge">
                {cartCount}
            </span>
        </Link>

        <Link to="/favorites" className="nav-btn">
            ❤️ Favorites
        </Link>



        {user && (
            <Link to="/order-history" className="nav-btn">
                📦 Orders
            </Link>
        )}

        {isAdmin && (
            <>
                <Link
                    to="/admin/orders"
                    className="nav-btn"
                >
                    📋 Admin Orders
                </Link>

                <Link
                    to="/admin/foods"
                    className="nav-btn"
                >
                    🍽 Admin Foods
                </Link>
            </>
        )}

        {!user ? (
            <>
                <Link to="/login" className="nav-btn">
                    Login
                </Link>

                <Link to="/register" className="nav-btn">
                    Register
                </Link>
            </>
        ) : (
            <button
                className="nav-btn logout-btn"
                onClick={()=>{
                    localStorage.removeItem("comeagain_user");
                    localStorage.removeItem("comeagain_token");
                    localStorage.removeItem("comeagain_cart");
                    window.location.href="/";
                }}
            >
                Logout
            </button>
        )}

    </nav>

</header>

      <section className="order-content">
        <div className="food-search-wrap modern-search">
          <input
            type="text"
            id="food-search"
            placeholder="Search for food..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <h2 className="order-heading">
    Order Now
</h2>
        {loading ? <p style={{ textAlign: 'center' }}>Loading menu...</p> : null}

        {filteredGroups.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No food matched your search.</p>
        ) : null}

        {filteredGroups.map(([category, items]) => (
          <div key={category} className="order-category">
            <h3 className="order-category-title">{category}</h3>
            <div className="food-grid">
              {items.map((food) => {
                const foodId = food._id || food.Id ;
                const quantity = quantities[foodId] || 1;
                const canUseAddons = ['Rice', 'Swallow'].includes(food.category);
                
                return (
                  <article
  key={food._id || food.id}
  className="food-card"
>

  <button
    className="favorite-btn"
    onClick={() => toggleFavorite(food._id)}
    disabled={favoriteLoading}
  >
    {favorites.includes(food._id) ? "❤️" : "🤍"}
  </button>
<h4>
  {food.name} - ₦{Number(food.price).toLocaleString()}
</h4>

<button
  type="button"
  className="review-food-btn"
  onClick={() => openReviews(food)}
>
  {food.totalReviews > 0
    ? `⭐ ${food.averageRating} (${food.totalReviews} review${food.totalReviews > 1 ? "s" : ""})`
    : "⭐ No reviews yet"
  }
</button>

{food.recommended ? (
  <p>
    <strong>Recommended:</strong> {food.recommended}
  </p>
) : null}

                    <div className="add-to-cart-form">
                      <label htmlFor={`quantity-${foodId}`}>Qty:</label>
                      <input
                        id={`quantity-${foodId}`}
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(event) => {
                          const nextValue = Math.max(1, Number(event.target.value || 1));
                          setQuantities((current) => ({
  ...current,
  [foodId]: nextValue,
}));

                        }}
                      />

                      {canUseAddons ? (
                        <div className="addons-box">
                          <strong>Add-ons:</strong>
                          {Object.entries(addonPrices).map(([name, price]) => (
                            <label key={name} className="addon">
                              <input
                                type="checkbox"
                                checked={(selectedAddons[foodId] || []).includes(name)}
                                onChange={() => toggleAddon(foodId, name)}
                              />
                              {' '}{name} (₦{price})
                            </label>
                          ))}
                        </div>
                      ) : null}

                      <button type="button" className="order-btn" onClick={() => addToCart(food)}>
                      
                        Add to Cart
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <footer className="modern-footer">© 2026 Come Again Restaurant</footer>
      <div id="cart-toast" className={toastVisible ? 'show' : ''}>Added to cart</div>
      {favoriteToast && (
  <div className="favorite-toast show">
    {favoriteToast}
  </div>
)}

<ReviewModal
  food={selectedReviewFood}
  reviews={foodReviews}
  loading={reviewLoading}
  onClose={() => setSelectedReviewFood(null)}
/>

    </div>
  );
}

export default OrderPage;
