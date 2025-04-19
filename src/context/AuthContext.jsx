import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

const fakeApiLogin = async (email, password) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (email && password) {
    return {
      success: true,
      token: 'fake-auth-token',
      user: { id: 1, email, name: email.split('@')[0] }
    };
  }
  return { success: false };
};

const fakeApiSignup = async (email, password) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (email && password) {
    return {
      success: true,
      token: 'fake-auth-token',
      user: { id: 1, email, name: email.split('@')[0] }
    };
  }
  return { success: false };
};

export const AuthProvider = ({ children }) => { 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email, password) => {
    const response = await fakeApiLogin(email, password);
    if (response.success) {
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', response.token);
    } else {
      throw new Error('Login failed');
    }
  };  

  const signup = async (email, password) => {
    try {
      const response = await fakeApiSignup(email, password);
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.token);
      } else {
        throw new Error('Signup failed');
      }
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};