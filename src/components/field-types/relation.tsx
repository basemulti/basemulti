import { cn } from "@/lib/utils";
import { FormControl, FormField, FormLabel, FormMessage, FormItem } from "../ui/form";
import 'react-markdown-editor-lite/lib/index.css';
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo, useState } from "react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import type { TypeEditorProps } from "./types";
import { Label } from "../ui/label";
import { useSchemaStore } from "@/store/base";
import { String } from "aws-sdk/clients/apigateway";
import startCase from "lodash/startCase";
import { useGlobalStore } from "@/store/global";
import { useFormContext } from "react-hook-form";
import Search from "../search";
import SchemaBuilder from "@/lib/schema-builder";
import { Separator } from "../ui/separator";
import { ArrowUpRightIcon, Maximize2Icon, MinusIcon, PlusIcon } from "lucide-react";
import SimplePagination from "../blocks/pagination/simple-pagination";
import ModalDetailButton from "../details/modal-detail-button";
import { FieldIcon } from ".";
import ButtonLoading from "../button-loading";

export const key = 'relation';
export const label = 'Relation';

export function Icon({ className }: {
  className?: string;
}) {
  return <ArrowUpRightIcon className={className} />;
}

export function Value({ value, schema, row, baseId, tableName, isSharingPage }: any) {
  const { open } = useGlobalStore((store) => ({
    open: store.openDetailModal
  }));
  const schemaFull = useSchemaStore(store => store.schema);

  const recordKey = useMemo(() => {
    if (schema.relation === undefined) {
      return;
    }

    return schema?.relation?.owner_key || schemaFull?.getPrimaryKey(schema?.relation?.table);
  }, [schema, schemaFull]);

  if (schema.relation === undefined) {
    return value;
  }

  if (!row?.[schema.name]) {
    return null;
  }

  return (
    // <Link
    //   href={`/bases/${baseId}/tables/${schema?.relation?.table}/${row?.[schema.name]?.[schema.primary_key || 'id']}`}
    //   className="text-indigo-500 font-semibold"
    // >
      <span className="border border-border rounded-sm px-1 py-0.5 text-indigo-500 text-xs cursor-pointer" onClick={(e) => {
        if (isSharingPage) return;
        e.preventDefault();
        open({
          baseId: baseId,
          tableName: schema?.relation?.table,
          recordId: row?.[schema.name]?.[recordKey]
        });
      }}>
        {row?.[schema.name]?.[schema.label_field || 'id']}
      </span>
    // </Link>
  );
}

export function Editor({ name, schema, originalData, disabled, baseId, tableName }: {
  name: string;
  schema: any;
  originalData: any;
  disabled: boolean;
  baseId: string;
  tableName: string;
}) {
  const [defaultLabel, setDefaultLabel] = useState<JSX.Element | string | null>(null);
  const schemaFull= useSchemaStore(store => store.schema);
  const [q, setQ] = useState({
    fieldName: '',
    value: '',
  });
  const { control, setValue } = useFormContext();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const relationSchema = schemaFull?.getRelation(tableName, schema.ui.name);
  const { data, isPending } = useQuery({
    queryKey: [`table:${relationSchema?.table}`, {
      search_field: q.fieldName,
      search_q: q.value,
      page,
      limit: 15,
    }],
    queryFn: async () => {
      const response = await axios.get(`/api/bases/${baseId}/tables/${relationSchema.table}/records?search_field=${q.fieldName}&search_q=${q.value}&page=${page}`);
      return response.data;
    },
    enabled: (open && !!relationSchema),
  });
  

  if (!schemaFull) {
    return null;
  }

  const relationName = schema?.ui?.name;
  const labelKey = schema?.ui?.label_field;
  const ownerKey = relationSchema?.owner_key || schemaFull?.getPrimaryKey(relationSchema.table) || 'id';
  const label = originalData?.[relationName]?.[labelKey] ?? <span className="text-gray-400">Select an option...</span>;

  return <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="space-y-0 flex flex-row items-center">
        <FormLabel className="w-1/5 flex flex-row items-center gap-2">
          <Icon className={'w-[14px] h-[14px]'} />
          {schema?.label}
        </FormLabel>
        {/* {disabled && (<div className="text-sm px-2 py-1 rounded-md border border-border">
          {data?.data?.find(
            (option: {
              label: string;
              value: string;
            }) => option.value === field.value
          )?.label || defaultLabel || label}
        </div>)} */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                role="combobox"
                className="cursor-pointer px-3 w-3/5 justify-between disabled:opacity-80"
                disabled={disabled}
                // asChild={!disabled}
              >
                <div className={cn(
                  "flex flex-row",
                  !field.value && "text-muted-foreground"
                )}>
                  <p className={cn(
                    "flex-1 truncate text-left"
                  )}>
                  {field.value
                    ? (data?.data?.find(
                        (option: {
                          label: string;
                          value: string;
                        }) => option.value === field.value
                      )?.label || defaultLabel || label)
                    : `Select record`}
                  </p>
                </div>
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[--radix-popover-trigger-width] min-w-[540px] p-0 overflow-hidden">
            <div className="w-full bg-muted px-3 py-2">
              <Search
                schema={schemaFull as SchemaBuilder}
                tableName={relationSchema.table as string}
                paramPrefix=""
                onChange={(value: any) => {
                  setQ(value);
                  setPage(1);
                }}
              />
            </div>
            <Separator />
            <div className="flex flex-col max-h-[300px] overflow-y-scroll divide-y divide-border">
              {(!isPending && !data?.data?.length) && <div className="py-6 text-center text-sm">No results found.</div>}
              {isPending && <div className="h-[300px] flex items-center justify-center text-sm">
                <ButtonLoading className="w-3 h-3" loading={true} />
                Loading...
              </div>}
              {data?.data?.map((option: any) => (
                <div
                  key={option[ownerKey]}
                  className="text-sm px-4 py-2 flex items-center justify-between"
                >
                  {option?.[labelKey]}
                  <div className="flex items-center gap-2">
                    <ModalDetailButton baseId={baseId} tableName={relationSchema.table} recordId={option[ownerKey]}>
                      <Button variant={'ghost'} className="h-6 w-6 p-0">
                        <Maximize2Icon className="size-3" />
                      </Button>
                    </ModalDetailButton>
                    {option[ownerKey] === field.value 
                      ? <Button variant={'secondary'} className="h-6 w-6 p-0" onClick={(e) => {
                        setValue(name, 0, { shouldDirty : true })
                        setDefaultLabel(<span className="text-gray-400">Select an option...</span>);
                      }}>
                        <MinusIcon className="size-3" />
                      </Button>
                      : <Button className="h-6 w-6 p-0" onClick={(e) => {
                        setValue(name, option[ownerKey], { shouldDirty : true })
                        setDefaultLabel(option?.[labelKey]);
                      }}>
                        <PlusIcon className="size-3" />
                      </Button>
                    }
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="px-3 py-1 bg-muted flex items-center justify-between">
              <div></div>
              <SimplePagination
                total={data?.total || 0}
                page={page}
                currentPage={data?.current_page}
                lastPage={data?.last_page}
                onPageChange={setPage}
              />
            </div>
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    )}
  />;
}

export function TypeEditor({ tableName }: TypeEditorProps) {
  const { setValue, watch  } = useFormContext();
  const uiWidget = watch('ui');

  const [labelOpen, setLabelOpen] = useState(false);
  const [relationOpen, setRelationOpen] = useState(false);
  const { schema } = useSchemaStore(store => ({
    schema: store.schema
  }));

  const relation = schema?.getRelation(tableName, uiWidget?.name);
  const relations = schema?.getRelations(tableName);

  const fields = relation?.table ? schema?.getFields(relation.table) : {};
  
  const handleChangeLabelField = (value: String) => {
    setValue('ui', {
      ...uiWidget,
      label_field: value
    }, {
      shouldDirty: true
    });
  }

  const handleChangeRelation = (value: String) => {
    setValue('ui', {
      ...uiWidget,
      name: value
    }, {
      shouldDirty: true
    });
  }

  // const defaultValue = fieldSchema.ui?.default;
  const labelField = fields?.[uiWidget?.label_field];

  return <>
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="relation">Relation</Label>
      <Popover open={relationOpen} onOpenChange={setRelationOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              !relation && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              {relation ? (relation?.label || relation?.name) : 'Select a relation'}
            </div>
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="end">
          <Command>
            <CommandInput placeholder="Search field..." />
            <CommandEmpty>No results.</CommandEmpty>
            <CommandList className="p-2">
              {relations && Object.entries(relations).filter(([relationName, relationSchema]: any) => relationSchema.type === 'belongs_to').map(([relationName, relationSchema]) => (

                <CommandItem
                  key={relationName}
                  className="w-full flex flex-row items-center gap-2 cursor-pointer"
                  value={relationName}
                  onSelect={() => {
                    handleChangeRelation(relationName);
                    setRelationOpen(false);
                  }}
                >
                  {relationSchema.label ?? startCase(relationName)} <span className="text-xs text-gray-500">{relationName}</span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="label_field">Label field</Label>
      <Popover open={labelOpen} onOpenChange={setLabelOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              !labelField && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <FieldIcon className="w-4 h-4" type={labelField?.ui?.type as string} />
              {labelField ? (labelField?.label || labelField?.name) : 'Select a field'}
            </div>
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="end">
          <Command>
            <CommandInput placeholder="Search field..." />
            <CommandEmpty>No results.</CommandEmpty>
            <CommandList className="p-2">
              {fields && Object.entries(fields).map(([fieldName, fieldSchema]) => (
                <CommandItem
                  key={fieldName}
                  className="w-full flex flex-row items-center gap-2 cursor-pointer"
                  value={fieldName}
                  onSelect={() => {
                    handleChangeLabelField(fieldName);
                    // field.onChange(fieldName);
                    setLabelOpen(false);
                  }}
                >
                  <FieldIcon className="w-4 h-4" type={fieldSchema?.ui?.type as string} />
                  {fieldSchema.label} <span className="text-xs text-gray-500">{fieldName}</span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  </>
}
