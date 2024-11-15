"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { NavTables } from "./nav-tables";
import QuickActions from "@/components/quick-actions";
import { useParams } from "next/navigation";
import { NavMain } from "./nav-main";

export function BaseSidebar({ children, tables, showCreate, ...props }: React.ComponentProps<typeof Sidebar> & {
  children: React.ReactNode;
  tables: any;
  showCreate: boolean;
}) {
  const { baseId }: {
    baseId: string;
  } = useParams();

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        {children}
        <QuickActions />
        <NavMain baseId={baseId} />
      </SidebarHeader>
      <SidebarContent className="">
        <NavTables
          items={tables}
          showCreate={showCreate}
        />
      </SidebarContent>
      {/* <SidebarRail /> */}
      <SidebarFooter className="">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
