import { useState } from "react";
import { Link } from "react-router-dom";
import { request } from "../lib/api";
import "../styles/ForgotPassword.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage("");

    try {
      const data = await request("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-page">

      <div className="forgot-card">

        <div className="forgot-brand">
          <h1>COME AGAIN</h1>
          <p>Restaurant</p>
        </div>

        <div className="forgot-heading">
          <h2>Forgot Password?</h2>

          <p>
            Enter your email address and we'll send you a password reset link.
          </p>
        </div>

        {message && (
          <div className="forgot-message">
            {message}
          </div>
        )}

        <form
          className="forgot-form"
          onSubmit={handleSubmit}
        >

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <button
            className="forgot-btn"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Sending..."
              : "Send Reset Link"}
          </button>

        </form>

        <p className="register-text">
          Remember your password?
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default ForgotPasswordPage;