'use server';

import { Base, type User, Workspace } from "@/database";
import { getCurrentUser } from "@/lib/server";
import { denies } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createWorkspace({ label }: { label: string; }) {
  const user = await getCurrentUser();

  if (!label) {
    return { error: "label is required" };
  }

  const workspace = new Workspace();
  workspace.label = label;
  await workspace.save();

  await user?.related('workspaces').attach(workspace.id, {
    role: 'owner',
    collaboratorable_type: 'workspace'
  });

  revalidatePath(`/workspaces`);
  return {};
}

export async function removeWorkspace({ id }: { id: string; }) {
  const user = await getCurrentUser() as User;
  const workspace = await user.getWorkspace(id);
  if (
    !workspace
    || (denies(workspace?.role, 'workspace:delete'))
  ) {
    return { error: 'Workspace not found' };
  }

  // const workspace = await user.related('workspaces').where('workspace.id', id).firstOrFail();
  await Base.query().where('workspace_id', id).delete();
  await workspace.delete();
  
  revalidatePath(`/workspaces`);
}

export async function updateWorkspaceLabel({ id, label }: { id: string; label: string; }) {
  const user = await getCurrentUser() as User;

  try {
    const workspace = await user.getWorkspace(id);

    if (!workspace) {
      return { error: 'xxxx' }
    }

    if (denies(workspace?.role, 'workspace:update')) {
      return {
        error: 'Permission denied'
      }
    }
    
    workspace.label = label;
    await workspace.save();
  } catch (error: any) {
    return { error: error.message }
  }
    
  revalidatePath(`/workspaces`);
  return {};
}