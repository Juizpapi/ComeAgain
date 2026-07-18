import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { request } from "../lib/api";
import "../styles/ResetPassword.css";

function ResetPasswordPage() {

  const { token } = useParams();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (form.password !== form.confirmPassword) {

      setMessage("Passwords do not match.");

      return;

    }

    setIsSubmitting(true);

    setMessage("");

    try {

      const data = await request(
        `/auth/reset-password/${token}`,
        {
          method: "POST",
          body: JSON.stringify({
            password: form.password,
          }),
        }
      );

      setMessage(data.message);

      setTimeout(() => {

        navigate("/login");

      }, 2500);

    } catch (error) {

      setMessage(error.message);

    } finally {

      setIsSubmitting(false);

    }

  };

  return (

    <div className="reset-page">

      <div className="reset-card">

        <div className="reset-brand">

          <h1>COME AGAIN</h1>

          <p>Restaurant</p>

        </div>

        <div className="reset-heading">

          <h2>Create New Password</h2>

          <p>

            Enter your new password below.

          </p>

        </div>

        {message && (

          <div className="reset-message">

            {message}

          </div>

        )}

        <form
          className="reset-form"
          onSubmit={handleSubmit}
        >

          <div className="password-box">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="New Password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          <div className="password-box">

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword:
                    e.target.value,
                })
              }
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >
              {showConfirmPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          <button
            className="reset-btn"
            type="submit"
            disabled={isSubmitting}
          >

            {isSubmitting
              ? "Updating Password..."
              : "Reset Password"}

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

export default ResetPasswordPage;