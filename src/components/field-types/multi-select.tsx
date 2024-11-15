import { cn } from "@/lib/utils";
import { FormField, FormLabel, FormMessage, FormItem } from "../ui/form";
import 'react-markdown-editor-lite/lib/index.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue as SelectValueUI } from "../ui/select";
import { useState } from "react";
import { Button } from "../ui/button";
import { CheckIcon, ListIcon, PlusIcon, XIcon } from "lucide-react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import isEqual from "lodash/isEqual";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { useFormContext } from "react-hook-form";
import { getColor, TypeEditorOption, TypeEditorProps } from "./select";
import { OptionsType, OptionType } from "@/lib/types";

export const key = 'multi-select';
export const label = 'Multi Select';

export function Icon({ className }: {
  className?: string;
}) {
  return <ListIcon className={className} />;
}

export function Value({ value, schema, row, preview }: any) {
  if (value === null || value === undefined) {
    return null;
  }

  const values = value?.split(',').map((v: string) => v.trim()) ?? [];

  return <div className={cn("flex items-center gap-1", preview && 'flex-wrap')}>
    {values.map((v: string) => {
      const enumIndex = schema?.enum?.findIndex((option: { label: string, value: any }, index: number) => option.value == v);
      return <span key={v} className={cn("px-1 py-0.5 text-sm rounded-md", getColor(schema?.enum?.[enumIndex], enumIndex))}>
        {schema?.enum?.[enumIndex]?.label ?? v}
      </span>
    })}
  </div>;
}

export function Editor({ name, value, schema, row, disabled }: any) {
  const [open, setOpen] = useState(false);
  const { getValues, control, setValue } = useFormContext();
  const values = getValues(name)?.split(',').map((v: string) => v.trim()) ?? [];
  const options = schema.ui?.enum;

  return <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="space-y-0 flex flex-row items-center">
        <FormLabel className="w-1/5 flex flex-row items-center gap-2">
          <Icon className={'w-[14px] h-[14px]'} />
          {schema?.label}
        </FormLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              disabled={disabled}
              className={cn(
                "w-3/5 justify-between gap-2 h-auto px-2 disabled:opacity-80",
              )}
              onClick={() => setOpen(!open)}
            >
              <div className={cn("flex items-center gap-1", 'flex-wrap')}>
                {values.map((v: string) => {
                  const enumIndex = options?.findIndex((option: { label: string, value: any }, index: number) => option.value == v);
                  return <span key={v} className={cn("px-1 py-0.5 text-sm rounded-md flex items-center gap-1", getColor(options?.[enumIndex], enumIndex))}>
                    {options?.[enumIndex]?.label ?? v}
                    <XIcon className="size-3" onClick={(e) => {
                      e.stopPropagation();
                      values.splice(values.indexOf(v), 1);
                      setValue(name, values.filter((v: string) => v.length > 0).join(','), {
                        shouldDirty: !isEqual(values, value?.split(',').map((v: string) => v.trim()) ?? [])
                      });
                    }} />
                  </span>
                })}
              </div>
              <CaretSortIcon className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput
                placeholder="Search option..."
                className="h-8"
              />
              <CommandList>
                <CommandEmpty>No option found.</CommandEmpty>
                <CommandGroup>
                  {options?.map((option: {
                    label: string;
                    value: string;
                  }, index: number) => <CommandItem
                    className="flex items-center gap-2"
                    value={`${option.value}-${option.label}`}
                    key={option.value}
                    onSelect={() => {
                      if (values.includes(option.value)) {
                        values.splice(values.indexOf(option.value), 1);
                      } else {
                        values.push(option.value);
                      }
                      setValue(name, values.filter((v: string) => v.length > 0).join(','), {
                        shouldDirty: !isEqual(values, value?.split(',').map((v: string) => v.trim()) ?? [])
                      });
                    }}
                  >
                    <div className={cn("text-sm px-1 py-0.5 rounded-md", getColor(option, index))}>
                      {option.label}
                    </div>
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        values.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>)}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    )}
  />
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
      })
    },
    setDefaultValue: (value: string | null) => {
      setValue('ui', {
        ...uiWidget,
        type: key,
        default: value,
      }, {
        shouldDirty: true
      })
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
      })
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