import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import SignUp from './Register'; 
import Home from './Home';
import GetOrder from './GetOrder';
import ProductForm from './ProductForm';
import PlaceOrder from './PlaceOrder';
import UserProfile from './UserProfile';/// Assuming Register is your signup component
// optional, only if you have a homepage

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<SignUp/>} /> {/* Optional */}
        <Route path="/home" element={<Home />} />
        <Route path="/order" element={<PlaceOrder />} />
        <Route path="/profile" element={< UserProfile/>} />
        <Route path="/product" element={< ProductForm/>} />
        <Route path="/getOrder" element={< GetOrder/>} />
      </Routes>
    </div>
  );
}

export default App;
