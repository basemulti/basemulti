"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileOutputIcon, Settings2, Settings2Icon, Trash, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { AlertModal } from "@/components/modal/alert-modal";
import { deleteRecords } from "@/actions/record";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { WebhookSchemaType } from "@/lib/schema-builder";
import { touchWebhook } from "@/actions/webhook";

export default function BulkActions({ baseId, tableName, rows, actions = [], primaryKey, onReset }: {
  baseId: string;
  tableName: string;
  primaryKey: string | null;
  rows: any[];
  actions?: WebhookSchemaType[];
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('GridView.BulkActions');

  const handleExportSelected = () => {
    if (primaryKey === null) {
      toast.error('No primary key found');
      return;
    }

    const filters = [['where', [primaryKey, 'in', rows.map((row: any) => row[primaryKey])]]];
    window.location.href = `/api/bases/${baseId}/tables/${tableName}/export?filters=${btoa(JSON.stringify(filters))}`;
  }

  const handleDeleteSelected = () => {
    if (primaryKey === null) {
      toast.error('No primary key found');
      return;
    }

    if (rows.length === 0) {
      toast.error('No rows selected');
      return;
    }

    if (loading) return;
    setLoading(true);
    deleteRecords({
      baseId,
      tableName,
      ids: rows.map((row: any) => row[primaryKey])
    }, {
      originalPath: pathname,
    })
    .then(result => {
      if (result.error) {
        throw new Error(result.error);
      }
    })
    .catch(e => {
      toast.error(e.message);
    })
    .finally(() => {
      setLoading(false);
      onReset();
    });
  }

  const handleTouchWebhook = (action: WebhookSchemaType) => {
    if (primaryKey === null) {
      toast.error('No primary key found');
      return;
    }

    toast.promise(touchWebhook({
      baseId,
      tableName,
      webhookId: action.id,
      params: {
        recordIds: rows.map((row: any) => row[primaryKey]),
      },
    }), {
      loading: t('loading'),
      success: (result) => {
        if (result.error) {
          throw new Error(result.error);
        }

        return t('success');
      },
      error: e => e.message,
    });
  }

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-2 gap-1">
          <div className="flex flex-row items-center gap-2">
            <Settings2 className="h-4 w-4"/>
            {t('text')}
          </div>
          <div className="rounded-md bg-blue-100 text-blue-500 px-2 py-0.5 text-xs">{rows.length}</div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleExportSelected}>
          <FileOutputIcon className="mr-2 h-4 w-4" /> {t('export')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setOpen(true)}>
          <Trash className="mr-2 h-4 w-4" /> {t('delete')}
        </DropdownMenuItem>
        {actions.length > 0 && <DropdownMenuSeparator />}
        {actions.map(action => <DropdownMenuItem key={action.id} onClick={() => handleTouchWebhook(action)}>
          <Settings2Icon className="mr-2 h-4 w-4" /> {action.label}
        </DropdownMenuItem>)}
      </DropdownMenuContent>
      <X className="cursor-pointer p-1 rounded-full w-5 h-5 bg-gray-100 text-gray-500" strokeWidth="3" onClick={onReset} />
    </DropdownMenu>
    <AlertModal
      isOpen={open}
      onClose={() => setOpen(false)}
      onConfirm={handleDeleteSelected}
      loading={loading}
    />
  </>;
}