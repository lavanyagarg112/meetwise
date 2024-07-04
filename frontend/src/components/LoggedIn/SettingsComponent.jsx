import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth-context';
import styles from './SettingsComponent.module.css';

const SettingsComponent = ({ user }) => {
  const { setIsLoggedIn, setUser, setActiveOrganisation } = useAuth();
  const navigate = useNavigate();

  const handleOrganisations = () => {
    navigate('/organisations');
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/logout`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      if (response.ok) {
        setIsLoggedIn(false);
        setUser(null); // Clear user state
        setActiveOrganisation(null);
        navigate('/'); // Redirect to home
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
    


  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.title}>Settings</h1>
      <div className={styles.userInfo}>
        <div className={styles.userInfoItem}>
          <span className={styles.label}>Username:</span>
          <span className={styles.value}>{user.username}</span>
        </div>
        <div className={styles.userInfoItem}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>{user.email}</span>
        </div>
        <div className={styles.userInfoItem}>
          <span className={styles.label}>Display Name:</span>
          <span className={styles.value}>{user.firstName} {user.lastName}</span>
        </div>
      </div>
      <div className={styles.buttons}>
        <button className={styles.button} onClick={handleOrganisations}>My Organisations</button>
        <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default SettingsComponent;
