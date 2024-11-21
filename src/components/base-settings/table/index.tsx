'use client';

import { useSchemaStore } from "@/store/base";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { SearchIcon } from "lucide-react";
import { sortObjectByKeys } from "@/lib/utils";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import ButtonLoading from "@/components/button-loading";
import isEqual from "lodash/isEqual";
import Loading from "@/components/loading";
import TableItem from "./table-item";
import { updateTablesOrder } from "@/actions/table";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function Index({ schema }: {
  schema: any;
}) {
  const { baseId }: { baseId: string } = useParams();
  const { originalSchema, schema: schemaBuilder, setTablesSchema, setTableSchema } = useSchemaStore(store => ({
    originalSchema: store.originalSchema,
    schema: store.schema,
    setTablesSchema: store.setTablesSchema,
    setTableSchema: store.setTableSchema,
  }));
  const t = useTranslations('Base.Settings.Tables');

  const [q, setQ] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const tablesSchema = schemaBuilder?.getTables() ?? {};

  const handleChangeQ = useCallback((e: any) => {
    setQ(e.target.value);
  }, []);

  if (schemaBuilder === null) {
    return <Loading />;
  }

  const tablesIds = Object.keys(tablesSchema);
  const { tables, setTables, tableDisplays } = {
    tables: Object.entries(tablesSchema ?? {}),
    setTables: (tables: any[]) => {
      const tablesIds = tables.map(([key]: any) => key);
      setTablesSchema(sortObjectByKeys(tablesSchema, tablesIds));
    },
    tableDisplays: originalSchema?.getTableDisplays() ?? {},
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;

    const activeColumnIndex = tables.findIndex((table) => table[0] === active.id);
    const overColumnIndex = tables.findIndex((table) => table[0] === over.id);

    setTables(arrayMove(tables, activeColumnIndex, overColumnIndex));
  }

  const handleResetOrder = () => {
    setTablesSchema(originalSchema?.getTables());
  }

  const handleSaveOrder = async () => {
    if (loading) return;
    setLoading(true);
    updateTablesOrder({
      baseId: baseId,
      tables: tablesIds,
    })
    .then(result => {
      if (result?.error) {
        throw new Error(result.error);
      }
    })
    .catch(e => toast(e.message))
    .finally(() => setLoading(false));
  }

  const filteredTables = q.length > 0 ? tables.filter(([key, table]: any) => {
    return key.toLowerCase().includes(q.toLowerCase()) || table.label.toLowerCase().includes(q.toLowerCase());
  }) : tables;
  
  return (
    <div className="max-w-screen-lg mx-auto mt-8 w-full flex flex-col gap-2">
      <div className="flex flex-row items-center justify-between">
        <div className="relative">
          <Input className="pl-8 h-8" placeholder={t('search_placeholder')} onChange={handleChangeQ} />
          <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 size-4 text-gray-500" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant={'outline'} className={'h-8'} onClick={handleResetOrder}>
            {t('reset_order')}
          </Button>
          <Button className={'h-8'} disabled={isEqual(tablesIds, Object.keys(originalSchema?.getTables() as object)) || loading} onClick={handleSaveOrder}>
            <ButtonLoading loading={loading} />
            {t('save_order')}
          </Button>
        </div>
      </div>
      <div className="rounded-md border border-border">
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
                <SortableContext items={tablesIds}>
                  {filteredTables.map(([key, table]: any) => {
                    return <TableItem
                      key={key}
                      name={key}
                      baseId={baseId}
                      table={table}
                      display={tableDisplays[key] as boolean}
                    />
                  })}
                </SortableContext>
              </DndContext>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}