import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import SignUp from './Register'; 
import Home from './Home';
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
        <Route path="/profile" element={< UserProfile/>} />
      </Routes>
    </div>
  );
}

export default App;
