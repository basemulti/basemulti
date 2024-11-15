"use client"

import { HomeIcon, SettingsIcon, SparklesIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

interface BaseNavProps {
  baseId: string;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

export function NavMain({
  baseId, setOpen
}: BaseNavProps) {
  const t = useTranslations('BaseSidebar');
  const path = usePathname();

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel>{t('platform')}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={t('home')} isActive={path === `/bases/${baseId}`}>
            <Link href={`/bases/${baseId}`}>
              <HomeIcon className="size-4" />
              <span>{t('home')}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={t('settings')} isActive={path.startsWith(`/bases/${baseId}/settings`)}>
            <Link href={`/bases/${baseId}/settings/table`}>
              <SettingsIcon className="size-4" />
              <span>{t('settings')}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {/* <SidebarMenuItem>
          <SidebarMenuButton disabled tooltip={t('ask_ai')}>
            <SparklesIcon className="size-4" />
            <span>{t('ask_ai')}</span>
          </SidebarMenuButton>
        </SidebarMenuItem> */}
      </SidebarMenu>
    </SidebarGroup>
  )
}
