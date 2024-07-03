
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Create the authentication context
const AuthContext = createContext(null);

// Custom hook for accessing the authentication context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeOrganisation, setActiveOrganisation] = useState('')

  // Check user's login status on component mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/logged-in`, {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
        //   }
            credentials: 'include'
        });
        const data = await response.json();

        if (data.user) {
            // Set user details if logged in
            setIsLoggedIn(true)
            setUser(data.user);
        } else {
            setIsLoggedIn(false)
            setUser(null);
        }
        if (data.activeOrganisation) {
          setActiveOrganisation(data.activeOrganisation)
        } else {
          setActiveOrganisation('')
        }
      } catch (error) {
        console.error("Failed to check login status:", error);
      }
    };

    checkLoggedIn();
  }, []);

  // Create the context value
  const value = { isLoggedIn, setIsLoggedIn, user, setUser, activeOrganisation, setActiveOrganisation };
  console.log(isLoggedIn)
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
