'use client';

import { GitCommitHorizontalIcon, ListIcon, RefreshCcwDotIcon, SwatchBookIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Bar from "../bar";
import { ProviderType } from "@/lib/types";
import { useTranslations } from "next-intl";

const defaultTypes = [
  {
    value: 'table',
    icon: <ListIcon className="size-4" />
  },
  // {
  //   value: 'graph',
  //   label: 'Graph',
  //   icon: <WaypointsIcon className="size-4" />
  // },
  // {
  //   value: 'api',
  //   label: 'API',
  //   icon: <CodeIcon className="size-4" />
  // },
];

const databaseTypes = [
  {
    value: 'table',
    icon: <ListIcon className="size-4" />
  },
  {
    value: 'connection',
    icon: <GitCommitHorizontalIcon className="size-4" />
  },
  // {
  //   value: 'graph',
  //   label: 'Graph',
  //   icon: <WaypointsIcon className="size-4" />
  // },
  // {
  //   value: 'api',
  //   label: 'API',
  //   icon: <CodeIcon className="size-4" />
  // },
  {
    value: 'schema',
    icon: <RefreshCcwDotIcon className="size-4" />
  },
];

export default function TypeList({ provider }: {
  provider: ProviderType
}) {
  const { baseId, type }: {
    baseId: string;
    type: string;
  } = useParams();
  const t = useTranslations('Base.Settings.List');

  const types = provider === 'default' 
    ? defaultTypes
    : databaseTypes;

  return (
    <Bar>
      <div className="inline-flex h-9 items-center justify-center rounded-lg text-muted-foreground bg-transparent gap-1">
        {types.map(item => item.value === type
        ? <div key={item.value} className="flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all  disabled:pointer-events-none disabled:opacity-50 text-foreground border hover:border-border border-border px-2 py-1 gap-2 cursor-pointer">
          {item.icon}
          {t(item.value)}
        </div>
        : <Link key={item.value} href={`/bases/${baseId}/settings/${item.value}`}>
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
    </Bar>
  )
}