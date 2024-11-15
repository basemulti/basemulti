'use server'

import { User, InviteLink } from "@/database";
import { getCurrentUser } from "@/lib/server";
import { RoleType } from "@/lib/types";
import { denies } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createInviteLink({
  id,
  type,
  role,
}: {
  id: string;
  type: 'workspace' | 'base';
  role: RoleType;
}) {
  const user = await getCurrentUser() as User;
  const record = type === 'workspace' ? await user?.getWorkspace(id) : await user?.getBase(id);
  if (!record) {
    return { error: `${type} not found` };
  }

  if (denies(record.role, `${type}:invite_link`)) {
    return { error: `You do not have permission to create an invite link` };
  }

  const inviteLink = new InviteLink();
  inviteLink.code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  inviteLink.linkable_id = id;
  inviteLink.linkable_type = type;
  inviteLink.role = role;
  await inviteLink.save();

  // revalidatePath(`/workspaces/${id}/collaborators`);

  return {
    inviteLink: inviteLink.toData()
  };
}

export async function updateInviteLink({
  id,
  role,
}: {
  id: string;
  role: RoleType;
}) {
  const user = await getCurrentUser() as User;
  const inviteLink = await InviteLink.query().find(id);
  if (!inviteLink) {
    return { error: 'Invite link not found' };
  }

  const record = inviteLink.linkable_type === 'workspace' ? await user?.getWorkspace(inviteLink.linkable_id) : await user?.getBase(inviteLink.linkable_id);

  if (!record) {
    return { error: `Invite link not found` };
  }

  if (denies(record.role, `${inviteLink.linkable_type}:invite_link`)) {
    return { error: `Invite link not found` };
  }

  inviteLink.role = role;
  await inviteLink.save();

  return {
    inviteLink: inviteLink.toData()
  };;
}

export async function removeInviteLink({ id }: { id: string }) {
  const user = await getCurrentUser() as User;
  const inviteLink = await InviteLink.query().find(id);
  if (!inviteLink) {
    return { error: 'Invite link not found' };
  }

  const record = inviteLink.linkable_type === 'workspace'
    ? await user?.getWorkspace(inviteLink.linkable_id)
    : await user?.getBase(inviteLink.linkable_id);

  if (!record) {
    return { error: `Invite link not found` };
  }

  if (denies(record.role, `${inviteLink.linkable_type}:invite_link`)) {
    return { error: `Invite link not found` };
  }

  await inviteLink.delete();

  return {};
}