import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { request } from '../lib/api';
import "../styles/CartPage.css";

const addonPrices = {
  Plantain: 200,
  Salad: 150,
  Chicken: 500,
  Turkey: 800,
  Meat: 600,
  Pomo: 400,
};

const deliveryOptions = [
  { value: 'agege', label: 'Agege', fee: 1000 },
  { value: 'ajeromi', label: 'Ajeromi-Ifelodun', fee: 800 },
  { value: 'alimosho', label: 'Alimosho', fee: 1000 },
];

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(deliveryOptions[0].value);
  const [message, setMessage] = useState('');

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("comeagain_cart");

    const storedCart = JSON.parse(raw || "[]");

    setCart(storedCart);
    setLoaded(true);
  }, []);

  const deliveryFee = useMemo(() => {
    const option = deliveryOptions.find((entry) => entry.value === selectedLocation);
    return option ? option.fee : 0;
  }, [selectedLocation]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      let total = item.price * item.quantity;
      if (item.addons?.length) {
        total += item.addons.reduce((addonSum, addon) => addonSum + (addonPrices[addon] || 0), 0) * item.quantity;
      }
      return sum + total;
    }, 0);
  }, [cart]);

  const total = subtotal + deliveryFee;

  const updateQuantity = (index, delta) => {
    setCart((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      })
    );
  };

  const removeItem = (index) => {
    setCart((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "comeagain_cart",
      JSON.stringify(cart)
    );
  }, [cart, loaded]);

  const token = localStorage.getItem("comeagain_token");

  const handleCheckout = async (paymentType) => {
    try {
      const token = localStorage.getItem("comeagain_token");

      if (!token) {
        alert("Please login to continue.");

        navigate("/login", {
          state: {
            from: paymentType === "online" ? "/checkout" : "/cart",
          },
        });

        return;
      }

      const payload = {
        customer: localStorage.getItem('comeagain_user')
          ? JSON.parse(localStorage.getItem('comeagain_user')).username
          : 'Guest',

        email: localStorage.getItem('comeagain_user')
          ? JSON.parse(localStorage.getItem('comeagain_user')).email
          : 'customer@example.com',

        paymentType,
        location: selectedLocation,
        items: cart,
        totalAmount: total,
      };

      if (paymentType === 'online') {
        localStorage.setItem('comeagain_checkout_location', selectedLocation);
        navigate('/checkout');
        return;
      }

      await request('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      localStorage.removeItem('comeagain_cart');
      setMessage('Order placed successfully.');
      navigate('/order-history');

    } catch (error) {
      setMessage(error.message || 'Unable to place order.');
    }
  };

  return (
    <div className="cart-page">

      <header className="cart-header">

        <div>

          <p className="cart-eyebrow">
            Your Cart
          </p>

          <h1 className="cart-heading">
            Review your order before checkout
          </h1>

        </div>

        {cart.length > 0 && (

          <Link
            to="/order"
            className="cart-btn"
          >
            Continue Ordering
          </Link>

        )}

      </header>

      <section className="cart-container">

        {cart.length === 0 ? (

          <div className="cart-empty">

            <h2>
              Your cart is empty 🛒
            </h2>

            <p>
              You haven't added any meals yet.
              Browse our delicious menu and start your order.
            </p>

            <Link
              to="/order"
              className="cart-btn"
            >
              Browse Menu
            </Link>

          </div>

        ) : (

          <>

            <div className="cart-items">

              {cart.map((item, index) => (

                <div
                  key={`${item.name}-${index}`}
                  className="cart-item"
                >

                  <div>

                    <h3>{item.name}</h3>

                    <p>
                      {item.addons?.length
                        ? `Add-ons: ${item.addons.join(', ')}`
                        : 'No add-ons'}
                    </p>

                    <p>

                      ₦

                      {(
                        (
                          item.price +
                          (item.addons || []).reduce(
                            (sum, addon) => sum + (addonPrices[addon] || 0),
                            0
                          )
                        ) * item.quantity

                      ).toLocaleString()}

                    </p>

                  </div>

                  <div className="cart-item-actions">

                    <div className="cart-quantity">

                      <button
                        type="button"
                        onClick={() => updateQuantity(index, -1)}
                      >
                        -
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(index, 1)}
                      >
                        +
                      </button>

                    </div>

                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </button>

                  </div>

                </div>

              ))}

            </div>

            <div className="cart-summary">

              <label htmlFor="location">
                Select your location
              </label>

              <select
                id="location"
                value={selectedLocation}
                onChange={(event) =>
                  setSelectedLocation(event.target.value)
                }
              >

                {deliveryOptions.map((option) => (

                  <option
                    value={option.value}
                    key={option.value}
                  >

                    {option.label} -
                    ₦{option.fee.toLocaleString()}

                  </option>

                ))}

              </select>

              <div className="cart-summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ₦{subtotal.toLocaleString()}
                </strong>

              </div>

              <div className="cart-summary-row">

                <span>
                  Delivery fee
                </span>

                <strong>
                  ₦{deliveryFee.toLocaleString()}
                </strong>

              </div>

              <div className="cart-summary-row cart-total">

                <span>
                  Total
                </span>

                <strong>
                  ₦{total.toLocaleString()}
                </strong>

              </div>

              {message ? (

                <p className="cart-message">

                  {message}

                </p>

              ) : null}

              <button
                type="button"
                className="cart-btn cart-wide-btn"
                onClick={() => handleCheckout('cash')}
              >
                Cash on Delivery
              </button>

              <button
                type="button"
                className="cart-outline-btn cart-wide-btn"
                onClick={() => handleCheckout('online')}
              >
                Pay Online
              </button>

            </div>

          </>

        )}

      </section>

    </div>
  );
}

export default CartPage;