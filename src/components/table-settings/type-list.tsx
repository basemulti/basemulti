'use client';

import { CodeIcon, ListIcon, WaypointsIcon, WebhookIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";

const types = [
  {
    value: 'field',
    icon: <ListIcon className="size-4" />
  },
  {
    value: 'relation',
    icon: <WaypointsIcon className="size-4" />
  },
  // {
  //   value: 'graph',
  //   icon: <WaypointsIcon className="size-4" />
  // },
  // {
  //   value: 'action',
  //   icon: <Settings2Icon className="size-4" />
  // },
  {
    value: 'webhook',
    icon: <WebhookIcon className="size-4" />
  },
  {
    value: 'api',
    icon: <CodeIcon className="size-4" />
  }
];

export default function TypeList() {
  const { baseId, tableName: paramTableName, type }: {
    baseId: string,
    tableName: string,
    type: string
  } = useParams();
  const tableName = decodeURIComponent(paramTableName);
  const t = useTranslations('Table.Settings.List');

  return (
    <div>
      <div className="h-[50px] px-5 py-0 m-0 flex flex-row items-center justify-between border-b border-border">
        <div className="inline-flex h-9 items-center justify-center rounded-lg text-muted-foreground bg-transparent gap-1">
          {types.map(item => item.value === type
          ? <div key={item.value} className="flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all  disabled:pointer-events-none disabled:opacity-50 text-foreground border hover:border-border border-border px-2 py-1 gap-2 cursor-pointer">
            {item.icon}
            {t(item.value)}
          </div>
          : <Link key={item.value} href={`/bases/${baseId}/tables/${tableName}/settings/${item.value}`}>
            <div
              className="flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-transparent hover:border-border px-2 py-1 gap-2"
            >
              {item.icon}
              {t(item.value)}
            </div>
          </Link>)}
        </div>
        <div className="flex gap-2">
        </div>
      </div>
    </div>
  )
}