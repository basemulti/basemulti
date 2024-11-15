import dayjs from "dayjs";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TypeEditorProps } from "./types";
import { useFormContext } from "react-hook-form";
import { FormItem, FormLabel } from "../ui/form";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CalendarClockIcon, CalendarIcon } from "lucide-react";

export const key = 'updated-at';
export const label = 'Updated At';
export const isSystemField = true;

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
  const { getValues } = useFormContext();
  const value = getValues(name);

  if (!value) {
    return null;
  }

  return <FormItem className="space-y-0 flex flex-row items-center">
    <FormLabel className="w-1/5 flex flex-row items-center gap-2">
      <Icon className={'w-[14px] h-[14px]'} />
      {schema?.label}
    </FormLabel>
    <Button
      variant={"outline"}
      disabled={true}
      className={cn(
        "w-3/5 pl-3 text-left font-normal disabled:opacity-80",
      )}
    >
      {value ? (
        dayjs(value).format(schema.ui?.format || "YYYY-MM-DD")
      ) : (
        <span>Pick a date</span>
      )}
      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
    </Button>
  </FormItem>;
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

function splitDatetimeFormat(value: string) {
  for (let format of dateFormatList) {
    if (value.includes(format)) {
      return [format, value.split(format + ' ')[1]];
    }
  }

  return value.split(' ');
}

export function TypeEditor(props: TypeEditorProps) {
  const { setValue, watch } = useFormContext();
  const uiWidget = watch('ui');

  const {
    format, setFormat
  } = {
    format: uiWidget?.format ? splitDatetimeFormat(uiWidget?.format) : ['YYYY-MM-DD', 'HH:mm'],
    setFormat: (format: string[]) => setValue('ui', {
      ...uiWidget,
      type: key,
      format: format.join(' '),
    }, {
      shouldDirty: true
    }),
  };

  return <>
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="default">Format</Label>
      <div className="grid grid-cols-2 items-center gap-1.5">
        <Select onValueChange={(value) => setFormat([value, format[1]])} value={format[0]}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {dateFormatList.map((value: string, index: number) => <SelectItem key={value} value={value}>
              {now.format(value)}
            </SelectItem>)}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setFormat([format[0], value])} value={format[1]}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {timeFormatList.map((value: string, index: number) => <SelectItem key={value} value={value}>
              {now.format(value)}
            </SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  </>
}

