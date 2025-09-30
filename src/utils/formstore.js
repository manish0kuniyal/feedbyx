// utils/formstore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFormStore = create(
  persist(
    (set) => ({
      form: null, // Entire form object
      setForm: (form) => {
        console.log('[Zustand] setForm:', form);
        set({ form });
      },
      clearForm: () => {
        console.log('[Zustand] clearForm');
        set({ form: null });
      },
    }),
    {
      name: 'form-store',
      partialize: (state) => ({ form: state.form }), // persist only the form
    }
  )
);
