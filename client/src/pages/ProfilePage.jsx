import { useEffect, useRef, useState } from "react";
import { request } from "../lib/api";
import "../styles/ProfilePage.css";

function ProfilePage() {
  const [user, setUser] = useState(null);
const [editing, setEditing] = useState(false);
const [success, setSuccess] = useState("");
const fileInputRef = useRef(null);
const [form, setForm] = useState({
  username: "",
  email: "",
});

  useEffect(() => {
  const loadProfile = async () => {
    try {
      const data = await request("/auth/profile");
      


setUser(data.user);
  setForm({
  username: data.user.username,
  email: data.user.email,
});

    } catch (error) {
      console.error(error);
    }
  };

  loadProfile();
}, []);

const handleSave = async () => {
  try {
    const data = await request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(form),
    });

    setUser(data.user);

    localStorage.setItem(
      "comeagain_user",
      JSON.stringify(data.user)
    );

    setEditing(false);

    setSuccess("Profile updated successfully.");

setTimeout(() => {
  setSuccess("");
}, 3000);

  } catch (error) {
    alert(error.message);
  }
};

const handleAvatarUpload = async (event) => {

  const file = event.target.files[0];

  if (!file) return;

  const formData = new FormData();

  formData.append("avatar", file);

  try {

    const data = await request("/auth/avatar", {
      method: "POST",
      body: formData,
    });

    setUser(data.user);

    localStorage.setItem(
      "comeagain_user",
      JSON.stringify(data.user)
    );

    setSuccess("📷 Profile photo updated!");

    setTimeout(() => {
      setSuccess("");
    }, 3000);

  } catch (error) {

    alert(error.message);

  }

};

  return (
    <div className="profile-page">

{success && (

<div className="success-toast">

    <div className="success-icon">
        ✓
    </div>

    <div className="success-content">

        <div className="success-title">
            Success
        </div>

        <div className="success-message">
            {success}
        </div>

    </div>

    <div
        className="success-close"
        onClick={() => setSuccess("")}
    >
        ✕
    </div>

</div>

)}

      <div className="profile-header">

  <div className="profile-avatar">

  {user?.avatar ? (

    <img
      src={`http://localhost:5000/uploads/${user.avatar}`}
      alt="Profile"
      className="profile-avatar-img"
    />

  ) : (

    user?.username?.charAt(0).toUpperCase()

  )}

</div>


  <h2>{user?.username}</h2>

  <p>{user?.email}</p>

  <p className="profile-role">
    {user?.role === "admin"
      ? "👑 Administrator"
      : "🍽️ Customer"}
  </p>

  <span className="verified-badge">
    {user?.is_confirmed
      ? "✅ Verified Account"
      : "⚠️ Email Not Verified"}
  </span>

</div>

<hr />

<div className="profile-info">

 <div className="profile-row">

  <span>Username</span>

  {editing ? (

    <input
      className="profile-input"
      value={form.username}
      onChange={(e) =>
        setForm({
          ...form,
          username: e.target.value,
        })
      }
    />

  ) : (

    <strong>{user?.username}</strong>

  )}

</div>

 <div className="profile-row">

  <span>Email</span>

  {editing ? (

    <input
      className="profile-input"
      type="email"
      value={form.email}
      onChange={(e) =>
        setForm({
          ...form,
          email: e.target.value,
        })
      }
    />

  ) : (

    <strong>{user?.email}</strong>

  )}

</div>

  <div className="profile-row">
    <span>Member Since</span>
    <strong>
      {user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "--"}
    </strong>
  </div>

</div>

<hr />

<div className="profile-actions">

<>
  <input
    type="file"
    accept="image/*"
    ref={fileInputRef}
    style={{ display: "none" }}
    onChange={handleAvatarUpload}
  />

  <button
    className="profile-btn"
    onClick={() => fileInputRef.current.click()}
  >
    📷 Change Photo
  </button>
</>

  {editing ? (
    <>
      <button
        className="profile-btn"
        onClick={handleSave}
      >
        💾 Save Changes
      </button>

      <button
        className="profile-btn"
        onClick={() => {
          setEditing(false);

          setForm({
            username: user.username,
            email: user.email,
          });
        }}
      >
        ❌ Cancel
      </button>
    </>
  ) : (
    <button
      className="profile-btn"
      onClick={() => setEditing(true)}
    >
      ✏️ Edit Profile
    </button>
  )}

  <button className="profile-btn">
    🔒 Change Password
  </button>

</div>
    </div>
  );
}

export default ProfilePage;