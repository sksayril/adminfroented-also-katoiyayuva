import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, getUserData, removeToken, removeUserData, LoginResponse } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: LoginResponse['user'] | null;
  branch: LoginResponse['branch'] | null;
  role: string | null;
  branchId: string | null;
  login: (data: LoginResponse) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [branch, setBranch] = useState<LoginResponse['branch'] | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = getToken();
    const userData = getUserData();

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData.user);
      setBranch(userData.branch);
      setRole(userData.role);
      setBranchId(userData.branchId);
    }
    setLoading(false);
  }, []);

  const login = (data: LoginResponse) => {
    setIsAuthenticated(true);
    setUser(data.user);
    setBranch(data.branch);
    setRole(data.role);
    setBranchId(data.branchId);
  };

  const logout = () => {
    removeToken();
    removeUserData();
    setIsAuthenticated(false);
    setUser(null);
    setBranch(null);
    setRole(null);
    setBranchId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        branch,
        role,
        branchId,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
