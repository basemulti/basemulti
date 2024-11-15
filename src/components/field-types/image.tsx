import { Dialog, DialogImage, DialogTrigger } from "@/components/ui/dialog";
import { FormControl, FormField, FormLabel, FormMessage, FormItem, FormDescription } from "../ui/form";
import axios from 'axios';
import Uploady, { useRequestPreSend, useItemProgressListener, useItemFinishListener, useItemFinalizeListener } from '@rpldy/uploady';
// import UploadDropZone from "@rpldy/upload-drop-zone";
import { asUploadButton } from '@rpldy/upload-button';
import { LoaderCircleIcon, PaperclipIcon, PlusIcon, X } from "lucide-react";
import { forwardRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useFormContext } from "react-hook-form";
import { FieldIcon } from ".";
import { useSchemaStore } from "@/store/base";
import { Editor as StringEditor } from "./string";
import { nanoid, url } from "@/lib/utils";
import { toast } from "sonner";
import SchemaBuilder from "@/lib/schema-builder";

export const key = 'image';
export const label = 'Image';

export function Icon({ className }: {
  className?: string;
}) {
  return <PaperclipIcon className={className} />;
}

export function Value({ value, schema }: any) {
  const schemaBuilder = useSchemaStore(store => store.schema);
  const schemaUrl = schemaBuilder?.isDefaultProvider() ? url('storage/{value}') : schema.url;

  if (!value) return <div style={{
    width: 24, //schema?.width ?? 24,
    height: 24, //schema?.height ?? 24,
  }} />;

  const isMultiple = schema?.meta?.multiple;
  const srcs: string[] = [];

  if (isMultiple) {
    srcs.push(schemaUrl ? value.split(',').map((src: string) => schemaUrl.replace('{value}', src)) : value.split(','));
  } else {
    srcs.push(schemaUrl ? schemaUrl.replace('{value}', value) : String(value));
  }

  return <>
    {srcs.map((src: string, index: number) => <Dialog key={index.toString()}>
      <DialogTrigger asChild>
        <img className="cursor-pointer rounded" style={{
          width: 24, //schema?.width ?? 24,
          height: 24, //schema?.height ?? 24,
        }} src={src?.startsWith('http') ? src : `https://${src}`} />
      </DialogTrigger>
      <DialogImage>
        <img className="" src={src?.startsWith('http') ? src : `https://${src}`} />
      </DialogImage>
    </Dialog>)}
  </>;
}
const UploadButtonBase = forwardRef<HTMLDivElement>(
  (
    props,
    ref
  ) => {
    const progress = useItemProgressListener();
    const progressData = progress || { completed: 0 };
    const { completed } = progressData;
    const [uploading, setUploading] = useState(false);

    useItemFinalizeListener((item, options: any) => {
      if (item.state === 'finished') {
        setUploading(false);
        options?.params?.onFinished && options?.params?.onFinished({
          file: item.file,
          filename: options?.metadata?.filename
        });
      }

      if (item.state === 'error') {
        setUploading(false);
      }
    });

    useItemFinishListener((item, options) => {
      console.log(`item ${item.id} finished uploading, response was: `, item.uploadResponse, item.uploadStatus);
    });

    useRequestPreSend(async ({ items, options }: any) => {
      const files = items.length > 0 ? items[0] : {};

      let { file } = files;
      let { name, type } = file;
      setUploading(true);
      console.log(name, type, name.split('.').pop())
      // const extension = name.split('.').pop();
      // const filename = name.include('.') ? nanoid(16) + '.' + extension : nanoid();
      // console.log(extension, filename);

      return {
        options: {
          sendWithFormData: true,
          destination: {
            url: '/api/files/storage',
            method: 'POST',
          },
          metadata: {
            filename: name
          },
          // fileFilter: (file: any) => {
          //   console.log(file)
          //   if (file.type.includes('image')) {
          //     return true;
          //   }
          //   toast.error('Only images are allowed');
          //   return false;
          // },
        },
      };
      
      let gateway = '/api/files/s3';
      
      const response = await axios(
        `${gateway}?` +
        new URLSearchParams({
          name: file.name,
          type: file.type,
        })
      );

      let { data } = response;
      let uploadUrl = data.upload_url;

      return {
        options: {
          sendWithFormData: false,
          destination: {
            url: uploadUrl,
            method: 'PUT',
            headers: {
              'Content-Type': type,
            },
          },
          metadata: {
            filename: name
          },
        },
      };
    });

    // if (!visible) {
    //   return null;
    // }

    return <div
      {...props}
      className="w-[50px] h-[50px] rounded-lg text-gray-400 border border-gray-400 border-dashed flex flex-col items-center justify-center cursor-pointer text-xs font-"
      // onDragOverClassName="drag-over"
      // extraProps={{ onClick: onZoneClick }}
      ref={ref}
    >
      {uploading ? <>
        <LoaderCircleIcon className="w-5 h-6 animate-spin" />
        <span>{(Math.floor(completed) % 100) || 0}%</span>
      </> : <PlusIcon className='text-gray-400 h-6 w-6' />}
    </div>
  }
);
UploadButtonBase.displayName = 'UploadButton';
const UploadButton = asUploadButton(UploadButtonBase);

export function Editor({ name, control, schema }: any) {
  const isMultiple = !!schema?.ui?.multiple;
  const schemaBuilder = useSchemaStore(store => store.schema);
  const url = schemaBuilder?.isDefaultProvider() ? '/storage/{value}' : schema?.ui.url;

  if (schemaBuilder?.isDefaultProvider() === false) {
    return <StringEditor name={name} control={control} schema={schema} />;
  }

  return <FormField
    control={control}
    name={name}
    render={({ field }) => {
      const { value } = field;
      const files: string[] = [];

      if (isMultiple) {
        files.push(...value?.split(','));
      } else {
        value?.length > 0 && files.push(value);
      }

      const handleDelete = (index: number) => {
        field.onChange(files.filter((item: any, i: number) => i !== index).join(','));
      }

      const handleFinished = (item: {
        file: File,
        filename: string
      }) => {
        if (isMultiple) {
          field.onChange([...files, item.filename].join(','));
        } else {
          field.onChange(item.filename);
        }
      }

      const imageUrl = (value: string) => {
        return url ? url.replace('{value}', value) : value;
      }

      return (
        <FormItem className="space-y-0 flex flex-row">
          <FormLabel className="w-1/5 mt-2 flex flex-row gap-2">
            <FieldIcon type={key} />
            {schema?.label}
          </FormLabel>
          <FormControl className="w-3/5">
            <div className="w-3/5 upload-container">
              <Uploady noPortal destination={{}} params={{
                onFinished: handleFinished,
              }}>
                <div className="flex flex-row flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="image-item bg-gray-100 rounded-lg group cursor-pointer relative text-transparent group">
                      <Dialog>
                        <DialogTrigger asChild>
                          <img 
                            src={imageUrl(file)} 
                            className="w-[50px] h-[50px] group-hover sticky object-cover rounded-md bg-fixed" 
                            title={imageUrl(file)} 
                          />
                        </DialogTrigger>
                        <DialogImage>
                          <img className="max-w-[425px]" src={imageUrl(file)} />
                        </DialogImage>
                      </Dialog>
                      <div className="ml-auto focus:outline-none absolute -right-[6px] -top-[6px] rounded-full bg-red-500 hidden group-hover:block" onClick={() => handleDelete(index)}>
                        <X className="m-1 w-2 h-2 text-white" strokeWidth="3" />
                      </div>
                    </div>
                  ))}
                  {(isMultiple || files.length == 0) && <UploadButton />}
                </div>
              </Uploady>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )
    }}
  />;
}

// export function ImageEditor({ control, schema }: any) {
//   const isMultiple = schema?.meta?.multiple;

//   const uploading = false;
//   return <FormField
//     control={control}
//     name={schema?.meta?.name}
//     render={({ field }) => {
//       const { value } = field;
//       console.log('value', value)
//       const srcs: string[] = [];

//       if (isMultiple) {
//         srcs.push(schema.url ? value.split(',').map((src: string) => schema.url.replace('{value}', src)) : value.split(','));
//       } else {
//         srcs.push(schema.url ? schema.url.replace('{value}', value) : value);
//       }

//       return (
//         <FormItem className="space-y-0 flex flex-row">
//           <FormLabel className="w-1/5 mt-2">{schema?.meta?.label}</FormLabel>
//           <FormControl className="w-3/5">
//             <Upload
//               files={srcs}
//               onChange={field.onChange}
//             />
//           </FormControl>
//           <FormMessage />
//         </FormItem>
//       )
//     }}
//   />;
// }

export type TypeEditorProps = {
  ui: any;
  fieldSchema: any;
  setFieldSchema: Function;
}

export function TypeEditor(props: TypeEditorProps) {
  const { control  } = useFormContext();
  const schema = useSchemaStore(store => store.schema);
  if (schema?.isDefaultProvider()) {
    return null;
  }

  return <>
    <FormField
      control={control}
      name={'ui'}
      render={({ field }) => (
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="url">Url</Label>
          <Input value={field.value.url ?? ''} placeholder={'e.g. https://foo.bar/{value}'} onChange={e => {
            field.onChange({
              type: key,
              url: e.target.value
            }, {
              shouldDirty: true
            });
          }} />
        </div>
      )}
    />
  </>
}