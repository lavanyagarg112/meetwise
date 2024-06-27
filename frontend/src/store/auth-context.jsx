
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

  // Check user's login status on component mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/logged_in`, {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
        //   }
            credentials: 'include'
        });
        const data = await response.json();
        setIsLoggedIn(data.logged_in);
        if (data.logged_in) {
            // Set user details if logged in
            setUser(data.user);
        } else {
            setUser(null);
        }
      } catch (error) {
        console.error("Failed to check login status:", error);
      }
    };

    checkLoggedIn();
  }, []);

  // Create the context value
  const value = { isLoggedIn, setIsLoggedIn, user, setUser };
  console.log(isLoggedIn)
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
