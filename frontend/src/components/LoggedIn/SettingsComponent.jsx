import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth-context';

const SettingsComponent = ({ user }) => {
  const { setIsLoggedIn, setUser } = useAuth();
  const navigate = useNavigate();

  const handleOrganisations = () => {
    navigate('/organisations');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null); // Clear user state
    navigate('/'); // Redirect to home
  };

  return (
    <div>
      <h1>Settings</h1>
      <div>
        <div>Username: {user.username}</div>
        <div>Email: {user.email}</div>
        <div>Display Name</div>
        <div>Bio</div>
      </div>
      <div>
        <div>Update profile</div>
      </div>
      <div>
        <div>Organisations created by me</div>
        <div>organisation 1</div>
        <div>organisation 2</div>
      </div>

      <button onClick={handleOrganisations}>See all my organisations</button>
      <button onClick={handleLogout}>Logout</button>
      {/* dummy logout. to actually logout need to send request to backend cause need to remove credentials */}
    </div>
  );
};

export default SettingsComponent;
