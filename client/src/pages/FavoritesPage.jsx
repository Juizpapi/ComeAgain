import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { request } from "../lib/api";
import "../styles/Favorites.css";

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartToast, setCartToast] = useState("");
  const [favoriteToast, setFavoriteToast] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const data = await request("/favorites");
        setFavorites(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();

    const updateCartCount = () => {
      const cart = JSON.parse(
        localStorage.getItem("comeagain_cart") || "[]"
      );

      const total = cart.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );

      setCartCount(total);
    };

    updateCartCount();

    window.addEventListener(
      "comeagain-cart-change",
      updateCartCount
    );

    return () => {
      window.removeEventListener(
        "comeagain-cart-change",
        updateCartCount
      );
    };

  }, []);

  const addToCart = (food) => {

    const cart =
      JSON.parse(localStorage.getItem("comeagain_cart") || "[]");

    const existing = cart.find(
      (item) => item.id === food._id
    );

    if (existing) {

      existing.quantity += 1;

    } else {

      cart.push({
        id: food._id,
        name: food.name,
        price: Number(food.price),
        quantity: 1,
        addons: [],
      });

    }

    localStorage.setItem(
      "comeagain_cart",
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new Event("comeagain-cart-change")
    );

    setCartToast("🛒 Added to Cart");

    setTimeout(() => {
      setCartToast("");
    }, 2000);

  };

  const removeFavorite = async (foodId) => {
    try {

      const data = await request(`/favorites/${foodId}`, {
        method: "POST",
      });

      if (!data.favorited) {

        setFavorites((current) =>
          current.filter(
            (item) => item.food._id !== foodId
          )
        );

        setFavoriteToast("🤍 Removed from Favorites");

        setTimeout(() => {
          setFavoriteToast("");
        }, 2000);

      }

    } catch (error) {

      console.error(error);

    }
  };

  return (
    <div className="favorites-page">

      <div className="favorites-topbar">

        <h1>❤️ My Favorites</h1>

        <div className="favorites-nav">

          <Link
            to="/order"
            className="favorites-nav-btn"
          >
            ← Back to Menu
          </Link>

          <Link
            to="/cart"
            className="favorites-nav-btn"
          >
            🛒 Cart ({cartCount})
          </Link>

        </div>

      </div>

      {loading ? (
        <p>Loading...</p>
      ) : favorites.length === 0 ? (
        <p>You haven't added any favorite meals yet.</p>
      ) : (
        <div className="favorites-list">

          {favorites.map((favorite) => (
            <div
              key={favorite.food._id}
              className="favorites-card"
            >

              <h2>{favorite.food.name}</h2>

              <p className="favorites-price">
                ₦{Number(favorite.food.price).toLocaleString()}
              </p>

              <p className="favorites-category">
                {favorite.food.category}
              </p>

              {favorite.food.recommended && (
                <p className="favorites-recommended">
                  🍽 {favorite.food.recommended}
                </p>
              )}

              <div className="favorites-card-buttons">

                <button
                  className="favorites-cart-btn"
                  onClick={() => addToCart(favorite.food)}
                >
                  🛒 Add to Cart
                </button>

                <button
                  className="favorites-remove-btn"
                  onClick={() => removeFavorite(favorite.food._id)}
                >
                  ❤️ Remove
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {cartToast && (
        <div className="favorites-toast">
          {cartToast}
        </div>
      )}

      {favoriteToast && (
        <div className="favorites-toast">
          {favoriteToast}
        </div>
      )}

    </div>
  );
}

export default FavoritesPage;