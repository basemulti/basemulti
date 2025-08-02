import { Workspace } from "@/database";
import Workspaces from "@/components/blocks/admin/workspaces";

const defaultLimit = 20;

export default async function page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }; 
}) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || defaultLimit;
  const q = searchParams.q;

  // Get all users ordered by creation date
  const query = Workspace.query()
    .withCount(['bases', 'collaborators'])
    // .select('id', 'name', 'email', 'created_at')
    .orderBy('created_at', 'desc');
  
  if (q) {
    query.where('label', 'like', `%${q}%`).orWhere('id', q);
  }

  const workspaces = await query.paginate(page, limit);

  return (
    <div className="flex-1 size-full flex flex-col">
      <div>
        <div className="h-[50px] border-b border-border px-5 flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <div className="text-base font-bold">工作区管理</div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <Workspaces data={workspaces.toData()} defaultLimit={limit} />
      </div>
    </div>
  );
}