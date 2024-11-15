'use client';

import { useSchemaStore } from "@/store/base";
import { Input } from "../../ui/input";
import { useParams } from "next/navigation";
import { ScrollArea } from "../../ui/scroll-area";
import { Button } from "../../ui/button";
import { useCallback, useState } from "react";
import { PlusIcon, SearchIcon } from "lucide-react";
import { sortObjectByKeys } from "@/lib/utils";
import RelationEditor from "./relation-editor";
import RelationItem from "./relation-item";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import ButtonLoading from "../../button-loading";
import isEqual from "lodash/isEqual";
import Loading from "@/components/loading";
import SelectBlank from "@/components/select-blank";
import { updateRelationsOrder } from "@/actions/relation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function Relation({ schema }: {
  schema: any;
}) {
  const { baseId, tableName: paramTableName }: { baseId: string, tableName: string} = useParams();
  const tableName = decodeURIComponent(paramTableName);
  const { originalSchema, schema: schemaBuilder, setTableSchema } = useSchemaStore(store => ({
    originalSchema: store.originalSchema,
    schema: store.schema,
    setTableSchema: store.setTableSchema,
  }));
  const t = useTranslations('Table.Settings.Relations')

  // const schemaBuilder = SchemaBuilder.make(schema);
  const tableSchema = schemaBuilder?.table(tableName)?.get();
  const [showCreateEditor, setShowCreateEditor] = useState<boolean>(false);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const relationsSchema = schemaBuilder?.getRelations(tableName) ?? {};

  const handleChangeQ = useCallback((e: any) => {
    setQ(e.target.value);
  }, []);

  if (schemaBuilder === null) {
    return <Loading />;
  }

  const relationsIds = Object.keys(relationsSchema);
  const { relations, setRelations } = {
    relations: Object.entries(relationsSchema ?? {}),
    setRelations: (relations: any[]) => {
      const relationsIds = relations.map(([key]: any) => key);
      setTableSchema(tableName, {
        ...tableSchema,
        relations: sortObjectByKeys(relationsSchema, relationsIds)
      });
    }
  }

  // const form = useForm({
  //   defaultValues: {},
  // });

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;

    const activeColumnIndex = relations.findIndex((field) => field[0] === active.id);
    const overColumnIndex = relations.findIndex((field) => field[0] === over.id);

    setRelations(arrayMove(relations, activeColumnIndex, overColumnIndex));
  }

  const handleResetOrder = () => {
    setTableSchema(tableName, originalSchema?.table(tableName)?.get());
  }

  const handleSaveOrder = () => {
    if (loading) return;
    setLoading(true);
    updateRelationsOrder({
      baseId: baseId,
      tableName: tableName,
      relations: relationsIds,
    }).then(result => {
      if (result?.error) {
        throw new Error(result?.error);
      }
    })
    .catch(e => {
      toast.error(e?.message);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  const filteredRelations = q.length > 0 ? relations.filter(([key, field]: any) => {
    return key.toLowerCase().includes(q.toLowerCase()) || field?.label?.toLowerCase()?.includes(q.toLowerCase());
  }) : relations;

  function renderPanel() {
    if (showCreateEditor) {
      return <RelationEditor
        base={baseId}
        table={tableName}
        onInit={handleInitPanel}
      />;
    }

    if (selected) {
      return <RelationEditor
        base={baseId}
        table={tableName}
        name={selected}
        onInit={handleInitPanel}
      />;
    }

    return <SelectBlank title={t('select_prompt')} />;
  }

  const handleShowCreate = () => {
    setShowCreateEditor(true);
    setSelected(null);
  }

  const handleSelectRelation = (name: string) => {
    setSelected(name);
    setShowCreateEditor(false);
  }

  const handleInitPanel = () => {
    setShowCreateEditor(false);
    setSelected(null);
  }
  
  return (
    <div className="max-w-screen-lg mx-auto mt-8 w-full flex flex-col gap-2">
      <div className="flex flex-row items-center justify-between">
        <div className="relative">
          <Input className="pl-8 h-8" placeholder={t('search_placeholder')} onChange={handleChangeQ} />
          <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 size-4 text-gray-500" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant={'outline'} className={'h-8 gap-2'} onClick={handleShowCreate}>
            <PlusIcon className="size-4" />
            {t('create')}
          </Button>
          <Button variant={'outline'} className={'h-8'} onClick={handleResetOrder}>
            {t('reset_order')}
          </Button>
          <Button className={'h-8'} disabled={isEqual(relationsIds, Object.keys(originalSchema?.getFields(tableName, false) as object)) || loading} onClick={handleSaveOrder}>
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
                onDragEnd={onDragEnd}
              >
                <SortableContext items={relationsIds}>
                  {filteredRelations.map(([key, relation]: any) => {
                    return <RelationItem
                      key={key}
                      name={key}
                      relation={relation}
                      isSelected={selected === key}
                      onClick={handleSelectRelation}
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