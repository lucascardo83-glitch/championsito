import { create } from 'zustand';
import { setAuthTokenGetter } from '@workspace/api-client-react';

interface AuthState {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// Initialize from localStorage
const initialToken = localStorage.getItem('championsito_admin_token');
if (initialToken) {
  setAuthTokenGetter(() => initialToken);
}

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  login: (token) => {
    localStorage.setItem('championsito_admin_token', token);
    setAuthTokenGetter(() => token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('championsito_admin_token');
    setAuthTokenGetter(null);
    set({ token: null });
  },
}));
