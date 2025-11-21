import api from './axios';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'admin' | 'user';
  profile_picture: string | null;
  date_joined: string;
  is_active: boolean;
  project_count?: number;
  task_count?: number;
  status?: 'active' | 'inactive';
  full_name?: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: 'admin' | 'user';
  is_active?: boolean;
  password?: string;
  password2?: string;
}

export const userService = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('users/');
    return response.data;
  },

  // Get single user
  getUser: async (id: number): Promise<User> => {
    const response = await api.get<User>(`users/${id}/`);
    return response.data;
  },

  // Create user (admin only)
  createUser: async (data: CreateUserData | FormData): Promise<{ message: string; user: User }> => {
    const response = await api.post<{ message: string; user: User }>('users/', data);
    return response.data;
  },

  // Update user (admin only)
  updateUser: async (id: number, data: UpdateUserData | FormData): Promise<{ message: string; user: User }> => {
    const response = await api.put<{ message: string; user: User }>(`users/${id}/`, data);
    return response.data;
  },

  // Partial update user (admin only)
  partialUpdateUser: async (id: number, data: Partial<UpdateUserData>): Promise<{ message: string; user: User }> => {
    const response = await api.patch<{ message: string; user: User }>(`users/${id}/`, data);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`users/${id}/`);
    return response.data;
  },

  // Toggle user status (admin only)
  toggleUserStatus: async (id: number): Promise<{ message: string; user: User }> => {
    const response = await api.post<{ message: string; user: User }>(`users/${id}/toggle_status/`);
    return response.data;
  },

  // Get available users (for adding to projects)
  getAvailableUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('users/available/');
    return response.data;
  },
};
