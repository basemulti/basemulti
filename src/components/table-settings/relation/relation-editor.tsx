"use client";

import { useSchemaStore } from "@/store/base";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import startCase from "lodash/startCase";
import pickBy from "lodash/pickBy";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ButtonLoading from "../../button-loading";
import { CheckIcon, TrashIcon } from "lucide-react";
import HasOneOrManyEditor from "./has-one-or-many-editor";
import { createRelation, deleteRelation, updateRelation } from "@/actions/relation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { AlertModal } from "@/components/modal/alert-modal";
import BelongsToEditor from "./belongs-to-editor";
import BelongsToManyEditor from "./belongs-to-many-editor";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

function omitValues(obj: any, keys: string[]) {
  return pickBy(obj, function(value, key) {
    return keys.includes(key as string) && value !== null && value !== undefined && value !== '';
  });
}

function valuesFilter(relation: string, values: any) {
  switch (relation) {
    case 'has_one':
    case 'has_many':
      return omitValues(values, ['name', 'label', 'type', 'table', 'foreign_key', 'local_key']);
    case 'belongs_to':
      return omitValues(values, ['name', 'label', 'type', 'table', 'foreign_key', 'owner_key']);
    case 'belongs_to_many':
      return omitValues(values, ['name', 'label', 'type', 'table', 'pivot_table', 'foreign_pivot_key', 'related_pivot_key', 'parent_key', 'related_key']);
    default:
      return values;
  }
}

function schemaToFormValues(name:string, schema: any) {
  return {
    type: schema.type,
    table: schema.table,
    name: name,
    label: schema.label ?? '',
    foreign_key: schema.foreign_key ?? '',
    local_key: schema.local_key ?? '',
    owner_key: schema.owner_key ?? '',
    pivot_table: schema.pivot_table ?? '',
    foreign_pivot_key: schema.foreign_pivot_key ?? '',
    related_pivot_key: schema.related_pivot_key ?? '',
    parent_key: schema.parent_key ?? '',
    related_key: schema.related_key ?? '',
  };
}

export default function RelationEditor({
  base,
  table,
  name,
  onInit,
}: {
  base: string;
  table: string;
  name?: string;
  onInit?: () => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [autoReciprocal, setAutoReciprocal] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { schema } = useSchemaStore(
    (store) => ({
      schema: store.schema,
    }),
  );
  const t = useTranslations('Table.Settings.Relations.Editor');
  
  const relationSchema = name ? schema?.getRelation(table as string, name) : {};
  const defaultValues = name ? schemaToFormValues(name, relationSchema) : {
    type: 'has_one',
    table: '',
    name: '',
    label: '',
    foreign_key: '',
    local_key: '',
    owner_key: '',
    pivot_table: '',
    foreign_pivot_key: '',
    related_pivot_key: '',
    parent_key: '',
    related_key: '',
  };

  console.log('defaultValues', defaultValues);

  const form = useForm({
    defaultValues: defaultValues,
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change') {
        console.log(form.getValues());
      }
    });
    return () => subscription.unsubscribe()
  }, [form.watch])

  useEffect(() => {
    form.reset(defaultValues);
  }, [name]);

  function renderRelationEditor() {
    switch (form.getValues('type')) {
      case 'has_one':
        return <HasOneOrManyEditor baseId={base} />;
      case 'has_many':
        return <HasOneOrManyEditor baseId={base} hasMany={true} />;
      case 'belongs_to':
        return <BelongsToEditor baseId={base} />;
      case 'belongs_to_many':
        return <BelongsToManyEditor baseId={base} />; 
      default:
        return null;
    }
  }

  const handleDelete = () => {
    if (!name) return;

    setDeleting(true);
    deleteRelation({
      baseId: base as string,
      tableName: table as string,
      relationName: name as string,
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

  const handleSave = () => {
    if (loading) return;

    setLoading(true);
    if (name) {
      const values = form.getValues();
      const value = valuesFilter(values.type, values);
      updateRelation({
        baseId: base as string,
        tableName: table as string,
        relationName: values.name,
        value: value,
      })
      .then((result) => {
        if (result?.error) {
          throw new Error(result.error);
        }
        setTimeout(() => {
          form.reset(schemaToFormValues(name, value));
        }, 300);
      })
      .catch((error) => toast.error("Uh oh! Something went wrong.", {
        description: error.message,
      }))
      .finally(() => {
        setLoading(false);
      });
    } else {
      const values = form.getValues();

      if (!values.name) {
        toast.error("Uh oh!", {
          description: "Please enter a name for the relation.",
        });
        setLoading(false);
        return;
      }

      createRelation({
        baseId: base as string,
        tableName: table as string,
        relationName: values.name,
        value: valuesFilter(values.type, values),
        auto_reciprocal: autoReciprocal,
      }).then((result) => {
        if (result?.error) {
          throw new Error(result.error);
        }

        form.reset(defaultValues);
      }).catch((error) => toast.error("Uh oh! Something went wrong.", {
        description: error.message,
      })).finally(() => {
        setLoading(false);
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(() => {})}
        >
          <div className="p-4 flex flex-col gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="mb-0 lg:mb-0">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <FormLabel>{t('relation')}</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant={"outline"} className="h-8 gap-2 justify-between" onClick={() => field.onChange('has_one')}>
                        {t('has_one')}
                        <div className="aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                          {field.value === 'has_one' && <div className="flex items-center justify-center">
                            <CheckIcon className="h-3.5 w-3.5" />
                          </div>}
                        </div>
                      </Button>
                      <Button variant={"outline"} className="h-8 gap-2 justify-between" onClick={() => field.onChange('has_many')}>
                        {t('has_many')}
                        <div className="aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                          {field.value === 'has_many' && <div className="flex items-center justify-center">
                            <CheckIcon className="h-3.5 w-3.5" />
                          </div>}
                        </div>
                      </Button>
                      <Button variant={"outline"} className="h-8 gap-2 justify-between" onClick={() => field.onChange('belongs_to_many')}>
                        {t('many_to_many')}
                        <div className="aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                          {field.value === 'belongs_to_many' && <div className="flex items-center justify-center">
                            <CheckIcon className="h-3.5 w-3.5" />
                          </div>}
                        </div>
                      </Button>
                      <Button variant={"outline"} className="h-8 gap-2 justify-between" onClick={() => field.onChange('belongs_to')}>
                        {t('belongs_to')}
                        <div className="aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                          {field.value === 'belongs_to' && <div className="flex items-center justify-center">
                            <CheckIcon className="h-3.5 w-3.5" />
                          </div>}
                        </div>
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {renderRelationEditor()}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="mb-0 lg:mb-0">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <FormLabel>{t('name')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        className="h-8"
                        disabled={!!name}
                        placeholder={t('name')}
                        {...field}
                        value={field.value}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem className="mb-0 lg:mb-0">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <FormLabel>{t('label')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        className="h-8"
                        placeholder={startCase(form.watch('name')) || t('label')}
                        {...field}
                        value={field.value}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!name && <div className="flex w-full max-w-sm items-center gap-2">
              <Switch checked={autoReciprocal} onCheckedChange={setAutoReciprocal} />
              <Label>
                {t('auto_add_reciprocal')}
              </Label>
            </div>}
            <div className="flex items-center justify-between">
              <div>
                {name && <Button
                  variant={"destructive"}
                  className="text-sm h-8 gap-2 px-3"
                  onClick={() => setDeleteOpen(true)}
                >
                  <TrashIcon className="h-4 w-4" />
                  {t('delete')}
                </Button>}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={"outline"}
                  className="text-sm h-8"
                  onClick={() => form.reset(defaultValues)}
                >
                  {t('reset')}
                </Button>
                <Button
                  className="text-sm h-8"
                  disabled={!form.formState.isDirty || loading}
                  onClick={form.handleSubmit(handleSave)}
                >
                  <ButtonLoading loading={loading} />
                  {t('save')}
                </Button>
              </div>
            </div>
          </div>
        </form>
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
