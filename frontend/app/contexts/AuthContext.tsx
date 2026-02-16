import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Try to verify the access token
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      })
      .then(res => {
        if (res.ok) return res.json();
        // Access token expired — try silent refresh
        return fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        }).then(refreshRes => {
          if (!refreshRes.ok) throw new Error('Refresh failed');
          return refreshRes.json();
        }).then(data => {
          if (data.token) {
            localStorage.setItem('token', data.token);
          }
          return data;
        });
      })
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      localStorage.removeItem('token');
      setUser(null);
    });
  };

  const value = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
