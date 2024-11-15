'use client';

import { EllipsisIcon, LayoutGridIcon, SettingsIcon, TrashIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CreateBaseButton from "../create-base-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "../modal/alert-modal";
import { removeWorkspace } from "@/actions/workspace";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/store/global";
import { toast } from "sonner";
import Bar from "../bar";
import { useTranslations } from "next-intl";

export default function Tabs({ children, showBasesButton = false }: {
  children?: React.ReactNode;
  showBasesButton?: boolean;
}) {
  const { workspaceId }: {
    workspaceId: string;
  } = useParams();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [workspaceDeleting, setWorkspaceDeleting] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const {allows} = useGlobalStore(store => ({
    allows: store.allows,
  }));
  const t = useTranslations('Workspace.Tabs');

  const handleDeleteWorkspace = () => {
    setWorkspaceDeleting(true);
    removeWorkspace({
      id: workspaceId,
    })
      .then((result) => {
        if (result?.error) {
          throw new Error(result?.error);
        }
        router.replace('/workspaces');
      })
      .catch(e => {
        toast.error(e.message);
      })
      .finally(() => {
        setWorkspaceDeleting(false);
        setDeleteOpen(false);
      });
  }

  return <Bar>
    <div className="flex flex-row items-center gap-2">
      {children}
      {showBasesButton && <Link href={`/workspaces/${workspaceId}`}>
        <div
          className={cn(
            "h-8 flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-transparent hover:border-border px-2 py-1 gap-1",
            pathname == `/workspaces/${workspaceId}` ? 'border-border' : 'border-transparent'
          )}
        >
          <LayoutGridIcon className="mr-1 size-4" />
          {t('bases')}
        </div>
      </Link>}
      <Link href={`/workspaces/${workspaceId}/collaborators`}>
        <div
          className={cn(
            "h-8 flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-transparent hover:border-border px-2 py-1 gap-1",
            pathname == `/workspaces/${workspaceId}/collaborators` ? 'border-border' : 'border-transparent'
          )}
        >
          <UsersIcon className="mr-1 size-4" />
          {t('collaborators')}
        </div>
      </Link>
      {allows(workspaceId, 'workspace', 'workspace:update') && <Link href={`/workspaces/${workspaceId}/settings`}>
        <div
          className={cn(
            "h-8 flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-transparent hover:border-border px-2 py-1 gap-1",
            pathname == `/workspaces/${workspaceId}/settings` ? 'border-border' : 'border-transparent'
          )}
        >
          <SettingsIcon className="mr-1 size-4" />
          {t('settings')}
        </div>
      </Link>}
    </div>
    <div className="flex items-center gap-2">
      <CreateBaseButton workspace={workspaceId} />
      {allows(workspaceId, 'workspace', 'workspace:delete') && <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'outline'} className="w-8 h-8 p-0">
            <EllipsisIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 h-8" onSelect={() => setDeleteOpen(true)}>
              <TrashIcon className="size-4" />
              {t('delete_workspace')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>}
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteWorkspace}
        loading={workspaceDeleting}
      />
    </div>
  </Bar>
}