import { BaseType, RoleType, WorkspaceType } from "@/lib/types";
import { allows, getRole } from "@/lib/utils";
import { create } from "zustand";

export type State = {
  user: {
    id: string;
    avatar: string;
    name: string;
    email: string;
  } | null;
  workspaces: WorkspaceType[];
  bases: BaseType[];
  detailModalOpen: boolean;
  detailModalInfo: {
    baseId: string;
    tableName: string;
    recordId: string;
  } | null;
}

export type Actions = {
  updateUser: (user: {
    id?: string;
    name?: string;
    email?: string;
  }) => void;
  allows(
    id: string | RoleType,
    type: 'workspace' | 'base' | 'role',
    ability: string | string[],
    all?: boolean,
  ): boolean;
  denies(
    id: string | RoleType,
    type: 'workspace' | 'base' | 'role',
    ability: string | string[],
    all?: boolean,
  ): boolean;
  setDetailModalOpen: (value: boolean) => void;
  openDetailModal: (info: {
    baseId: string;
    tableName: string;
    recordId: string;
  }) => void;
}

export const useGlobalStore = create<State & Actions>((set, get) => {
  return {
    user: null,
    workspaces: [],
    bases: [],
    detailModalOpen: false,
    detailModalInfo: null,
    updateUser: (user) => set((store) => ({
      user: {
        ...(store?.user || {
          id: '',
          avatar: '',
          name: '',
          email: '',
        }),
        ...user,
      }
    })),
    allows: (id, type, ability, all = true) => {
      function getItemRole() {
        if (type === 'role') {
          return getRole(id as RoleType);
        }

        const data = type === 'workspace' ? get().workspaces : get().bases;
        return data.find((d) => d.id === id)?.role;
      }
      
      const role = getItemRole();
      return !!role && allows(role?.role, ability);
    },
    denies: (id, type, ability) => !get().allows(id, type, ability),
    setDetailModalOpen: (value) => set((store) => ({
      detailModalOpen: value,
      detailModalInfo: value ? store?.detailModalInfo : null,
    })),
    openDetailModal: (info) => set((store) => ({
      detailModalOpen: true,
      detailModalInfo: info
    })),
  };
});