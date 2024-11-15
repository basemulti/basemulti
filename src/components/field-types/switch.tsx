import { Check, ToggleRightIcon, X } from "lucide-react";
import { FormControl, FormField, FormLabel, FormItem } from "../ui/form";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import set from "lodash/set";
import { useFormContext } from "react-hook-form";

export const key = 'switch';
export const label = 'Switch';

export function Icon({ className }: {
  className?: string;
}) {
  return <ToggleRightIcon className={className} />;
}

export function Value({ value }: any) {
  return value
  ? <Check className="p-1 rounded-full bg-green-100 w-5 h-5 text-green-600 mx-auto" strokeWidth="3" />
  : <X className="p-1 rounded-full w-5 h-5 bg-gray-100 text-gray-500 mx-auto" strokeWidth="3" />;
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
        <FormControl>
          <Switch
            className="disabled:opacity-80"
            checked={field.value}
            disabled={disabled}
            onCheckedChange={field.onChange}
          />
        </FormControl>
      </FormItem>
    )}
  />;
}

export type TypeEditorProps = {
  ui: any;
  fieldSchema: any;
  setFieldSchema: Function;
}

export function TypeEditor(props: TypeEditorProps) {
  const { setValue, watch } = useFormContext();
  const uiWidget = watch('ui');

  const handleChangeDefaultValue = (value: boolean) => {
    setValue('ui', {
      type: key,
      default: value,
    }, {
      shouldDirty: true
    })
  }

  return <>
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="default">Default</Label>
      <div className="flex items-center h-8">
        <Switch checked={!!uiWidget?.default} onCheckedChange={handleChangeDefaultValue} />
      </div>
    </div>
  </>
}

export function FilterOperator({ filters, setFilters, params, index }: {
  filters: any[];
  setFilters: Function;
  params: any;
  index: number | string;
}) {
  return <>
    <Button variant={'outline'} className="w-[120px] text-sm h-8 rounded-none border-l-0 justify-between bg-white" disabled>
      <span className="truncate">{'is'}</span>
    </Button>
    <div
      className="bg-white rounded-none border-l-0 focus-visible:ring-0 h-8 px-4 flex items-center border-y border-r border-border shadow-sm"
    >
      <Switch
        checked={params[2] === null ? false : params[2]}
        onCheckedChange={(checked) => {
          let newFilters = structuredClone(filters);
          set(newFilters, `${index}.1.2`, checked ? true : false);
          setFilters(newFilters);
        }}
      />
    </div>
  </>
}