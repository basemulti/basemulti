'use client';

import { useSchemaStore } from "@/store/base";
import { Input } from "../ui/input";
import { useParams } from "next/navigation";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { useCallback, useState } from "react";
import { PlusIcon, SearchIcon } from "lucide-react";
import { sortObjectByKeys } from "@/lib/utils";
import FieldEditor from "./field-editor";
import FieldItem from "./field-item";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { updateFieldsOrder } from "@/actions/field";
import ButtonLoading from "../button-loading";
import isEqual from "lodash/isEqual";
import Loading from "@/components/loading";
import SelectBlank from "../select-blank";
import FieldCreator from "./field-creator";
import { useGlobalStore } from "@/store/global";
import { useTranslations } from "next-intl";

export default function Field({ schema, showDeleteFieldButton = true }: {
  schema: any;
  showDeleteFieldButton?: boolean
}) {
  const { baseId, tableName: paramTableName }: {
    baseId: string,
    tableName: string
  } = useParams();
  const tableName = decodeURIComponent(paramTableName);
  const { originalSchema, schema: schemaBuilder, setTableSchema } = useSchemaStore(store => ({
    originalSchema: store.originalSchema,
    schema: store.schema,
    setTableSchema: store.setTableSchema,
  }));
  const { allows } = useGlobalStore(store => ({
    allows: store.allows
  }));
  const t = useTranslations('Table.Settings.Fields');

  const tableSchema = schemaBuilder?.table(tableName)?.get();
  const [showCreateEditor, setShowCreateEditor] = useState<boolean>(false);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fieldsSchema = schemaBuilder?.getFields(tableName) ?? {};

  const handleChangeQ = useCallback((e: any) => {
    setQ(e.target.value);
  }, []);

  if (schemaBuilder === null) {
    return <Loading />;
  }

  const fieldsIds = Object.keys(fieldsSchema);
  const { fields, setFields } = {
    fields: Object.entries(fieldsSchema ?? {}),
    setFields: (fields: any[]) => {
      const fieldsIds = fields.map(([key]: any) => key);
      setTableSchema(tableName, {
        ...tableSchema,
        fields: sortObjectByKeys(fieldsSchema, fieldsIds)
      });
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;

    const activeColumnIndex = fields.findIndex((field) => field[0] === active.id);
    const overColumnIndex = fields.findIndex((field) => field[0] === over.id);

    setFields(arrayMove(fields, activeColumnIndex, overColumnIndex));
  }

  function renderPanel() {
    if (showCreateEditor) {
      return <div className="p-4 flex flex-col gap-4">
        <FieldCreator
          baseId={baseId}
          tableName={tableName}
        />
      </div>;
    }

    if (selected) {
      return <div className="p-4 flex flex-col gap-4">
        <FieldEditor
          baseId={baseId}
          tableName={tableName}
          name={selected}
          showDeleteButton={showDeleteFieldButton}
          onInit={handleInitPanel}
        />
      </div>;
    }

    return <SelectBlank title={t('select_prompt')} />;
  }

  const handleShowCreate = () => {
    setShowCreateEditor(true);
    setSelected(null);
  }

  const handleSelectField = (name: string) => {
    setSelected(name);
    setShowCreateEditor(false);
  }

  const handleResetOrder = () => {
    setTableSchema(tableName, originalSchema?.table(tableName)?.get());
  }

  const handleSaveOrder = async () => {
    if (loading) return;
    setLoading(true);
    await updateFieldsOrder({
      baseId: baseId,
      tableName: tableName,
      fields: fieldsIds,
    });
    setLoading(false);
  }

  const handleInitPanel = () => {
    setShowCreateEditor(false);
    setSelected(null);
  }

  const filteredFields = q.length > 0 ? fields.filter(([key, field]: any) => {
    return key.toLowerCase().includes(q.toLowerCase()) || field.label.toLowerCase().includes(q.toLowerCase());
  }) : fields;
  
  return (
    <div className="max-w-screen-lg mx-auto mt-8 w-full flex flex-col gap-2">
      <div className="flex flex-row items-center justify-between">
        <div className="relative">
          <Input className="pl-8 h-8" placeholder={t('search_placeholder')} onChange={handleChangeQ} />
          <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 size-4 text-gray-500" />
        </div>
        <div className="flex items-center gap-2">
          {(allows(baseId, 'base', 'field:create') && schemaBuilder.isDefaultProvider()) && <Button variant={'outline'} className={'h-8 gap-2'} onClick={handleShowCreate}>
            <PlusIcon className="size-4" />
            {t('create')}
          </Button>}
          <Button variant={'outline'} className={'h-8'} onClick={handleResetOrder}>
            {t('reset_order')}
          </Button>
          <Button className={'h-8'} disabled={isEqual(fieldsIds, Object.keys(originalSchema?.getFields(tableName, false) as object)) || loading} onClick={handleSaveOrder}>
            <ButtonLoading loading={loading} />
            {t('save_order')}
          </Button>
        </div>
      </div>
      <div className="rounded-md border border-gray-200">
        <div className="size-full flex flex-row">
          <ScrollArea className="h-[calc(100vh-200px)] flex-1">
            <div className="flex-1 divide-y border-b">
              <DndContext
                // onDragStart={({ active }) => {
                //   console.log('onDragStart', active)
                // }}
                onDragEnd={onDragEnd}
                // onDragOver={({ active, over }) => {
                //   console.log('onDragOver', active, over)
                // }}
              >
                <SortableContext items={fieldsIds}>
                  {filteredFields.map(([key, field]: any) => {
                    return <FieldItem
                      key={key}
                      name={key}
                      field={field}
                      isSelected={selected === key}
                      onClick={handleSelectField}
                    />
                  })}
                </SortableContext>
              </DndContext>
            </div>
          </ScrollArea>
          <div className="h-[calc(100vh-200px)] min-w-[400px] border-l border-l-gray-200 overflow-y-scroll">
            {renderPanel()}
          </div>
        </div>
      </div>
    </div>
  );
}