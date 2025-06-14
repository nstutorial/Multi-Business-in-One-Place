import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
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

// Demo users for testing
const DEMO_USERS: User[] = [
  {
    id: '1',
    email: 'admin@cashbook.com',
    name: 'System Admin',
    role: 'admin',
    assignedBusinesses: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'manager@business1.com',
    name: 'Business Manager',
    role: 'business_manager',
    assignedBusinesses: ['business-1'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'staff@business1.com',
    name: 'Staff Member',
    role: 'staff',
    assignedBusinesses: ['business-1'],
    createdAt: new Date().toISOString(),
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('cashbook_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any password
    const foundUser = DEMO_USERS.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('cashbook_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cashbook_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}