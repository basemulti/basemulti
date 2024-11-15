"use client";

import type {
  Column,
  Table
} from "@tanstack/react-table";
import React from "react";
import { Button } from "@/components/ui/button";
import { EyeOffIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function Fields({ columnVisibility, table, onToggleField, disabled = false }: {
  columnVisibility: any;
  table: Table<any>;
  disabled?: boolean;
  onToggleField?: (fieldName: string, visibility: boolean) => Promise<any | void>;
}) {
  const t = useTranslations('ViewBar.Fields')
  const hideFieldsCount = Object.values(columnVisibility).filter(value => value === false).length;

  const handleToggleField = (column: Column<any, unknown>) => {
    const isVisible = column.getIsVisible();
    column.toggleVisibility();

    if (onToggleField) {
      onToggleField(column.id, !isVisible).then(result => {
        if (result?.error) {
          throw new Error(result.error);
        }
      })
      .catch((e) => {
        toast.error(e.message);
      })
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-8 px-2 gap-1" disabled={disabled}>
          <div className="flex gap-2 items-center">
            <EyeOffIcon className="size-4" /> {t('text')}
          </div>
          {hideFieldsCount > 0 && <div className="rounded-md bg-blue-100 text-blue-500 px-2 py-0.5 text-xs">{hideFieldsCount}</div>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command>
          <CommandInput placeholder={t('placeholder')} />
          <CommandEmpty>{t('empty')}</CommandEmpty>
          <CommandList className=" px-2 pt-2">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const def = column.columnDef as any;
                return (
                  <CommandItem
                    key={column.id}
                    className="capitalize w-full flex flex-row items-center justify-between gap-2 cursor-pointer"
                    value={column.id}
                    onSelect={() => handleToggleField(column)}
                  >
                    {def.title}
                    <Switch
                      className="w-[26px] h-[14px]"
                      buttonClassName="w-[10px] h-[10px] data-[state=checked]:translate-x-3"
                      checked={column.getIsVisible()}
                    />
                  </CommandItem>
                )
              })}
          </CommandList>
        </Command>
        <div className="p-2 flex flex-row items-center gap-2">
          <Button variant="secondary" className="flex-1 py-1 text-xs h-8" onClick={() => {
            table.toggleAllColumnsVisible(false);
          }}>{t('hide_all')}</Button>
          <Button variant="secondary" className="flex-1 py-1 text-xs h-8" onClick={() => {
            table.toggleAllColumnsVisible(true);
          }}>{t('show_all')}</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}