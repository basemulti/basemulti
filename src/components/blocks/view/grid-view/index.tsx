"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useMemo, useState } from "react";
import { TableVirtuoso } from 'react-virtuoso';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/grid-table";
import { PlusIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Cell from "./cell";
import { getColumns } from "./columns";
import { cn, selectId } from "@/lib/utils";
import Sort from "@/components/blocks/sort/sort";
import Filter from "@/components/blocks/filter/filter";
import Fields from "@/components/blocks/fields/fields";
import Pagination from "@/components/blocks/pagination/pagination";
import Search from "../search";
import SchemaBuilder, { FiltersType, SortsType, WebhookSchemaType } from "@/lib/schema-builder";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGlobalStore } from "@/store/global";
import { setViewFields, setViewFilter, setViewSort } from "@/actions/view";
import { toast } from "sonner";
import { useSchemaStore } from "@/store/base";
import { parseAsInteger, useQueryState, useQueryStates } from "nuqs";
import useTransitionProgress from "@/hooks/use-transition-progress";
import CreateRecordButton from "../create-record-button";
import BulkActions from "../bulk-actions";
import { useTranslations } from "next-intl";

interface DataTableProps<TData, TValue> {
  data: {
    current_page: number;
    data: any[];
    per_page: number;
    total: number;
    count: number;
    last_page: number;
  };
  view?: string;
  schema: any;
  baseId: string;
  tableName: string;
  prefix?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  className?: string;
  hideCreateButton?: boolean;
  isSharingPage?: boolean;
}

export function GridView<TData, TValue>({
  schema,
  baseId,
  tableName,
  prefix,
  data,
  pageSizeOptions = [15, 30, 50, 100],
  defaultPageSize = 15,
  className,
  hideCreateButton = false,
  isSharingPage = false,
}: DataTableProps<TData, TValue>) {
  const schemaBuilder = SchemaBuilder.make(schema);
  const provider = schemaBuilder.getProvider() as string;
  const paramPrefix = prefix ? prefix + '_' : '';
  const { relationName }: {
    relationName: string;
  } = useParams();
  // Search params
  const [view] = useQueryState('tab', {
    defaultValue: schemaBuilder.getDefaultViewId(tableName) as string
  })
  const { allows, denies } = useGlobalStore(store => ({
    allows: store.allows,
    denies: store.denies,
  }));
  const updateSchema = useSchemaStore(store => store.updateSchema);
  const { startTransition } = useTransitionProgress();
  const t = useTranslations('GridView');

  const [{ page, limit }, setPagination] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(defaultPageSize),
  }, {
    shallow: false,
    startTransition: startTransition,
  });

  function getViewSchema() {
    if (relationName) {
      return {} as any;
    } else {
      return schemaBuilder.table(tableName).view(view);
    }
  }

  const viewSchema = getViewSchema();

  const columns = useMemo(() => {
    if (tableName && schema) {
      return getColumns(tableName, schemaBuilder, allows(baseId, 'base', "record:update"));
    } else {
      return [];
    }
  }, [tableName, schema]);

  const tableSchema = schemaBuilder.table(tableName);
  const actions: WebhookSchemaType[] = [];
  Object.values(schemaBuilder.getWebhooks(tableName) || {}).forEach(webhook => {
    if (webhook?.type === 'bulk-action') {
      actions.push(webhook);
    }
  })

  /* this can be used to get the selectedrows 
  console.log("value", table.getFilteredSelectedRowModel()); */

  const [sort, setSorting] = useQueryState(paramPrefix + "sort", {
    shallow: false,
    startTransition: startTransition,
  });

  const [filters, setFilters] = useQueryState(paramPrefix + "filters", {
    shallow: false,
    startTransition: startTransition,
  });

  const [sorts, setSorts] = useQueryState(paramPrefix + "sorts", {
    shallow: false,
    startTransition: startTransition,
  });

  const sorting = sort ? [{
    id: sort.split(' ')[0],
    desc: sort.split(' ')[1] === 'desc',
  }] : [];

  const [columnVisibility, setColumnVisibility] = useState(viewSchema.fields ?? {});

  useEffect(() => {
    setColumnVisibility(viewSchema.fields ?? {});
  }, [view]);

  const table = useReactTable({
    data: data?.data || [],
    columns: columns,
    pageCount: data?.last_page || 0,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: { pageIndex: page - 1, pageSize: limit },
      sorting: sorting,
      columnVisibility,
    },
    onSortingChange: ((callback: any) => {
      setSorting((oldState) => {
        const sorting = oldState ? [{
          id: oldState.split(' ')[0],
          desc: oldState.split(' ')[1] === 'desc',
        }] : [];

        const value = callback(sorting);
        return value.length > 0 ? `${value.map(({ id, desc }: any) => {
          return `${id} ${desc ? "desc" : "asc"}`;
        })}` : null;
      });
    }),
    onPaginationChange: ((callback: any) => {
      setPagination((oldState) => {
        const value = callback({
          pageIndex: oldState.page - 1,
          pageSize: oldState.limit
        });
        return {
          page: value.pageIndex + 1,
          limit: value.pageSize
        }
      });
    }),
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  const { rows } = table.getRowModel();

  const handleChangeFilters = async (filters: FiltersType) => {
    if (relationName) {
      setFilters(
        filters.length > 0 ? btoa(JSON.stringify(filters)) : null
      );
      return;
    }

    if (view) {
      await setViewFilter({
        baseId: baseId,
        tableName: tableName,
        viewId: view,
        filters,
      });
    }
  }

  const handleChangeSorts = async (sorts: SortsType) => {
    if (relationName) {
      setSorts(
        sorts.length > 0 ? btoa(JSON.stringify(sorts)) : null
      )
      return;
    }

    await setViewSort({
      baseId: baseId,
      tableName: tableName,
      viewId: view,
      sorts
    });
  }

  const handleToggleField = (fieldName: string, visibility: boolean) => {
    const sync = relationName ? false : true;
    if (sync) {
      const fields = {
        ...columnVisibility,
        [fieldName]: visibility,
      };

      const fieldedFields = Object.keys(fields).reduce((acc: Record<string, boolean>, key) => {
        if (fields[key] === false) {
          acc[key] = fields[key];
        }
        return acc;
      }, {});

      setViewFields({
        baseId: baseId,
        tableName: tableName,
        viewId: view,
        fields: fieldedFields,
      }).then((result) => {
        if (result?.error) {
          throw new Error(result.error);
        }
        updateSchema(`tables.${table}.views.${view}.fields`, fields);
      }).catch(e => {
        toast.error(e.message);
      });
    }
  };

  const defaultFilters = useMemo(() => {
    let defaultFilters: any = [];
    const searchFilters = filters ?? '[]';
    try {
      defaultFilters = JSON.parse(atob(searchFilters));
    } catch (e) {}
    return defaultFilters = relationName ? defaultFilters : viewSchema.filters;
  }, [relationName, filters, viewSchema.filters]);
  
  const defaultSorts = useMemo(() => {
    let defaultSorts: SortsType = [];
    try {
      defaultSorts = JSON.parse(atob(sorts || '') ?? '[]');
    } catch (e) {}
  
    return defaultSorts = relationName ? defaultSorts : viewSchema?.sorts || [];
  }, [relationName, sorts, viewSchema.sorts]);
  

  return (
    <>
      <div className="flex items-center justify-between px-5">
        <div className="h-[50px] flex flex-row items-center gap-2">
          <Fields
            columnVisibility={columnVisibility}
            table={table}
            disabled={denies(baseId, 'base', 'view:update')}
            onToggleField={async (fieldName, visibility) => {
              await handleToggleField(fieldName, visibility);
            }}
          />
          <Filter
            schemaBuilder={schemaBuilder}
            table={table}
            tableName={tableName}
            view={view}
            disabled={denies(baseId, 'base', 'view:update')}
            defaultFilters={defaultFilters}
            onFiltersChange={handleChangeFilters}
          />
          <Sort
            schemaBuilder={schemaBuilder}
            table={table}
            baseId={baseId}
            tableName={tableName}
            view={view}
            defaultSorts={defaultSorts}
            disabled={!!sort || denies(baseId, 'base', 'view:update')}
            onSortsChange={handleChangeSorts}
          />
          {(!isSharingPage && table.getFilteredSelectedRowModel().rows.length > 0) && (
            <BulkActions
              baseId={baseId}
              tableName={tableName}
              primaryKey={schemaBuilder.getPrimaryKey(tableName)}
              rows={table.getFilteredSelectedRowModel().rows.map((row: any) => row.original)}
              actions={actions}
              onReset={table.resetRowSelection}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Search table={table} paramPrefix={paramPrefix} onChange={(value) => {
            setPagination({
              page: 1,
              limit: limit,
            })
          }} />
          {allows(baseId, 'base', 'record:create') && <CreateRecordButton baseId={baseId} tableName={tableName}>
            <Button variant="outline" className="px-2 h-8 gap-2">
              <PlusIcon className="size-4" /> {t('create')}
            </Button>
          </CreateRecordButton>}
          {/* {(denies(baseId, 'base', 'record:create')
          ? <Button variant="outline" className="px-2 h-8 gap-2" disabled={true}>
            <PlusIcon className="size-4" /> Create
          </Button>
          : <Link
            href={`/bases/${baseId}/tables/${tableName}/create`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              'px-2 h-8 gap-2',
            )}
          >
            <PlusIcon className="size-4" /> Create
          </Link>)} */}
        </div>
      </div>
      {rows.length > 80 ? <div className={cn("border-t h-[calc(100vh-200px)]", className)}>
        <TableVirtuoso
          totalCount={rows.length}
          fixedItemHeight={36}
          components={{
            Table: ({ style, ...props }) => {
              return (
                // <table
                //   {...props}
                //   style={{
                //     ...style,
                //     width: "100%",
                //     tableLayout: "fixed",
                //     borderCollapse: "collapse",
                //     borderSpacing: 0
                //   }}
                // />
                <Table className="whitespace-nowrap" {...props} style={{...style}} />
              );
            },
            TableRow: (props) => {
              const index = props["data-index"];
              const row = rows[index];
  
              return (
                // <tr {...props}>
                //   {row.getVisibleCells().map((cell) => (
                //     <td key={cell.id} style={{ padding: "6px" }}>
                //       {Tanstack.flexRender(cell.column.columnDef.cell, cell.getContext())}
                //     </td>
                //   ))}
                // </tr>
                <TableRow
                  {...props}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-9 group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <Popover key={cell.id}>
                      <PopoverTrigger asChild>
                        <TableCell key={cell.id} className={cn("border-b border-r border-border max-h-9 py-0 pl-2 max-w-[30rem] overflow-hidden bg-white",
                          cell.column.id === selectId && 'sticky left-0 w-20',
                          cell.column.id === selectId && denies(baseId, 'base', "record:update") && 'w-14',
                        )}>
                          <Cell
                            ui={tableSchema.field(cell.column.id).ui()}
                            cell={cell}
                            baseId={baseId}
                            tableName={tableName}
                            provider={provider}
                            isSharingPage={isSharingPage}
                          />
                        </TableCell>
                      </PopoverTrigger>
                      <PopoverContent sideOffset={-36} align="start" className="w-[--radix-popover-trigger-width] shadow-none p-2 border-black min-h-9  max-h-[360px] rounded-none overflow-auto" noAnimate>
                        <div className="text-sm">
                          <Cell
                            ui={tableSchema.field(cell.column.id).ui()}
                            cell={cell}
                            preview={true}
                            baseId={baseId}
                            tableName={tableName}
                            provider={provider}
                            isSharingPage={isSharingPage}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))}
                </TableRow>
              );
            }
          }}
          fixedHeaderContent={() => {
            return table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-9 bg-primary-foreground z-20">
                {headerGroup.headers.map((header) => {
                  const columnDef = header.column.columnDef as any;
                  return (
                    <TableHead key={header.id} className={cn(
                      "border-slate-100 max-w-[30rem] border-b border-r bg-primary-foreground",
                      header.id === selectId && 'w-20 sticky left-0',
                      header.id === selectId && denies(baseId, 'base', "record:update") && 'w-14',
                    )} style={{
                      ...columnDef.style,
                    }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ));
          }}
        />
      </div>
      : (
        <ScrollArea className={cn("border-t flex-1 h-full overflow-hidden", className)}>
          <Table className="whitespace-nowrap">
            <TableHeader className="bg-background [&_tr]:border-b [&_tr]:border-border sticky shadow-sm top-0 z-20">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="h-9">
                  {headerGroup.headers.map((header) => {
                    const columnDef = header.column.columnDef as any;
                    return (
                      <TableHead key={header.id} className={cn("border-border/80 max-w-[30rem] border-b border-r bg-background",
                        header.id === selectId && 'w-20 sticky left-0',
                        header.id === selectId && denies(baseId, 'base', "record:update") && 'w-14',
                      )}
                        style={{
                        ...columnDef.style,
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows?.length ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="h-9 group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      cell.column.id === selectId
                      ? <TableCell key={cell.id} className={cn(
                          "border-b border-r border-r-border/80 max-h-9 py-0 pl-2 max-w-[30rem] overflow-hidden bg-background relative",
                          'w-20 sticky left-0 shadow-sm z-20',
                          denies(baseId, 'base', "record:update") && 'w-14',
                        )}>
                          <Cell
                            ui={tableSchema.field(cell.column.id).ui()}
                            cell={cell}
                            baseId={baseId}
                            tableName={tableName}
                            provider={provider}
                            isSharingPage={isSharingPage}
                          />
                        </TableCell>
                      : <Popover key={cell.id}>
                        <PopoverTrigger asChild>
                          <TableCell key={cell.id} className={cn(
                            "border-b border-r border-border/80 max-h-9 py-0 pl-2 max-w-[30rem] overflow-hidden bg-background relative",
                          )}>
                            <Cell
                              ui={tableSchema.field(cell.column.id).ui()}
                              cell={cell}
                              baseId={baseId}
                              tableName={tableName}
                              provider={provider}
                              isSharingPage={isSharingPage}
                            />
                          </TableCell>
                        </PopoverTrigger>
                        <PopoverContent sideOffset={-36} align="start" className="w-[--radix-popover-trigger-width] shadow-none p-2 border-black min-h-9 rounded-sm max-h-[360px] overflow-auto" noAnimate>
                          <div className="text-sm">
                            <Cell
                              ui={tableSchema.field(cell.column.id).ui()}
                              cell={cell}
                              preview={true}
                              baseId={baseId}
                              tableName={tableName}
                              provider={provider}
                              isSharingPage={isSharingPage}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center border-b border-r border-border/80"
                  >
                    {t('empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
      <Pagination
        page={page}
        limit={limit}
        total={data?.total}
        currentPage={data?.current_page}
        lastPage={data?.last_page}
        pageSizeOptions={pageSizeOptions}
        onPageChange={(page: number) => {
          table.setPageIndex(page - 1);
        }}
        onLimitChange={(limit: number) => {
          table.setPageSize(limit);
        }}
      />
    </>
  );
}
