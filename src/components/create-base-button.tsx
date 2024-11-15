'use client';

import { Button } from "./ui/button";
import { useRouter } from "next-nprogress-bar";
import { useGlobalStore } from "@/store/global";
import { useTranslations } from "next-intl";

export default function CreateBaseButton({ workspace }: {
  workspace: string;
}) {
  const router = useRouter();
  const { denies } = useGlobalStore(store => ({
    denies: store.denies,
  }));
  const t = useTranslations('Workspace');

  const handleCreateBase = () => {
    router.push(`/workspaces/${workspace}/create`);
  }

  if (denies(workspace,'workspace', 'base:create')) {
    return null;
  }

  return <Button variant={'outline'} className="text-sm h-8 px-3 bg-background" onClick={handleCreateBase}>
    {t('create_base')}
  </Button>
}