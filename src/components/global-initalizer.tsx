'use client'

import { BaseType, RoleType } from '@/lib/types';
import { getRole } from '@/lib/utils';
import { useGlobalStore } from '@/store/global';
import React, { useEffect } from 'react';

type GlobalInitializerPropsType = {
  user: any;
  workspaces: any;
  children: React.ReactNode;
}

export default function GlobalInitializer({ user, workspaces, children }: GlobalInitializerPropsType) {
  useEffect(() => {
    useGlobalStore.setState({
      user
    });
  }, [user]);

  useEffect(() => {
    const bases: BaseType[] = [];
    const newWorkspaces = workspaces.map((workspace: any) => {
      workspace.bases.forEach((base: any) => {
        const role = base.role as RoleType;
        bases.push({
          id: base.id,
          label: base.label,
          workspace_id: workspace.id,
          role: getRole(role),
          created_at: base.created_at,
          updated_at: base.updated_at,
        });
      });

      const role = workspace.role as RoleType;
      return {
        id: workspace.id,
        label: workspace.label,
        role: getRole(role),
        created_at: workspace.created_at,
        updated_at: workspace.updated_at,
      };
    });


    useGlobalStore.setState({
      workspaces: newWorkspaces,
      bases,
    });
  }, [workspaces])

  return children
}