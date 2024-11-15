"use client";

import type {
  Table,
} from "@tanstack/react-table";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";

import { ChevronsUpDownIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useTranslations } from "next-intl";

export default function SortColumn({ params, index, table, sorts, setSorts }: {
  params: string[];
  index: number;
  table: Table<any>;
  sorts: any[];
  setSorts: Function;
}) {
  const [open, setOpen] = useState(false);
  const selectedColumn = table.getColumn(params[0])?.columnDef as any;
  const t = useTranslations('ViewBar.Sort');

  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button variant={'outline'} className="w-[150px] text-sm h-8 rounded-r-none bg-white">
        <div className="flex flex-1 items-center truncate">
          {selectedColumn?.label ?? params[0]}
        </div>
        <ChevronsUpDownIcon className="size-3 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="p-0 w-auto">
      <Command>
        <CommandInput placeholder={t('search_placeholder')} />
        <CommandEmpty>{t('search_empty')}</CommandEmpty>
        <CommandList className=" p-2 max-h-[300px]">
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
                  onSelect={() => {
                    const newSorts = sorts.map((sort: any, i: number) => {
                      if (i === index) {
                        return [
                          sort[0],
                          [
                            column.id,
                            sort[1][1]
                          ]
                        ];
                      }
                      return sort;
                    });
                    setSorts(newSorts);
                    setOpen(false);
                  }}
                >
                  {def.title}
                </CommandItem>
              )
            })}
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
}