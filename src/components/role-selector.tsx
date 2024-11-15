'use client'

import { Button } from "@/components/ui/button";
import { Fragment, useState } from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { RoleType } from "@/lib/types";
import { useTranslations } from "next-intl";

const roles: {
  name: RoleType;
}[] = [
  {
    name: 'creator',
  },
  {
    name: 'editor',
  },
  {
    name: 'viewer',
  },
  {
    name: 'owner',
  },
]

export default function RoleSelector({ className, roleName, align = 'end', onSelect, disabled = false }: {
  roleName: string;
  className?: string;
  align?: "center" | "end" | "start" | undefined;
  disabled?: boolean;
  onSelect?: (role: RoleType) => void;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('Roles');

  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        disabled={disabled}
        className={cn(
          "justify-between gap-2 h-8 px-3 bg-background w-[100px]",
          className
        )}
      >
        <div className={cn("flex items-center gap-1", 'flex-wrap')}>
          {t(roles.find(role => role.name === roleName)?.name ?? 'no_access')}
        </div>
        <CaretSortIcon className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent align={align} className="p-0">
      <Command>
        <CommandList>
          <CommandGroup>
            {roles?.map((role, index: number) => <Fragment key={role.name}>
              {role.name === 'owner' && <CommandSeparator className="my-1" />}
              <CommandItem
                className="flex flex-col items-start cursor-pointer"
                value={role.name}
                key={role.name}
                onSelect={() => {
                  onSelect && onSelect(role.name);
                  setOpen(false);
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm font-medium">{t(role.name)}</div>
                  <CheckIcon
                    className={cn(
                      "size-3",
                      role.name === roleName
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </div>
                <div className="text-xs text-gray-500">{t(role.name + '_description')}</div>
              </CommandItem>
            </Fragment>)}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>;
}