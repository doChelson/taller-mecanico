import { createContext, useContext, useState } from 'react';
import { signIn } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const data = await signIn(email, password);
    if (!data.success) throw new Error(data.message || 'Credenciales inválidas');
    setUser(data);
    return data;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: user?.success === true }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
