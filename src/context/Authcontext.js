import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Validate token on initial load
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('cineToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/validate', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.valid) {
          setUser(data.user);
        } else {
          localStorage.removeItem('cineToken');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('cineToken');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('cineToken', data.token);
        setUser(data.user);
        toast.success('Login successful!');
        navigate('/browse');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('cineToken');
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


