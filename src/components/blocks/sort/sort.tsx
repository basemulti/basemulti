"use client";

import type {
  Table
} from "@tanstack/react-table";
import React, { Usable, use, useEffect, useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowDownUpIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SortColumn from "./sort-column";
import SortDirection from "./sort-direction";
import ButtonLoading from "@/components/button-loading";
import type SchemaBuilder from "@/lib/schema-builder";
import type { SortsType } from "@/lib/schema-builder";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function Sort({ baseId, tableName, view, schemaBuilder, table, defaultSorts, disabled = false, onSortsChange }: {
  schemaBuilder: SchemaBuilder;
  table: Table<any>;
  tableName: string;
  baseId: string;
  view: string;
  defaultSorts: SortsType;
  disabled?: boolean;
  onSortsChange?: (sorts: SortsType) => Promise<any | void>;
}) {
  const [sorts, setSorts] = useState<SortsType>(defaultSorts);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('ViewBar.Sort');
  const defaultField = table.getAllColumns().find((column) => column.getCanHide())?.id as string;

  useEffect(() => {
    setSorts(defaultSorts);
  }, [view]);

  const handleAddSort = () => {
    setSorts([
      ...sorts,
      ['orderBy', [defaultField, 'asc']]
    ]);
  }

  const handleRemoveSort = (index: number) => {
    setSorts(sorts.filter((_, i) => i !== index));
  }

  const handleSaveSort = async () => {
    if (loading || !view) {
      return;
    }

    setLoading(true);
    onSortsChange ? onSortsChange(sorts)
      .then(result => {
        if (result?.error) {
          throw new Error(result.error);
        }
      })
      .catch((e) => {
        toast.error(e.message);
      })
      .finally(() => setLoading(false)) : setLoading(false);
  }

  return <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" className="h-8 px-2 gap-1" disabled={disabled}>
        <div className="flex flex-row items-center gap-2">
          <ArrowDownUpIcon className="size-4" /> {t('text')}
        </div>
        {(sorts.length > 0) && <div className="rounded-md bg-blue-100 text-blue-500 px-2 py-0.5 text-xs">{sorts.length}</div>}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="p-0 gap-2 w-min min-w-72" align="start">
      <div className="p-2">
        {sorts.length === 0 && <div className="p-2 text-gray-500 text-sm">{t('empty')}</div>}
        <div className="">
          {sorts.map(([method, params]: any, index: number) => {
            return <div key={index} className="my-1 flex items-center">
              <SortColumn
                params={params}
                index={index}
                table={table}
                sorts={sorts}
                setSorts={setSorts}
              />
              <SortDirection
                params={params}
                index={index}
                table={table}
                sorts={sorts}
                setSorts={setSorts}
              />
              <Button variant={'outline'} className="h-8 px-2 rounded-l-none border-l-0 text-xs" onClick={() => handleRemoveSort(index)}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>;
          })}
        </div>
        <div className="flex gap-2 justify-between mt-4">
          <div className="flex gap-2">
            <Button variant={'ghost'} className="px-2 py-1 text-sm h-auto gap-1" onClick={handleAddSort}>
              <PlusIcon className="h-4 w-4" /> {t('add_sort')}
            </Button>
          </div>
          <Button className="px-2 py-1 text-sm h-auto gap-1" onClick={handleSaveSort} disabled={loading}>
            <ButtonLoading loading={loading} />
            {t('save')}
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
}