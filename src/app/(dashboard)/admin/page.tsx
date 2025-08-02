import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DB, User, Workspace } from "@/database";
import { UsersIcon, LayersIcon, ActivityIcon } from "lucide-react";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserCreatedChart from "@/components/user-created-chart";

export default async function Manage() {
  const usersCount = await User.query().count();
  const workspacesCount = await Workspace.query().count();

  const usersByDate = await User.query()
    .select(
      DB.raw("strftime('%Y-%m-%d', created_at) as day"),
      DB.raw('COUNT(*) as count')
    )
    .groupBy('day')
    .orderBy('day', 'asc')
    .get<{
      day: string;
      count: string;
    }>();

  // Get all workspaces ordered by creation date
  const users = await User.query()
    .select('id', 'email', 'created_at')
    .orderBy('created_at', 'desc')
    .limit(10)
    .get();

  const chartData = usersByDate.toData().map((item: any) => ({
    day: dayjs(item.day).format('MM/DD'),
    users: parseInt(item.count)
  }));

  return (
    <div className="flex-1 size-full flex flex-col">
      <div>
        <div className="h-[50px] border-b border-border px-5 flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <div className="text-base font-bold">管理后台</div>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-md border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">用户</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersCount}</div>
              <p className="text-xs text-muted-foreground">
                注册用户数量
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-md border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">工作区</CardTitle>
              <LayersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workspacesCount}</div>
              <p className="text-xs text-muted-foreground">
                工作区数量
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-md border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium">日注册用户数</CardTitle>
            </CardHeader>
            <CardContent>
              <UserCreatedChart data={[...chartData, ...chartData, ...chartData, ...chartData, ...chartData]} />
            </CardContent>
          </Card>

          <Card className="rounded-md border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">最新注册用户</CardTitle>
              <ActivityIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>邮箱</TableHead>
                    <TableHead>创建时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.toData().map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{dayjs(user.created_at).format('YYYY-MM-DD HH:mm')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}