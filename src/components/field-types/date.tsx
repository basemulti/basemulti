import { cn, isNumberType } from "@/lib/utils";
import { Button } from "../ui/button";
import { FormControl, FormField, FormLabel, FormItem } from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import dayjs from "dayjs";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TypeEditorProps } from "./types";
import { useFormContext } from "react-hook-form";

export const key = 'date';
export const label = 'Date';

export function Icon({ className }: {
  className?: string;
}) {
  return <CalendarIcon className={className} />;
}

export function Value({ value, schema }: any) {
  let date = dayjs(value);

  if (schema?.timezone) {
    date = date.tz(schema.timezone);
  }
  
  return <>{date.format(schema?.format || 'YYYY-MM-DD')}</>;
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
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant={"outline"}
                disabled={disabled}
                className={cn(
                  "w-3/5 pl-3 text-left font-normal disabled:opacity-80",
                  !field.value && "text-muted-foreground"
                )}
              >
                {field.value ? (
                  dayjs(field.value).format(schema.ui?.format || "YYYY-MM-DD")
                  // format(field.value, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value instanceof Date ? field.value : dayjs(field.value).toDate()}
              onSelect={field.onChange}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
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

const now = dayjs();

export function TypeEditor(props: TypeEditorProps) {
  const { setValue, watch } = useFormContext();
  const uiWidget = watch('ui');

  const {
    value, setDefaultValue, format, setFormat, saveAs, setSaveAs
  } = {
    value: uiWidget?.default ? dayjs(uiWidget?.default).toDate() : undefined,
    format: uiWidget?.format ? uiWidget?.format : 'YYYY-MM-DD',
    saveAs: uiWidget?.dateformat ?? 'X',
    setDefaultValue: (value: Date | undefined) => setValue('ui', {
      ...uiWidget,
      type: key,
      default: value !== undefined ? dayjs(value).format(format) : undefined,
    }, {
      shouldDirty: true
    }),
    setFormat: (format: string) => setValue('ui', {
      ...uiWidget,
      type: key,
      format,
    }, {
      shouldDirty: true
    }),
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
      <Select onValueChange={(value) => setFormat(value)} value={format}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option..." />
        </SelectTrigger>
        <SelectContent>
          {dateFormatList.map((value: string, index: number) => <SelectItem key={value} value={value}>
            {now.format(value)}
          </SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    {isNumber && <div className="grid w-full max-w-sm items-center gap-1.5">
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
    </div>}
    {value
    ? <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="default">Default</Label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "flex-1 h-8 pl-3 text-left font-normal",
                !value && "text-muted-foreground"
              )}
            >
              {value ? (
                dayjs(value).format(format)
              ) : (
                <span>---- -- --</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value instanceof Date ? value : dayjs(value).toDate()}
              onSelect={(date) => {
                setDefaultValue(dayjs(date).toDate());
              }}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
            <div className="flex items-center justify-center p-3 pt-2 space-x-2">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-2.5 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input type="time" className="h-9 bg-background border border-input text-sm rounded-md w-full p-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" value={dayjs(value).format('HH:mm')} required onChange={(e) => {
                  setDefaultValue(dayjs(value).set('hour', Number(e.target.value.split(':')[0])).set('minute', Number(e.target.value.split(':')[1])).toDate())
                }} />
              </div>
              <button className="h-9 inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 gap-2 bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-md px-3 w-2/5 text-sm" onClick={() => {
                setDefaultValue(dayjs().toDate());
              }}>Today</button>
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="outline" className="w-8 h-8 p-0" onClick={() => setDefaultValue(undefined)}>
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </div>
    : <div>
      <Button variant={'secondary'} className="h-8 gap-2" onClick={() => setDefaultValue(new Date)}>
        Set default value
        <PlusIcon className="size-4" />
      </Button>
    </div>}
  </>
}


