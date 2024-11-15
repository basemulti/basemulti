import { PlusIcon, TrashIcon, ChevronsUpDownIcon, BaselineIcon } from "lucide-react";
import { FormControl, FormField, FormLabel, FormMessage, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { Button } from "../ui/button";
import { TypeEditorProps } from "./types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import set from "lodash/set";
import { useFormContext } from "react-hook-form";
import { FieldIcon } from ".";

export const key = 'string';
export const label = 'Single Line Text';

export function Icon({ className }: {
  className?: string;
}) {
  return <BaselineIcon className={className} />;
}

export function Value({ value, schema }: any) {
  return <div className="flex">
    <span className="max-w-[30rem] break-all">{value}</span>
  </div>;
}

export function Editor({ name, schema, disabled }: any) {
  const { control } = useFormContext();

  return <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="space-y-0 flex flex-row w-full">
        <FormLabel className="w-1/5 gap-2 flex flex-row items-center">
          <FieldIcon type={key} />
          {schema?.label}
        </FormLabel>
        <div className="w-3/5">
          <FormControl>
            <Input
              className="disabled:opacity-80"
              disabled={disabled || schema.ui.disabled}
              placeholder={schema?.label}
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage className="mt-1" />
        </div>
      </FormItem>
    )}
  />
}

export function TypeEditor(props: TypeEditorProps) {
  const { control } = useFormContext();

  return <>
    <FormField
      control={control}
      name={'ui'}
      render={({ field }) => (
        field.value?.default !== undefined ? <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="default">Default</Label>
          <div className="flex items-center gap-2">
            <Input className="flex-1 h-8" type="text" value={field.value?.default} placeholder="Default value (Optional)" onChange={(e) => {
              field.onChange({
                type: key,
                default: e.target.value
              }, {
                shouldDirty: true
              });
            }} />
            <Button variant="outline" className="w-8 h-8 p-0" onClick={() => {
              field.onChange({
                type: key,
                default: undefined
              }, {
                shouldDirty: true
              });
            }}>
              <TrashIcon className="size-4" />
            </Button>
          </div>
        </div> : <div>
          <Button variant={'secondary'} className="h-8 gap-2" onClick={() => {
            field.onChange({
              type: key,
              default: ''
            }, {
              shouldDirty: true
            });
          }}>
            Set default value
            <PlusIcon className="size-4" />
          </Button>
        </div>
      )}
    />
  </>
}

const operatorsMap: any = {
  '=': 'is',
  '!=': 'is not',
  'like': 'contains',
  'not like': 'not contains',
  'is null': 'is empty',
  'is not null': 'is not empty',
};

const getOperatorText = (operator: string, value: string | null) => {
  if (value === null) {
    return operator === 'is' ? 'is empty' : 'is not empty';
  }
  
  return operatorsMap[operator];
};

export function FilterOperator({ filters, setFilters, params, index }: {
  filters: any[];
  setFilters: Function;
  params: any;
  index: number | string;
}) {
  const [open, setOpen] = useState(false);

  return <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={'outline'} className="w-[120px] text-sm h-8 rounded-none border-l-0 justify-between bg-white">
          <span className="truncate">{getOperatorText(params[1], params[2])}</span>
          <ChevronsUpDownIcon className="size-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 w-auto">
        <Command>
          <CommandInput placeholder="Search field..." />
          <CommandEmpty>No results.</CommandEmpty>
          <CommandList className=" p-2 max-h-[300px]">
            {Object.keys(operatorsMap).map((operator: string, operatorIndex: number) => <CommandItem
              key={operator}
              className="w-full flex flex-row items-center justify-between gap-2 cursor-pointer"
              value={operator}
              onSelect={() => {
                let newFilters = structuredClone(filters);
                if (operator === 'is null' || operator === 'is not null') {
                  set(newFilters, `${index}.1.1`, operator === 'is null' ? 'is' : 'is not');
                  set(newFilters, `${index}.1.2`, null);
                } else {
                  set(newFilters, `${index}.1.1`, operator);
                  set(newFilters, `${index}.1.2`, '');
                }
                
                setFilters(newFilters);
                setOpen(false);
              }}
            >
              {/* {getOperatorText(operator, params[2], operatorIndex)} */}
              {operatorsMap[operator]}
            </CommandItem>)}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <Input
      className="bg-white rounded-none border-l-0 focus-visible:ring-0 h-8 placeholder:text-[13px] w-[120px]" placeholder="Enter a value"
      value={params[2] === null ? '' : params[2]}
      disabled={params[2] === null}
      onChange={(e) => {
        let newFilters = structuredClone(filters);
        set(newFilters, `${index}.1.2`, e.target.value);
        console.log('newFilters', newFilters)
        setFilters(newFilters);
      }}
    />
  </>
}