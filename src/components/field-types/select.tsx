import { cn } from "@/lib/utils";
import { FormControl, FormField, FormLabel, FormMessage, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import 'react-markdown-editor-lite/lib/index.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue as SelectValueUI } from "../ui/select";
import { useState } from "react";
import { Button } from "../ui/button";
import { ChevronDownIcon, ChevronsUpDownIcon, CircleChevronDownIcon, PlusIcon, XIcon } from "lucide-react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import set from "lodash/set";
import { useSchemaStore } from "@/store/base";
import { OptionsType, OptionType } from "@/lib/types";
import { useFormContext } from "react-hook-form";

const colors = [
  'bg-red-200',
  'bg-yellow-200',
  'bg-green-200',
  'bg-blue-200',
  'bg-indigo-200',
  'bg-purple-200',
  'bg-cyan-200',
  'bg-pink-200',
  'bg-amber-200',
  'bg-lime-200',
  'bg-emerald-200',
  'bg-teal-200',
  'bg-sky-200',
  'bg-violet-200',
];

export const optionColors = [
  'bg-gray-200', 'bg-red-200', 'bg-yellow-200', 'bg-green-200', 'bg-blue-200', 'bg-indigo-200', 'bg-purple-200', 'bg-pink-200', 'bg-orange-200',
  'bg-gray-300', 'bg-red-300', 'bg-yellow-300', 'bg-green-300', 'bg-blue-300', 'bg-indigo-300', 'bg-purple-300', 'bg-pink-300', 'bg-orange-300',
  'bg-gray-400', 'bg-red-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400', 'bg-orange-400',
  'bg-gray-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500',
  'bg-gray-600', 'bg-red-600', 'bg-yellow-600', 'bg-green-600', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-pink-600', 'bg-orange-600',
];

export const key = 'select';
export const label = 'Single Select';

export function Icon({ className }: {
  className?: string;
}) {
  return <CircleChevronDownIcon className={className} />;
}

export function getColor(option: OptionType, index: number) {
  return option?.color ?? (index > -1 ? colors[index % colors.length] : 'bg-gray-100');
}

export function Value({ value, schema, row }: any) {
  if (value === null || value === undefined) {
    return null;
  }

  const enumIndex = schema?.enum?.findIndex((option: { label: string, value: any }, index: number) => option.value == value);
  if (enumIndex === -1) {
    return value;
  }

  return <span className={cn(
    "px-1 py-0.5 text-sm rounded-md", 
    getColor(schema?.enum?.[enumIndex], enumIndex)
  )}>{schema?.enum?.[enumIndex]?.label}</span>;
}

export function Editor({ name, schema, row, disabled }: any) {
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
        <Select onValueChange={field.onChange} defaultValue={String(field.value)} disabled={disabled}>
          <FormControl className="w-3/5">
            <SelectTrigger>
              <SelectValueUI className="disabled:opacity-80" placeholder="Select an option..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {schema.ui?.enum?.map((option: {
              label: string;
              value: string;
            }, index: number) => <SelectItem key={option.value} value={option.value}>
              <div className={cn("text-sm px-1 py-0.5 rounded-md", getColor(option, index))}>
                {option.label}
              </div>
            </SelectItem>)}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
}

export type TypeEditorProps = {
  ui: any;
  fieldSchema: any;
  setFieldSchema: Function;
}

export function TypeEditorOption({ isSame, onChangeValue, onChangeLabel, onChangeColor, onDeleteOption, index, option }: {
  isSame: boolean;
  onChangeValue: Function;
  onChangeLabel: Function;
  onChangeColor: Function;
  onDeleteOption: Function;
  index: number;
  option: OptionType;
}) {
  const [open, setOpen] = useState(false);

  return <div className="flex flex-row items-center gap-1.5 py-0.5">
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn('rounded-md size-6 flex items-center justify-center cursor-pointer', getColor(option, index))}>
          <ChevronDownIcon className="size-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="grid grid-cols-9 gap-1">
        {optionColors.map((color: string) => <div key={color} className={cn('rounded-md size-6 cursor-pointer', color)} onClick={() => {
          onChangeColor(index, color);
          setOpen(false);
        }} />)}
      </PopoverContent>
    </Popover>
    <Input
      className="flex-1 h-8 bg-background"
      placeholder="Value"
      value={option.value}
      onChange={(e) => onChangeValue(index, e.target.value)}
    />
    {!isSame && <Input
      className="flex-1 h-8 bg-background"
      placeholder="Label"
      value={option.label}
      onChange={(e) => onChangeLabel(index, e.target.value)}
    />}
    <Button variant="ghost" className="w-8 h-8 p-0" onClick={() => onDeleteOption(index)}>
      <XIcon className="size-3" />
    </Button>
  </div>
}

export function TypeEditor(props: TypeEditorProps) {
  const { setValue, watch } = useFormContext();
  const uiWidget = watch('ui')

  const { options, defaultValue, isSame, setOptions, setIsSame, setDefaultValue }: {
    options: OptionsType;
    defaultValue: string | null;
    isSame: boolean;
    setOptions: Function;
    setIsSame: (value: boolean) => void;
    setDefaultValue: (value: string | null) => void;
  } = {
    options: uiWidget?.enum?.map((option: OptionType) => ({
      label: option.label,
      value: option.value,
      color: option.color,
    })) || [],
    defaultValue: uiWidget?.default ?? null,
    isSame: uiWidget?.isSame ?? false,
    setOptions: (options: OptionsType) => {
      setValue('ui', {
        ...uiWidget,
        type: key,
        enum: options.map(option => ({
          label: option.label,
          value: option.value,
          color: option.color,
        })),
        default: options.find(option => option.value === defaultValue)?.value ?? null,
      }, {
        shouldDirty: true
      });
    },
    setDefaultValue: (value: string | null) => {
      setValue('ui', {
        ...uiWidget,
        type: key,
        default: value,
      }, {
        shouldDirty: true
      });
    },
    setIsSame: (value: boolean) => {
      if (isSame === value) return;
      setValue('ui', {
        ...uiWidget,
        type: key,
        enum: options.map(option => ({
          ...option,
          label: option.value,
        })),
        isSame: value,
      }, {
        shouldDirty: true
      });
    }
  };

  const handleAddOption = () => {
    setOptions([...options, { label: '', value: '' }]);
  }

  const handleDeleteOption = (index: number) => {
    const newOptions = [...options];
    if (newOptions[index].value === defaultValue) {
      setDefaultValue(null);
    }

    newOptions.splice(index, 1);
    setOptions(newOptions);
  }

  const handleChangeValue = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].value = value;
    if (isSame) {
      newOptions[index].label = value;
    }
    setOptions(newOptions);
  }

  const handleChangeLabel = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].label = value;
    setOptions(newOptions);
  }

  const handleChangeColor = (index: number, color: string) => {
    const newOptions = [...options];
    newOptions[index].color = color;
    setOptions(newOptions);
  }

  return <>
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label>Options</Label>
      {options.length > 0 && <div className="rounded-md border border-muted p-2 bg-accent">
        {!isSame && <div className="flex flex-row items-center gap-1.5 h-4 text-xs text-gray-500 leading-none mb-1">
          <div className="size-6" />
          <div className="ml-1 flex-1">Value</div>
          <div className="ml-1 flex-1">Label</div>
          <div className="size-8" />
        </div>}
        {options.map((option: OptionType, index: number) => <TypeEditorOption
          key={index}
          isSame={isSame}
          onChangeValue={handleChangeValue}
          onChangeLabel={handleChangeLabel}
          onChangeColor={handleChangeColor}
          onDeleteOption={handleDeleteOption}
          index={index}
          option={option}
        />)}
      </div>}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="w-full gap-2 text-sm h-8" onClick={handleAddOption}>
          <PlusIcon className="size-4" />
          Add Option
        </Button>
        <div className="flex items-center justify-end gap-2">
          <Label htmlFor="is_same">Value = Label</Label>
          <Switch id="is_same" className="" checked={isSame} onCheckedChange={setIsSame} />
        </div>
      </div>
    </div>
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label>Default value (optional)</Label>
      <Select onValueChange={setDefaultValue} value={defaultValue ?? 'BASEMULTI_DEFAULT_NULL'}>
        <SelectTrigger>
          <SelectValueUI placeholder="Select an option..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={'BASEMULTI_DEFAULT_NULL'}>
            <div className={cn("text-sm px-1 py-0.5 rounded-md h-6")}>
            </div>
          </SelectItem>
          {options
            .filter(option => option.value.length > 0)
            .map((option: OptionType, index: number) => <SelectItem key={option.value} value={option.value}>
            <div className={cn("text-sm px-1 py-0.5 rounded-md h-6 min-w-6", getColor(option, index))}>
              {option.label}
            </div>
          </SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  </>
}

const operatorsMap: any = {
  '=': 'is',
  '!=': 'is not',
  // 'in': 'contains any of',
  // 'not in': 'does not contain any of',
  'is null': 'is empty',
  'is not null': 'is not empty',
};

const getOperatorText = (operator: string, value: string | null) => {
  if (value === null) {
    return operator === 'is' ? 'is empty' : 'is not empty';
  }
  
  return operatorsMap[operator];
};

export function FilterOperator({ filters, setFilters, params, index, tableName }: {
  filters: any[];
  setFilters: Function;
  params: any;
  index: number | string;
  tableName: string;
}) {
  const [open, setOpen] = useState(false);
  const schema = useSchemaStore(store => store.schema);
  const fieldSchema = schema?.getField(tableName, params[0]);

  const options = fieldSchema?.ui?.enum ?? [];

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
                  set(newFilters, `${index}.1.2`, options?.[0]?.value ?? '');
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
    <Select
      onValueChange={(value) => {
        let newFilters = structuredClone(filters);
        set(newFilters, `${index}.1.2`, value);
        setFilters(newFilters);
      }}
      defaultValue={params[2] ?? ''}
    >
      <SelectTrigger className="rounded-none border-l-0 focus-visible:ring-0 h-8 placeholder:text-[13px] w-[120px] focus:ring-0 bg-background">
        <SelectValueUI 
          
          placeholder="Select an option..."
        />
      </SelectTrigger>
      <SelectContent>
        {/* <SelectItem value={''}>
          <div className={cn("text-sm px-1 py-0.5 rounded-md")}>{' '}</div>
        </SelectItem> */}
        {fieldSchema?.ui?.enum?.map((option: {
          label: string;
          value: string;
        }, index: number) => <SelectItem key={option.value} value={option.value}>
          <div className={cn("text-sm px-1 py-0.5 rounded-md", getColor(option, index))}>
            {option.label}
          </div>
        </SelectItem>)}
      </SelectContent>
    </Select>
  </>
}
