import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { request } from '../lib/api';
import "../styles/CheckoutPage.css";

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
  { value: 'Ajeromi-Ifelodun', label: 'Ajeromi-Ifelodun', fee: 1000 },
  { value: 'alimosho', label: 'Alimosho', fee: 1000 },
  { value: 'Amuwo-Odofin', label: 'Amuwo-Odofin', fee: 1000 },
  { value: 'Apapa', label: 'Apapa', fee: 1000 },
  { value: 'Badagry', label: 'Badagry', fee: 1000 },
    { value: 'Epe', label: 'Epe', fee: 1000 },
  { value: 'Eti-Osa', label: 'Eti-Osa', fee: 1000 },
    { value: 'Ibeju-Lekki', label: 'Ibeju-Lekki', fee: 1000 },
  { value: 'Ifako-Ijaiye', label: 'Ifako-Ijaiye', fee: 1000 },
  { value: 'Ikeja', label: 'Ikeja', fee: 1000 },
    { value: 'Ikorodu', label: 'Ikorodu', fee: 1000 },
  { value: 'Kosofe', label: 'Kosofe', fee: 1000 },
  { value: 'Lagos Island', label: 'Lagos Island', fee: 1000 },
    { value: 'Lagos Mainland', label: 'Lagos Mainland', fee: 1000 },
  { value: 'Mushin', label: 'Mushin', fee: 1000 },
  { value: 'Ojo', label: 'Ojo', fee: 1000 },
    { value: 'Oshodi-Isolo', label: 'Oshodi-Isolo', fee: 1000 },
  { value: 'Somolu', label: 'Somolu', fee: 1000 },
   { value: 'Surulere ', label: 'Surulere ', fee: 1000 },

];

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('comeagain_user') || '{}');
  } catch {
    return {};
  }
}

function CheckoutPage() {
  const navigate = useNavigate();
  
useEffect(() => {
  const token = localStorage.getItem("comeagain_token");

  if (!token) {
    alert("Please login to continue.");
    navigate("/login");
  }
}, [navigate]);

  const [status, setStatus] = useState('Preparing your payment...');
  const [isReady, setIsReady] = useState(false);
  const [cart, setCart] = useState([]);
  const [location, setLocation] = useState(() => localStorage.getItem('comeagain_checkout_location') || deliveryOptions[0].value);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('comeagain_cart') || '[]');
    setCart(storedCart);

    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');

    const verifyPayment = async () => {
      if (!reference) {
        setIsReady(storedCart.length > 0);
        setStatus(storedCart.length > 0 ? 'Payment is ready. Click pay to continue.' : 'Your cart is empty.');
        return;
      }

      try {
        setStatus('Verifying payment...');
        const verification = await request('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({ reference }),
        });

        if (!verification.ok) {
          throw new Error(verification.message || 'Verification failed');
        }

        localStorage.removeItem('comeagain_cart');
localStorage.removeItem('comeagain_checkout_location');

setCart([]);
setIsReady(false);

setStatus('Payment successful. Your order is confirmed.');

setTimeout(() => {
  navigate('/order-history');
}, 2000);
      } catch (error) {
        setIsReady(storedCart.length > 0);
        setStatus(error.message || 'Payment verification failed.');
      }
    };

    verifyPayment();
  }, []);

  const deliveryFee = useMemo(() => {
    const option = deliveryOptions.find((entry) => entry.value === location);
    return option ? option.fee : 0;
  }, [location]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const addonsTotal = (item.addons || []).reduce((addonSum, addon) => addonSum + (addonPrices[addon] || 0), 0);
      return sum + (Number(item.price || 0) + addonsTotal) * Number(item.quantity || 1);
    }, 0);
  }, [cart]);

  const total = subtotal + deliveryFee;

  const handlePay = async () => {
    try {
      const user = readUser();
      setStatus('Starting Paystack checkout...');

      const response = await request('/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({
          customer: user.username || 'Guest',
          email: user.email || 'customer@example.com',
          paymentType: 'online',
          location,
          items: cart,
        }),
      });

      if (!response.authorizationUrl) {
        throw new Error('Paystack did not return a payment link.');
      }

      localStorage.setItem('comeagain_checkout_location', location);
      window.location.href = response.authorizationUrl;
    } catch (error) {
      setStatus(error.message || 'Unable to start Paystack payment.');
    }
  };

  return (
  <div className="checkout-page">
    <header className="checkout-header">
      <div>
        <p className="checkout-eyebrow">Checkout</p>
        <h1 className="checkout-title">Complete your order</h1>
      </div>
    </header>

    <section className="checkout-payment-card">
      <h2 className="checkout-card-title">
        Payment checkout
      </h2>

      <p className="checkout-status">
        {status}
      </p>

      <label
        htmlFor="checkout-location"
        className="checkout-label"
      >
        Select your location
      </label>

      <select
        id="checkout-location"
        className="checkout-select"
        value={location}
        onChange={(event) => {
          setLocation(event.target.value);
          localStorage.setItem(
            "comeagain_checkout_location",
            event.target.value
          );
        }}
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

      <div className="checkout-summary-row">
        <span>Items</span>

        <strong>{cart.length}</strong>
      </div>

      {cart.map((item) => (
        <div
          key={`${item.name}-${item.quantity}`}
          className="checkout-summary-row"
        >
          <span>
            {item.name} x {item.quantity}
          </span>

          <strong>
            ₦
            {(
              (
                Number(item.price || 0) +
                (item.addons || []).reduce(
                  (sum, addon) =>
                    sum +
                    (addonPrices[addon] || 0),
                  0
                )
              ) *
              Number(item.quantity || 1)
            ).toLocaleString()}
          </strong>
        </div>
      ))}

      <div className="checkout-summary-row checkout-total-row">
        <span>Delivery fee</span>

        <strong>
          ₦{deliveryFee.toLocaleString()}
        </strong>
      </div>

      <div className="checkout-summary-row checkout-grand-total">
        <span>Total</span>

        <strong>
          ₦{total.toLocaleString()}
        </strong>
      </div>

      <button
        type="button"
        className="checkout-primary-btn"
        onClick={handlePay}
        disabled={!isReady}
      >
        Pay with Paystack
      </button>

      <Link
        to="/cart"
        className="checkout-secondary-btn"
        
      >
        Back to Cart
      </Link>
      

    </section>
  </div>
);
}

export default CheckoutPage;
