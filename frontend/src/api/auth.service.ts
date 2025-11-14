import api from './axios';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  ChangePasswordData,
  UpdateProfileData,
} from '@/types/auth.types';

export const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register/', data);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login/', credentials);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/api/auth/logout/');
    return response.data;
  },

  // Get current user details
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/me/');
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<{ message: string; user: User }> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'profile_picture' && value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'string') {
          formData.append(key, value);
        }
      }
    });

    const response = await api.patch<{ message: string; user: User }>(
      '/api/auth/profile/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<{ message: string; token: string }> => {
    const response = await api.post<{ message: string; token: string }>(
      '/api/auth/change-password/',
      data
    );
    return response.data;
  },

  // Delete account
  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/api/auth/delete-account/');
    return response.data;
  },
};
