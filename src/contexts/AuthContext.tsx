import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService } from '../services/storageService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const [storedUser, authToken] = await Promise.all([
        storageService.getUser(),
        storageService.getAuthToken()
      ]);
      
      if (storedUser && authToken) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
      
      // Check onboarding status
      const onboardingStatus = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(onboardingStatus === 'true');
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // Simulated login logic - in real app, this would be an API call
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@bookbite.com',
          name: 'Admin User',
          role: 'admin',
          createdAt: new Date(),
        },
        {
          id: '2',
          email: 'hotel@bookbite.com',
          name: 'Hotel Owner',
          role: 'hotel_owner',
          createdAt: new Date(),
        },
        {
          id: '3',
          email: 'restaurant@bookbite.com',
          name: 'Restaurant Owner',
          role: 'restaurant_owner',
          createdAt: new Date(),
        },
        {
          id: '4',
          email: 'user@bookbite.com',
          name: 'Regular User',
          role: 'user',
          createdAt: new Date(),
        },
      ];

      const foundUser = mockUsers.find(u => u.email === email);
      
      if (foundUser && password === 'password123') {
        const authToken = `token_${foundUser.id}_${Date.now()}`;
        await Promise.all([
          storageService.saveUser(foundUser),
          storageService.saveAuthToken(authToken)
        ]);
        setUser(foundUser);
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email!,
        name: userData.name!,
        role: userData.role || 'user',
        phone: userData.phone,
        createdAt: new Date(),
      };

      const authToken = `token_${newUser.id}_${Date.now()}`;
      await Promise.all([
        storageService.saveUser(newUser),
        storageService.saveAuthToken(authToken)
      ]);
      setUser(newUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await Promise.all([
        storageService.removeItem('USER_DATA'),
        storageService.removeItem('AUTH_TOKEN')
      ]);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        await storageService.saveUser(updatedUser);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const completeOnboarding = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      console.error('Complete onboarding error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    hasSeenOnboarding,
    login,
    register,
    logout,
    updateUser,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};