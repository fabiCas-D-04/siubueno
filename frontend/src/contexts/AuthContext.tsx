import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '../services';
import type { User, Student } from '../types';

interface AuthContextType {
  user: User | null;
  student: Student | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ student?: Student }>;
  logout: () => Promise<void>;
  updateStudent: (student: Student) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setStudent(null);
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    let active = true;
    (async () => {
      try {
        const data = await authService.getMe();
        if (!active) return;
        const savedUser = localStorage.getItem('user');
        const savedStudent = localStorage.getItem('student');
        setUser(data.user || (savedUser ? JSON.parse(savedUser) : null));
        if (data.student) {
          setStudent(data.student);
          localStorage.setItem('student', JSON.stringify(data.student));
        } else if (savedStudent) {
          setStudent(JSON.parse(savedStudent));
        }
      } catch {
        if (!active) return;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('student');
        setUser(null);
        setStudent(null);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = async (username: string, password: string) => {
    const data = await authService.login(username, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    if (data.student) {
      localStorage.setItem('student', JSON.stringify(data.student));
    }
    setUser(data.user);
    setStudent(data.student || null);
    return { student: data.student };
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student');
    setUser(null);
    setStudent(null);
  };

  const updateStudent = (newStudent: Student) => {
    setStudent(newStudent);
    localStorage.setItem('student', JSON.stringify(newStudent));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}