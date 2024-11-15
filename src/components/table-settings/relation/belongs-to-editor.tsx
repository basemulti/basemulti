import { useFormContext } from "react-hook-form";
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

export default function BelongsToEditor({
  baseId,
}: {
  baseId: string;
}) {
  const [open, setOpen] = useState(false);
  const [foreignOpen, setForeignOpen] = useState(false);
  const [localOpen, setLocalOpen] = useState(false);
  const { control, getValues, setValue } = useFormContext();
  const t = useTranslations('Table.Settings.Relations.Editor');
  
  const { tableName: paramTableName }: { tableName: string } = useParams();
  const tableName = decodeURIComponent(paramTableName);
  const { schema } = useSchemaStore(store => ({
    schema: store.schema,
  }));

  const tables = schema?.getTablesSchema();

  const relationTable = getValues('table');
  const defaultForeignKey = relationTable ? schema?.getDefaultForeignKey(relationTable) : '';

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
                      {tables && Object.entries(tables).map(([tableName, tableSchema]) => (
                        <CommandItem
                          key={tableName}
                          className="capitalize w-full flex flex-row items-center gap-2 cursor-pointer h-8"
                          value={tableName}
                          onSelect={() => {
                            field.onChange(tableName);
                            setValue('name', snakeCase(pluralize.singular(tableName)));
                            setOpen(false);
                          }}
                        >
                          {/* <TableIcon className="w-4 h-4" /> */}
                          <TableIconSelector size="sm" baseId={baseId} tableName={tableName || ''} selector={false} />
                          {tableSchema.label}
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
        name="foreign_key"
        render={({ field }) => {
          const foreignFields = tableName ? schema?.getFields(tableName) : {};

          return (
            <FormItem className="mb-0 lg:mb-0 flex-1">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>{tables?.[tableName]?.label || t('foreign_key')}</FormLabel>
                <FormControl>
                  <Popover open={foreignOpen} onOpenChange={setForeignOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <FieldIcon className="w-4 h-4" type={foreignFields?.[field.value]?.type as string} />
                          {foreignFields?.[field.value]
                            ? field.value
                            : <div className="text-muted-foreground">{schema?.hasField(tableName, defaultForeignKey as string) ? defaultForeignKey : t('select_field_prompt')}</div>}
                        </div>
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="end">
                      <Command>
                        <CommandInput placeholder={t('search_placeholder')} />
                        <CommandEmpty>{t('search_empty')}</CommandEmpty>
                        <CommandList className="p-2">
                          {foreignFields && Object.entries(foreignFields).map(([fieldName, fieldSchema]) => (
                            <CommandItem
                              key={fieldName}
                              className="w-full flex flex-row items-center gap-2 cursor-pointer"
                              value={fieldName}
                              onSelect={() => {
                                field.onChange(fieldName);
                                setForeignOpen(false);
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
        name="owner_key"
        render={({ field }) => {
          const table = relationTable;
          const localFields = table ? schema?.getFields(table) : {};

          return (
            <FormItem className="mb-0 lg:mb-0 flex-1">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>{tables?.[table]?.label || t('owner_key')}</FormLabel>
                <Popover open={localOpen} onOpenChange={setLocalOpen}>
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
                          : <div className="text-muted-foreground">{table ? schema?.getPrimaryKey(table) ?? t('select_field_prompt') : t('select_field_prompt')}</div>}
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
                              setLocalOpen(false);
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