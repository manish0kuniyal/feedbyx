// app/utils/userstore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => {
        console.log('[SET USER]', user);
        set({ user });
      },
      clearUser: () => {
        console.log('[CLEAR USER]');
        set({ user: null });
      },
    }),
    {
      name: 'user-store', // localStorage key
      partialize: (state) => ({ user: state.user }), // what to persist
    }
  )
);
