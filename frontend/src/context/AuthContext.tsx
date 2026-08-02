import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  name?: string | null;
  role: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  googleLogin: (googleToken: string) => Promise<void>;
  googleRedirectLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set base API URL dynamically from VITE_API_URL environment variable
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api/v1';
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

axios.defaults.baseURL = getApiBaseUrl();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted token and user on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlRefreshToken = params.get('refresh_token');
    const urlUser = params.get('user');

    if (urlToken && urlRefreshToken && urlUser) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(urlUser));
        setToken(urlToken);
        setUser(parsedUser);
        localStorage.setItem('token', urlToken);
        localStorage.setItem('refresh_token', urlRefreshToken);
        localStorage.setItem('user', JSON.stringify(parsedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${urlToken}`;
        
        // Clean URL to remove tokens from browser history & address bar
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } catch (e) {
        console.error("Error parsing user from URL parameters:", e);
      }
    } else {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    }
    setIsLoading(false);
  }, []);

  // Interceptor to handle 401 errors by attempting token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const storedRefreshToken = localStorage.getItem('refresh_token');
          if (storedRefreshToken) {
            try {
              // Call API route on /api prefix to support root refresh
              const response = await axios.post('/auth/refresh', { refresh_token: storedRefreshToken });
              const { access_token, refresh_token: new_refresh_token, user: loggedUser } = response.data;
              
              setToken(access_token);
              setUser(loggedUser);
              localStorage.setItem('token', access_token);
              localStorage.setItem('refresh_token', new_refresh_token);
              localStorage.setItem('user', JSON.stringify(loggedUser));
              axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
              originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
              
              return axios(originalRequest);
            } catch (refreshError) {
              logout();
              return Promise.reject(refreshError);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await axios.post('/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, refresh_token, user: loggedUser } = response.data;

      setToken(access_token);
      setUser(loggedUser);
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } catch (error) {
      logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      await axios.post('/auth/register', {
        email,
        username,
        password,
        full_name: fullName,
        name: fullName,
        role: 'farmer',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (googleToken: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/auth/google', { token: googleToken });
      const { access_token, refresh_token, user: loggedUser } = response.data;
      
      setToken(access_token);
      setUser(loggedUser);
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } catch (error) {
      logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleRedirectLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/auth/google/login');
      const targetUrl = response.data?.url || (typeof response.data === 'string' && response.data.startsWith('http') ? response.data : null);
      if (targetUrl) {
        window.location.href = targetUrl;
      } else {
        const baseUrl = getApiBaseUrl();
        window.location.href = `${baseUrl}/auth/google/login`;
      }
    } catch (error) {
      console.warn("AJAX Google redirect notice, falling back to direct location:", error);
      const baseUrl = getApiBaseUrl();
      window.location.href = `${baseUrl}/auth/google/login`;
    }
  };

  const logout = async () => {
    const storedRefreshToken = localStorage.getItem('refresh_token');
    if (storedRefreshToken) {
      try {
        await axios.post('/auth/logout', { refresh_token: storedRefreshToken });
      } catch (e) {
        // Ignore errors during logout request
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        googleLogin,
        googleRedirectLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
