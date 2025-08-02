'use client';

import orderCollection from "lodash/orderBy";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon, DatabaseIcon, LayoutGridIcon, LayoutListIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import CreateWorkspace from "@/components/create-workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";
import BaseCard from "./base-card";
import WorkspaceCard from "./workspace-card";
import { useWorkspacesStore } from "@/store/workspace";
import { useTranslations } from "next-intl";

export default function WorkspaceList({
  workspaces,
  allowCreateWorkspace
}: {
  workspaces: any;
  allowCreateWorkspace: boolean;
}) {
  const {
    orderBy,
    viewFor,
    setOrderBy,
    setViewFor
  } = useWorkspacesStore();
  const t = useTranslations('AllWorkspaces');

  let bases: any[] = [];
  workspaces.map((workspace: any) => {
    bases.push(...workspace.bases);
  });

  bases = orderCollection(bases, [orderBy[0]], [orderBy[1]]);
  const sortedWorkspaces = orderCollection(workspaces, [orderBy[0]], [orderBy[1]]);

  return <>
    <div>
      <div className="h-[50px] border-b border-border px-5 flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={'ghost'} className="h-8 gap-2 px-2 focus-visible:ring-0">
                {orderBy[1] === 'asc' ? <ArrowUpIcon className={"size-4"} /> : <ArrowDownIcon className={"size-4"} />}
                {t(orderBy[0] === 'created_at' ? 'Tabs.created_time' : 'Tabs.alphabetical')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-40">
              <DropdownMenuRadioGroup value={orderBy[0]} onValueChange={(value) => setOrderBy([value, 'asc'])}>
                <DropdownMenuRadioItem value={'created_at'} className="cursor-pointer gap-2">
                  {t('Tabs.created_time')}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={'label'} className="cursor-pointer gap-2">
                  {t('Tabs.alphabetical')}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={orderBy[1]} onValueChange={(value) => setOrderBy([orderBy[0], value as 'desc' | 'asc'])}>
                <DropdownMenuRadioItem value={'asc'} className="cursor-pointer gap-2">
                  {t(orderBy[0] === 'created_at' ? 'Tabs.oldest_to_newest' : 'Tabs.a_to_z')}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={'desc'} className="cursor-pointer gap-2">
                  {t(orderBy[0] === 'created_at' ? 'Tabs.newest_to_oldest' : 'Tabs.z_to_a')}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant={'ghost'} className="h-8 gap-2 px-2 focus-visible:ring-0" onClick={() => {
            setViewFor(viewFor === 'base' ? 'workspace' : 'base')
          }}>
            {viewFor === 'base' ? <LayoutGridIcon className="size-4" /> : <LayoutListIcon className={cn("size-4")} />}
            {t(viewFor === 'base' ? 'Tabs.base' : 'Tabs.workspace')}
          </Button>
        </div>
        {allowCreateWorkspace && <CreateWorkspace />}
      </div>
    </div>
    <div className="overflow-y-scroll px-10 py-4 bg-muted/50 flex-1">
      {viewFor === 'base' ? (bases.length > 0 ? <div className="grid grid-cols-5 gap-4">
          {bases.map(base => <BaseCard key={base.id} base={base} />)}
      </div> : <div className="size-full flex flex-col items-center justify-center gap-4">
        <div className="bg-muted rounded-md p-2">
          <DatabaseIcon className="size-8 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-center font-semibold">{t('no_databases')}</div>
          <div className="text-gray-500 text-sm text-center">{t('no_databases_description')}</div>
        </div>
        <Button variant={'outline'} className="h-8 px-3 bg-background" onClick={() => setViewFor('workspace')}>
          显示所有工作区
        </Button>
      </div>) : <div className="flex flex-col gap-4">
        {sortedWorkspaces.map((workspace: any) => <WorkspaceCard key={workspace.id} workspace={workspace} />)}
      </div>}
    </div>
  </>
}