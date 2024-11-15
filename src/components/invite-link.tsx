'use client'

import { CopyIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import RoleSelector from "./role-selector";
import { RoleType } from "@/lib/types";
import { useState } from "react";
import { removeInviteLink, updateInviteLink } from "@/actions/invite-link";

export default function InviteLink({ inviteLink }: {
  inviteLink: {
    id: string;
    code: string;
    link: string;
    role: RoleType;
  }
}) {
  const [role, setRole] = useState<RoleType>(inviteLink.role);
  const [deleted, setDeleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSelect = (role: RoleType) => {
    if (loading) return;
    setLoading(true);
    setRole(role);
    updateInviteLink({
      id: inviteLink.id,
      role: role,
    }).then(result => {
      if (result?.error) {
        throw new Error(result.error);
      } else {
        // router.refresh();
      }
    }).catch(error => {
      setRole(inviteLink.role);
      toast.error(error.message);
    }).finally(() => {
      setLoading(false);
    });
  }

  const handleDeleteInviteLink = () => {
    removeInviteLink({
      id: inviteLink.id,
    }).then(result => {
      if (result?.error) {
        throw new Error(result.error);
      }
        
      setDeleted(true);
    }).catch(error => {
      toast.error(error.message);
    }).finally(() => {
      setLoading(false);
    });
  }

  if (deleted) {
    return null;
  }

  return <div className="flex items-center gap-2">
    <Input className="flex-1 h-8 bg-background" placeholder="Search invite link..." defaultValue={inviteLink.link} readOnly />
    <CopyIcon className="size-4 opacity-50 hover:opacity-80 cursor-pointer" onClick={() => {
      navigator.clipboard.writeText(inviteLink.link);
      toast.success('Copied to clipboard');
    }} />
    <RoleSelector roleName={role} onSelect={handleSelect} />
    <XIcon className="size-4 opacity-50 hover:opacity-80 cursor-pointer" onClick={handleDeleteInviteLink} />
  </div>;
}