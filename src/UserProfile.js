import { useAuth } from './auth/AuthContext';

function UserProfile() {
  const { currentUser } = useAuth();

  return (
    <div>
      {currentUser ? (
        <div>
          <h2>Welcome, {currentUser.displayName || 'User'}</h2>
          <p>Email: {currentUser.email}</p>
          <p>User ID: {currentUser.uid}</p>
          <p>Email Verified: {currentUser.emailVerified ? 'Yes' : 'No'}</p>
          {currentUser.photoURL && (
            <img 
              src={currentUser.photoURL} 
              alt="Profile" 
              style={{ width: 100, borderRadius: '50%' }}
            />
          )}
        </div>
      ) : (
        <p>Please log in to view your profile</p>
      )}
    </div>
  );
}
export default UserProfile;