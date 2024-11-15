'use client';

import { useSchemaStore } from "@/store/base";
import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import ButtonLoading from "@/components/button-loading";
import Loading from "@/components/loading";
import TableItem from "./table-item";
import { toast } from "sonner";
import { checkConnectionSchema, updateConnectionSchema } from "@/actions/base";
import { useTranslations } from "next-intl";

export default function BaseSchema({ schema }: {
  schema: any;
}) {
  const { baseId }: { baseId: string } = useParams();
  const { schema: schemaBuilder } = useSchemaStore(store => ({
    schema: store.schema,
  }));
  const t = useTranslations('Base.Settings.Schema');

  const [onlyChanges, setOnlyChanges] = useState<boolean>(false);
  const [compare, setCompare] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);

  const tables = useMemo(() => {
    if (Object.keys(compare).length === 0) {
      return Object.entries(schemaBuilder?.getSkeleton() ?? {});
    } else {
      return Object.entries(compare ?? {});
    }
  }, [schemaBuilder, compare]);

  const handleCheckRemoteSchema = () => {
    if (checking) return;
    setChecking(true);
    checkConnectionSchema({
      id: baseId,
    })
    .then(result => {
      if (result?.error) {
        throw new Error(result.error);
      }

      setCompare(result?.compare ?? {});
    })
    .catch(e => toast(e.message))
    .finally(() => setChecking(false));
  }

  const handleToggleChanges = () => {
    setOnlyChanges(!onlyChanges);
  }

  const handleUpdateSchema = () => {
    if (loading) return;
    setLoading(true);
    updateConnectionSchema({
      id: baseId,
    })
    .then(result => {
      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success('Schema updated');
      setCompare({});
    })
    .catch(e => toast(e.message))
    .finally(() => setLoading(false));
  }

  if (schemaBuilder === null) {
    return <Loading />;
  }

  const changedCount = Object.keys(compare).length > 0 && tables.filter(([, table]: any) => table._status !== 'unchanged').length;
  
  return (
    <div className="max-w-screen-lg mx-auto mt-8 w-full flex flex-col gap-2">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {Object.keys(compare).length > 0 && <>
            <Button variant={'outline'} className={'h-8 gap-2'} onClick={handleToggleChanges}>
              {onlyChanges ? <EyeOffIcon className={"size-4"} /> : <EyeIcon className={"size-4"} />}
              {t(onlyChanges ? 'show_all' : 'only_changes')}
              <span className="bg-blue-100 text-blue-500 text-xs rounded-md px-1.5 py-0.5">{changedCount} changed</span>
            </Button>
            <div className="flex items-center gap-1 text-xs">
              <div className="size-2 rounded-full bg-green-400"></div>
              Added
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="size-2 rounded-full bg-red-400"></div>
              Deleted
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="size-2 rounded-full bg-yellow-400"></div>
              Changed
            </div>
          </>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant={'outline'} className={'h-8'} disabled={checking} onClick={handleCheckRemoteSchema}>
            <ButtonLoading loading={checking} />
            {t('check_schema')}
          </Button>
          <Button className={'h-8'} onClick={handleUpdateSchema}>
            <ButtonLoading loading={loading} />
            {t('update_schema')}
          </Button>
        </div>
      </div>
      <div className="rounded-md border border-gray-200">
        <div className="size-full flex flex-row">
          <ScrollArea className="h-[calc(100vh-200px)] flex-1">
            <div className="flex-1 gap-2 flex flex-col p-4">
              {tables.map(([key, table]: any) => {
                if (onlyChanges && table._status === 'unchanged') return null;
                return <TableItem
                  key={key}
                  name={key}
                  baseId={baseId}
                  table={table}
                />
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}