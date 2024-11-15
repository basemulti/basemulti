"use client"

import {
  BadgeCheck,
  ChevronsUpDown,
  ExternalLinkIcon,
  GithubIcon,
  LogOut,
  MilestoneIcon,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useGlobalStore } from "@/store/global"
import { logout } from "@/actions/auth"
import AccountSettings from "@/components/account-settings";
import { appString, getInitials, version } from "@/lib/utils"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

export function NavUser() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isMobile } = useSidebar();
  const user = useGlobalStore(store => store.user);
  const t = useTranslations('NavUser');
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  return <>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-11"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="rounded-lg font-medium">{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "top"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="rounded-lg font-medium">{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 h-8" >
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                {t('upgrade')}
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {/* <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem> */}
              <DropdownMenuItem className="gap-2 h-8" onSelect={() => setSettingsOpen(true)}>
                <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                {t('account')}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 h-8 justify-between group">
                <div className="flex items-center gap-2">
                  <GithubIcon className="h-4 w-4 text-muted-foreground" />
                  Github
                </div>
                <ExternalLinkIcon className="hidden group-hover:block h-4 w-4 text-muted-foreground" />
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 h-8">
                <MilestoneIcon className="h-4 w-4 text-muted-foreground" />
                {t('version', {
                  version: version()
                })}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4 text-muted-foreground" />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
    <AccountSettings
      open={settingsOpen}
      setOpen={setSettingsOpen}
    />
  </>;
}
