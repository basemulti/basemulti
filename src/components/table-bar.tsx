'use client';

import { LinkIcon, RotateCwIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import Bar from "@/components/bar";
import { useRouter, startProgress, stopProgress } from "next-nprogress-bar";
import { useParams } from "next/navigation";
import TableIconSelector from "./table-icon-selector";
import ShareViewButton from "./share-view-button";

export default function TableBar({ viewId, breadcrumbItems, settingsDisabled, settingsLink }: {
  viewId: string;
  breadcrumbItems: any[];
  settingsDisabled: boolean;
  settingsLink: string;
}) {
  const router = useRouter();
  const { baseId, tableName: paramTableName }: {
    baseId: string;
    tableName: string;
  } = useParams();
  const tableName = decodeURIComponent(paramTableName);

  return <Bar>
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <TableIconSelector baseId={baseId} tableName={tableName} />
        <div className="text-sm">{breadcrumbItems[1]?.title}</div>
      </div>
      {/* <BreadCrumb className='mb-0' items={breadcrumbItems} /> */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="rounded-md hover:bg-muted p-1 cursor-pointer" onClick={() => {
            startProgress();
            router.refresh();
            stopProgress();
          }}>
            <RotateCwIcon className="text-slate-500 w-3 h-3" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reload</p>
        </TooltipContent>
      </Tooltip>
    </div>
    <div className="flex flex-row items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent cursor-pointer" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Copied to clipboard');
          }}>
            <LinkIcon className="size-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy link</p>
        </TooltipContent>
      </Tooltip>
      {!settingsDisabled && <Link href={settingsLink} className={'w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer'}>
        <SettingsIcon className="size-4" />
      </Link>}
      <ShareViewButton
        baseId={baseId}
        tableName={tableName}
        viewId={viewId}
      />
    </div>
  </Bar>
}