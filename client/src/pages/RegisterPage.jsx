import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { request } from '../lib/api';
import "../styles/RegisterPage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(form.email.trim())) {
  setMessage("❌ Please enter a valid email address.");
  return;
}

    setIsSubmitting(true);
    setMessage('');

    try {
await request('/auth/register', {
  method: 'POST',
  body: JSON.stringify(form),
});

// Clear the form
setForm({
  username: "",
  email: "",
  password: "",
});

setMessage(
  "✅ Account created successfully! Please log in.."
);

setTimeout(() => {
  navigate("/login");
}, 3000);

    } catch (error) {
      setMessage(error.message || 'Unable to create account right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">

  <div className="register-card">

    <div className="register-brand">

      <img
        src="/images/logo.png"
        alt="Come Again Restaurant"
        className="register-logo"
      />

      <h1>COME AGAIN</h1>

      <p>Restaurant</p>

    </div>

    <div className="register-heading">

      <h2>Create Account 🍽️</h2>

      <p>
        Join us and start ordering delicious Nigerian meals.
      </p>

    </div>

    {message && (
      <div className="register-message">
        {message}
      </div>
    )}

    <form
  onSubmit={handleSubmit}
  className="register-form"
  autoComplete="off"
>
    

      <input
  type="text"
  autoComplete="username"
  placeholder="Username"
  value={form.username}
        onChange={(e)=>
          setForm({
            ...form,
            username:e.target.value
          })
        }
        required
      />

      <input
  type="email"
  autoComplete="email"
  placeholder="Email Address"
        value={form.email}
        onChange={(e)=>
          setForm({
            ...form,
            email:e.target.value
          })
        }
        required
      />

      <div className="password-box">

       <input
  type={showPassword ? "text" : "password"}
  autoComplete="new-password"
          placeholder="Password"
          value={form.password}
          onChange={(e)=>
            setForm({
              ...form,
              password:e.target.value
            })
          }
          required
        />

        <button
          type="button"
          className="password-toggle"
          onClick={()=>
            setShowPassword(!showPassword)
          }
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>

      </div>

      <label className="remember-row">

        <input type="checkbox" />

        I agree to the Terms & Conditions

      </label>

      <button
        type="submit"
        className="register-btn"
        disabled={isSubmitting}
      >

        {isSubmitting
          ? "Creating Account..."
          : "Create Account"}

      </button>

    </form>

    <div className="register-footer">

      <Link to="/">
        ← Back Home
      </Link>

      <Link to="/login">
        Login Instead
      </Link>

    </div>

  </div>

</div>
  );
}

export default RegisterPage;
