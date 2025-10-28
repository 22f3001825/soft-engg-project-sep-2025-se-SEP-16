import React, { createContext, useContext, useState, useEffect } from 'react';
import { users } from '../data/dummyData';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('intellica_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password, role) => {
    // Check credentials against dummy data
    const userKey = Object.keys(users).find(key => 
      users[key].email === email && 
      users[key].password === password &&
      users[key].role === role
    );

    if (userKey) {
      const userData = users[userKey];
      setUser(userData);
      localStorage.setItem('intellica_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    
    return { success: false, message: 'Invalid credentials' };
  };

  const signup = (email, name, password, role) => {
    // jab backend use karenge then this would create a new user,
    // abhi milestone3 ke liye we'll just use the dummy data
    const newUser = {
      email,
      name,
      password,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };
    
    setUser(newUser);
    localStorage.setItem('intellica_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('intellica_user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
