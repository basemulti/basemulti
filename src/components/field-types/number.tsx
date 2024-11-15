import { HashIcon, PlusIcon, TrashIcon, ChevronsUpDownIcon } from "lucide-react";
import { FormControl, FormField, FormLabel, FormMessage, FormItem, FormDescription } from "../ui/form";
import { Input } from "../ui/input";
import type { TypeEditorProps } from "./types";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import set from "lodash/set";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export const key = 'number';
export const label = 'Number';

export function Icon({ className }: {
  className?: string;
}) {
  return <HashIcon className={className} />;
}

export function Value({ value, schema }: any) {
  return <div className="flex justify-end">
    <span className="max-w-[30rem] truncate">{Number(value)}</span>
  </div>;
}

export function Editor({ name, schema, disabled }: any) {
  const { control } = useFormContext();

  return <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="space-y-0 flex flex-row items-center">
        <FormLabel className="w-1/5 flex flex-row items-center gap-2">
          <Icon className={'w-[14px] h-[14px]'} />
          {schema?.label}
        </FormLabel>
        <FormControl className="w-3/5">
          <Input
            type="number"
            className="disabled:opacity-80"
            disabled={disabled}
            placeholder={schema?.label}
            {...field}
            onChange={(e) => {
              field.onChange(Number(e.target.value));
            }}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />;
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
            <Input className="flex-1 h-8" type="number" value={field.value?.default} placeholder="Default value (Optional)" onChange={(e) => field.onChange({
              type: key,
              default: Number(e.target.value)
            }, {
              shouldDirty: true
            })} />
            <Button variant="outline" className="w-8 h-8 p-0" onClick={() => field.onChange({
              type: key,
              default: undefined
            }, {
              shouldDirty: true
            })}>
              <TrashIcon className="size-4" />
            </Button>
          </div>
        </div> : <div>
          <Button variant={'secondary'} className="h-8 gap-2" onClick={() => {
            field.onChange({
              type: key,
              default: 0
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
  '=': '=',
  '!=': '≠',
  '<': '<',
  '>': '>',
  '<=': '≤',
  '>=': '≥',
  'is null': 'is empty',
  'is not null': 'is not empty',
};

const getOperatorText = (operator: string, value: string | null) => {
  console.log('getOperatorText', operator, value)
  if (value === null) {
    return operator === '=' ? 'is empty' : 'is not empty';
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
                  set(newFilters, `${index}.1.1`, operator === 'is null' ? '=' : '!=');
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
