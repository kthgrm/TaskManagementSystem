// User and Profile Types
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
  last_login?: string;
}

// Auth Types
export interface LoginCredentials {
  username_or_email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string; // Optional for session-based auth
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface UpdateProfileData {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_picture?: File | null;
}
