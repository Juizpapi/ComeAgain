import { Navigate, Outlet } from 'react-router-dom';

function getStoredUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawUser = localStorage.getItem('comeagain_user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function ProtectedRoute() {
  const user = getStoredUser();
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
