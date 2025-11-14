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
    updateUser: (user: User) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token and user on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            // Optionally fetch fresh user data
            fetchCurrentUser(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchCurrentUser = async (authToken: string) => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Failed to fetch user:', error);
            // Clear invalid token
            localStorage.removeItem('token');
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
            setToken(response.token);
            setUser(response.user);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            toast.success(response.message || 'Login successful!');
        } catch (error: any) {
            const errorMessage = error.response?.data?.non_field_errors?.[0] ||
                error.response?.data?.detail ||
                'Login failed. Please try again.';
            toast.error(errorMessage);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await authService.register(data);
            setToken(response.token);
            setUser(response.user);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            toast.success(response.message || 'Registration successful!');
        } catch (error: any) {
            const errors = error.response?.data;
            if (errors) {
                Object.entries(errors).forEach(([field, messages]: [string, any]) => {
                    const message = Array.isArray(messages) ? messages[0] : messages;
                    toast.error(`${field}: ${message}`);
                });
            } else {
                toast.error('Registration failed. Please try again.');
            }
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.success('Logged out successfully');
        } catch (error) {
            // Still logout locally even if API call fails
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.error('Logout failed, but you have been logged out locally');
        }
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
