"use client";

import { useSchemaStore } from "@/store/base";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FieldTypeEditor } from "../field-types";
import ButtonLoading from "../button-loading";
import { createField } from "@/actions/field";
import FieldTypeSelector from "./field-type-selector";
import { useForm, useFormState } from "react-hook-form";
import { Form, FormField } from "../ui/form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { withDefaultUI } from "@/lib/schema-builder";

const defaultSchema = {
  name: "",
  label: "",
  type: "string",
  ui: {
    type: 'string'
  }
};

export default function FieldCreator({
  baseId,
  tableName,
}: {
  baseId: string;
  tableName: string;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const { schema, setFieldSchemaBuilber } = useSchemaStore(
    (store) => ({
      schema: store.schema,
      setFieldSchemaBuilber: store.setFieldSchema,
    }),
  );
  const t = useTranslations('Table.Settings.Fields.Editor');

  const form = useForm({
    defaultValues: defaultSchema
  });

  const handleReset = () => {
    form.reset(defaultSchema);
  };

  const handleSave = async () => {
    const name = form.getValues('name');

    if (!name) {
      toast.error('Please enter a name');
      return;
    }

    if (schema?.hasField(tableName, name)) {
      toast.error(`Field ${name} already exists`);
      return;
    }

    if (loading) return;
    setLoading(true);
    const fieldSchema = withDefaultUI(name, form.getValues());
    createField({
      baseId,
      tableName,
      fieldName: name,
      value: fieldSchema,
    })
    .then(result => {
      if (result?.error) {
        throw new Error(result.error);
      }

      setFieldSchemaBuilber(tableName, name, fieldSchema);
      form.reset(defaultSchema);
    })
    .catch(e => {
      toast.error(e.message);
    })
    .finally(() =>{
      setLoading(false);
    });
  };

  return (
    <>
      <Form {...form}>
        <FormField
          control={form.control}
          name={'name'}
          render={({ field }) => (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="label">{t('name')}</Label>
              <Input
                type="text"
                placeholder={''}
                {...field}
              />
            </div>
          )}
        />
        <FormField
          control={form.control}
          name={'label'}
          render={({ field }) => (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="label">{t('label')}</Label>
              <Input
                type="text"
                placeholder={''}
                {...field}
              />
            </div>
          )}
        />
        <FieldTypeSelector name={form.watch('name')} provider={schema?.getProvider()} />
        <FieldTypeEditor
          baseId={baseId}
          tableName={tableName}
          name={form.watch('name')}
        />
        <div className="flex items-center justify-between">
          <div></div>
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
