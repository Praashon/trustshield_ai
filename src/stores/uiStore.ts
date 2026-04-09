import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  theme: 'light' | 'dark';
  activeModal: string | null;
  sidebarOpen: boolean;
  openModal: (id: string) => void;
  closeModal: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      activeModal: null,
      sidebarOpen: false,
      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null }),
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
        }
      },
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: 'trustshield-ui',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
