import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../lib/api';
import "../styles/AdminFoods.css";

const addonPrices = {
  Plantain: 200,
  Salad: 150,
  Chicken: 500,
  Turkey: 800,
  Meat: 600,
  Pomo: 400,
};

const emptyForm = {
  name: '',
  price: '',
  category: 'Rice',
  recommended: '',
  addons: '',
};

function AdminFoodsPage() {
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const formRef = useRef(null);

  const loadMenu = async () => {
    try {
      const response = await request('/foods');
      setFoods(response);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        recommended: form.recommended,
        addons: form.addons
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean)
  .map((name) => ({
    name,
    price: addonPrices[name] || 0,
  })),
      };

if (editingId) {
  await request(`/foods/${editingId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

  setMessage("Menu item updated successfully.");

  setTimeout(() => {
    setMessage("");
  }, 3000);

} else {
  await request('/foods', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  setMessage("Menu item added successfully.");

  setTimeout(() => {
    setMessage("");
  }, 3000);
}

      setForm(emptyForm);
      setEditingId(null);
      await loadMenu();
    } catch (error) {
      setMessage(error.message || 'Unable to save item.');
    }
  };

const handleEdit = (food) => {
  setEditingId(food._id);

  setForm({
    name: food.name,
    price: food.price,
    category: food.category,
    recommended: food.recommended || '',
    addons: (food.addons || []).join(', '),
  });

  formRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

  const handleDelete = async (id) => {
    try {
      await request(`/foods/${id}`, { method: 'DELETE' });
      setMessage("Menu item removed successfully.");

setTimeout(() => {
  setMessage("");
}, 3000);

      await loadMenu();
    } catch (error) {
      setMessage(error.message || 'Unable to remove item.');
    }
  };

  return (
    <div className="admin-foods-page">
{message && (

<div className="admin-toast">

    <div className="admin-toast-icon">
        ✓
    </div>

    <div>

        <div className="admin-toast-title">
            Success
        </div>

        <div className="admin-toast-text">
            {message}
        </div>

    </div>

</div>

)}

      <header className="admin-header">
<div>


  <h1 className="admin-title">Manage Menu</h1>

  <p className="admin-subtitle">
    Add, edit and remove restaurant meals
  </p>
</div>
        <Link to="/" className="admin-btn"> Back Home</Link>
      </header>

     <section className="admin-foods-container">
        <form
  ref={formRef}
  className="admin-form"
  onSubmit={handleSubmit}
>
          <div>
            <p className="admin-subtitle">{editingId ? 'Edit item' : 'Add item'}</p>
            <h3>{editingId ? 'Update menu item' : 'Create a new menu item'}</h3>
          </div>
          <div className="admin-grid">
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" required />
            <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="Price" type="number" required />
            <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Category" required />
            <input value={form.recommended} onChange={(event) => setForm({ ...form, recommended: event.target.value })} placeholder="Recommended" />
            <input value={form.addons} onChange={(event) => setForm({ ...form, addons: event.target.value })} placeholder="Add-ons (comma separated)" />
          </div>
          

          <div className="admin-actions">

            <button type="submit" className="admin-btn">{editingId ? 'Save Changes' : 'Add Item'}</button>
            {editingId ? <button type="button" className="admin-btn" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button> : null}
          </div>
        </form>

<div className="food-list">
        {foods.map((food) => (
          <article
    key={food._id}
    className="food-item-card"
>
            <div>
              <h3>{food.name}</h3>
              <p>Category: {food.category}</p>
            </div>
            <div>
              <p>Price: ₦{Number(food.price || 0).toLocaleString()}</p>
              <div className="food-buttons">
                <button
  type="button"
  className="admin-btn"
  onClick={() => handleEdit(food)}
>Edit</button>
                <button type="button" className="admin-btn-danger" onClick={() => handleDelete(food._id)}>
                
                Delete</button>
              </div>

            </div>
          </article>
        ))}
        </div>
      </section>
    </div>)
  
}

export default AdminFoodsPage;
