import { useFormContext } from "react-hook-form";
import SchemaBuilder from "@/lib/schema-builder";
import { useSchemaStore } from "@/store/base";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { FieldIcon } from "@/components/field-types";
import { useParams } from "next/navigation";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import pluralize from "pluralize";
import snakeCase from "lodash/snakeCase";
import TableIconSelector from "@/components/table-icon-selector";
import { useTranslations } from "next-intl";

function guessPivotTable(schema: SchemaBuilder | null, table: string, relationTable: string) {
  if (!schema) {
    return null;
  }

  const tables = Object.keys(schema.getTablesSchema());
  let pivotTables = [
    `${table}_${relationTable}`,
    `${relationTable}_${table}`,
    pluralize(table) + '_' + pluralize(relationTable),
    pluralize(relationTable) + '_' + pluralize(table),
    pluralize.singular(table) + '_' + pluralize.singular(relationTable),
    pluralize.singular(relationTable) + '_' + pluralize.singular(table),
  ];

  for (let pivotTable of pivotTables) {
    if (tables.includes(pivotTable)) {
      return pivotTable;
    }
  }

  return null;
}

export default function BelongsToManyEditor({
  baseId,
}: {
  baseId: string;
}) {
  const [open, setOpen] = useState(false);
  const [pivotOpen, setPivotOpen] = useState(false);
  const [foreignPivotOpen, setForeignPivotOpen] = useState(false);
  const [relatedPivotOpen, setRelatedPivotOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);
  const [relatedOpen, setRelatedOpen] = useState(false);
  const { control, getValues, setValue } = useFormContext();
  const t = useTranslations('Table.Settings.Relations.Editor');
  
  const { tableName: paramTableName }: { tableName: string } = useParams();
  const tableName = decodeURIComponent(paramTableName);
  const { schema } = useSchemaStore(store => ({
    schema: store.schema,
  }));

  const tables = schema?.getTablesSchema();

  const defaultForeignPivotKey = schema?.getDefaultForeignKey(tableName);
  const relationTable = getValues('table');
  const defaultRelatedPivotKey = relationTable ? schema?.getDefaultForeignKey(relationTable) : null;

  const pivotTable = getValues('pivot_table');
  const pivotFields = pivotTable ? schema?.getFields(pivotTable) : {};

  return <>
    <FormField
      control={control}
      name="table"
      render={({ field }) => (
        <FormItem className="mb-0 lg:mb-0">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <FormLabel>{t('table')}</FormLabel>
            <FormControl>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {/* <TableIcon className="w-4 h-4" /> */}
                      <TableIconSelector size="sm" baseId={baseId} tableName={field.value} selector={false} />
                      {tables?.[field.value]?.label || t('select_table_prompt')}
                    </div>
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="end">
                  <Command>
                    <CommandInput placeholder={t('search_placeholder')} />
                    <CommandEmpty>{t('search_empty')}</CommandEmpty>
                    <CommandList className=" px-2 pt-2">
                      {tables && Object.entries(tables).map(([relationTableName, relationTableSchema]) => (
                        <CommandItem
                          key={relationTableName}
                          className="capitalize w-full flex flex-row items-center gap-2 cursor-pointer"
                          value={relationTableName}
                          onSelect={() => {
                            field.onChange(relationTableName);
                            setValue('name', snakeCase(pluralize(relationTableName)));
                            if (getValues('pivot_table') === '') {
                              const pivotTable = guessPivotTable(schema, tableName, relationTableName);
                              if (pivotTable) {
                                setValue('pivot_table', pivotTable);
                              }
                            }
                            setOpen(false);
                          }}
                        >
                          {/* <TableIcon className="w-4 h-4" /> */}
                          <TableIconSelector size="sm" baseId={baseId} tableName={relationTableName} selector={false} />
                          {relationTableSchema.label}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="pivot_table"
      render={({ field }) => (
        <FormItem className="mb-0 lg:mb-0">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <FormLabel>{t('pivot_table')}</FormLabel>
            <FormControl>
              <Popover open={pivotOpen} onOpenChange={setPivotOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {/* <TableIcon className="w-4 h-4" /> */}
                      <TableIconSelector size="sm" baseId={baseId} tableName={field.value} selector={false} />
                      {tables?.[field.value]?.label || t('select_pivot_table_prompt')}
                    </div>
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="end">
                  <Command>
                    <CommandInput placeholder={t('search_placeholder')} />
                    <CommandEmpty>{t('search_empty')}</CommandEmpty>
                    <CommandList className=" px-2 pt-2">
                      {tables && Object.entries(tables).map(([relationTableName, relationTableSchema]) => (
                        <CommandItem
                          key={relationTableName}
                          className="capitalize w-full flex flex-row items-center gap-2 cursor-pointer"
                          value={relationTableName}
                          onSelect={() => {
                            field.onChange(relationTableName);
                            setPivotOpen(false);
                          }}
                        >
                          {/* <TableIcon className="w-4 h-4" /> */}
                          <TableIconSelector size="sm" baseId={baseId} tableName={relationTableName} selector={false} />
                          {relationTableSchema.label}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
    <div className="flex items-end gap-2">
      <FormField
        control={control}
        name="foreign_pivot_key"
        render={({ field }) => {
          return (
            <FormItem className="mb-0 lg:mb-0 flex-1">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>{tables?.[pivotTable]?.label || t('foreign_pivot_key')}</FormLabel>
                <FormControl>
                  <Popover open={foreignPivotOpen} onOpenChange={setForeignPivotOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <FieldIcon className="w-4 h-4" type={pivotFields?.[field.value]?.type as string} />
                          {pivotFields?.[field.value]
                            ? field.value
                            : <div className="text-muted-foreground">{schema?.hasField(getValues('pivot_table'), defaultForeignPivotKey as string) ? defaultForeignPivotKey : t('select_field_prompt')}</div>}
                        </div>
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="end">
                      <Command>
                        <CommandInput placeholder={t('search_placeholder')} />
                        <CommandEmpty>{t('search_empty')}</CommandEmpty>
                        <CommandList className="p-2">
                          {pivotFields && Object.entries(pivotFields).map(([fieldName, fieldSchema]) => (
                            <CommandItem
                              key={fieldName}
                              className="w-full flex flex-row items-center gap-2 cursor-pointer"
                              value={fieldName}
                              onSelect={() => {
                                field.onChange(fieldName);
                                setForeignPivotOpen(false);
                              }}
                            >
                              <FieldIcon className="w-4 h-4" type={fieldSchema.type as string} />
                              {fieldName}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <div className="h-9 flex items-center">=</div>
      <FormField
        control={control}
        name="parent_key"
        render={({ field }) => {
          const localFields = tableName ? schema?.getFields(tableName) : {};

          return (
            <FormItem className="mb-0 lg:mb-0 flex-1">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>{tables?.[tableName]?.label || t('parent_key')}</FormLabel>
                <Popover open={parentOpen} onOpenChange={setParentOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <FieldIcon className="w-4 h-4" type={localFields?.[field.value]?.type as string} />
                        {localFields?.[field.value] 
                          ? field.value 
                          : <div className="text-muted-foreground">{schema?.getPrimaryKey(tableName) ?? t('select_field_prompt')}</div>}
                      </div>
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="end">
                    <Command>
                      <CommandInput placeholder={t('search_placeholder')} />
                      <CommandEmpty>{t('search_empty')}</CommandEmpty>
                      <CommandList className="p-2">
                        {localFields && Object.entries(localFields).map(([fieldName, fieldSchema]) => (
                          <CommandItem
                            key={fieldName}
                            className="w-full flex flex-row items-center gap-2 cursor-pointer"
                            value={fieldName}
                            onSelect={() => {
                              field.onChange(fieldName);
                              setParentOpen(false);
                            }}
                          >
                            <FieldIcon className="w-4 h-4" type={fieldSchema.type as string} />
                            {fieldName}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
    <div className="flex items-end gap-2">
      <FormField
        control={control}
        name="related_pivot_key"
        render={({ field }) => {
          return (
            <FormItem className="mb-0 lg:mb-0 flex-1">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>{tables?.[pivotTable]?.label || t('related_pivot_key')}</FormLabel>
                <FormControl>
                  <Popover open={relatedPivotOpen} onOpenChange={setRelatedPivotOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <FieldIcon className="w-4 h-4" type={pivotFields?.[field.value]?.type as string} />
                          {pivotFields?.[field.value]
                            ? field.value
                            : <div className="text-muted-foreground">{schema?.hasField(getValues('pivot_table'), defaultRelatedPivotKey as string) ? defaultRelatedPivotKey : t('select_field_prompt')}</div>}
                        </div>
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="end">
                      <Command>
                        <CommandInput placeholder={t('search_placeholder')} />
                        <CommandEmpty>{t('search_empty')}</CommandEmpty>
                        <CommandList className="p-2">
                          {pivotFields && Object.entries(pivotFields).map(([fieldName, fieldSchema]) => (
                            <CommandItem
                              key={fieldName}
                              className="w-full flex flex-row items-center gap-2 cursor-pointer"
                              value={fieldName}
                              onSelect={() => {
                                field.onChange(fieldName);
                                setRelatedPivotOpen(false);
                              }}
                            >
                              <FieldIcon className="w-4 h-4" type={fieldSchema.type as string} />
                              {fieldName}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <div className="h-9 flex items-center">=</div>
      <FormField
        control={control}
        name="related_key"
        render={({ field }) => {
          const relatedTable = getValues('table');
          const relatedFields = relatedTable ? schema?.getFields(relatedTable) : {};

          return (
            <FormItem className="mb-0 lg:mb-0 flex-1">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>{tables?.[relatedTable]?.label || t('related_key')}</FormLabel>
                <Popover open={relatedOpen} onOpenChange={setRelatedOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <FieldIcon className="w-4 h-4" type={relatedFields?.[field.value]?.type as string} />
                        {relatedFields?.[field.value] 
                          ? field.value 
                          : <div className="text-muted-foreground">{relatedTable ? schema?.getPrimaryKey(relatedTable) ?? t('select_field_prompt') : t('select_table_prompt')}</div>}
                      </div>
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="end">
                    <Command>
                      <CommandInput placeholder={t('search_placeholder')} />
                      <CommandEmpty>{t('search_empty')}</CommandEmpty>
                      <CommandList className="p-2">
                        {relatedFields && Object.entries(relatedFields).map(([fieldName, fieldSchema]) => (
                          <CommandItem
                            key={fieldName}
                            className="w-full flex flex-row items-center gap-2 cursor-pointer h-8"
                            value={fieldName}
                            onSelect={() => {
                              field.onChange(fieldName);
                              setRelatedOpen(false);
                            }}
                          >
                            <FieldIcon className="w-4 h-4" type={fieldSchema.type as string} />
                            {fieldName}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  </>;
}