
'use client';

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { CircleUserIcon, KeyIcon, Settings2Icon } from "lucide-react";
import { useGlobalStore } from "@/store/global";
import Loading from "@/components/loading";
import { useState } from "react";
import { cn, getInitials } from "@/lib/utils";
// import MyAccount from "./account-settings/my-account";
// import MySettings from "./account-settings/my-settings";
// import Tokens from "./account-settings/tokens";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

type TabType = 'account' | 'settings' | 'tokens' | 'connections';

const MyAccount = dynamic(() => import('./account-settings/my-account'));
const MySettings = dynamic(() => import('./account-settings/my-settings'));
const Tokens = dynamic(() => import('./account-settings/tokens'));

export default function AccountSettings({ open, setOpen, tab: initTab = 'account' }: {
  open: boolean;
  setOpen: (open: boolean) => void;
  tab?: TabType
}) {
  const [tab, setTab] = useState<TabType>(initTab);
  const t = useTranslations('ModalAccount');

  const renderTab = () => {
    switch (tab) {
      case 'account':
        return <MyAccount />;
      case 'settings':
        return <MySettings />;
      case 'tokens':
        return <Tokens />;
      case 'connections':
        return <div>App</div>;
    }
  }

  const { user } = useGlobalStore(store => ({
    user: store.user
  }));

  if (!open) {
    return null;
  }

  if (!user) {
    return <Loading />;
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      setOpen(open);
      if (!open) {
        setTab(initTab);
      }
    }}>
      {open && <DialogContent className="flex items-center p-0 h-[calc(100vh-100px)] max-w-[calc(100vw-100px)] md:w-[1150px] w-[1150px] gap-0" visibleClose={false}>
        <div className="w-[240px] h-full min-h-32 bg-sidebar rounded-l-md p-2 border-r border-r-border">
          <div className="">
            <div className="text-muted-foreground text-xs p-1 mb-2">{t('modal_title')}</div>
            <div className="flex flex-col gap-1">
              <div className={cn(
                "text-sm h-8 flex items-center gap-2 rounded-md hover:bg-sidebar-accent px-2 cursor-pointer",
                tab === 'account' && 'bg-sidebar-accent'
              )} onClick={() => setTab('account')}>
                <CircleUserIcon className="size-4" />
                {t('my_account')}
              </div>
              <div className={cn(
                "text-sm h-8 flex items-center gap-2 rounded-md hover:bg-sidebar-accent px-2 cursor-pointer",
                tab === 'settings' && 'bg-sidebar-accent'
              )} onClick={() => setTab('settings')}>
                <Settings2Icon className="size-4" />
                {t('my_settings')}
              </div>
              <div className={cn(
                "text-sm h-8 flex items-center gap-2 rounded-md hover:bg-sidebar-accent px-2 cursor-pointer",
                tab === 'tokens' && 'bg-sidebar-accent'
              )} onClick={() => setTab('tokens')}>
                <KeyIcon className="size-4" />
                {t('api_tokens')}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 w-[900px] h-full">
          <div className="flex flex-col w-full px-16 py-8 gap-12 h-full overflow-y-scroll">
            {renderTab()}
          </div>
        </div>
      </DialogContent>}
    </Dialog>
  );
}