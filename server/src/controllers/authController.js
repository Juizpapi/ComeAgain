import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";


const googleClient = new OAuth2Client();

// REGISTER
export const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
const email = req.body.email.trim().toLowerCase();

// Block common email domain typos
const commonTypos = {
  "gmaill.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",

  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",

  "outlok.com": "outlook.com",
  "outllook.com": "outlook.com",

  "yahoo.con": "yahoo.com",
  "yahoo.co": "yahoo.com",
};

const domain = email.split("@")[1];

if (commonTypos[domain]) {
  return res.status(400).json({
    message: `Did you mean ${email.split("@")[0]}@${commonTypos[domain]} ?`,
  });
}


    // Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  return res.status(400).json({
    message: "Please enter a valid email address.",
  });
}

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    

const user = await User.create({
  username,
  email,
  password: hashedPassword,
  role: role || "user",

  is_confirmed: true,
 
});





    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      message:
  "Account created successfully. You can now log in.",
      user: userResponse,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if all fields are provided
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    

    // Find user
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }



    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.json({
      message: "Login successful",
      token,
 user: {
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
},
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Verification link is invalid or has expired.",
      });
    }

    user.is_confirmed = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await user.save();

  return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// RESEND VERIFICATION EMAIL
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Don't reveal whether the email exists
    if (!user) {
      return res.json({
  message:
    "✅ Verification email sent. Please check your inbox and Spam folder.",
});
    }

    // Already verified
    if (user.is_confirmed) {
      return res.status(400).json({
        message: "This account has already been verified.",
      });
    }

    // Generate a fresh verification token
    const verificationToken = crypto
      .randomBytes(32)
      .toString("hex");

    user.verificationToken = verificationToken;
    user.verificationTokenExpires =
      Date.now() + 1000 * 60 * 60 * 24;

    await user.save();

    const verifyLink =
      `http://localhost:5000/api/auth/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your Come Again Restaurant account",
      html: `
        <h2>Verify your email</h2>

        <p>Please click the button below to verify your account.</p>

        <p>
          <a href="${verifyLink}"
          style="
            background:#ff5722;
            color:white;
            padding:12px 20px;
            text-decoration:none;
            border-radius:6px;
          ">
            Verify Email
          </a>
        </p>

        <p>This link expires in 24 hours.</p>
      `,
    });

    res.json({
      message:
        "If an account with that email exists, a verification email has been sent.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Don't reveal whether the email exists
    if (!user) {
      return res.json({
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }
/*
const resetToken = crypto.randomBytes(32).toString("hex");
*/
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires =
      Date.now() + 1000 * 60 * 60; // 1 hour

    await user.save();

    const resetLink =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your Come Again Restaurant password",
      html: `
        <h2>Password Reset</h2>

        <p>You requested a password reset.</p>

        <p>
          <a href="${resetLink}"
          style="
            background:#ff5722;
            color:white;
            padding:12px 20px;
            text-decoration:none;
            border-radius:6px;
          ">
          Reset Password
          </a>
        </p>

        <p>This link expires in 1 hour.</p>

        <p>If you didn't request this, simply ignore this email.</p>
      `,
    });

    res.json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({
      message: "Password has been reset successfully.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    const existingUser = await User.findOne({
      _id: { $ne: req.user._id },
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists.",
      });
    }

    const user = await User.findById(req.user._id);

    user.username = username;
    user.email = email;

    await user.save();

    res.json({
      message: "Profile updated successfully.",
      user,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// UPLOAD AVATAR
export const uploadAvatar = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image.",
      });
    }

    const user = await User.findById(req.user._id);

    user.avatar = req.file.filename;

    await user.save();

    res.json({
      message: "Avatar updated successfully.",
      user,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message,
    });

  }
};

// GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  try {

    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        message: "Google token is required.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
    });

    const payload = ticket.getPayload();

    const email = payload.email;

    const username =
      payload.name || email.split("@")[0];

    let user = await User.findOne({ email });

    if (!user) {

      user = await User.create({
        username,
        email,
        password: crypto.randomBytes(32).toString("hex"),
        role: "user",
        is_confirmed: true,
      });

    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.json({
      message: "Google login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Google login failed.",
    });

  }
};