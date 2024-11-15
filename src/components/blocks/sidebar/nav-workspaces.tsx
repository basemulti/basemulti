'use client';

import { LayersIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";

export function NavWorkspaces({ workspaces }: any) {
  const pathname = usePathname();
  const t = useTranslations('WorkspaceSidebar');

  return <>
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{t('workspace')}</SidebarGroupLabel>
      <SidebarMenu>
        {workspaces.map((item: any) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild isActive={pathname.startsWith(`/workspaces/${item.id}`)}>
              <Link href={`/workspaces/${item.id}`}>
                <LayersIcon className="size-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  </>
}