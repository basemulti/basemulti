"use client";

import type {
  Table
} from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleAlertIcon, ListFilter, PlusIcon, TrashIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import FilterColumn from "./filter-column";
import FilterOperator from "./filter-operator";
import FilterMethod from "./filter-method";
import FilterGroup from "./filter-group";
import ButtonLoading from "@/components/button-loading";
import type SchemaBuilder from "@/lib/schema-builder";
import { FiltersType } from "@/lib/schema-builder";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function Filter({ tableName, view, table, defaultFilters, onFiltersChange, disabled = false }: {
  schemaBuilder: SchemaBuilder;
  table: Table<any>;
  tableName: string;
  view: string;
  defaultFilters?: FiltersType;
  onFiltersChange?: (filters: FiltersType) => Promise<any | void>;
  disabled?: boolean;
}) {
  const [filters, setFilters] = useState<any>(defaultFilters);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('ViewBar.Filter');

  const defaultColumn = table.getAllColumns().find(column => column.getCanHide());

  useEffect(() => {
    setFilters(defaultFilters);
  }, [view]);

  const handleAddFilter = () => {
    const method = filters.length > 1 ? filters[1][0] : 'where';
    setFilters([
      ...filters,
      [method, [defaultColumn?.id, '=', '']],
    ]);
  }

  const handleAddFilterGroup = () => {
    const method = filters.length > 1 ? filters[1][0] : 'where';
    setFilters([
      ...filters,
      [method, [
        ['where', [defaultColumn?.id, '=', '']]
      ]],
    ]);
  }

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_: any, i: number) => i !== index));
  }

  const handleSetFilters = () => {
    if (loading) {
      return ;
    }

    setLoading(true);
    onFiltersChange ? onFiltersChange(filters)
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
          <ListFilter className="h-4 w-4" /> {t('text')}
        </div>
        {filters.length > 0 && <div className="rounded-md bg-blue-100 text-blue-500 px-2 py-0.5 text-xs">{filters.length}</div>}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="min-w-[480px] p-0 gap-2 w-min" align="start">
      <div className="flex items-center gap-3 bg-slate-100 py-2 px-4">
        <CircleAlertIcon className="size-4 text-slate-500" />
        <div className="text-[11px] text-slate-500 flex-1">{t('alert')}</div>
      </div>
      <div className="">
        {filters.length === 0 && <div className="px-4 pt-4 text-gray-500 text-sm">{t('empty')}</div>}
        {filters.length > 0 && <div className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
          {filters.map(([method, params]: any, index: number) => {
            if (typeof params[0] === 'string') {
              return <div key={index} className="my-1 flex items-center">
                <FilterMethod
                  filters={filters}
                  setFilters={setFilters}
                  method={method}
                  params={params}
                  index={index}
                />
                <FilterColumn
                  params={params}
                  index={index}
                  tableName={tableName}
                  filters={filters}
                  setFilters={setFilters}
                />
                <FilterOperator
                  filters={filters}
                  setFilters={setFilters}
                  params={params}
                  index={index}
                  tableName={tableName}
                />
                <Button variant={'outline'} className="h-8 px-2 rounded-l-none border-l-0 text-xs" onClick={() => handleRemoveFilter(index)}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>;
            }

            return <FilterGroup
              key={index}
              filters={filters}
              setFilters={setFilters}
              method={method}
              params={params}
              index={index}
              tableName={tableName}
            />;
          })}
        </div>}
        <div className="flex gap-2 justify-between p-2">
          <div className="flex gap-2">
            <Button variant={'ghost'} className="px-2 py-1 text-sm h-auto gap-1" onClick={handleAddFilter}>
              <PlusIcon className="h-4 w-4" /> {t('add_filter')}
            </Button>
            <Button variant={'ghost'} className="px-2 py-1 text-sm h-auto gap-1" onClick={handleAddFilterGroup}>
              <PlusIcon className="h-4 w-4" /> {t('add_filter_group')}
            </Button>
          </div>
          <Button className="px-2 py-1 text-sm h-auto gap-1" onClick={handleSetFilters} disabled={loading}>
            <ButtonLoading loading={loading} />
            {t('save')}
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>;
}