'use client';

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
// @ts-ignore
import { useOptimistic, useEffect, useState } from "react";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import ButtonLoading from "@/components/button-loading";
import { toast } from "sonner";
import Tabs from "./workspace/tabs";
import { useGlobalStore } from "@/store/global";
import InviteLink from "./invite-link";
import { createInviteLink } from "@/actions/invite-link";
import { useRouter } from "next/navigation";
import CollaboratorItem from "./collaborator-item";
import { useTranslations } from "next-intl";

export default function CollaboratorList({ workspace, collaborators }: {
  workspace: any;
  collaborators: any;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [optimisticInviteLinks, setOptimisticInviteLinks] = useOptimistic(workspace.invite_links);
  const [q, setQ] = useState<string>('');
  const { user, allows } = useGlobalStore(store => ({
    user: store.user,
    allows: store.allows,
  }));
  const t = useTranslations('Workspace.Collaborators');

  const form = useForm({
    defaultValues: {
    }
  });

  const handleChangeQ = (e: any) => {
    setQ(e.target.value);
  }

  const handleCreateInviteLink = () => {
    if (loading) return;
    setLoading(true);
    createInviteLink({
      id: workspace.id,
      type: 'workspace',
      role: 'creator'
    }).then(result => {
      if (result?.error) {
        throw new Error(result.error);
      }
      optimisticInviteLinks.push(result.inviteLink);
      setOptimisticInviteLinks(optimisticInviteLinks);
    }).catch(error => {
      toast.error(error.message);
    }).finally(() => {
      setLoading(false);
    });
  }

  const filteredCollaborators = q.length > 0
    ? collaborators.filter((collaborator: any) => collaborator.name.toLowerCase().includes(q.toLowerCase()) || collaborator.email.toLowerCase().includes(q.toLowerCase()))
    : collaborators;
  
  return (
    <>
      <Tabs showBasesButton={true} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(() => {})}
          // className="space-y-8 w-full"
        >
          <div className="max-w-screen-lg mx-auto mt-8 w-full flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between">
              <div className="relative">
                <Input className="pl-8 h-8" placeholder={t('search_placeholder')} onChange={handleChangeQ} />
                <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 size-4 text-gray-500" />
              </div>
              <div className="flex items-center gap-2">
                {/* <Button type="button" className={'h-8 px-2'}>
                  <ButtonLoading loading={loading} />
                  Add collaborator
                </Button> */}
              </div>
            </div>
            <div className="rounded-md border border-border overflow-hidden">
              <div className="size-full flex flex-row">
                <ScrollArea className="h-[calc(100vh-200px)] flex-1">
                  <div className="flex-1 flex flex-col">
                    {filteredCollaborators.map((collaborator: any) => (
                      <CollaboratorItem key={collaborator.id} collaborator={collaborator} />
                    ))}
                  </div>
                </ScrollArea>
                {allows(workspace.id, 'workspace', 'workspace:invite_link') && <ScrollArea className="h-[calc(100vh-200px)] min-w-[420px] border-l border-l-border bg-muted/50">
                  <div className="flex-1 p-4 text-sm flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <div>
                        <div className="text-base font-bold">{t('share_workspace')}</div>
                        <div className="text-xs text-gray-500">{t('share_description')}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* <RoleSelector align="start" roleName={'creator'} /> */}
                        <Button type="button"  className="h-8 px-3 gap-2  w-auto" disabled={loading} onClick={handleCreateInviteLink}>
                          {loading ? <ButtonLoading loading={loading} /> : <PlusIcon className="size-4" />}
                          {t('create_invite_link')}
                        </Button>
                      </div>
                    </div>
                    {optimisticInviteLinks?.length > 0 && <div className="flex flex-col gap-2">
                      <div className="font-medium">{t('invite_links')}</div>
                      {optimisticInviteLinks.map((link: any) => (
                        <InviteLink key={link.id} inviteLink={link} />
                      ))}
                    </div>}
                  </div>
                </ScrollArea>}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}