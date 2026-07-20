import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { request } from '../lib/api';
import "../styles/LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState("");

useEffect(() => {
  const params = new URLSearchParams(location.search);

  if (params.get("verified") === "true") {
    setMessage(
      "✅ Your email has been verified successfully. You can now log in."
    );
  }
}, [location]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      localStorage.setItem('comeagain_token', data.token);
      localStorage.setItem('comeagain_user', JSON.stringify(data.user));
      setMessage('Login successful. Redirecting...');
      navigate(location.state?.from || "/");
    } 
    catch (error) {

  setMessage(
    error.message || "Unable to log in right now."
  );

  if (
    error.message ===
    "Please verify your email before logging in."
  ) {
    setShowResend(true);
  }


    } finally {
      setIsSubmitting(false);
    }
  };

 
    
const handleResendVerification = async () => {

  try {

    setSendingVerification(true);

    const email = resendEmail.trim();

    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    const data = await request(
      "/auth/resend-verification",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );

    setMessage(data.message);

    setResendEmail("");
    setShowResend(false);

  } catch (error) {

    setMessage(
      error.message ||
      "Unable to resend verification email."
    );

  } finally {

    setSendingVerification(false);

  }

};

  return (
<div className="login-page">

  <div className="login-card">

    <div className="login-brand">

      <img
        src="/images/logo.png"
        alt="Come Again Restaurant"
        className="login-logo"
      />

      <h1>COME AGAIN</h1>

      <p>Restaurant</p>

    </div>

    <div className="login-heading">

      <h2>Welcome Back 👋</h2>

      <p>
        Sign in to continue ordering delicious meals.
      </p>

    </div>

    {message && (
      <div className="login-message">
        {message}
      </div>
    )}

    <form onSubmit={handleSubmit} className="login-form">

      <input
        type="text"
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

<div className="password-box">

<input
    type={showPassword ? "text" : "password"}
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
    onClick={() => setShowPassword(!showPassword)}
>

{showPassword ? <FaEyeSlash /> : <FaEye />}

</button>

</div>

      <button
        type="submit"
        className="login-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing In..." : "Login"}
      </button>


    </form>

    <div className="login-footer">

      <Link to="/">
        ← Back Home
      </Link>

      <Link to="/forgot-password">
        Forgot Password?
      </Link>

    </div>



    {showResend && (

  <div className="resend-verification">

    <p>
      Enter the email address you used when creating your account.
    </p>

    <input
      type="email"
      placeholder="Enter your email address"
      value={resendEmail}
      onChange={(e) =>
        setResendEmail(e.target.value)
      }
    />

    <button
  type="button"
  className="login-btn"
  onClick={handleResendVerification}
  disabled={sendingVerification}
>
  {sendingVerification
    ? "Sending..."
    : "Resend Verification Email"}
</button>

  </div>

)}
  

    <p className="register-text">

      Don't have an account?

      <Link to="/register">
        Register
      </Link>

    </p>

  </div>

</div>
  );
}

export default LoginPage;
