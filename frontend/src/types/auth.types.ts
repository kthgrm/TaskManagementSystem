// User and Profile Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: Profile;
  date_joined: string;
}

export interface Profile {
  role: 'admin' | 'user';
  bio: string | null;
  profile_picture: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
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
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
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
  bio?: string;
  phone_number?: string;
  profile_picture?: File | null;
}
