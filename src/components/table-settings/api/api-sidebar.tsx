'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BookOpenIcon, KeyIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import AccountSettings from "@/components/account-settings";

export default function APISidebar({ data, language, setLanguage }: {
  data: {
    name: string;
    color: string;
    codes: {
        name: string;
        code: string;
    }[];
  }[],
  language: string,
  setLanguage: (language: string) => void
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('Table.Settings.API');

  return <>
    <Sidebar collapsible="none" className="hidden md:flex w-56">
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <span>{t('languages')}</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.name === language}
                    onClick={() => setLanguage(item.name)}
                  >
                    <div className="cursor-pointer">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} data-collapsible="icon"></div>
                      <span>{item.name}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <span>{t('tokens')}</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div className="cursor-pointer" onClick={() => setOpen(true)}>
                    <KeyIcon className="size-4" />
                    <span>{t('manage_tokens')}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <span>{t('documents')}</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href={t('docs_url')} target="_blank">
                    <BookOpenIcon className="size-4" />
                    <span>{t('data_api')}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    <AccountSettings open={open} setOpen={setOpen} tab={'tokens'} />
  </>;
}