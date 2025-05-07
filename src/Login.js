import { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { sendTokenToBackend } from './auth/SendTokenToBackend';
import { getAuth, onIdTokenChanged } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  const successMessage = location.state?.successMessage;

  // Token monitoring effect
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const { exp } = JSON.parse(atob(token.split('.')[1]));
          console.debug(`Token expires at: ${new Date(exp * 1000)}`);
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 1. Authenticate with Firebase using the email and password entered by the user
      await login(email, password);

      // 2. Get a fresh token
      const token = await auth.currentUser.getIdToken(true);
      console.debug('Obtained fresh ID token');

      // 3. Verify token with backend
      const backendResponse = await sendTokenToBackend(
        "api/protected/user-info",
        { email }
      );

      // 4. Update auth context and navigate to home page
      navigate(location.state?.from || '/home', {
        state: {
          message: 'Login successful!',
          user: backendResponse.userData || backendResponse
        },
        replace: true
      });

    } catch (err) {
      console.error('Login error:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      });

      let errorMessage = 'Login failed. Please try again.';

      switch (err.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Account temporarily locked. Try again later or reset password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>

              {successMessage && (
                <div className="alert alert-success">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    placeholder="name@example.com"
                    required
                    autoFocus
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Authenticating...
                    </>
                  ) : 'Login'}
                </button>
              </form>

              <div className="mt-3 text-center">
                <p className="mb-2">
                  Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}