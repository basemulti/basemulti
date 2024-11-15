'use server'

import { Collaborator, User, Workspace } from "@/database";
import { getCurrentUser } from "@/lib/server";
import { RoleType } from "@/lib/types";
import { denies } from "@/lib/utils";

export async function updateCollaborator({
  id,
  role,
}: {
  id: string;
  role: RoleType;
}) {
  const user = await getCurrentUser() as User;
  const collaborator = await Collaborator.query().find(id);

  if (!collaborator) {
    return { error: 'Collaborator not found.' };
  }

  const record = await user.getWorkspaceOrBase(collaborator);

  if (!record) {
    return { error: `Collaborator not found.` };
  }

  if (denies(record.role, `${collaborator.collaboratorable_type}:grant_role`)) {
    return { error: 'You do not have permission to update this collaborator' };
  };

  collaborator.role = role;
  await collaborator.save();

  return {
    collaborator: collaborator.toData()
  };
}

export async function removeCollaborator({ id }: { id: string }) {
  const user = await getCurrentUser() as User;
  const collaborator = await Collaborator.query().find(id);

  if (!collaborator) {
    return { error: 'Collaborator not found.' };
  }

  const record = await user.getWorkspaceOrBase(collaborator);

  if (!record) {
    return { error: `Collaborator not found.` };
  }

  if (user.id !== collaborator.user_id && denies(record.role, `${collaborator.collaboratorable_type}:grant_role`)) {
    return { error: 'You do not have permission to delete this collaborator' };
  };

  if (
    collaborator.collaboratorable_type === 'workspace'
    && collaborator.role === 'owner'
    && await (record as Workspace).isLastOwner()
  ) {
    return { error: `You denies delete the last owner of a workspace` };
  }

  await collaborator.delete();

  return {};
}