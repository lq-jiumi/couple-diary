import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithCustomToken, connectAuthEmulator } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authAPI, coupleAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBound, setIsBound] = useState(false);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      await signInWithCustomToken(auth, token);
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
      setPartner(response.data.partner);
      setIsBound(!!response.data.user.coupleId);
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { user: userData, token } = response.data;
    localStorage.setItem('token', token);

    await signInWithCustomToken(auth, token);

    const coupleResponse = await coupleAPI.getCoupleInfo();
    setUser(userData);
    setPartner(coupleResponse.data.partner);
    setIsBound(coupleResponse.data.isBound);

    return response.data;
  };

  const register = async (email, password, displayName) => {
    const response = await authAPI.register({ email, password, displayName });
    const { user: userData, token } = response.data;
    localStorage.setItem('token', token);

    await signInWithCustomToken(auth, token);

    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPartner(null);
    setIsBound(false);
  };

  const createInviteCode = async () => {
    const response = await coupleAPI.createInviteCode();
    return response.data;
  };

  const joinWithCode = async (code) => {
    const response = await coupleAPI.joinWithCode(code);
    await checkAuth();
    return response.data;
  };

  const unbindCouple = async () => {
    await coupleAPI.unbindCouple(true);
    setPartner(null);
    setIsBound(false);
    await checkAuth();
  };

  const refreshCoupleInfo = async () => {
    await checkAuth();
  };

  const value = {
    user,
    partner,
    loading,
    isBound,
    login,
    register,
    logout,
    createInviteCode,
    joinWithCode,
    unbindCouple,
    refreshCoupleInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
