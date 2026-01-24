import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee, Permission } from '../types';

interface AuthState {
  token: string | null;
  user: Employee | null;
  isAuthenticated: boolean;
  permissions: Permission[];
  
  // Actions
  login: (token: string, user: Employee) => void;
  logout: () => void;
  updateUser: (user: Employee) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      permissions: [],
      
      login: (token: string, user: Employee) => {
        const permissions = user?.role?.permissions?.split(',') as Permission[] || [];
        set({
          token,
          user,
          isAuthenticated: true,
          permissions,
        });
      },
      
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          permissions: [],
        });
      },
      
      updateUser: (user: Employee) => {
        const permissions = user.role?.permissions?.split(',') as Permission[] || [];
        set({ user, permissions });
      },
      
      hasPermission: (permission: Permission) => {
        return get().permissions.includes(permission);
      },
      
      hasAnyPermission: (permissions: Permission[]) => {
        const userPermissions = get().permissions;
        return permissions.some(p => userPermissions.includes(p));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
      }),
    }
  )
);
