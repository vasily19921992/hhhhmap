import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const getToken = () => {
  return localStorage.getItem('pb_auth');
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Restore session from localStorage on load
    const storedToken = localStorage.getItem('pb_auth');
    const storedModel = localStorage.getItem('pb_model');
    
    if (storedToken && storedModel) {
      try {
        pb.authStore.save(storedToken, JSON.parse(storedModel));
      } catch (e) {
        console.error('Failed to restore session', e);
      }
    }

    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
      setUserType(pb.authStore.model?.userType);
    } else {
      pb.authStore.clear();
      localStorage.removeItem('pb_auth');
      localStorage.removeItem('pb_model');
    }
    setLoading(false);

    // Subscribe to auth changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
      setUserType(model?.userType || null);
      
      if (token && model) {
        localStorage.setItem('pb_auth', token);
        localStorage.setItem('pb_model', JSON.stringify(model));
      } else {
        localStorage.removeItem('pb_auth');
        localStorage.removeItem('pb_model');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signup = async (email, password, selectedUserType) => {
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        userType: selectedUserType
      }, { $autoCancel: false });

      return await login(email, password);
    } catch (error) {
      console.error("Signup error:", error);
      throw new Error(error.message || 'Signup failed. Email might be already in use.');
    }
  };

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
      setCurrentUser(authData.record);
      setUserType(authData.record.userType);
      
      // Explicitly store token as requested
      localStorage.setItem('pb_auth', authData.token);
      localStorage.setItem('pb_model', JSON.stringify(authData.record));
      
      return authData;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error('Invalid email or password. Please try again.');
    }
  };

  const logout = () => {
    pb.authStore.clear();
    localStorage.removeItem('pb_auth');
    localStorage.removeItem('pb_model');
    setCurrentUser(null);
    setUserType(null);
    navigate('/');
  };

  const value = {
    currentUser,
    userType,
    loading,
    signup,
    login,
    logout,
    getToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};