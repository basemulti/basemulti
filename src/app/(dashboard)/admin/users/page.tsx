import { User } from "@/database";
import Users from "@/components/blocks/admin/users";

const defaultLimit = 10;

export default async function page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }; 
}) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || defaultLimit;
  const q = searchParams.q;

  // Get all users ordered by creation date
  const query = User.query()
    .select('id', 'name', 'email', 'created_at')
    .orderBy('created_at', 'desc');

  if (q) {
    query.where('email', 'like', `%${q}%`).orWhere('id', q).orWhere('name', 'like', `%${q}%`);
  }
  
  const users = await query.paginate(page, limit);

  return (
    <div className="flex-1 size-full flex flex-col">
      <div>
        <div className="h-[50px] border-b border-border px-5 flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <div className="text-base font-bold">用户管理</div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <Users data={users.toData()} defaultLimit={limit} />
      </div>
    </div>
  );
}