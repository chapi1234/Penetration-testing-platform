
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import api from '@/api/apiService'; // Adjust the import path as necessary

interface User {
  id: string;
  email: string;
  name: string;
  role : string;
  phone?: string;
  address?: string;
  image?: string;  
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  // setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('securityUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user data');
        localStorage.removeItem('securityUser');
      }
    }
    setLoading(false);
  }, []);
  
// const login = async (email: string, password: string) => {
//     try {
//       setLoading(true);

//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Login failed');
//       }

//       const data = await response.json();
//       // Adjusted to match backend response structure
//       const user = data.data?.user;
//       if (!user) {
//         throw new Error("No user data in response");
//       }
//       localStorage.setItem('securityUser', JSON.stringify(user));
//       setUser(user);

//       toast({
//         title: "Login successful!",
//         description: `Welcome back, ${user.name}!`,
//       });
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Login failed';
//       toast({
//         title: "Login failed",
//         description: errorMessage,
//         variant: "destructive",
//       });
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const register = async (name: string, email: string, password: string) => {
//     try {
//       setLoading(true);
  
//       const response = await fetch('http://localhost:5000/api/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ name, email, password }),
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Registration failed');
//       }
  
//       const data = await response.json();
//       const user = data.data?.user;
//       if (!user) {
//         throw new Error("No user data in response");
//       }
//       localStorage.setItem('securityUser', JSON.stringify(user));
//       setUser(user);
  
//       toast({
//         title: "Registration successful!",
//         description: "Your account has been created.",
//       });
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Registration failed';
//       toast({
//         title: "Registration failed",
//         description: errorMessage,
//         variant: "destructive",
//       });
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };
  
//     // Add this function inside your AuthProvider component
  
//   const adminLogin = async (email: string, password: string) => {
//     try {
//       setLoading(true);
  
//       const response = await fetch('http://localhost:5000/api/auth/admin-login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Admin login failed');
//       }
  
//       const data = await response.json();
//       const user = data.data?.user;
//       if (!user) {
//         throw new Error("No admin user data in response");
//       }
//       localStorage.setItem('securityUser', JSON.stringify(user));
//       setUser(user);
  
//       toast({
//         title: "Admin login successful!",
//         description: `Welcome back, ${user.name}!`,
//       });
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Admin login failed';
//       toast({
//         title: "Admin login failed",
//         description: errorMessage,
//         variant: "destructive",
//       });
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };
  // ...existing code...

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const response = await api.post('/auth/login', { email, password }); // Use apiService
      const { user, token } = response.data.data;
      if (!user || !token) {
        throw new Error("No user or token in response");
      }
      // localStorage.setItem('securityUser', JSON.stringify({ ...user, token }));
      // setUser({ ...user, token });

      const mappedUser = { ...user, id: user._id, token }; // Map _id to id
      localStorage.setItem('securityUser', JSON.stringify(mappedUser));
      setUser(mappedUser);

      toast({
        title: "Login successful!",
        description: `Welcome back, ${user.name}!`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);

      const response = await api.post('/auth/register', { name, email, password }); // Use apiService
      const { user, token } = response.data.data;
      if (!user || !token) {
        throw new Error("No user or token in response");
      }
      // localStorage.setItem('securityUser', JSON.stringify({ ...user, token }));
      // setUser({ ...user, token });

      const mappedUser = { ...user, id: user._id, token }; // Map _id to id
      localStorage.setItem('securityUser', JSON.stringify(mappedUser));
      setUser(mappedUser);

      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      setLoading(true);

      const response = await api.post('/auth/admin-login', { email, password }); // Use apiService
      const { user, token } = response.data.data;
      if (!user || !token) {
        throw new Error("No admin user or token in response");
      }
      localStorage.setItem('securityUser', JSON.stringify({ ...user, token }));
      setUser({ ...user, token });

      toast({
        title: "Admin login successful!",
        description: `Welcome back, ${user.name}!`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Admin login failed';
      toast({
        title: "Admin login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    localStorage.removeItem('securityUser');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        adminLogin,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin', // Assuming the user object has a role property
        // setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
