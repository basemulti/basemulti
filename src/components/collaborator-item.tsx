'use client';

import { useParams } from "next/navigation";
import { useState } from "react";
import { XIcon } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import dayjs from "dayjs";
import RoleSelector from "./role-selector";
import { useGlobalStore } from "@/store/global";
import { useRouter } from "next/navigation";
import { RoleType } from "@/lib/types";
import { removeCollaborator, updateCollaborator } from "@/actions/collaborator";
import { useTranslations } from "next-intl";

export default function CollaboratorItem({ collaborator }: { collaborator: any }) {
  const { user, denies } = useGlobalStore(store => ({
    user: store.user,
    denies: store.denies,
  }));
  const [role, setRole] = useState(collaborator.pivot.role);
  const [deleted, setDeleted] = useState<boolean>(false);
  const router = useRouter();
  const { workspaceId }: {
    workspaceId: string;
  } = useParams();
  const t = useTranslations('Workspace.Collaborators');

  const handleChangeRole = (role: RoleType) => {
    setRole(role);
    updateCollaborator({
      id: collaborator.pivot.id,
      role: role,
    }).then(result => {
      if (result?.error) {
        throw new Error(result.error);
      } else {
      }
    }).catch(error => {
      setRole(collaborator.pivot.role);
      toast.error(error.message);
    });
  }

  const handleDeleteCollaborator = () => {
    removeCollaborator({
      id: collaborator.pivot.id,
    }).then(result => {
      if (result?.error) {
        throw new Error(result.error);
      } else {
        if (user?.id === collaborator.id) {
          router.replace('/workspaces');
        } else {
          setDeleted(true);
        }
      }
    }).catch(error => {
      toast.error(error.message);
    });
  }

  const selectorDisables = !user || collaborator.id === user.id || denies(workspaceId, 'workspace', 'workspace:grant_role');

  if (!collaborator || deleted) return null;
  
  return (
    <div className="flex flex-row items-center justify-between gap-2 border-b border-border px-4 py-2">
      <div className="flex flex-row items-center gap-2">
        <Avatar className={cn("rounded-md w-8 h-8")}>
          <AvatarImage src="https://xinquji.remoteb.com/7268ede3-6038-4d27-b10d-c9d?imageView2/1/w/180/h/180" />
          <AvatarFallback className={cn("rounded-md font-bold")}>{getInitials(collaborator?.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="text-sm font-medium">{collaborator.name}</div>
          <div className="text-xs text-gray-500 cursor-pointer" onClick={() => {
            navigator.clipboard.writeText(collaborator.email);
            toast.success('Copied to clipboard');
          }}>{collaborator.email}</div>
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <div className="text-xs">{t('joined_on', {
          date: dayjs(collaborator.pivot.created_at).format('YYYY-MM-DD')
        })}</div>
        <RoleSelector roleName={role} disabled={selectorDisables} onSelect={handleChangeRole} />
        <XIcon className="size-4 opacity-50 hover:opacity-80 cursor-pointer" onClick={handleDeleteCollaborator} />
      </div>
    </div>
  );
}