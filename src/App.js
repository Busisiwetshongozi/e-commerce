import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';  // Use AuthContext here
import { CartProvider } from './CartContext';

import Navbar from './Navbar';
import Login from './Login';
import SignUp from './Register';
import Home from './Home';
import GetOrder from './GetOrder';
import ProductForm from './ProductForm';
import Products from './Products';  
import UserProfile from './UserProfile';
import ReviewForm from './Review';
import ProductReviews from './ProductReviews';
import ProductDetails from './ProductDetails';
import Cart from './Cart';
import PayButton from './Payment';
import ForgotPassword from './ForgotPassword';
import AdminDashboard from './AdminDashboard';

function AdminRoute({ children }) {
  const { backendUser, loading } = useAuth();

  if (loading) return null; // or spinner while loading user data

  if (!backendUser || backendUser.role !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/reviews/:productId" element={<ProductReviews />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
        
          <Route path="/profile" element={<UserProfile />} />

          <Route
            path="/product"
            element={
              <AdminRoute>
                <ProductForm />
              </AdminRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/products"
            element={
              <AdminRoute>
                <Products />
              </AdminRoute>
            }
          />

          <Route path="/getOrder" element={<GetOrder />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/review/:productId" element={<ReviewForm />} />
          <Route path="/pay" element={<PayButton />} />
          <Route path="/password" element={<ForgotPassword />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
