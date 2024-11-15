import { FormControl, FormField, FormLabel, FormMessage, FormItem, FormDescription } from "../ui/form";
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { PlusIcon, TextQuoteIcon, TrashIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";

const mdParser = new MarkdownIt(/* Markdown-it options */);

export const key = 'markdown';
export const label = 'Markdown';

export function Icon({ className }: {
  className?: string;
}) {
  return <TextQuoteIcon className={className} />;
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
          <MdEditor
            className={'h-[500px] rounded-md overflow-hidden shadow-sm'}
            value={field.value}
            renderHTML={text => mdParser.render(text)}
            onChange={({ text }) => field.onChange(text)}
            view={{ menu: true, md: true, html: false }}
          />
        </FormControl>
        <FormMessage />
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
  const { setValue, getValues } = useFormContext();

  const handleChangeDefault = (value: string | undefined) => {
    setValue('ui', {
      type: key,
      default: value,
    }, {
      shouldDirty: true
    });
  }
  const defaultValue = getValues('ui.default');

  return <>
    {defaultValue !== undefined ? <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="default">Default</Label>
      <div className="flex flex-col gap-2">
        <MdEditor
          className={'h-[500px] rounded-md overflow-hidden shadow-sm'}
          value={defaultValue}
          renderHTML={text => mdParser.render(text)}
          onChange={({ text }) => handleChangeDefault(text)}
          view={{ menu: true, md: true, html: false }}
        />
        <Button variant="outline" className="w-full h-8 p-0" onClick={() => handleChangeDefault(undefined)}>
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