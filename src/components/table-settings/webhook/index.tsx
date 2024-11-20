'use client';

import { useSchemaStore } from "@/store/base";
import { Input } from "../../ui/input";
import { useParams } from "next/navigation";
import { Button } from "../../ui/button";
import { useCallback, useState } from "react";
import { PlusIcon, SearchIcon, WebhookIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Loading from "@/components/loading";
import { useTranslations } from "next-intl";
import WebhookItem from "./webhook-item";
import CreateWebhook from "./create-webhook";

export default function Webhook({ schema, webhooks }: {
  schema: any;
  webhooks: any[];
}) {
  const { baseId, tableName: paramTableName }: { baseId: string, tableName: string} = useParams();
  const tableName = decodeURIComponent(paramTableName);
  const { schema: schemaBuilder } = useSchemaStore(store => ({
    schema: store.schema,
  }));
  const t = useTranslations('Table.Settings.Webhooks')
  const [q, setQ] = useState('');

  const handleChangeQ = useCallback((e: any) => {
    setQ(e.target.value);
  }, []);

  if (schemaBuilder === null) {
    return <Loading />;
  }

  const filteredWebhooks = q.length > 0 ? webhooks.filter((webhook: any) => {
    return webhook.label.toLowerCase().includes(q.toLowerCase());
  }) : webhooks;
  
  return (
    <div className="max-w-screen-lg mx-auto mt-8 w-full flex flex-col gap-2">
      <div className="flex flex-row items-center justify-between">
        <div className="relative">
          <Input className="pl-8 h-8" placeholder={t('search_placeholder')} onChange={handleChangeQ} />
          <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 size-4 text-gray-500" />
        </div>
        <div className="flex items-center gap-2">
          <CreateWebhook baseId={baseId} tableName={tableName}>
            <Button variant={'outline'} className={'h-8 gap-2'}>
              <PlusIcon className="size-4" />
              {t('create')}
            </Button>
          </CreateWebhook>
        </div>
      </div>
      <div className="rounded-md border border-gray-200">
        <div className="size-full flex flex-row">
          <div className="h-[calc(100vh-200px)] flex-1 overflow-y-auto">
            {filteredWebhooks.length > 0
            ? <div className={cn(
              'flex-1 divide-y border-b',
            )}>
              {filteredWebhooks.map((item: any) => {
                return <WebhookItem
                  key={item.id}
                  webhook={item}
                />
              })}
            </div>
            : <div className={cn(
              'size-full flex flex-col items-center justify-center gap-4',
            )}>
              <WebhookIcon className="size-10" />
              <div className="flex flex-col gap-1">
                <div className="text-center font-semibold">{t('no_webhooks')}</div>
                <div className="text-gray-500 text-sm text-center">{t('no_webhooks_description')}</div>
              </div>
              <CreateWebhook baseId={baseId} tableName={tableName}>
                <Button className={'h-8 gap-2'}>
                  <PlusIcon className="size-4" />
                  {t('create')}
                </Button>
              </CreateWebhook>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}