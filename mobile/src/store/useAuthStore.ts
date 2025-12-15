import { create } from 'zustand';

interface AuthState {
    token: string | null;
    user: any | null;
    isAuthenticated: boolean;
    login: (token: string, user: any) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isAuthenticated: false,
    login: (token, user) => set({ token, user, isAuthenticated: true }),
    logout: () => set({ token: null, user: null, isAuthenticated: false }),
}));
