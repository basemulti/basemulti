"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import SchemaBuilder from "@/lib/schema-builder";
import pick from "lodash/pick";
import { AlertModal } from "../modal/alert-modal";
import { ScrollArea } from "../ui/scroll-area";
import { deleteRecord } from "@/actions/record";
import { useRouter } from "next-nprogress-bar";
import ButtonLoading from "../button-loading";
import { toast } from "sonner";
import { useGlobalStore } from "@/store/global";
import { ModelForm } from "./model-form";
import { useTranslations } from "next-intl";
import { useSchemaStore } from "@/store/base";

const ImgSchema = z.object({
  fileName: z.string(),
  name: z.string(),
  fileSize: z.number(),
  size: z.number(),
  fileKey: z.string(),
  key: z.string(),
  fileUrl: z.string(),
  url: z.string(),
});
export const IMG_MAX_LIMIT = 3;
const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Product Name must be at least 3 characters" }),
  imgUrl: z
    .array(ImgSchema)
    .max(IMG_MAX_LIMIT, { message: "You can only add up to 3 images" })
    .min(1, { message: "At least one image must be added." }),
  description: z
    .string()
    .min(3, { message: "Product description must be at least 3 characters" }),
  price: z.coerce.number(),
  category: z.string().min(1, { message: "Please select a category" }),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ModelFormProps {
  baseId: string,
  tableName: string,
  recordId: string,
  initialData: any | null;
  tableSchema: any;
  submit?: Function;
}

export const PageDetail: React.FC<ModelFormProps> = ({
  tableSchema,
  initialData,
  submit,
  baseId,
  tableName,
  recordId,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Record');
  // const title = initialData ? `Edit Details` : `Create Record`;
  // const description = initialData ? `Edit a ${tableSchema.label}.` : `Add a new ${tableSchema.label}`;
  // const toastMessage = initialData ? `${tableSchema.label} updated.` : `${tableSchema.label} created.`;
  const action = t(initialData ? "save" : "create");
  const { allows, denies } = useGlobalStore(store => ({
    allows: store.allows,
    denies: store.denies,
  }));
  const pathname = usePathname();
  const { schema } = useSchemaStore(store => ({
    schema: store.schema,
  }));

  // const tableFormSchema = Object.keys(tableSchema.fields).map((key) => {
  //   return getColumnSchema(tableSchema, key);
  // });
  const schemaBuilder = schema || SchemaBuilder.table(tableSchema);

  const defaultValues = initialData
    ? pick(initialData, Object.keys(tableSchema.fields))
    : schemaBuilder.defaultData()
      {
        // name: "",
        // description: "",
        // price: 0,
        // imgUrl: [],
        // category: "",
      };

  const {...form} = useForm<ProductFormValues>({
    // resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { isDirty, dirtyFields } = form.formState;

  const onSubmit = async (data?: ProductFormValues) => {
    try {
      setLoading(true);
      // await sleep(3000);
      if (initialData) {
        submit && await submit(baseId, tableName, recordId, pick(data as Record<string, any>, [...Object.keys(dirtyFields)]));
        // await axios.post(`/api/products/edit-product/${initialData._id}`, data);
      } else {
        submit && await submit(baseId, tableName, pick(data as Record<string, any>, [...Object.keys(tableSchema.fields)]));
        // const res = await axios.post(`/api/products/create-product`, data);
        // console.log("product", res);
        router.push(`/bases/${baseId}/tables/${tableName}?_=${Date.now()}`);
      }
      // router.refresh();
      
      toast.success("Update successful.");
    } catch (error: any) {
      toast.error("Uh oh! Something went wrong.", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (loading) return;
    setLoading(true);
    deleteRecord({
      baseId,
      tableName,
      id: recordId
    }, {
      originalPath: pathname,
    })
    .then(result => {
      if (result.error) {
        throw new Error(result.error);
      }
    })
    .catch (e => {
      toast.error(e.message);
    })
    .finally(() => {
      setLoading(false);
      setOpen(false);
    });
  };

  // const triggerImgUrlValidation = () => form.trigger("imgUrl");
  // const { formState: { isDirty} } = form;
  // const { isDirty, isValid } = form.formState;

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <ScrollArea className="h-[calc(100vh-150px)]">
        <div className="max-w-screen-lg mx-auto py-4">
          <Form {...form}>
            <ModelForm
              schema={schemaBuilder}
              submit={onSubmit}
              baseId={baseId}
              tableName={tableName}
              disabled={loading || denies(baseId, "base", "record:update")}
              data={initialData}
            />
          </Form>
        </div>
      </ScrollArea>
      <div>
        <div className="bg-white border-t border-border flex flex-col gap-2 sm:flex-row items-center justify-end space-x-2 h-[50px] px-4">
          {/* <Button disabled={!isDirty || loading} type="submit">
            {loading && <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />}
            {action}
          </Button> */}
          <Button className="py-2 px-3 h-8" variant="ghost" asChild>
            <Link href=".">{t('cancel')}</Link>
          </Button>
          <Form {...form}>
          {allows(baseId, 'base', 'record:update') && <Submit initialData={initialData} loading={loading} onSubmit={onSubmit} action={action} />}
          </Form>
          {/* <Button className="py-2 px-2 h-8" disabled={initialData ? !isDirty || loading : loading} onClick={(e) => {
            // form.handleSubmit(onSubmit)()
            e.preventDefault();
            onSubmit(getValues())
          }}>
            <ButtonLoading className="mr-2" loading={loading} />
            {action}
          </Button> */}
        </div>
      </div>
    </>
  );
};

function Submit({ loading, onSubmit, action, initialData }: any) {
  const { getValues, formState: {
    isDirty
  } } = useFormContext();

  return <Button className="py-2 px-3 h-8" disabled={initialData ? !isDirty || loading : loading} onClick={(e) => {
    // form.handleSubmit(onSubmit)()
    e.preventDefault();
    onSubmit(getValues())
  }}>
    <ButtonLoading className="mr-2" loading={loading} />
    {action}
  </Button>
}
