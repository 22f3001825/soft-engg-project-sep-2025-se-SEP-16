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
    // Try to find the current tab's role-specific session based on URL
    const currentPath = window.location.pathname;
    let targetRole = null;
    
    if (currentPath.startsWith('/customer')) targetRole = 'customer';
    else if (currentPath.startsWith('/agent')) targetRole = 'agent';
    else if (currentPath.startsWith('/supervisor')) targetRole = 'supervisor';
    else if (currentPath.startsWith('/vendor')) targetRole = 'vendor';
    
    let foundUser = null;
    
    if (targetRole) {
      // Check for specific role session first
      const savedUser = localStorage.getItem(`intellica_user_${targetRole}`);
      const token = localStorage.getItem(`intellica_token_${targetRole}`);
      if (savedUser && token) {
        foundUser = JSON.parse(savedUser);
      }
    } else {
      // Fallback: find any valid session for non-role-specific pages
      const roles = ['customer', 'agent', 'supervisor', 'vendor'];
      for (const role of roles) {
        const savedUser = localStorage.getItem(`intellica_user_${role}`);
        const token = localStorage.getItem(`intellica_token_${role}`);
        if (savedUser && token) {
          foundUser = JSON.parse(savedUser);
          break;
        }
      }
    }
    
    if (foundUser) {
      setUser(foundUser);
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
        // Fetch vendor profile for business name if vendor
        let companyName = null;
        if (data.user.role.toLowerCase() === 'vendor') {
          try {
            const profileResponse = await fetch('http://127.0.0.1:8000/api/vendor/profile', {
              headers: {
                'Authorization': `Bearer ${data.access_token}`
              }
            });
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              companyName = profileData.vendor?.company_name;
            }
          } catch (error) {
            console.error('Failed to fetch vendor profile:', error);
          }
        }

        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.full_name,
          full_name: data.user.full_name,
          role: data.user.role.toLowerCase(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.full_name}`,
          company_name: companyName
        };

        setUser(userData);
        localStorage.setItem(`intellica_user_${userData.role}`, JSON.stringify(userData));
        localStorage.setItem(`intellica_token_${userData.role}`, data.access_token);
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
        localStorage.setItem(`intellica_user_${userData.role}`, JSON.stringify(userData));
        localStorage.setItem(`intellica_token_${userData.role}`, data.access_token);
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
    if (user) {
      localStorage.removeItem(`intellica_user_${user.role}`);
      localStorage.removeItem(`intellica_token_${user.role}`);
    }
    setUser(null);
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
