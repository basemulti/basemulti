import { ChevronsUpDownIcon, DatabaseIcon, Undo2Icon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "@/database";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { getCurrentUser } from "@/lib/server";
import { cache } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTranslations } from "next-intl/server";

function getSelectedBase(workspaces: any, baseId: string) {
  for (let workspace of workspaces) {
    for (let base of workspace.bases) {
      if (`${base.id}` === baseId) {
        return {
          workspace: workspace.label,
          base: base.label,
          icon: base.icon,
          workspaceId: workspace.id,
          baseId: base.id,
        };
      }
    }
  }

  return {
    workspace: 'No workspace selected',
    base: 'No base selected',
    icon: 'No icon selected',
  }
}

const colors = [
  'bg-red-300',
  'bg-yellow-300',
  'bg-green-300',
  'bg-blue-300',
  'bg-indigo-300',
  'bg-purple-300',
  'bg-cyan-300',
  'bg-pink-300',
  'bg-amber-300',
  'bg-lime-300',
  'bg-emerald-300',
  'bg-teal-300',
  'bg-sky-300',
  'bg-violet-300',
];

function stringToNumber(str: string) {
  // return str.charCodeAt(0);
  let num = 0;
  for(let i = 0; i < str.length; i++) {
    num += str.charCodeAt(i);
  }
  return num;
}

const getWorkspaces = cache(User.getWorkspaces);

export default async function BaseSelector({ params }: any) {
  const viewer = await getCurrentUser();
  const workspaces = await getWorkspaces(viewer as User);
  const selected = getSelectedBase(workspaces.toData(), params.baseId);
  const t = await getTranslations('BaseSidebar.BaseSelector');

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center justify-between p-1 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground flex-1">
            <div className="truncate flex items-center gap-3">
              <Avatar className="rounded-md w-7 h-7">
                <AvatarImage src="" />
                <AvatarFallback className={cn("rounded-md font-bold", colors[stringToNumber(selected?.base) % 13])}>{selected?.base?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col max-w-56">
                {/* <div className="text-[11px] text-muted-foreground">
                  {selected?.workspace}
                </div> */}
                <h2 className="text-base font-semibold tracking-tight truncate">
                  {selected?.base}
                </h2>
              </div>
            </div>
            <ChevronsUpDownIcon className="size-3 text-primary/60" />
          </div>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0">
          <Command>
            <CommandInput className="h-9" placeholder={t('search_placeholder')} />
            <CommandList>
              <CommandEmpty>{t('search_empty')}</CommandEmpty>
              {workspaces.toData().map((workspace: any) => <CommandGroup key={workspace.id} heading={workspace.label}>
                {workspace.bases.map((base: any) => <CommandItem key={base.id} value={`${base.id}-${base.label}`} asChild>
                  <Link className="cursor-pointer" href={`/bases/${base.id}`}>
                    <div className="flex items-center gap-2 ">
                      <DatabaseIcon className="h-4 w-4" />
                      <span className="max-w-52 truncate">{base.label}</span>
                    </div>
                  </Link>
                </CommandItem>)}
              </CommandGroup>)}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/workspaces/${selected.workspaceId}`}>
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
  );
}