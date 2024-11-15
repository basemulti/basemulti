"use client";

import type {
  Table
} from "@tanstack/react-table";
import React, { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronsUpDownIcon, XIcon } from "lucide-react";
import debounce from 'lodash/debounce';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { parseAsString, useQueryStates } from "nuqs";
import useTransitionProgress from "@/hooks/use-transition-progress";
import { useTranslations } from "next-intl";

export default function Search({ table, paramPrefix, onChange }: {
  table: Table<any>;
  paramPrefix: string;
  onChange?: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [canClear, setCanClear] = useState(false);
  const t = useTranslations('ViewBar.Search');
  const { startTransition } = useTransitionProgress();
  const defaultField = table.getAllColumns().find((column) => column.getCanHide())?.id as string;

  const [{ search_q: searchQ, search_field: searchQueryField }, setSearch] = useQueryStates({
    search_field: parseAsString.withDefault(defaultField),
    search_q: parseAsString,
    // page: parseAsInteger,
  }, {
    shallow: false,
    startTransition: startTransition,
  });

  const [searchField, setSearchField] = useState(searchQueryField);
  const [open, setOpen] = useState(false);

  const debounceFn = useCallback(debounce((value) => {
    setSearch({
      search_q: value || null,
      search_field: value ? searchField : null,
    });
    onChange && onChange(value);
  }, 500, {
    leading: false,
    trailing: true
  }), [searchQ, searchField]);

  const handleSelectField = (name: string) => {
    setSearchField(name);
    setOpen(false);
    
    if (searchQ) {
      setSearch({
        search_field: name,
      });
      onChange && onChange(searchQ);
    }
  };

  const handleChangeValue = (e: any) => {
    if (e.target.value.trim()?.length > 0) {
      setCanClear(true);
    }

    debounceFn(e.target.value.trim());
  }

  const handleClear = () => {
    setSearch({
      search_q: null,
      search_field: null,
    });
    onChange && onChange('');
    setCanClear(false);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const field = table.getColumn(searchField)?.columnDef as any;

  return <div className="flex items-center relative">
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={'outline'} className="w-[100px] text-sm h-8 rounded-r-none border-r-0 px-2 bg-white" onClick={() => setOpen(true)}>
          <div className="flex flex-1 items-center truncate">
            {field?.title}
          </div>
          <ChevronsUpDownIcon className="size-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command>
          <CommandInput placeholder={t('search_placeholder')} />
          <CommandEmpty>{t('search_empty')}</CommandEmpty>
          <CommandList className="p-2">
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
                    onSelect={() => handleSelectField(column.id)}
                  >
                    {def.title}
                  </CommandItem>
                )
              })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <Input
      ref={inputRef}
      placeholder={t('placeholder')}
      defaultValue={searchQ ?? ''}
      // value={searchValue ?? ""}
      onChange={handleChangeValue}
      className="w-full md:max-w-xs h-8 rounded-l-none focus-visible:ring-0"
    />
    {canClear && <button
      className="absolute inset-y-px right-px flex h-full w-9 items-center justify-center rounded-r-lg border border-transparent text-muted-foreground/80 ring-offset-background transition-shadow animate-in fade-in zoom-in-75 hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Clear input"
      onClick={handleClear}
    >
      <XIcon className="size-4" strokeWidth={2} aria-hidden="true" role="presentation" />
    </button>}
  </div>
}