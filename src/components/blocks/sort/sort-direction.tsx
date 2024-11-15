"use client";

import type {
  Table,
} from "@tanstack/react-table";
import React, { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";

import { ArrowRightIcon, ChevronsUpDownIcon, SquareCheckIcon, SquareIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandItem, CommandList } from "@/components/ui/command";

const sortTypeBounds: any = {
  default: {
    high: 'Z',
    low: 'A'
  },
  number: {
    high: '9',
    low: '1'
  },
  switch: {
    high: <SquareCheckIcon className="size-3" />,
    low: <SquareIcon className="size-3" />
  },
  date: {
    high: 'Latest',
    low: 'Earliest',
  },
  datetime: {
    high: 'Latest',
    low: 'Earliest',
  }
}

export default function SortDirection({ params, index, table, sorts, setSorts }: {
  params: string[];
  index: number;
  table: Table<any>;
  sorts: any[];
  setSorts: Function;
}) {
  const [open, setOpen] = useState(false);
  const selectedColumn = table.getColumn(params[0])?.columnDef as any;

  const renderDirection = useCallback((direction: string) => {
    const typeBound = sortTypeBounds?.[selectedColumn?.meta?.type] || sortTypeBounds.default;

    if (direction === 'asc') {
      return <span className="flex flex-row gap-1 items-center">
        {typeBound.low} <ArrowRightIcon className="size-3" /> {typeBound.high}
      </span>
    } else {
      return <span className="flex flex-row gap-1 items-center">
        {typeBound.high} <ArrowRightIcon className="size-3" /> {typeBound.low}
      </span>
    }
  }, [selectedColumn?.meta?.type])

  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button variant={'outline'} className="w-[150px] text-sm h-8 rounded-none border-l-0 bg-white">
        <div className="flex flex-1 items-center truncate">
          {renderDirection(sorts[index][1][1])}
        </div>
        <ChevronsUpDownIcon className="size-3 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="p-0 w-auto">
      <Command>
        <CommandList className="min-w-[120px] p-2">
          <CommandItem
            key={'asc'}
            className="capitalize w-full flex flex-row items-center justify-between gap-2 cursor-pointer"
            value={'asc'}
            onSelect={() => {
              const newSorts = sorts.map((sort: any, i: number) => {
                if (i === index) {
                  return [
                    sort[0],
                    [
                      sort[1][0],
                      'asc'
                    ]
                  ];
                }
                return sort;
              });
              console.log('newSorts', newSorts)
              setSorts(newSorts);
              setOpen(false);
            }}
          >
            {renderDirection('asc')}
          </CommandItem>
          <CommandItem
            key={'desc'}
            className="capitalize w-full flex flex-row items-center justify-between gap-2 cursor-pointer"
            value={'desc'}
            onSelect={() => {
              const newSorts = sorts.map((sort: any, i: number) => {
                if (i === index) {
                  return [
                    sort[0],
                    [
                      sort[1][0],
                      'desc'
                    ]
                  ];
                }
                return sort;
              });
              console.log('newSorts', newSorts)
              setSorts(newSorts);
              setOpen(false);
            }}
          >
            {renderDirection('desc')}
          </CommandItem>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
}