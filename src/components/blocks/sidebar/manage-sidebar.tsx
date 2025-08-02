"use client"

import * as React from "react"
import {
  FolderIcon,
  HomeIcon,
  LayersIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  Undo2Icon,
  UsersIcon,
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ManageSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('AdminSidebar');
  const pathname = usePathname();

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between m-2">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" className="size-8 rounded-lg" />
            <div className="font-semibold text-lg">Basemulti</div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/workspaces`}>
                <div className="h-7 w-7 rounded-md hover:bg-accent hover:text-accent-foreground flex items-center justify-center cursor-pointer">
                  <Undo2Icon className="size-4 text-primary/60" />
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('back')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{'管理员后台'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                  <Link href="/admin">
                    <LayoutDashboardIcon className="size-4" />
                    <span>{t('console')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/users'}>
                  <Link href="/admin/users">
                    <UsersIcon className="size-4" />
                    <span>{t('users')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/workspaces'}>
                  <Link href="/admin/workspaces">
                    <LayersIcon className="size-4" />
                    <span>{t('workspaces')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/settings'}>
                  <Link href="/admin/settings">
                    <SettingsIcon className="size-4" />
                    <span>{t('settings')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
