import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const token = localStorage.getItem('intellica_token');
    if (savedUser && token) {
      const userData = JSON.parse(savedUser);
      // Fix for Ali Jawar -> Ali Jawad
      if (userData.email === 'ali.jawad@example.com' && userData.name === 'Ali Jawar') {
        userData.name = 'Ali Jawad';
        userData.full_name = 'Ali Jawad';
        localStorage.setItem('intellica_user', JSON.stringify(userData));
      }
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
          role: role
        })
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.full_name,
          full_name: data.user.full_name,
          role: data.user.role.toLowerCase(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.full_name}`
        };

        setUser(userData);
        localStorage.setItem('intellica_user', JSON.stringify(userData));
        localStorage.setItem('intellica_token', data.access_token);
        return { success: true, user: userData };
      } else {
        return { success: false, message: data.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const signup = async (email, name, password, role) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          full_name: name,
          password: password,
          role: role.toUpperCase()
        })
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.full_name,
          full_name: data.user.full_name,
          role: data.user.role.toLowerCase(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.full_name}`
        };

        setUser(userData);
        localStorage.setItem('intellica_user', JSON.stringify(userData));
        localStorage.setItem('intellica_token', data.access_token);
        return { success: true, user: userData };
      } else {
        return { success: false, message: data.detail || 'Registration failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('intellica_user');
    localStorage.removeItem('intellica_token');
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
