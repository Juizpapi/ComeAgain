import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import OrderPage from './pages/OrderPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminFoodsPage from './pages/AdminFoodsPage';
import FavoritesPage from "./pages/FavoritesPage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
  path="/forgot-password"
  element={<ForgotPasswordPage />}
/>

<Route
  path="/reset-password/:token"
  element={<ResetPasswordPage />}
/>
          <Route path="/order" element={<OrderPage />} />
          <Route
  path="/favorites"
  element={<FavoritesPage />}
/>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-history" element={<OrderHistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/foods" element={<AdminFoodsPage />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
