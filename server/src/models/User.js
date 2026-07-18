import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
    

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    token: {
      type: String,
      default: null,
    },

    is_confirmed: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
  type: String,
  default: null,
},

verificationTokenExpires: {
  type: Date,
  default: null,
},
resetPasswordToken: {
  type: String,
  default: null,
},

resetPasswordExpires: {
  type: Date,
  default: null,
},
avatar: {
  type: String,
  default: "",
},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);