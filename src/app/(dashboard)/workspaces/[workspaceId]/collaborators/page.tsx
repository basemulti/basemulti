import { redirect } from "next/navigation";
import CollaboratorList from "@/components/collaborator-list";
import { getCurrentUser } from "@/lib/server";
import { allows } from "@/lib/utils";
import { Collection } from "sutando";

type PageProps = {
  params: {
    workspaceId: string
  },
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function page({ params, searchParams }: PageProps) {
  const user = await getCurrentUser();
  const wspace = await user?.getWorkspace(params.workspaceId);

  if (!wspace) {
    return redirect('/workspaces');
  }

  const collaborators = await wspace.getCollaborators();

  if (allows(wspace.role, 'workspace:invite_link')) {
    await wspace.load({
      invite_links: (q) => q.orderBy('created_at', 'asc')
    });
  } else {
    wspace.setRelation('invite_links', new Collection([]));
  }

  const workspace = wspace.toData();

  return (
    <>
      <div className="flex-1 size-full flex flex-col">
        <div>
          <div className="h-[50px] border-b border-border px-5 flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <div className="text-base font-bold">{workspace.label}</div>
            </div>
          </div>
        </div>
        <CollaboratorList
          workspace={workspace}
          collaborators={collaborators.toData()}
        />
      </div>
    </>
  );
}
