import { type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { Collaborator, InviteLink } from '@/database';
import { getCurrentUser } from '@/lib/server';
import { roleLevels } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: any
) {
  const searchParams = req.nextUrl.searchParams;
  const inviteLinkId = searchParams.get("id");
  const inviteLinkCode = searchParams.get("code");

  if (!inviteLinkId || !inviteLinkCode) {
    redirect('/workspaces');
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const inviteLink = await InviteLink.query().where({
    id: inviteLinkId,
    code: inviteLinkCode
  }).first();

  if (!inviteLink) {
    redirect('/workspaces');
  }

  const { linkable_id, linkable_type } = inviteLink;

  let collaborator = await Collaborator.query().where({
    user_id: user.id,
    collaboratorable_id: linkable_id,
    collaboratorable_type: linkable_type
  }).first();

  if (!collaborator) {
    collaborator = new Collaborator;
    collaborator.user_id = user.id;
    collaborator.collaboratorable_id = linkable_id;
    collaborator.collaboratorable_type = linkable_type;
    collaborator.role = inviteLink.role;
  }

  if (roleLevels[collaborator.role] < roleLevels[inviteLink.role]) {
    collaborator.role = inviteLink.role;
  }
  
  await collaborator.save();

  redirect(`/workspaces`);
}
