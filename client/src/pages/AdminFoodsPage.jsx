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

const categories = [
  "Main Meal",
  "Pepper Soup",
  "Rice",
  "Side",
  "Soup",
  "Swallow"
];

const emptyForm = {
  name: '',
  price: '',
  category: 'Rice',
  recommended: '',
  addons: [],
};

// Helper function to cleanly extract add-on names without [object Object]
const getAddonName = (addon) => {
  if (!addon) return '';
  if (typeof addon === 'object') return addon.name || addon.title || '';
  if (typeof addon === 'string') {
    if (addon.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(addon);
        return parsed.name || parsed.title || addon;
      } catch {
        return addon;
      }
    }
    return addon;
  }
  return String(addon);
};

function AdminFoodsPage() {
  const [foods, setFoods] = useState([]);
  const [deletedFoods, setDeletedFoods] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'trash'
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleAddonToggle = (addonName) => {
    setForm((prev) => {
      const currentAddons = prev.addons || [];
      const exists = currentAddons.includes(addonName);
      const updatedAddons = exists
        ? currentAddons.filter((name) => name !== addonName)
        : [...currentAddons, addonName];
      return { ...prev, addons: updatedAddons };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const formattedAddons = (form.addons || []).map((name) => ({
        name,
        price: addonPrices[name] || 0,
      }));

      const payload = {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        recommended: form.recommended,
        addons: formattedAddons,
      };

      if (editingId) {
        await request(`/foods/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setMessage("Menu item updated successfully.");
      } else {
        await request('/foods', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMessage("Menu item added successfully.");
      }

      setTimeout(() => setMessage(""), 3000);
      setForm(emptyForm);
      setEditingId(null);
      await loadMenu();
    } catch (error) {
      setMessage(error.message || 'Unable to save item.');
    }
  };

  const handleEdit = (food) => {
    setEditingId(food._id);

    const existingAddons = (food.addons || [])
      .map(getAddonName)
      .filter(Boolean);

    setForm({
      name: food.name || '',
      price: food.price || '',
      category: food.category || 'Rice',
      recommended: food.recommended || '',
      addons: existingAddons,
    });

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleDelete = async (food) => {
    try {
      await request(`/foods/${food._id}`, { method: 'DELETE' }).catch(() => {});
      
      setDeletedFoods((prev) => [...prev.filter((f) => f._id !== food._id), food]);
      setFoods((prev) => prev.filter((f) => f._id !== food._id));

      setMessage("Menu item moved to trash.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.message || 'Unable to remove item.');
    }
  };

  const handleRestore = async (food) => {
    try {
      const formattedAddons = (food.addons || []).map((item) => {
        const name = getAddonName(item);
        return { name, price: addonPrices[name] || 0 };
      });

      const payload = {
        name: food.name,
        price: Number(food.price),
        category: food.category || 'Rice',
        recommended: food.recommended || '',
        addons: formattedAddons,
      };

      const restoredItem = await request('/foods', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const newItem = restoredItem?.food || restoredItem || food;

      setFoods((prev) => [...prev, newItem]);
      setDeletedFoods((prev) => prev.filter((f) => f._id !== food._id));

      setMessage("Menu item restored successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.message || 'Unable to restore item.');
    }
  };

  const handlePermanentDelete = (id) => {
    setDeletedFoods((prev) => prev.filter((f) => f._id !== id));
    setMessage("Menu item permanently removed from trash.");
    setTimeout(() => setMessage(""), 3000);
  };

  const displayedFoods = activeTab === 'active' ? foods : deletedFoods;

  const filteredFoods = displayedFoods.filter((food) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      food.name?.toLowerCase().includes(query) ||
      food.category?.toLowerCase().includes(query) ||
      (food.recommended || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="admin-foods-page">
      {message && (
        <div className="admin-toast">
          <div className="admin-toast-icon">✓</div>
          <div>
            <div className="admin-toast-title">Success</div>
            <div className="admin-toast-text">{message}</div>
          </div>
        </div>
      )}

      <header className="admin-header">
        <div>
          <h1 className="admin-title">Manage Menu</h1>
          <p className="admin-subtitle">Add, edit and remove restaurant meals</p>
        </div>
        <Link to="/" className="admin-btn"> Back Home</Link>
      </header>

      <section className="admin-foods-container">
        <form ref={formRef} className="admin-form" onSubmit={handleSubmit}>
          <div>
            <p className="admin-subtitle">{editingId ? 'Edit item' : 'Add item'}</p>
            <h3>{editingId ? 'Update menu item' : 'Create a new menu item'}</h3>
          </div>

          <div className="admin-grid">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              required
            />
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Price (₦)"
              type="number"
              required
            />

            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              className="admin-select"
            >
              <option value="" disabled>Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <input
              value={form.recommended}
              onChange={(e) => setForm({ ...form, recommended: e.target.value })}
              placeholder="Recommended description"
            />
          </div>

          <div className="admin-addons-section" style={{ marginTop: '15px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              Select Available Add-ons:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {Object.entries(addonPrices).map(([name, price]) => (
                <label key={name} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={(form.addons || []).includes(name)}
                    onChange={() => handleAddonToggle(name)}
                  />
                  {name} (+₦{price})
                </label>
              ))}
            </div>
          </div>

          <div className="admin-actions" style={{ marginTop: '15px' }}>
            <button type="submit" className="admin-btn">
              {editingId ? 'Save Changes' : 'Add Item'}
            </button>
            {editingId ? (
              <button
                type="button"
                className="admin-btn"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div style={{ display: 'flex', gap: '10px', marginTop: '25px', marginBottom: '15px' }}>
          <button
            type="button"
            className="admin-btn"
            style={{
              backgroundColor: activeTab === 'active' ? '#1f2937' : '#e5e7eb',
              color: activeTab === 'active' ? '#fff' : '#374151'
            }}
            onClick={() => setActiveTab('active')}
          >
            Active Menu ({foods.length})
          </button>
          <button
            type="button"
            className="admin-btn"
            style={{
              backgroundColor: activeTab === 'trash' ? '#1f2937' : '#e5e7eb',
              color: activeTab === 'trash' ? '#fff' : '#374151'
            }}
            onClick={() => setActiveTab('trash')}
          >
            🗑️ Trash / Deleted ({deletedFoods.length})
          </button>
        </div>

        <div className="admin-search-container" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder={`🔍 Search ${activeTab === 'active' ? 'active' : 'deleted'} menu...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '15px'
            }}
          />
        </div>

        <div className="food-list">
          {filteredFoods.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>
              {activeTab === 'active' ? 'No active meals found.' : 'Trash is empty.'}
            </p>
          ) : (
            filteredFoods.map((food) => {
              const formattedAddonList = (food.addons || [])
                .map(getAddonName)
                .filter(Boolean);

              return (
                <article key={food._id} className="food-item-card">
                  <div>
                    <h3>{food.name}</h3>
                    <p>Category: <strong>{food.category}</strong></p>
                    {formattedAddonList.length > 0 && (
                      <p style={{ fontSize: '13px', color: '#666' }}>
                        Add-ons: {formattedAddonList.join(', ')}
                      </p>
                    )}
                  </div>
                  <div>
                    <p>Price: ₦{Number(food.price || 0).toLocaleString()}</p>
                    <div className="food-buttons">
                      {activeTab === 'active' ? (
                        <>
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={() => handleEdit(food)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn-danger"
                            onClick={() => handleDelete(food)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={() => handleRestore(food)}
                          >
                            Restore 🔄
                          </button>
                          <button
                            type="button"
                            className="admin-btn-danger"
                            onClick={() => handlePermanentDelete(food._id)}
                          >
                            Delete Permanently ❌
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminFoodsPage;