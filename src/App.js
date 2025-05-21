import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import SignUp from './Register';
import Home from './Home';
import GetOrder from './GetOrder';
import ProductForm from './ProductForm';
import Products from './Products';
import PlaceOrder from './PlaceOrder';
import { CartProvider } from './CartContext';
import UserProfile from './UserProfile';
import Navbar from './Navbar';
import ReviewForm from './Review';
import ProductReviews from './ProductReviews';
import ProductDetails from './ProductDetails';
import Cart from './Cart';  // Import the Cart component
import PayButton from './Payment';
import ForgotPassword from './ForgotPassword';


function App() {
  return (
    <div className="App">
      <CartProvider>
        <Navbar /> {/* 🛒 Add the Navbar here to display globally */}
        <Routes>
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/reviews/:productId" element={<ProductReviews />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<SignUp />} /> {/* Optional homepage */}
          <Route path="/home" element={<Home />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/product" element={<ProductForm />} />
          <Route path="/getOrder" element={<GetOrder />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} /> {/* Use Cart component here */}
          <Route path="/review/:productId" element={<ReviewForm />} />
          <Route path="/pay" element={<PayButton />} />
          <Route path="/password" element={<ForgotPassword />} />
        </Routes>
      </CartProvider>
    </div>
  );
}

export default App;
