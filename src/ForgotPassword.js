import { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSending(true);

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setMessage('📧 A password reset email has been sent.');
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/user-not-found':
          setError('No user found with this email');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Reset Password</h2>

              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleReset}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Enter your email</label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    required
                    disabled={isSending}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isSending}
                >
                  {isSending ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-3 text-center">
                <Link to="/login">Back to Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
