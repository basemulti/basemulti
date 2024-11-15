"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronsUpDownIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import set from "lodash/set";
import { useSchemaStore } from "@/store/base";
import { FieldIcon } from "@/components/field-types";
import { useTranslations } from "next-intl";

export default function FilterColumn({ params, index, tableName, filters, setFilters }: {
  params: string[];
  index: number | string;
  tableName: string;
  filters: any[];
  setFilters: Function;
}) {
  const [open, setOpen] = useState(false);
  const schema = useSchemaStore(store => store.schema);
  const fields = schema?.getFields(tableName);
  const selectedColumn = schema?.getField(tableName, params[0]);
  const t = useTranslations('ViewBar.Filter');

  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button variant={'outline'} className="w-[120px] text-sm h-8 rounded-none bg-white">
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
          {Object.entries(fields ?? {}).map(([fieldName, field]) => {
            return (
              <CommandItem
                key={fieldName}
                className="capitalize w-full flex flex-row items-center gap-2 cursor-pointer"
                value={fieldName}
                onSelect={() => {
                  let newFilters = structuredClone(filters);
                  set(newFilters, `${index}.1`, [
                    fieldName,
                    '=',
                    ''
                  ]);
                  setFilters(newFilters);
                  setOpen(false);
                }}
              >
                <FieldIcon type={field?.ui?.type} />
                {field?.label}
              </CommandItem>
            )
          })}
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
}