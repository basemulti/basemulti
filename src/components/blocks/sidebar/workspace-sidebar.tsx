"use client"

import * as React from "react"
import {
  HomeIcon,
} from "lucide-react"

import { NavWorkspaces } from "./nav-workspaces";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import Link from "next/link"
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function WorkspaceSidebar({ workspaces, showAdminButton = false, ...props }: React.ComponentProps<typeof Sidebar> & {
  workspaces: any;
  showAdminButton?: boolean;
}) {
  const t = useTranslations('WorkspaceSidebar');
  const pathname = usePathname();

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} />
        <NavMain items={data.navMain} /> */}
        <div className="flex items-center gap-3 m-2">
          <img src="/logo.svg" className="size-8 rounded-lg" />
          <div className="font-semibold text-lg">Basemulti</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('home')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/workspaces'}>
                  <Link href="/workspaces">
                    <HomeIcon className="size-4" />
                    <span>{t('all_workspaces')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {showAdminButton && <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                  <Link href="/admin">
                    <HomeIcon className="size-4" />
                    <span>{'管理后台'}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavWorkspaces workspaces={workspaces} />
      </SidebarContent>
      {/* <SidebarRail /> */}
      <SidebarFooter className="">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
