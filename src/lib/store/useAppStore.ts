import { create } from "zustand";

export type Language = "zh" | "en";

interface Category {
  id: string;
  name_zh: string;
  name_en: string;
  slug: string;
  icon?: string | null;
}

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentCategory: string | null;
  setCurrentCategory: (id: string | null) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;

  // 新增：折叠状态
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  copilotCollapsed: boolean;
  setCopilotCollapsed: (collapsed: boolean) => void;

  // Auth
  user: { username: string } | null;
  setUser: (user: { username: string } | null) => void;

  // 联动聊天
  externalInput: string | null;
  setExternalInput: (text: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: "zh",
  setLanguage: (lang) => set({ language: lang }),
  currentCategory: null,
  setCurrentCategory: (id) => set({ currentCategory: id }),
  categories: [],
  setCategories: (categories) => set({ categories }),

  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  copilotCollapsed: false,
  setCopilotCollapsed: (collapsed) => set({ copilotCollapsed: collapsed }),

  user: null,
  setUser: (user) => set({ user }),

  externalInput: null,
  setExternalInput: (externalInput) => set({ externalInput }),
}));
