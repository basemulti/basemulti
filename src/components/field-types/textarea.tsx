import { PlusIcon, TextIcon, TrashIcon } from "lucide-react";
import { Button } from "../ui/button";
import { FormControl, FormField, FormLabel, FormItem } from "../ui/form";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useFormContext } from "react-hook-form";

export const key = 'textarea';
export const label = 'Long Text';

export function Icon({ className }: {
  className?: string;
}) {
  return <TextIcon className={className} />;
}

export function Editor({ name, schema, disabled }: any) {
  const { control } = useFormContext();

  return <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="space-y-0 flex flex-row">
        <FormLabel className="w-1/5 mt-2 flex flex-row gap-2">
          <Icon className={'w-[14px] h-[14px]'} />
          {schema?.label}
        </FormLabel>
        <FormControl className="w-3/5">
          <Textarea
            className="disabled:opacity-80"
            placeholder=""
            disabled={disabled}
            {...field}
          />
        </FormControl>
      </FormItem>
    )}
  />;
}

type TypeEditorProps = {
  ui: any;
  fieldType: string;
  fieldSchema: any;
  setFieldSchema: Function;
}

export function TypeEditor(props: TypeEditorProps) {
  const { setValue, watch } = useFormContext();
  const uiWidget = watch('ui')
  const handleChangeDefault = (value: string | undefined) => {
    setValue('ui', {
      type: key,
      default: value,
    }, {
      shouldDirty: true
    });
  }

  const defaultValue = uiWidget?.default;

  return <>
    {defaultValue !== undefined ? <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="default">Default</Label>
      <div className="flex gap-2">
        <Textarea className="flex-1" value={defaultValue} placeholder="Default value (Optional)" onChange={(e) => handleChangeDefault(e.target.value)} />
        <Button variant="outline" className="w-8 h-8 p-0" onClick={() => handleChangeDefault(undefined)}>
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </div> : <div>
      <Button variant={'secondary'} className="h-8 gap-2" onClick={() => handleChangeDefault('')}>
        Set default value
        <PlusIcon className="size-4" />
      </Button>
    </div>}
  </>
}