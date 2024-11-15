import CreateBase from "@/components/workspace/create-base";
import { getCurrentUser } from "@/lib/server";
import { denies } from "@/lib/utils";
import { redirect } from "next/navigation";

type ParamsProps = {
  workspaceId: string;
}

type PageProps = { 
  params: ParamsProps;
}

export default async function Page({ params, ...props }: PageProps) {
  const user = await getCurrentUser();
  const wspace = await user?.getWorkspace(params.workspaceId);

  if (!wspace) {
    return <div>Workspace not found</div>;
  }
  
  const workspace = wspace.toData();

  if (denies(workspace.role, 'base:create')) {
    redirect('/404');
  }

  const breadcrumbItems = [
    { title: workspace, link: `/workspaces/${workspace}` },
    { title: 'Create', link: `/workspaces/${workspace}/create` },
  ];

  return <>
    <div className="flex-1 size-full flex flex-col">
      <div>
        <div className="h-[50px] border-b border-border px-5 flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <div className="text-base font-bold">{workspace.label}</div>
          </div>
        </div>
      </div>
      <CreateBase />
    </div>
  </>
}