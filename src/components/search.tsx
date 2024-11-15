"use client";

import React, { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronsUpDownIcon, XIcon } from "lucide-react";
import debounce from 'lodash/debounce';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import SchemaBuilder from "@/lib/schema-builder";
import { FieldIcon } from "./field-types";

export default function Search({ schema, tableName, paramPrefix, onChange }: {
  schema: SchemaBuilder;
  tableName: string;
  paramPrefix: string;
  onChange?: (data: { fieldName: string, value: string }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const defaultField = schema.getPrimaryKey(tableName) as string;

  const [searchField, setSearchField] = useState(defaultField);
  const [open, setOpen] = useState(false);

  const debounceFn = useCallback(debounce((value) => {
    onChange && onChange({
      fieldName: searchField, 
      value: value
    });
  }, 500, {
    leading: false,
    trailing: true
  }), [searchField]);

  const handleSelectField = (name: string) => {
    setSearchField(name);
    setOpen(false);
    
    if (value) {
      onChange && onChange({
        fieldName: name, 
        value: value
      });
    }
  };

  const handleChangeValue = (e: any) => {
    setValue(e.target.value.trim());
    debounceFn(e.target.value.trim());
  }

  const handleClear = () => {
    onChange && onChange({
      fieldName: searchField, 
      value: ''
    });
    setValue('');
  };

  const fields = schema.getFields(tableName);
  const field = fields[searchField];

  return <div className="flex items-center relative">
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={'outline'} className="w-[100px] text-sm h-8 rounded-r-none border-r-0 px-2 bg-white" onClick={() => setOpen(true)}>
          <div className="flex flex-1 items-center truncate">
            <FieldIcon className="size-3 mr-2" type={field.ui.type} />
            {field.label}
          </div>
          <ChevronsUpDownIcon className="size-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command>
          <CommandInput placeholder="Search field..." />
          <CommandEmpty>No results.</CommandEmpty>
          <CommandList className="p-2">
            {Object.entries(fields).map(([fieldName, field]) => {
                return (
                  <CommandItem
                    key={fieldName}
                    className="capitalize w-full flex flex-row items-center justify-between gap-2 cursor-pointer"
                    value={fieldName}
                    onSelect={() => handleSelectField(fieldName)}
                  >
                    <div className="flex items-center gap-2">
                      <FieldIcon className="size-3" type={field.ui.type} />
                      {field.label}
                    </div>
                  </CommandItem>
                )
              })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <Input
      ref={inputRef}
      placeholder={`Search...`}
      // defaultValue={searchQ ?? ''}
      value={value ?? ""}
      onChange={handleChangeValue}
      className="w-full md:max-w-xs bg-background h-8 rounded-l-none focus-visible:ring-0"
    />
    {setValue.length > 0 && <button
      className="absolute inset-y-px right-px flex h-full w-9 items-center justify-center rounded-r-lg border border-transparent text-muted-foreground/80 ring-offset-background transition-shadow animate-in fade-in zoom-in-75 hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Clear input"
      onClick={handleClear}
    >
      <XIcon className="size-4" strokeWidth={2} aria-hidden="true" role="presentation" />
    </button>}
  </div>
}