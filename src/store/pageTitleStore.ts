import { create } from "zustand";

interface TitleState {
  title: string | null;
  setTitle: (title: string) => void;
}

export const usePageTitleStore = create<TitleState>((set) => ({
  title: null,
  setTitle: (title) => set({ title }),
}));