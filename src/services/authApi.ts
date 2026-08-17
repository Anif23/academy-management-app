import { delay } from './crudFactory';
import type { AuthUser } from '../types';

export const DEMO_CREDENTIALS = {
  email: 'admin@acadmey.com',
  password: 'admin123',
};

const ADMIN_STORAGE_KEY = 'acadmey:admin-profile';

const DEFAULT_ADMIN_USER: AuthUser = {
  id: 'ADMIN-001',
  name: 'Mohamed Anif',
  email: DEMO_CREDENTIALS.email,
  role: 'Super Admin',
  department: 'Academy Operations',
  phone: '+91 98765 43210',
  status: 'Active',
  avatar: '',
};

function getStoredAdmin(): AuthUser {
  try {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);

    if (stored) {
      return JSON.parse(stored) as AuthUser;
    }
  } catch (error) {
    console.error('Failed to load admin profile:', error);
  }

  return DEFAULT_ADMIN_USER;
}

function saveAdmin(user: AuthUser): void {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save admin profile:', error);
  }
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthUser> {
    await delay(500);

    if (
      email.trim().toLowerCase() !== DEMO_CREDENTIALS.email ||
      password !== DEMO_CREDENTIALS.password
    ) {
      throw new Error(
        'Invalid email or password. Please use the demo credentials.',
      );
    }

    // Get the latest saved profile instead of the default profile.
    return getStoredAdmin();
  },

  async updateProfile(patch: Partial<AuthUser>): Promise<AuthUser> {
    await delay(300);

    const currentUser = getStoredAdmin();

    const updatedUser: AuthUser = {
      ...currentUser,
      ...patch,
    };

    saveAdmin(updatedUser);

    return updatedUser;
  },

  async logout(): Promise<void> {
    await delay(150);
  },
};