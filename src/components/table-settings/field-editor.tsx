"use client";

import { useSchemaStore } from "@/store/base";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import startCase from "lodash/startCase";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { FieldTypeEditor } from "../field-types";
import ButtonLoading from "../button-loading";
import { deleteField, updateField } from "@/actions/field";
import FieldTypeSelector from "./field-type-selector";
import { useForm, useFormContext, useFormState } from "react-hook-form";
import { Form, FormField, FormItem } from "../ui/form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { withDefaultUI } from "@/lib/schema-builder";
import { TrashIcon } from "lucide-react";
import { AlertModal } from "../modal/alert-modal";
import { isSystemField } from "@/lib/utils";

// const UItoSchema = (ui: any) => {
//   return {
//     ...ui.meta,
//     ui: {
//       ...omit(ui, 'meta')
//     }
//   };
// }

export default function FieldEditor({
  baseId,
  tableName,
  name,
  showDeleteButton = true,
  onInit,
}: {
  baseId: string;
  tableName: string;
  name: string;
  showDeleteButton?: boolean;
  onInit?: () => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const t = useTranslations('Table.Settings.Fields.Editor');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { schema, setFieldSchemaBuilber } = useSchemaStore(
    (store) => ({
      schema: store.schema,
      setFieldSchemaBuilber: store.setFieldSchema,
    }),
  );
  const originalFieldSchema = schema?.getField(tableName, name, false);

  useEffect(() => {
    const originalFieldSchema = schema?.getField(tableName, name, false);
    form.reset(originalFieldSchema);
  }, [name]);

  const form = useForm({
    defaultValues: originalFieldSchema
  });

  const handleReset = () => {
    form.reset(originalFieldSchema);
  };

  const handleSave = async () => {
    // console.log(form.getValues());
    // return;
    if (loading) return;
    setLoading(true);
    const originalFieldSchema = schema?.getField(tableName, name, false);
    const fieldSchema = withDefaultUI(name, form.getValues());
    setFieldSchemaBuilber(tableName, name, fieldSchema);
    updateField({
      baseId: baseId,
      tableName: tableName,
      fieldName: name,
      value: fieldSchema,
    })
    .then(result => {
      if (result?.error) {
        throw new Error(result.error);
      }
    })
    .catch(e => {
      toast.error(e.message);
      setFieldSchemaBuilber(tableName, name, originalFieldSchema);
    })
    .finally(() =>{
      setLoading(false);
    });
  };

  const handleDelete = () => {
    if (!name) return;

    setDeleting(true);
    deleteField({
      baseId,
      tableName,
      fieldName: name,
    }, {
      originalPath: `/bases/${baseId}/tables/${tableName}/settings/fields`
    }).then((result) => {
      if (result?.error) {
        throw new Error(result.error);
      }
      onInit?.();
    }).catch((error) => toast.error("Uh oh! Something went wrong.", {
      description: error.message,
    })).finally(() => {
      setDeleting(false);
    });
  };

  return (
    <>
      <Form {...form}>
        <Input disabled value={name || ""} readOnly />
        <LabelForm name={name} />
        <FieldTypeSelector name={name} provider={schema?.getProvider()} />
        <FieldTypeEditor
          baseId={baseId}
          tableName={tableName}
          name={name}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showDeleteButton && <Button
              className="text-sm h-8 gap-2 px-3"
              variant={"destructive"}
              disabled={isSystemField(name)}
              onClick={() => {
                setDeleteOpen(true);
              }}
            >
              <TrashIcon className="h-4 w-4" />
              {t('delete')}
            </Button>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={"outline"}
              className="text-sm h-8"
              onClick={handleReset}
            >
              {t('reset')}
            </Button>
            <SaveButton loading={loading} onClick={handleSave} />
          </div>
        </div>
      </Form>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}

function SaveButton({ loading, onClick }: any) {
  const { isDirty } = useFormState();
  const t = useTranslations('Table.Settings.Fields.Editor');

  return <Button
    className="text-sm h-8"
    disabled={loading || !isDirty}
    onClick={onClick}
  >
    <ButtonLoading loading={loading} />
    {t('save')}
  </Button>
}

function LabelForm({ name }: {
  name: string;
}) {
  const { control, setValue } = useFormContext();
  const t = useTranslations('Table.Settings.Fields.Editor');

  return <FormField
    control={control}
    name={'label'}
    render={({ field }) => (
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="label">{t('label')}</Label>
        <Input
          type="text"
          placeholder={startCase(name)}
          value={field.value}
          onChange={(e) => {
            setValue('label', e.target.value, {
              shouldDirty: true,
            });
          }}
        />
      </div>
    )}
  />;
}
