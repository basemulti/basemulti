import { isNumberType } from "@/lib/utils";
import { Button } from "../ui/button";
import { FormField, FormLabel, FormItem } from "../ui/form";
import { CalendarClockIcon, PlusIcon, TrashIcon, ChevronsUpDownIcon } from "lucide-react";
import dayjs from "dayjs";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TypeEditorProps } from "./types";
import { useFormContext } from "react-hook-form";
import { DateTimePicker } from "../ui/datetime-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import set from "lodash/set";
import { useState } from "react";

export const key = 'datetime';
export const label = 'Date Time';

export function Icon({ className }: {
  className?: string;
}) {
  return <CalendarClockIcon className={className} />;
}

export function Value({ value, schema }: any) {
  if (value === null || value === undefined) {
    return null;
  }
  
  let date = dayjs(value);

  if (schema?.timezone) {
    date = date.tz(schema.timezone);
  }

  return <>{date.format(schema?.format || 'YYYY-MM-DD HH:mm:ss')}</>;
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
        <DateTimePicker
          date={field.value instanceof Date ? field.value : dayjs(field.value).toDate()}
          onSelect={(date) => {
            if (date) {
              field.onChange(date);
            }
          }}
        />
      </FormItem>
    )}
  />;
}

const dateFormatList = [
  'YYYY-MM-DD',
  'YYYY/MM/DD',
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'DD-MMM-YYYY',
  'MMM DD, YYYY',
];

const timeFormatList = [
  'HH:mm',
  'HH:mm:ss',
  'HH:mm:ss.SSS'
];

const now = dayjs();

function getAutoFillValue(fieldSchema: any) {
  if (fieldSchema.is_created_at) {
    return 'is_created_at';
  }
  if (fieldSchema.is_updated_at) {
    return 'is_updated_at';
  }
  return 'none';
}

function splitDatetimeFormat(value: string) {
  // 先检查是否包含特殊的日期格式
  const specialDateFormats = ['MMM DD, YYYY'];
  for (const format of specialDateFormats) {
    if (value.startsWith(format)) {
      // 如果是特殊格式，返回日期格式和剩余的时间格式
      return [format, value.slice(format.length).trim()];
    }
  }

  // 处理常规格式
  for (const dateFormat of dateFormatList) {
    if (value.startsWith(dateFormat)) {
      return [dateFormat, value.slice(dateFormat.length).trim()];
    }
  }

  // 如果没有匹配到任何格式，使用默认的分割方法
  return value.split(' ');
}

export function TypeEditor(props: TypeEditorProps) {
  const { setValue, watch } = useFormContext();
  const uiWidget = watch('ui');

  const {
    value, setDefaultValue, format, setFormat, autoFill, setAutoFill, saveAs, setSaveAs
  } = {
    value: uiWidget?.default ? dayjs(uiWidget?.default).toDate() : undefined,
    format: uiWidget?.format ? splitDatetimeFormat(uiWidget?.format) : ['YYYY-MM-DD', 'HH:mm:ss'],
    autoFill: getAutoFillValue(watch()),
    saveAs: uiWidget?.dateformat ? uiWidget?.dateformat : 'X',
    setDefaultValue: (value: Date | undefined) => setValue('ui', {
      ...uiWidget,
      type: key,
      default: value !== undefined ? dayjs(value).format(format.join(' ')) : undefined,
    }, {
      shouldDirty: true
    }),
    setFormat: (format: string[]) => setValue('ui', {
      ...uiWidget,
      type: key,
      format: format.join(' '),
    }, {
      shouldDirty: true
    }),
    setAutoFill: (value: string) => {
      setValue('is_created_at', value === 'is_created_at' ? true : undefined, {
        shouldDirty: true
      });
      setValue('is_updated_at', value === 'is_updated_at' ? true : undefined, {
        shouldDirty: true
      });
      setValue('ui', {
        ...uiWidget,
        type: key,
        default: undefined,
      }, {
        shouldDirty: true
      })
    },
    setSaveAs: (value: string) => setValue('ui', {
      ...uiWidget,
      type: key,
      dateformat: value,
    }, {
      shouldDirty: true
    })
  };

  const isNumber = isNumberType(watch('type'));

  return <>
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="default">Format</Label>
      <div className="grid grid-cols-2 items-center gap-1.5">
        <Select onValueChange={(value) => setFormat([value, format[1]])} value={format[0]}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {dateFormatList.map((value: string) => (
              <SelectItem key={value} value={value}>
                {now.format(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setFormat([format[0], value])} value={format[1]}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {timeFormatList.map((value: string) => (
              <SelectItem key={value} value={value}>
                {now.format(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    {isNumber && (
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="save_as">Save Timestamp As</Label>
        <Select value={saveAs} onValueChange={setSaveAs}>
          <SelectTrigger>
            <SelectValue className="h-8" placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={'X'}>
              Seconds (e.g., 171237363)
            </SelectItem>
            <SelectItem value={'x'}>
              Milliseconds (e.g., 171237363000)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    )}
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="automatic" className="cursor-pointer">Automatic</Label>
      <Select value={autoFill} onValueChange={setAutoFill}>
        <SelectTrigger>
          <SelectValue className="h-8" placeholder="Select an option..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={'none'}>
            No action
          </SelectItem>
          <SelectItem value={'is_created_at'}>
            Auto-fill on creation
          </SelectItem>
          <SelectItem value={'is_updated_at'}>
            Auto-update on modification
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    {autoFill === 'none' && (
      value ? (
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="default">Default</Label>
          <div className="flex items-center gap-2">
            <DateTimePicker
              date={value instanceof Date ? value : dayjs(value).toDate()}
              onSelect={setDefaultValue}
              className="flex-1"
            />
            <Button variant="outline" className="w-8 h-8 p-0" onClick={() => setDefaultValue(undefined)}>
              <TrashIcon className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Button variant={'secondary'} className="h-8 gap-2" onClick={() => setDefaultValue(new Date())}>
            Set default value
            <PlusIcon className="size-4" />
          </Button>
        </div>
      )
    )}
  </>;
}

const operatorsMap: any = {
  '=': 'is',
  '!=': 'is not',
  '<': 'before',
  '>': 'after',
  '<=': 'before or on',
  '>=': 'after or on',
  'is null': 'is empty',
  'is not null': 'is not empty',
};

const getOperatorText = (operator: string, value: string | null) => {
  if (value === null) {
    return operator === '=' ? 'is empty' : 'is not empty';
  }
  
  return operatorsMap[operator];
};

export function FilterOperator({ filters, setFilters, params, index, schema }: {
  filters: any[];
  setFilters: Function;
  params: any;
  index: number | string;
  schema?: any;
}) {
  const [open, setOpen] = useState(false);

  // 根据 dateformat 属性决定格式化方式
  const formatDate = (date: Date | null) => {
    if (!date) return null;
    
    // 如果是 X，返回秒级时间戳
    if (schema?.ui?.dateformat === 'X') {
      return Math.floor(date.getTime() / 1000);
    }
    // 如果是 x，返回毫秒级时间戳
    if (schema?.ui?.dateformat === 'x') {
      return date.getTime();
    }
    // 默认返回格式化的字符串
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  };

  // 转换保存的值为 Date 对象
  const parseDate = (value: any) => {
    if (!value) return new Date;
    
    // 如果是数字（时间戳），需要判断是秒还是毫秒
    if (typeof value === 'number') {
      // 如果是秒级时间戳，转换为毫秒
      if (schema?.ui?.dateformat === 'X') {
        return new Date(value * 1000);
      }
      // 如果是毫秒级时间戳
      if (schema?.ui?.dateformat === 'x') {
        return new Date(value);
      }
    }
    // 默认使用 dayjs 解析
    return dayjs(value).toDate();
  };

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
          <CommandInput placeholder="Search operator..." />
          <CommandEmpty>No results.</CommandEmpty>
          <CommandList className="p-2 max-h-[300px]">
            {Object.keys(operatorsMap).map((operator: string) => (
              <CommandItem
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
                    set(newFilters, `${index}.1.2`, formatDate(new Date()));
                  }
                  
                  setFilters(newFilters);
                  setOpen(false);
                }}
              >
                {operatorsMap[operator]}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    {params[2] !== null && (
      <DateTimePicker
        date={parseDate(params[2])}
        onSelect={(date) => {
          let newFilters = structuredClone(filters);
          set(newFilters, `${index}.1.2`, formatDate(date || null));
          setFilters(newFilters);
        }}
        className="w-[200px]"
        inputClassName="h-8 rounded-none border-l-0 bg-white text-sm"
      />
    )}
  </>;
}
