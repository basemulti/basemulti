'use client';

import { ChevronRightIcon } from "lucide-react";
import React from "react";
import { useParams } from "next/navigation";
import Bar from "@/components/bar";
import { toast } from "sonner";
import TableIconSelector from "./table-icon-selector";
import Link from "next/link";
import RecordActions from "./blocks/record/record-actions";
import { useRouter } from "next-nprogress-bar";

export default function RecordBar({ breadcrumbItems }: {
  breadcrumbItems: any[];
}) {
  const { baseId, tableName: paramTableName, recordId }: {
    baseId: string;
    tableName: string;
    recordId: string;
  } = useParams();
  const tableName = decodeURIComponent(paramTableName);
  const router = useRouter();

  return <Bar>
    <div className="flex flex-row items-center gap-2">
      <TableIconSelector baseId={baseId} tableName={tableName} />
      <Link href={breadcrumbItems[0]?.link}><div className="text-sm">{breadcrumbItems[0]?.title}</div></Link>
      <ChevronRightIcon className="text-muted-foreground size-4" />
      <div className="text-sm">{breadcrumbItems[1]?.title}</div>
    </div>
    <RecordActions
      baseId={baseId}
      tableName={tableName}
      recordId={recordId}
      onDelete={() => {
        toast.success("Record deleted");
        router.replace(`/bases/${baseId}/tables/${tableName}`);
      }}
    />
  </Bar>
}