import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/api/auth.service';
import type { User, LoginCredentials, RegisterData } from '@/types/auth.types';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    logoutWithConfirmation: (callback: () => void) => void;
    updateUser: (user: User) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated by fetching profile
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
            // Try to fetch current user from session
            fetchCurrentUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const userData = await authService.getProfile();
            setUser(userData);
            setToken('session'); // Placeholder to indicate authenticated
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Failed to fetch user:', error);
            // Clear invalid session
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authService.login(credentials);
            setToken('session'); // Session-based, no actual token
            setUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
            toast.success('Login successful!');
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await authService.register(data);
            toast.success(response.message || 'Registration successful!');
        } catch (error: any) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = async () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('user');

        try {
            await authService.logout();
            toast.success('Logged out successfully');
        } catch (error) {
            console.log(error);
        }
    };

    const logoutWithConfirmation = (callback: () => void) => {
        // This will be used by components to trigger the confirmation dialog
        callback();
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value: AuthContextType = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        logoutWithConfirmation,
        updateUser,
        isAuthenticated: !!token && !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
