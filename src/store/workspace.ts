import { create } from "zustand";
import { persist } from "zustand/middleware";

export type State = {
  orderBy: [string, 'desc' | 'asc'];
  viewFor: 'base' | 'workspace';
}

export type Actions = {
  setOrderBy: (value: [string, 'desc' | 'asc']) => void;
  setViewFor: (value: 'base' | 'workspace') => void;
}

export const useWorkspacesStore = create<State & Actions>()(persist(
  (set) => {
    return {
      orderBy: ['created_at', 'asc'],
      viewFor: 'workspace',

      setOrderBy: (value: [string, 'desc' | 'asc']) => set({ orderBy: value }),
      setViewFor: (value: 'base' | 'workspace') => set({ viewFor: value }),
    };
  },
  { name: "workspaces-store" },
));