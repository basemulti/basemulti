'use client';

import {  EllipsisIcon, PlusIcon, TableIcon } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Dispatch, SetStateAction, useState } from "react";
import { TableNavItem } from "@/types";
import TableIconSelector from "@/components/table-icon-selector";
import NavTableOption from "./nav-table-option";
import { useTranslations } from "next-intl";
import CreateTable from "@/components/create-table";
import { Button } from "@/components/ui/button";

type NavTablesProps = {
  items: TableNavItem[];
  showCreate: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

export function NavTables({ items, showCreate }: NavTablesProps) {
  const t = useTranslations('BaseSidebar');
  const path = usePathname();
  const { baseId }: {
    baseId: string;
  } = useParams();
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  
  const filteredItems = keyword.length > 0 ? items.filter((item) => {
    return item.title.toLowerCase().includes(keyword.toLowerCase())
      || item.value.toLowerCase().includes(keyword.toLowerCase());
  }) : items;

  const visibleItems = [];
  const hiddenItems = [];

  for (const item of filteredItems) {
    if (item.visible !== false) {
      visibleItems.push(item);
    } else {
      hiddenItems.push(item);
    }
  }

  return <>
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="justify-between items-center">
        {t('tables')}
        {showCreate && <CreateTable baseId={baseId}>
          <div className="w-5 h-5 -mr-1 cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center justify-center rounded-md">
            <PlusIcon className="w-4 h-4" />
          </div>
        </CreateTable>}
      </SidebarGroupLabel>
      <SidebarMenu>
        {visibleItems.length === 0 && hiddenItems.length === 0 && <div className="w-full flex flex-col items-center mt-10 gap-2">
          <TableIcon className="w-6 h-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t('no_tables')}</span>
          {showCreate && <CreateTable baseId={baseId}>
          <Button variant={'outline'} className="px-2 h-7 bg-background text-xs">
            {t('create_table')}
          </Button>
        </CreateTable>}
        </div>}
        {visibleItems.map((item: any) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild isActive={path.startsWith(item.href)}>
              <Link href={item.disabled ? "/" : item.href}>
                <TableIconSelector icon={item.icon} baseId={baseId} tableName={item.value} size={'sm'} selector={false} />
                <span className="text-sm">{item.label}</span>
              </Link>
            </SidebarMenuButton>
            <NavTableOption data={item} />
          </SidebarMenuItem>
        ))}
        {hiddenItems.length > 0 && <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70" isActive={open} onClick={() => setOpen(!open)}>
            <EllipsisIcon />
            <span>{t('more')}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>}
        {open && hiddenItems.map((item: any) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild isActive={path.startsWith(item.href)}>
              <Link href={item.disabled ? "/" : item.href}>
                <TableIconSelector baseId={baseId} tableName={item.value} size={'sm'} selector={false} />
                <span className="text-sm">{item.label}</span>
              </Link>
            </SidebarMenuButton>
            <NavTableOption data={item}  />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  </>
}