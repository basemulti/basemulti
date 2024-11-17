'use client';

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { ArrowRightIcon, EditIcon, EllipsisIcon, SettingsIcon, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";
// @ts-ignore
import { useEffect, useState, useOptimistic, useRef } from "react";
import BaseCard from "./base-card";
import { AlertModal } from "./modal/alert-modal";
import { removeWorkspace, updateWorkspaceLabel } from "@/actions/workspace";
import { useRouter } from "next-nprogress-bar";
import { Input } from "./ui/input";
import CreateBaseButton from "./create-base-button";
import { toast } from "sonner";
import { useGlobalStore } from "@/store/global";
import { useTranslations } from "next-intl";

export default function WorkspaceCard({ workspace }: {
  workspace: any;
}) {
  const [workspaceDeleting, setWorkspaceDeleting] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [renaming, setRenaming] = useState(false);
  const [label, setLabel] = useState(workspace.label);
  const [optimisticLabel, setOptimisticLabel] = useOptimistic(label, (state: string, value: string) => value);
  const { allows } = useGlobalStore(store => ({
    allows: store.allows,
  }));
  const t = useTranslations('WorkspaceCard');

  useEffect(() => {
    setTimeout(() => {
      if (renaming) {
        inputRef?.current?.focus();
      }
    }, 300);
    
  }, [renaming]);

  // console.log('workspace card', workspaces)

  const handleDeleteWorkspace = () => {
    setWorkspaceDeleting(true);
    removeWorkspace({
      id: workspace.id,
    })
    .then((result) => {
      if (result?.error) {
        throw new Error(result?.error);
      }
    })
    .catch((e) => {
      toast.error(e.message)
    })
    .finally(() => {
      setWorkspaceDeleting(false);
      setDeleteOpen(false);
    });
  };

  const handleBlurLabel = (e: any) => {
    e.preventDefault();

    const newLabel = e.target.value;

    if (newLabel === label) {
      setRenaming(false);
      return;
    }

    setOptimisticLabel(newLabel);
    updateWorkspaceLabel({ id: workspace.id, label: newLabel }).then((result) => {
      if (result?.error) {
        throw new Error(result?.error);
      }
      setLabel(newLabel);
    }).catch((error) => {
      setOptimisticLabel(label);
      toast.error(error.message)
    }).finally(() => {
      setRenaming(false);
    });
  }

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  }

  return <>
    <Card className="rounded-lg shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          {renaming
          ? <Input
            ref={inputRef}
            defaultValue={optimisticLabel}
            className="h-8 focus-visible:ring-0"
            onBlur={handleBlurLabel}
            onKeyPress={handleKeyPress}
          />
          : optimisticLabel}
          <div className="flex items-center gap-2">
            {allows(workspace.id, 'workspace', 'base:create') && <Link href={`/workspaces/${workspace.id}/create`} className={cn(buttonVariants({ variant: 'outline' }), "text-sm h-8 px-3")}>
              {t('create_base')}
            </Link>}
            {allows(workspace.id, 'workspace', [
              'workspace:update',
              'workspace:delete',
            ], false) && <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant={'outline'} className="h-8 w-8 p-0">
                  <EllipsisIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="">
                <DropdownMenuGroup>
                  {allows(workspace.id, 'workspace', 'workspace:update') && <DropdownMenuItem className="cursor-pointer gap-2 h-8 text-sm" onClick={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    setRenaming(true);
                  }}>
                    <EditIcon className="size-4" />
                    {t('rename')}
                  </DropdownMenuItem>}
                  {allows(workspace.id, 'workspace', 'workspace:update') && <DropdownMenuItem className="cursor-pointer gap-2 h-8 text-sm" onSelect={() => router.push(`/workspaces/${workspace.id}/settings`)}>
                    <SettingsIcon className="size-4" />
                    {t('settings')}
                  </DropdownMenuItem>}
                  {allows(workspace.id, 'workspace', 'workspace:delete') && <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 h-8 text-sm" onSelect={() => setDeleteOpen(true)}>
                      <TrashIcon className="size-4" />
                      {t('delete')}
                    </DropdownMenuItem>
                  </>}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(
        "grid grid-cols-4 gap-4",
        workspace.bases.length > 0 ? 'grid-cols-4' : 'grid-cols-1'
      )}>
        {workspace.bases.map((base: any) => <BaseCard key={base.id} base={base} />)}
        {workspace.bases.length === 0 && <div className="flex flex-col items-center justify-center gap-2">
          {t('empty_prompt')}
          <CreateBaseButton workspace={workspace.id} />
        </div>}
      </CardContent>
      <Link href={`/workspaces/${workspace.id}`}>
        <CardFooter className="pb-4 text-muted-foreground gap-2 text-sm hover:text-primary">
          {t('view_workspace')}
          <ArrowRightIcon className="size-3" />
        </CardFooter>
      </Link>
    </Card>
    <AlertModal
      isOpen={deleteOpen}
      onClose={() => setDeleteOpen(false)}
      onConfirm={handleDeleteWorkspace}
      loading={workspaceDeleting}
    />
  </>
}