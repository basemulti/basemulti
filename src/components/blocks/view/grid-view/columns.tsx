"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { selectId } from "@/lib/utils";
import { startCase } from 'lodash';
import { Button } from "@/components/ui/button";
import { CaretDownIcon, CaretSortIcon, CaretUpIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Maximize2Icon } from "lucide-react";
import { FieldIcon } from "@/components/field-types";
import SchemaBuilder, { getUISchema, WebhookSchemaType } from "@/lib/schema-builder";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ModalDetail from "@/components/details/modal-detail";
import { useGlobalStore } from "@/store/global";

export type ColumnListDef = ColumnDef<any, { style?: React.CSSProperties, title?: string }>;

export const getColumns = (tableName: string, schema?: SchemaBuilder, canUpdate?: boolean) => {
  if (!schema || !schema.hasTable(tableName)) {
    return [];
  }
  const table = schema.getTableSchema(tableName);

  const primaryKeyName = schema.getPrimaryKey(tableName);
  const actionsDisabled = !canUpdate;

  const columns: any[] = [];
  Object.keys(table.fields).map((field: string) => {
    const fieldSchema = schema.getField(tableName, field);
    const uiSchema = fieldSchema.ui;

    // if (fieldSchema['ui:display'] == false) {
    //   return;
    // }

    columns.push({
      accessorKey: field,
      header: <div className="flex flex-row items-center gap-1">
        <FieldIcon type={uiSchema.type} />
        {fieldSchema.label}
      </div>,
      schema: fieldSchema,
      uiSchema: uiSchema,
    })
  })

  const newColumns: ColumnListDef[] = columns.map(column => ({
    accessorKey: column.accessorKey,
    title: column.header,
    meta: {
      type: column.uiSchema.type,
    },
    header: (props: any) => {
      return (
        <div
          className="size-full flex items-center justify-start whitespace-nowrap font-medium transition-colors text-sm h-8 cursor-pointer"
          onClick={props.column.getToggleSortingHandler()}
        >
          {column.header}
          {{
            asc: <CaretUpIcon className="ml-1 h-4 w-4" />,
            desc: <CaretDownIcon className="ml-1 h-4 w-4" />,
          }[props.column.getIsSorted() as string] ?? <CaretSortIcon className="ml-1 h-4 w-4" />}
        </div>
      )
    },
    enableSorting: true,
    style: column?.schema?.['ui:header'] ? { ...column?.schema?.['ui:header'] } : undefined
  }));

  // newColumns.push({
  //   id: createFieldId,
  //   header: ({ table }) => (
  //     <div className="flex flex-row items-center gap-2">
  //       {!actionsDisabled && <div className="w-4 h-4"></div>}
  //       <Checkbox
  //         checked={table.getIsAllPageRowsSelected()}
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //       <
  //       <div className="w-4 h-4"></div>
  //     </div>
  //   ),
  //   cell: ({ row }) => (
  //     <div className="flex flex-row items-center gap-2">
  //     </div>
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // })

  const actions: WebhookSchemaType[] = [];
  Object.entries(table?.webhooks || {}).forEach(([webhookId, webhook]) => {
    if (webhook?.type === 'action') {
      actions.push(webhook);
    }
  });

  newColumns.unshift({
    id: selectId,
    header: ({ table }) => (
      <div className="flex flex-row items-center gap-2">
        {!actionsDisabled && <div className="w-4 h-4"></div>}
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
        <div className="w-4 h-4"></div>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex flex-row items-center gap-2">
        <CellAction
          data={row.original}
          meta={{
            baseId: schema.schema.id,
            tableName: tableName,
          }}
          primaryKey={primaryKeyName as string}
          actions={actions}
          actionsDisabled={actionsDisabled}
        />
        <Checkbox
          className="shadow-none"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
        {primaryKeyName ? (
          // <Link href={`/bases/${schema.id}/tables/${tableName}/${row.original[primaryKeyName]}`}>
            <div className="h-4 w-4" onClick={() => {
              useGlobalStore.getState().openDetailModal({
                baseId: schema.schema.id,
                tableName: tableName,
                recordId: row.original[primaryKeyName],
              });
            }}>
              <Maximize2Icon className="h-4 w-4 cursor-pointer hidden group-hover:block" />
            </div>
          // </Link>
        ) : <Tooltip>
          <TooltipTrigger asChild>
            <div className="h-4 w-4 opacity-50">
              <Maximize2Icon className="h-4 w-4 cursor-pointer hidden group-hover:block" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="z-100">
            <p>No primary key, denies open.</p>
          </TooltipContent>
        </Tooltip>}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  })

  return newColumns;
}
