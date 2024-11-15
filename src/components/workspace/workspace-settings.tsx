'use client';

import { Label } from "../ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AlertModal } from "../modal/alert-modal";
import { removeWorkspace, updateWorkspaceLabel } from "@/actions/workspace";
import { Input } from "../ui/input";
import Tabs from "./tabs";
import { useRouter } from "next-nprogress-bar";
import ButtonLoading from "../button-loading";
import { toast } from "sonner";
import { useGlobalStore } from "@/store/global";
import { useTranslations } from "next-intl";

type WorkspaceSettingsProps = {
  workspace: any;
}

export default function WorkspaceSettings({ workspace }: WorkspaceSettingsProps) {
  const [workspaceDeleting, setWorkspaceDeleting] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [label, setLabel] = useState(workspace.label);
  const router = useRouter();
  const { workspaces, allows } = useGlobalStore(store => ({
    workspaces: store.workspaces,
    allows: store.allows,
  }));
  const t = useTranslations('Workspace.Settings');

  const handleUpdateLabel = () => {
    setRenaming(true);
    if (workspace.label === label) {
      setRenaming(false);
      return;
    }

    updateWorkspaceLabel({ id: workspace.id, label: label })
    .catch((error) => {
      toast.error("Uh oh! Something went wrong.", {
        description: error.message,
      });
    }).finally(() => {
      setRenaming(false);
    });
  }

  const handleDeleteWorkspace = () => {
    setWorkspaceDeleting(true);
    removeWorkspace({
      id: workspace.id,
    })
    .then((result) => {
      if (result?.error) {
        throw new Error(result?.error);
      }
      router.replace("/workspaces");
    }).finally(() => {
      setWorkspaceDeleting(false);
      setDeleteOpen(false);
    })
  }

  return <>
    <Tabs showBasesButton={true} />
    {allows(workspace.id, 'workspace', 'workspace:update') && <div className="max-w-screen-md mx-auto mt-8 w-full flex flex-col gap-2">
      <div className="rounded-lg border border-border p-6 flex flex-col gap-3">
        <div className="text-base font-medium">{t('change_label')}</div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="workspace-label" className="block text-sm text-slate-500">{t('label')}</Label>
          <Input id="workspace-label" type="text" className="h-8" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="flex flex-row-reverse">
          <Button className="h-8 gap-2" disabled={renaming || label == workspace.label} onClick={handleUpdateLabel}>
            <ButtonLoading loading={renaming} />
            {t('rename')}
          </Button>
        </div>
      </div>
    </div>}
    {allows(workspace.id, 'workspace', 'workspace:delete') && <div className="max-w-screen-md mx-auto mt-8 w-full flex flex-col gap-2">
      <div className="rounded-lg border border-red-500 p-6 flex flex-col gap-3">
        <div className="text-base font-medium">{t('delete_workspace')}</div>
        <div className="text-sm text-muted-foreground">{t('delete_description')}</div>
        <div className="flex flex-row-reverse">
          <Button variant={'destructive'} className="h-8" onClick={() => setDeleteOpen(true)}>
            {t('delete_workspace')}
          </Button>
        </div>
      </div>
    </div>}
    <AlertModal
      isOpen={deleteOpen}
      onClose={() => setDeleteOpen(false)}
      onConfirm={handleDeleteWorkspace}
      loading={workspaceDeleting}
    />
  </>;
}