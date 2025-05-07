import { useState } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [name, setName] = useState('');

const [address, setAddress] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState(''); // Add phone field
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      // Pass all user details to the signup function
      await signup(email, password, {
        name, // Include the name
        phone,
        address // Include phone number
        // Add any other fields you need
      });
      navigate('/login'); // Redirect after successful sign-up
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mt-5">
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
        
        <div className="mb-3">
  <label htmlFor="phone" className="form-label">Phone Number</label>
  <input
    type="text"
    className="form-control"
    id="phone"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    placeholder="e.g. 123-456-7890"
    required
  />
</div>

<div className="mb-3">
  <label htmlFor="address" className="form-label">Address</label>
  <input
    type="text"
    className="form-control"
    id="address"
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    placeholder="123 Main St, City, Country"
    required
  />
</div>

        
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Sign Up</button>
      </form>
    </div>
  );
}